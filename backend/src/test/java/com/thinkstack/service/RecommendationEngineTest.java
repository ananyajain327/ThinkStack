package com.thinkstack.service;

import com.thinkstack.service.RecommendationEngine.Constraints;
import com.thinkstack.service.RecommendationEngine.ProductInput;
import com.thinkstack.service.RecommendationEngine.Result;
import com.thinkstack.service.RecommendationEngine.SpecValue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * DB-free decision-validity tests for the pure scoring engine.
 * These lock down the rules that make a recommendation trustworthy:
 * budget hard-constraints, OS deal-breakers, brand preferences, ranking sanity
 * and weight derivation.
 */
class RecommendationEngineTest {

    private final RecommendationEngine engine = new RecommendationEngine();

    private static Map<String, SpecValue> laptopSpecs(String processor, double ramGb, double storageGb,
                                                      double batteryHours, double weightKg,
                                                      String display, String os, String gpu) {
        Map<String, SpecValue> specs = new LinkedHashMap<>();
        specs.put("processor", SpecValue.ofText(processor));
        specs.put("ram", SpecValue.of(BigDecimal.valueOf(ramGb)));
        specs.put("storage", SpecValue.of(BigDecimal.valueOf(storageGb)));
        specs.put("battery_life", SpecValue.of(BigDecimal.valueOf(batteryHours)));
        specs.put("weight", SpecValue.of(BigDecimal.valueOf(weightKg)));
        specs.put("display_resolution", SpecValue.ofText(display));
        specs.put("os", SpecValue.ofText(os));
        specs.put("gpu", SpecValue.ofText(gpu));
        return specs;
    }

    private static Map<String, Double> weights(double performance, double battery, double portability,
                                               double display, double gaming) {
        Map<String, Double> w = new LinkedHashMap<>();
        w.put("performance", performance);
        w.put("battery", battery);
        w.put("portability", portability);
        w.put("display", display);
        w.put("gaming", gaming);
        return w;
    }

    @Test
    @DisplayName("product within budget has no deal-breakers and a favourable budget category")
    void withinBudget() {
        ProductInput product = new ProductInput("Dell", BigDecimal.valueOf(4.5), 120,
                BigDecimal.valueOf(80000),
                laptopSpecs("Intel Core i7", 16, 512, 12, 1.6, "1080p", "Windows 11", "Intel Iris Xe"));
        Constraints constraints = new Constraints(BigDecimal.valueOf(100000), "windows", null, null, Set.of());

        Result result = engine.score(product, constraints, weights(1, 1, 1, 1, 1));

        assertThat(result.dealBreakers()).isEmpty();
        assertThat(result.budgetCategory()).isIn("WITHIN_BUDGET", "EXCEPTIONAL_VALUE");
        assertThat(result.overall()).isBetween(0.0, 100.0);
    }

    @Test
    @DisplayName("a product priced above the stated maximum budget is flagged as a deal-breaker")
    void overBudgetIsDealBreaker() {
        ProductInput product = new ProductInput("Apple", BigDecimal.valueOf(4.8), 300,
                BigDecimal.valueOf(250000),
                laptopSpecs("Apple M3", 16, 512, 18, 1.2, "Retina", "macOS", "Apple M3"));
        Constraints constraints = new Constraints(BigDecimal.valueOf(100000), "any", null, null, Set.of());

        Result result = engine.score(product, constraints, weights(1, 1, 1, 1, 1));

        assertThat(result.dealBreakers()).isNotEmpty();
        assertThat(result.budgetCategory()).isEqualTo("NOT_SUITABLE");
    }

    @Test
    @DisplayName("an OS mismatch produces an explicit deal-breaker explaining the conflict")
    void osMismatchIsDealBreaker() {
        ProductInput product = new ProductInput("Apple", BigDecimal.valueOf(4.8), 300,
                BigDecimal.valueOf(90000),
                laptopSpecs("Apple M2", 16, 512, 18, 1.3, "Retina", "macOS", "Apple M2"));
        Constraints constraints = new Constraints(BigDecimal.valueOf(150000), "windows", null, null, Set.of());

        Result result = engine.score(product, constraints, weights(1, 1, 1, 1, 1));

        assertThat(result.dealBreakers())
                .anyMatch(msg -> msg.toLowerCase().contains("windows"));
    }

    @Test
    @DisplayName("a non-preferred brand is recorded as a trade-off, a preferred brand as an advantage")
    void brandPreferences() {
        ProductInput preferred = new ProductInput("Dell", BigDecimal.valueOf(4.4), 50,
                BigDecimal.valueOf(70000),
                laptopSpecs("Intel Core i5", 8, 256, 8, 1.9, "1080p", "Windows 11", "Intel UHD Graphics"));
        ProductInput other = new ProductInput("Acer", BigDecimal.valueOf(4.4), 50,
                BigDecimal.valueOf(70000),
                laptopSpecs("Intel Core i5", 8, 256, 8, 1.9, "1080p", "Windows 11", "Intel UHD Graphics"));
        Constraints constraints = new Constraints(BigDecimal.valueOf(90000), "any", null, null,
                Set.of("dell"));

        Result preferredResult = engine.score(preferred, constraints, weights(1, 1, 1, 1, 1));
        Result otherResult = engine.score(other, constraints, weights(1, 1, 1, 1, 1));

        assertThat(preferredResult.advantages()).anyMatch(a -> a.toLowerCase().contains("preferred brand"));
        assertThat(otherResult.tradeOffs()).anyMatch(t -> t.toLowerCase().contains("preferred brands"));
    }

    @Test
    @DisplayName("storage/RAM shortfalls lower the performance-match dimension")
    void performanceMatchReflectsMinimums() {
        ProductInput weak = new ProductInput("Acer", BigDecimal.valueOf(4.0), 20,
                BigDecimal.valueOf(40000),
                laptopSpecs("Intel Celeron", 4, 128, 6, 2.2, "768p", "Windows 11", null));
        Constraints constraints = new Constraints(BigDecimal.valueOf(120000), "any",
                BigDecimal.valueOf(16), BigDecimal.valueOf(512), Set.of());

        Result result = engine.score(weak, constraints, weights(2, 1, 1, 1, 1));

        assertThat(result.performanceMatch()).isLessThan(40);
        assertThat(result.tradeOffs())
                .anyMatch(t -> t.toLowerCase().contains("performance/storage"));
    }

    @Test
    @DisplayName("a stronger product outranks a weaker one under identical weights")
    void rankingSanity() {
        Map<String, Double> w = weights(2, 1, 1, 1, 2);
        ProductInput strong = new ProductInput("Asus", BigDecimal.valueOf(4.7), 200,
                BigDecimal.valueOf(90000),
                laptopSpecs("AMD Ryzen 9", 32, 1024, 14, 1.7, "4K", "Windows 11", "NVIDIA RTX 4060"));
        ProductInput weak = new ProductInput("Asus", BigDecimal.valueOf(4.0), 200,
                BigDecimal.valueOf(90000),
                laptopSpecs("Intel Core i3", 8, 256, 5, 2.4, "768p", "Windows 11", "Intel UHD Graphics"));

        Result strongResult = engine.score(strong, Constraints.none(), w);
        Result weakResult = engine.score(weak, Constraints.none(), w);

        assertThat(strongResult.overall()).isGreaterThan(weakResult.overall());
        assertThat(strongResult.featureMatch()).isGreaterThan(weakResult.featureMatch());
    }

    @Test
    @DisplayName("'programming' purpose boosts the performance weight")
    void purposeBoostsPerformance() {
        Map<String, Double> base = new LinkedHashMap<>();
        base.put("performance", 1.0);
        base.put("battery", 1.0);

        Map<String, Double> neutral = engine.deriveWeights(base, Map.of("performance", "3", "battery", "3"));
        Map<String, Double> programming = engine.deriveWeights(base,
                Map.of("performance", "3", "battery", "3", "purpose", "programming"));

        assertThat(programming.get("performance")).isGreaterThan(neutral.get("performance"));
        assertThat(programming.get("battery")).isEqualTo(neutral.get("battery"));
    }

    @Test
    @DisplayName("weights never fall below the 0.1 floor and unknown dimensions are ignored")
    void weightsFloorAndUnknowns() {
        Map<String, Double> base = new LinkedHashMap<>();
        base.put("performance", 1.0);
        base.put("does_not_exist", 1.0);

        Map<String, Double> derived = engine.deriveWeights(base, Map.of());

        assertThat(derived).containsKey("performance");
        assertThat(derived).doesNotContainKey("does_not_exist");
        assertThat(derived.get("performance")).isGreaterThanOrEqualTo(0.1);
    }

    @Test
    @DisplayName("a missing spec degrades gracefully instead of throwing")
    void missingSpecsAreNeutral() {
        ProductInput product = new ProductInput("Generic", null, null,
                BigDecimal.valueOf(50000), Map.of());

        Result result = engine.score(product, Constraints.none(), weights(1, 1, 1, 1, 1));

        assertThat(result.overall()).isBetween(0.0, 100.0);
        assertThat(result.reviewSentiment()).isEqualTo(70.0);
        assertThat(result.dimensions().get("performance")).isGreaterThan(0.0);
    }

    @Test
    @DisplayName("budget category classification follows the ratio thresholds")
    void budgetClassification() {
        BigDecimal budget = BigDecimal.valueOf(100000);
        assertThat(engine.classifyBudget(BigDecimal.valueOf(90000), budget, 50)).isEqualTo("WITHIN_BUDGET");
        assertThat(engine.classifyBudget(BigDecimal.valueOf(105000), budget, 50)).isEqualTo("SLIGHTLY_ABOVE_BUDGET");
        assertThat(engine.classifyBudget(BigDecimal.valueOf(115000), budget, 50)).isEqualTo("PREMIUM_ALTERNATIVE");
        assertThat(engine.classifyBudget(BigDecimal.valueOf(140000), budget, 50)).isEqualTo("NOT_SUITABLE");
    }

    @Test
    @DisplayName("used weights only include dimensions actually present in the weight map")
    void usedWeightsSubset() {
        ProductInput product = new ProductInput("Dell", BigDecimal.valueOf(4.5), 10,
                BigDecimal.valueOf(60000),
                laptopSpecs("Intel Core i5", 16, 512, 10, 1.8, "1080p", "Windows 11", "Intel Iris Xe"));
        Map<String, Double> onlyPerformance = Map.of("performance", 2.0);

        Result result = engine.score(product, Constraints.none(), onlyPerformance);

        assertThat(result.usedWeights()).containsOnlyKeys("performance");
        assertThat(result.advantages()).isNotNull();
    }

    @Test
    @DisplayName("battery and gaming dimension scores respond to specs")
    void dimensionScores() {
        Map<String, SpecValue> specs = laptopSpecs("AMD Ryzen 7", 16, 512, 15, 1.4,
                "QHD", "Windows 11", "NVIDIA GeForce RTX 4070");

        assertThat(engine.batteryScore(specs)).isEqualTo(1.0);
        assertThat(engine.gamingScore(specs)).isEqualTo(1.0);
        assertThat(engine.portabilityScore(specs)).isGreaterThan(0.8);
        List<Double> all = List.of(
                engine.performanceScore(specs), engine.batteryScore(specs),
                engine.portabilityScore(specs), engine.displayScore(specs), engine.gamingScore(specs));
        assertThat(all).allSatisfy(v -> assertThat(v).isBetween(0.0, 1.0));
    }
}
