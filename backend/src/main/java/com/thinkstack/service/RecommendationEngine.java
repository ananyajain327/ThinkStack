package com.thinkstack.service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

/**
 * Pure, dependency-free scoring engine for the ThinkStack recommendation model.
 *
 * <p>This class deliberately knows nothing about persistence or Spring so that the
 * decision-validity rules can be exercised by fast unit tests. All inputs are plain
 * value objects; all outputs are plain value objects.</p>
 */
@Component
public class RecommendationEngine {

    private static final List<String> DIMENSIONS =
            List.of("performance", "battery", "portability", "display", "gaming");

    /** A single product specification value, decoupled from the JPA entity. */
    public record SpecValue(String text, BigDecimal numeric, Boolean bool) {
        public static SpecValue of(BigDecimal numeric) {
            return new SpecValue(null, numeric, null);
        }

        public static SpecValue ofText(String text) {
            return new SpecValue(text, null, null);
        }

        public static SpecValue of(boolean value) {
            return new SpecValue(null, null, value);
        }
    }

    /** The product fields the engine needs, decoupled from the entity. */
    public record ProductInput(String brand, BigDecimal avgRating, Integer reviewCount,
                               BigDecimal bestPrice, Map<String, SpecValue> specs) {
    }

    /** User constraints derived from wizard answers. */
    public record Constraints(BigDecimal budgetMax, String osPreference, BigDecimal ramMin,
                              BigDecimal storageMin, Set<String> preferredBrands) {
        public static Constraints none() {
            return new Constraints(null, "", null, null, Set.of());
        }
    }

    /** The scored result for one product. */
    public record Result(double overall, double confidence, String budgetCategory, double value,
                         double featureMatch, double performanceMatch, double reviewSentiment,
                         Map<String, Double> dimensions, Map<String, Double> usedWeights,
                         List<String> advantages, List<String> disadvantages,
                         List<String> dealBreakers, List<String> tradeOffs, BigDecimal bestPrice) {
    }

    // ---------- public API ----------

    public Result score(ProductInput product, Constraints constraints, Map<String, Double> weights) {
        BigDecimal bestPrice = product.bestPrice();
        BigDecimal budgetMax = constraints.budgetMax();
        String osPreference = constraints.osPreference() == null ? "" : constraints.osPreference();

        List<String> advantages = new java.util.ArrayList<>();
        List<String> disadvantages = new java.util.ArrayList<>();
        List<String> dealBreakers = new java.util.ArrayList<>();
        List<String> tradeOffs = new java.util.ArrayList<>();

        Map<String, Double> dimensions = new LinkedHashMap<>();
        dimensions.put("performance", performanceScore(product.specs()));
        dimensions.put("battery", batteryScore(product.specs()));
        dimensions.put("portability", portabilityScore(product.specs()));
        dimensions.put("display", displayScore(product.specs()));
        dimensions.put("gaming", gamingScore(product.specs()));

        double weightedSum = 0;
        double weightTotal = 0;
        Map<String, Double> usedWeights = new LinkedHashMap<>();
        for (Map.Entry<String, Double> e : weights.entrySet()) {
            Double dimension = dimensions.get(e.getKey());
            if (dimension == null) continue;
            usedWeights.put(e.getKey(), e.getValue());
            weightedSum += dimension * e.getValue();
            weightTotal += e.getValue();
        }
        double featureMatch = weightTotal == 0 ? 50 : (weightedSum / weightTotal) * 100;

        double perfMatch = adequacy(ramOf(product.specs()), constraints.ramMin()) * 0.5
                + adequacy(storageOf(product.specs()), constraints.storageMin()) * 0.5;
        double performanceMatch = perfMatch * 100;

        double reviewSentiment = product.avgRating() == null
                ? 70 : product.avgRating().doubleValue() / 5 * 100;

        double priceValue = bestPrice == null ? 0 : bestPrice.doubleValue();
        double value;
        if (budgetMax != null && budgetMax.signum() > 0) {
            double ratio = priceValue / budgetMax.doubleValue();
            value = Math.max(0, Math.min(100, 100 - (ratio - 0.3) * 55));
        } else {
            value = Math.min(100, Math.max(40, priceValue >= 1000 ? 75 : 45));
        }

        double overall = featureMatch * 0.40 + value * 0.25
                + reviewSentiment * 0.20 + performanceMatch * 0.15;

        String budgetCategory = classifyBudget(bestPrice, budgetMax, value);

        if (budgetMax != null && bestPrice != null && bestPrice.compareTo(budgetMax) > 0) {
            dealBreakers.add("Price ₹" + bestPrice + " exceeds your maximum budget of ₹" + budgetMax);
        }
        String os = text(product.specs(), "os");
        if (!"any".equals(osPreference) && !osPreference.isEmpty() && os != null
                && !os.toLowerCase().contains(osPreference.toLowerCase())) {
            dealBreakers.add("Runs " + os + " but you asked for " + osPreference);
        }
        Set<String> preferredBrands = constraints.preferredBrands() == null
                ? Set.of() : constraints.preferredBrands();
        if (!preferredBrands.isEmpty() && product.brand() != null
                && !preferredBrands.contains(product.brand().toLowerCase())) {
            tradeOffs.add("Not one of your preferred brands (" + String.join(", ", preferredBrands) + ")");
        }
        if (dealBreakers.isEmpty()) {
            advantages.add("Within your budget at ₹" + bestPrice);
        }
        String topDim = dimensions.entrySet().stream()
                .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("");
        if (!topDim.isEmpty() && dimensions.get(topDim) >= 0.7) {
            advantages.add("Excellent " + topDim.replace('_', ' ') + " ("
                    + Math.round(dimensions.get(topDim) * 100) + "% of ideal)");
        }
        dimensions.forEach((dim, val) -> {
            if (val < 0.4) {
                disadvantages.add("Weak " + dim.replace('_', ' ') + " ("
                        + Math.round(val * 100) + "% of ideal)");
            }
        });
        if (!preferredBrands.isEmpty() && product.brand() != null
                && preferredBrands.contains(product.brand().toLowerCase())) {
            advantages.add("Matches your preferred brand " + product.brand());
        }
        if (performanceMatch < 40) {
            tradeOffs.add("Performance/storage may fall short of what you asked for");
        }

        double confidence = 50 + 40 * (weightTotal == 0 ? 0 : 1);

        return new Result(overall, confidence, budgetCategory, value, featureMatch,
                performanceMatch, reviewSentiment, dimensions, usedWeights,
                advantages, disadvantages, dealBreakers, tradeOffs, bestPrice);
    }

    /**
     * Derive per-dimension priority weights from the wizard question base weights and the
     * user's stated importances (0..5) plus purpose boosts.
     *
     * @param questionWeights base weight per dimension (from the wizard definition); missing
     *                        dimensions are skipped
     * @param profile         wizard answers keyed by question key
     */
    public Map<String, Double> deriveWeights(Map<String, Double> questionWeights, Map<String, String> profile) {
        Map<String, Double> weights = new LinkedHashMap<>();
        for (String dim : DIMENSIONS) {
            if (!questionWeights.containsKey(dim)) continue;
            double base = questionWeights.get(dim) == null ? 1.0 : questionWeights.get(dim);
            double importance = importance(profile.get(dim));
            double w = base * (importance == 0 ? 0.6 : importance);
            if (importance == 0 && !profile.containsKey(dim)) w = base * 0.5;
            weights.put(dim, Math.max(0.1, w));
        }
        String purpose = clean(profile.get("purpose"));
        if ("programming".equals(purpose)) {
            weights.put("performance", weights.getOrDefault("performance", 1.0) * 1.4);
        }
        if ("gaming".equals(purpose)) {
            weights.put("gaming", weights.getOrDefault("gaming", 1.0) * 1.4);
        }
        if ("office".equals(purpose)) {
            weights.put("battery", weights.getOrDefault("battery", 1.0) * 1.3);
        }
        if ("portability".equals(purpose)) {
            weights.put("portability", weights.getOrDefault("portability", 1.0) * 1.3);
        }
        return weights;
    }

    // ---------- dimension scorers ----------

    double performanceScore(Map<String, SpecValue> specs) {
        BigDecimal ram = ramOf(specs);
        double ramScore = ram == null ? 0.5 : Math.min(1, ram.doubleValue() / 16.0);
        String cpu = text(specs, "processor");
        double cpuScore = 0.6;
        if (cpu != null) {
            String c = cpu.toLowerCase();
            if (c.contains("i9") || c.contains("ryzen 9") || c.contains("m3") || c.contains("m2 pro")
                    || c.contains("m2 max") || c.contains("m1 max") || c.contains("core ultra")) {
                cpuScore = 1.0;
            } else if (c.contains("i7") || c.contains("ryzen 7") || c.contains("m2") || c.contains("m1 pro")) {
                cpuScore = 0.9;
            } else if (c.contains("i5") || c.contains("ryzen 5") || c.contains("m1")) {
                cpuScore = 0.8;
            } else if (c.contains("i3") || c.contains("celeron") || c.contains("pentium")) {
                cpuScore = 0.4;
            }
        }
        return ramScore * 0.6 + cpuScore * 0.4;
    }

    double batteryScore(Map<String, SpecValue> specs) {
        BigDecimal hours = num(specs, "battery_life");
        if (hours == null) return 0.5;
        return Math.min(1, hours.doubleValue() / 15.0);
    }

    double portabilityScore(Map<String, SpecValue> specs) {
        BigDecimal weight = num(specs, "weight");
        if (weight == null) return 0.5;
        return Math.max(0, Math.min(1, (2.6 - weight.doubleValue()) / 1.1));
    }

    double displayScore(Map<String, SpecValue> specs) {
        String res = text(specs, "display_resolution");
        BigDecimal size = num(specs, "display_size");
        double resScore = 0.5;
        if (res != null) {
            String r = res.toLowerCase();
            if (r.contains("4k") || r.contains("retina") || r.contains("qhd") || r.contains("2k")
                    || r.contains("1440p")) {
                resScore = 1.0;
            } else if (r.contains("1080p") || r.contains("fhd")) {
                resScore = 0.8;
            } else if (r.contains("768p") || r.contains("1366")) {
                resScore = 0.4;
            }
        }
        double sizeScore = size == null ? 0.5 : Math.min(1, size.doubleValue() / 15.5);
        return resScore * 0.7 + sizeScore * 0.3;
    }

    double gamingScore(Map<String, SpecValue> specs) {
        String gpu = text(specs, "gpu");
        if (gpu == null) return 0.3;
        String g = gpu.toLowerCase();
        if (g.contains("rtx") || g.contains("gtx") || g.contains("geforce")) return 1.0;
        if (g.contains("radeon") || g.contains("arc") || g.contains("m2") || g.contains("m3")) return 0.8;
        if (g.contains("iris") || g.contains("uhd") || g.contains("graphics")) return 0.4;
        return 0.5;
    }

    // ---------- helpers ----------

    String classifyBudget(BigDecimal price, BigDecimal budgetMax, double value) {
        if (budgetMax == null || budgetMax.signum() <= 0) {
            return value >= 70 ? "EXCEPTIONAL_VALUE" : "WITHIN_BUDGET";
        }
        if (price == null) return "NOT_SUITABLE";
        double ratio = price.doubleValue() / budgetMax.doubleValue();
        if (ratio > 1.3) return "NOT_SUITABLE";
        if (ratio > 1.1) return "PREMIUM_ALTERNATIVE";
        if (ratio > 1.0) return "SLIGHTLY_ABOVE_BUDGET";
        return value >= 70 ? "EXCEPTIONAL_VALUE" : "WITHIN_BUDGET";
    }

    double adequacy(BigDecimal have, BigDecimal need) {
        if (need == null || need.signum() <= 0) return 1.0;
        if (have == null) return 0;
        return Math.min(1, have.doubleValue() / need.doubleValue());
    }

    double importance(String raw) {
        try {
            double v = Double.parseDouble(clean(raw));
            v = Math.max(0, Math.min(5, v));
            return v / 5.0;
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private String clean(String raw) {
        if (raw == null) return "";
        return raw.trim().replaceAll("[₹\\s,]", "").replace("\"", "");
    }

    private BigDecimal ramOf(Map<String, SpecValue> specs) {
        return num(specs, "ram");
    }

    private BigDecimal storageOf(Map<String, SpecValue> specs) {
        return num(specs, "storage");
    }

    BigDecimal num(Map<String, SpecValue> specs, String key) {
        SpecValue s = specs.get(key);
        if (s == null) return null;
        if (s.numeric() != null) return s.numeric();
        if (s.bool() != null) return s.bool() ? BigDecimal.ONE : BigDecimal.ZERO;
        if (s.text() != null) {
            try {
                return new BigDecimal(s.text().replaceAll("[^0-9.]", ""));
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    String text(Map<String, SpecValue> specs, String key) {
        SpecValue s = specs.get(key);
        return s == null ? null : s.text();
    }

    /** Convenience for building a spec map in tests and callers. */
    public static Map<String, SpecValue> newSpecMap() {
        return new LinkedHashMap<>();
    }

    public static Set<String> newBrandSet(String... brands) {
        Set<String> set = new LinkedHashSet<>();
        for (String b : brands) {
            if (b != null) set.add(b.toLowerCase());
        }
        return set;
    }
}
