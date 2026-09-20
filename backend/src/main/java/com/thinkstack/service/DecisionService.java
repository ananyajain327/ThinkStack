package com.thinkstack.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thinkstack.dto.request.AnswerSubmissionRequest;
import com.thinkstack.dto.request.StartSessionRequest;
import com.thinkstack.dto.response.DecisionSessionResponse;
import com.thinkstack.dto.response.ProductSummaryResponse;
import com.thinkstack.dto.response.RecommendationResponse;
import com.thinkstack.entity.Category;
import com.thinkstack.entity.DecisionAlternative;
import com.thinkstack.entity.DecisionSession;
import com.thinkstack.entity.DecisionWizard;
import com.thinkstack.entity.Product;
import com.thinkstack.entity.ProductPrice;
import com.thinkstack.entity.ProductSpecification;
import com.thinkstack.entity.Recommendation;
import com.thinkstack.entity.User;
import com.thinkstack.entity.WizardAnswer;
import com.thinkstack.entity.WizardQuestion;
import com.thinkstack.exception.ThinkStackException;
import com.thinkstack.repository.DecisionAlternativeRepository;
import com.thinkstack.repository.DecisionSessionRepository;
import com.thinkstack.repository.DecisionWizardRepository;
import com.thinkstack.repository.ProductPriceRepository;
import com.thinkstack.repository.ProductRepository;
import com.thinkstack.repository.ProductSpecificationRepository;
import com.thinkstack.repository.RecommendationRepository;
import com.thinkstack.repository.WizardAnswerRepository;
import com.thinkstack.repository.WizardQuestionRepository;
import com.thinkstack.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Decision sessions, adaptive answers and the recommendation + explainability engine. */
@Service
public class DecisionService {

    private static final BigDecimal FIVE = BigDecimal.valueOf(5);

    private final DecisionSessionRepository sessionRepository;
    private final DecisionWizardRepository wizardRepository;
    private final WizardQuestionRepository questionRepository;
    private final WizardAnswerRepository answerRepository;
    private final ProductRepository productRepository;
    private final ProductSpecificationRepository productSpecRepository;
    private final ProductPriceRepository priceRepository;
    private final RecommendationRepository recommendationRepository;
    private final DecisionAlternativeRepository alternativeRepository;
    private final ObjectMapper objectMapper;

    public DecisionService(DecisionSessionRepository sessionRepository,
                           DecisionWizardRepository wizardRepository,
                           WizardQuestionRepository questionRepository,
                           WizardAnswerRepository answerRepository,
                           ProductRepository productRepository,
                           ProductSpecificationRepository productSpecRepository,
                           ProductPriceRepository priceRepository,
                           RecommendationRepository recommendationRepository,
                           DecisionAlternativeRepository alternativeRepository,
                           ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.wizardRepository = wizardRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.productRepository = productRepository;
        this.productSpecRepository = productSpecRepository;
        this.priceRepository = priceRepository;
        this.recommendationRepository = recommendationRepository;
        this.alternativeRepository = alternativeRepository;
        this.objectMapper = objectMapper;
    }

    // ---------- session lifecycle ----------

    @Transactional
    public DecisionSessionResponse startSession(StartSessionRequest request) {
        DecisionWizard wizard = resolveWizard(request.getWizardId(), request.getCategorySlug());
        DecisionSession session = DecisionSession.builder()
                .user(User.builder().id(SecurityUtils.currentUserId()).build())
                .wizard(wizard)
                .category(wizard.getCategory())
                .title(request.getTitle())
                .status("IN_PROGRESS")
                .build();
        return toResponse(sessionRepository.save(session));
    }

    @Transactional
    public DecisionSessionResponse submitAnswers(UUID sessionId,
                                                 List<AnswerSubmissionRequest> answerRequests) {
        DecisionSession session = requireOwned(sessionId);
        Map<String, WizardQuestion> questionsByKey = questionRepository
                .findByWizardIdOrderByDisplayOrderAsc(session.getWizard().getId()).stream()
                .collect(Collectors.toMap(WizardQuestion::getQuestionKey, Function.identity()));

        Map<UUID, WizardAnswer> existingByQuestionId = answerRepository.findBySessionId(sessionId).stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), Function.identity()));

        for (AnswerSubmissionRequest request : answerRequests) {
            WizardQuestion question = questionsByKey.get(request.getQuestionKey());
            if (question == null) {
                throw new ThinkStackException("Unknown questionKey: " + request.getQuestionKey(),
                        "BAD_REQUEST");
            }
            WizardAnswer answer = existingByQuestionId.remove(question.getId());
            if (answer == null) {
                answer = WizardAnswer.builder().session(session).question(question).build();
            }
            answer.setAnswerValue(request.getAnswerValue());
            answerRepository.save(answer);
        }
        // answers sent with an empty body replace nothing; orphan removal not required.

        List<WizardAnswer> allAnswers = answerRepository.findBySessionId(sessionId);
        Map<String, String> profile = allAnswers.stream().collect(Collectors.toMap(
                a -> a.getQuestion().getQuestionKey(), WizardAnswer::getAnswerValue));

        session.setRequirementProfile(json(profile));
        session.setPriorityWeights(json(deriveWeights(session.getWizard(), profile)));
        session.setBudgetMin(money(profile.get("budget_min")));
        session.setBudgetMax(money(profile.get("budget_max")));
        session.setStatus("COMPLETED");
        return toResponse(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<DecisionSessionResponse> mySessions() {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(SecurityUtils.currentUserId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DecisionSessionResponse getSession(UUID sessionId) {
        return toResponse(requireOwned(sessionId));
    }

    // ---------- recommendations ----------

    @Transactional
    public List<RecommendationResponse> runRecommendations(UUID sessionId) {
        DecisionSession session = requireOwned(sessionId);
        Category category = session.getCategory();

        List<WizardAnswer> answers = answerRepository.findBySessionId(sessionId);
        Map<String, String> profile = answers.stream().collect(Collectors.toMap(
                a -> a.getQuestion().getQuestionKey(), WizardAnswer::getAnswerValue));

        Map<String, Double> weights = deriveWeights(session.getWizard(), profile);
        BigDecimal budgetMax = money(profile.get("budget_max"));
        String osPreference = clean(profile.get("operating_system"));
        BigDecimal ramMin = money(profile.get("ram_min"));
        BigDecimal storageMin = money(profile.get("storage_min"));
        Set<String> preferredBrands = multiChoice(profile.get("brand_preferences"));

        List<Product> products = productRepository.findByCategoryIdAndIsActiveTrue(category.getId());
        if (products.isEmpty()) {
            throw new ThinkStackException("No products found for this category", "NO_PRODUCTS");
        }
        Map<UUID, Map<String, ProductSpecification>> specsByProduct = products.stream()
                .collect(Collectors.toMap(Product::getId,
                        p -> productSpecRepository.findByProductId(p.getId()).stream()
                                .collect(Collectors.toMap(s -> s.getSpecDef().getKeyName(),
                                        Function.identity()))));

        recommendationRepository.deleteBySessionId(sessionId);

        List<Candidate> candidates = new java.util.ArrayList<>();
        for (Product product : products) {
            Score score = scoreProduct(product, specsByProduct.get(product.getId()), weights,
                    budgetMax, osPreference, ramMin, storageMin, preferredBrands);
            candidates.add(new Candidate(product, score));
        }
        candidates.sort(Comparator.comparing((Candidate c) -> c.score.overall).reversed());

        int rank = 1;
        for (Candidate candidate : candidates) {
            Recommendation rec = Recommendation.builder()
                    .session(session)
                    .product(candidate.product)
                    .rankPosition(rank)
                    .overallScore(bd(candidate.score.overall))
                    .confidenceRating(bd(candidate.score.confidence))
                    .budgetCategory(candidate.score.budgetCategory)
                    .valueScore(bd(candidate.score.value))
                    .featureMatch(bd(candidate.score.featureMatch))
                    .performanceMatch(bd(candidate.score.performanceMatch))
                    .reviewSentiment(bd(candidate.score.reviewSentiment))
                    .scoreBreakdown(scoreBreakdownJson(candidate.score))
                    .explainability(explainabilityJson(candidate))
                    .advantages(json(candidate.score.advantages))
                    .disadvantages(json(candidate.score.disadvantages))
                    .dealBreakers(json(candidate.score.dealBreakers))
                    .tradeOffs(json(candidate.score.tradeOffs))
                    .build();
            recommendationRepository.save(rec);
            rank++;
        }

        return recommendationRepository.findBySessionIdOrderByRankPositionAsc(sessionId)
                .stream().map(this::toRecResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendations(UUID sessionId) {
        requireOwned(sessionId);
        return recommendationRepository.findBySessionIdOrderByRankPositionAsc(sessionId)
                .stream().map(this::toRecResponse).toList();
    }

    // ---------- alternatives shortlist ----------

    @Transactional
    public void addAlternative(UUID sessionId, UUID productId) {
        DecisionSession session = requireOwned(sessionId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ThinkStackException("Product not found", "NOT_FOUND"));
        if (!alternativeRepository.existsBySessionIdAndProductId(sessionId, productId)) {
            alternativeRepository.save(DecisionAlternative.builder()
                    .session(session).product(product).build());
        }
    }

    @Transactional
    public void removeAlternative(UUID sessionId, UUID productId) {
        requireOwned(sessionId);
        alternativeRepository.findBySessionId(sessionId).stream()
                .filter(a -> a.getProduct().getId().equals(productId))
                .forEach(alternativeRepository::delete);
    }

    // ---------- scoring engine ----------

    private Score scoreProduct(Product product,
                               Map<String, ProductSpecification> specs,
                               Map<String, Double> weights,
                               BigDecimal budgetMax,
                               String osPreference,
                               BigDecimal ramMin,
                               BigDecimal storageMin,
                               Set<String> preferredBrands) {
        BigDecimal bestPrice = bestPrice(product);
        List<String> advantages = new java.util.ArrayList<>();
        List<String> disadvantages = new java.util.ArrayList<>();
        List<String> dealBreakers = new java.util.ArrayList<>();
        List<String> tradeOffs = new java.util.ArrayList<>();

        // per-dimension 0..1 scores, 0.5 neutral default so unknowns don't destroy everything
        Map<String, Double> dimensions = new LinkedHashMap<>();
        dimensions.put("performance", performanceScore(product, specs));
        dimensions.put("battery", batteryScore(specs));
        dimensions.put("portability", portabilityScore(specs));
        dimensions.put("display", displayScore(specs));
        dimensions.put("gaming", gamingScore(specs));

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

        // performance vs explicit minimums
        double perfMatch = adequacy(ramOf(specs), ramMin) * 0.5
                + adequacy(storageOf(specs), storageMin) * 0.5;
        double performanceMatch = perfMatch * 100;

        // review sentiment from product aggregate
        double reviewSentiment = product.getAvgRating() == null
                ? 70 : product.getAvgRating().doubleValue() / 5 * 100;

        // value: within budget -> more value the lower price is (relative to budget)
        double value;
        if (budgetMax != null && budgetMax.signum() > 0) {
            double ratio = bestPrice.doubleValue() / budgetMax.doubleValue();
            value = Math.max(0, Math.min(100, 100 - (ratio - 0.3) * 55));
        } else {
            // no budget: rank by having a reasonable low end but not suspiciously cheap
            value = Math.min(100, Math.max(40, (bestPrice == null ? 0 : bestPrice.doubleValue())
                    >= 1000 ? 75 : 45));
        }

        double overall = featureMatch * 0.40 + value * 0.25
                + reviewSentiment * 0.20 + performanceMatch * 0.15;

        // budget category
        String budgetCategory = classifyBudget(bestPrice, budgetMax, value);

        // hard constraints / explainability
        if (budgetMax != null && bestPrice != null && bestPrice.compareTo(budgetMax) > 0) {
            dealBreakers.add("Price ₹" + bestPrice + " exceeds your maximum budget of ₹" + budgetMax);
        }
        String os = text(specs, "os");
        if (!"any".equals(osPreference) && !osPreference.isEmpty() && os != null
                && !os.toLowerCase().contains(osPreference.toLowerCase())) {
            dealBreakers.add("Runs " + os + " but you asked for " + osPreference);
        }
        if (!preferredBrands.isEmpty() && !preferredBrands.isEmpty()
                && product.getBrand() != null
                && !preferredBrands.contains(product.getBrand().toLowerCase())) {
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
        } else if (!disadvantages.isEmpty()) {
            // no-op placeholder to keep list stable
        }
        dimensions.forEach((dim, val) -> {
            if (val < 0.4) {
                disadvantages.add("Weak " + dim.replace('_', ' ') + " ("
                        + Math.round(val * 100) + "% of ideal)");
            }
        });
        if (!preferredBrands.isEmpty() && product.getBrand() != null
                && preferredBrands.contains(product.getBrand().toLowerCase())) {
            advantages.add("Matches your preferred brand " + product.getBrand());
        }
        if (performanceMatch < 40) {
            tradeOffs.add("Performance/storage may fall short of what you asked for");
        }

        double confidence = 50 + 40 * (weightTotal == 0 ? 0 : 1);

        return new Score(overall, confidence, budgetCategory, value, featureMatch,
                performanceMatch, reviewSentiment, dimensions, usedWeights,
                advantages, disadvantages, dealBreakers, tradeOffs, bestPrice);
    }

    private double performanceScore(Product product, Map<String, ProductSpecification> specs) {
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

    private double batteryScore(Map<String, ProductSpecification> specs) {
        BigDecimal hours = num(specs, "battery_life");
        if (hours == null) return 0.5;
        return Math.min(1, hours.doubleValue() / 15.0);
    }

    private double portabilityScore(Map<String, ProductSpecification> specs) {
        BigDecimal weight = num(specs, "weight");
        if (weight == null) return 0.5;
        // lighter is better: 1.7 kg ideal
        return Math.max(0, Math.min(1, (2.6 - weight.doubleValue()) / 1.1));
    }

    private double displayScore(Map<String, ProductSpecification> specs) {
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

    private double gamingScore(Map<String, ProductSpecification> specs) {
        String gpu = text(specs, "gpu");
        if (gpu == null) return 0.3;
        String g = gpu.toLowerCase();
        if (g.contains("rtx") || g.contains("gtx") || g.contains("geforce")) return 1.0;
        if (g.contains("radeon") || g.contains("arc") || g.contains("m2") || g.contains("m3")) return 0.8;
        if (g.contains("iris") || g.contains("uhd") || g.contains("graphics")) return 0.4;
        return 0.5;
    }

    private String classifyBudget(BigDecimal price, BigDecimal budgetMax, double value) {
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

    private double adequacy(BigDecimal have, BigDecimal need) {
        if (need == null || need.signum() <= 0) return 1.0;
        if (have == null) return 0;
        return Math.min(1, have.doubleValue() / need.doubleValue());
    }

    // ---------- helpers ----------

    private BigDecimal bestPrice(Product product) {
        List<ProductPrice> prices = priceRepository.findByProductIdOrderByPriceAsc(product.getId());
        return prices.stream().filter(ProductPrice::getInStock)
                .map(ProductPrice::getPrice).min(Comparator.naturalOrder())
                .orElse(product.getBasePrice());
    }

    private DecisionWizard resolveWizard(UUID wizardId, String categorySlug) {
        if (wizardId != null) {
            return wizardRepository.findById(wizardId)
                    .orElseThrow(() -> new ThinkStackException("Wizard not found", "NOT_FOUND"));
        }
        if (categorySlug != null) {
            return wizardRepository.findByCategorySlugAndIsActiveTrue(categorySlug)
                    .orElseThrow(() -> new ThinkStackException(
                            "No active wizard for category: " + categorySlug, "NOT_FOUND"));
        }
        throw new ThinkStackException("Provide wizardId or categorySlug", "BAD_REQUEST");
    }

    private DecisionSession requireOwned(UUID sessionId) {
        DecisionSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ThinkStackException("Decision session not found", "NOT_FOUND"));
        if (session.getUser() == null
                || !session.getUser().getId().equals(SecurityUtils.currentUserId())) {
            throw new ThinkStackException("Not your decision session", "FORBIDDEN");
        }
        return session;
    }

    private Map<String, Double> deriveWeights(DecisionWizard wizard, Map<String, String> profile) {
        Map<String, WizardQuestion> questions = questionRepository
                .findByWizardIdOrderByDisplayOrderAsc(wizard.getId()).stream()
                .collect(Collectors.toMap(WizardQuestion::getQuestionKey, Function.identity()));
        Map<String, Double> weights = new LinkedHashMap<>();
        for (String dim : List.of("performance", "battery", "portability", "display", "gaming")) {
            WizardQuestion question = questions.get(dim);
            if (question == null) continue;
            double base = question.getWeight() == null ? 1.0 : question.getWeight().doubleValue();
            double importance = importance(profile.get(dim));
            double w = base * (importance == 0 ? 0.6 : importance);
            if (importance == 0 && !profile.containsKey(dim)) w = base * 0.5;
            weights.put(dim, Math.max(0.1, w));
        }
        // purpose boosts
        String purpose = clean(profile.get("purpose"));
        if ("programming".equals(purpose)) weights.put("performance", weights.getOrDefault("performance", 1.0) * 1.4);
        if ("gaming".equals(purpose)) weights.put("gaming", weights.getOrDefault("gaming", 1.0) * 1.4);
        if ("office".equals(purpose)) weights.put("battery", weights.getOrDefault("battery", 1.0) * 1.3);
        if ("portability".equals(purpose)) weights.put("portability", weights.getOrDefault("portability", 1.0) * 1.3);
        return weights;
    }

    private double importance(String raw) {
        try {
            double v = Double.parseDouble(clean(raw));
            v = Math.max(0, Math.min(5, v));
            return v / 5.0;
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private Set<String> multiChoice(String rawJson) {
        Set<String> values = new LinkedHashSet<>();
        if (rawJson == null || rawJson.isBlank()) return values;
        try {
            List<String> list = objectMapper.readValue(rawJson, new TypeReference<List<String>>() {});
            values.addAll(list);
        } catch (Exception e) {
            values.add(clean(rawJson));
        }
        values.remove("any");
        values.remove("");
        return values;
    }

    private BigDecimal money(String raw) {
        String cleaned = clean(raw);
        if (cleaned.isEmpty()) return null;
        try {
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String clean(String raw) {
        if (raw == null) return "";
        String s = raw.trim().replaceAll("[₹\\s,]", "").replace("\"", "");
        return s;
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "[]";
        }
    }

    private BigDecimal bd(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    private String scoreBreakdownJson(Score score) {
        Map<String, Double> breakdown = new LinkedHashMap<>();
        breakdown.put("overall", round(score.overall));
        breakdown.put("featureMatch", round(score.featureMatch));
        breakdown.put("value", round(score.value));
        breakdown.put("reviewSentiment", round(score.reviewSentiment));
        breakdown.put("performanceMatch", round(score.performanceMatch));
        score.dimensions.forEach((dim, val) -> breakdown.put("dim." + dim, round(val * 100)));
        score.usedWeights.forEach((dim, w) -> breakdown.put("weight." + dim, round(w / 5 * 100)));
        return json(breakdown);
    }

    private String explainabilityJson(Candidate candidate) {
        Map<String, Object> explain = new LinkedHashMap<>();
        explain.put("summary", "This option scored "
                + Math.round(candidate.score.overall) + "/100 overall based on your answers.");
        explain.put("bestFeatures", candidate.score.advantages);
        explain.put("weaknesses", candidate.score.disadvantages);
        explain.put("budgetNote", candidate.score.budgetCategory.replace('_', ' ').toLowerCase());
        if (!candidate.score.dealBreakers.isEmpty()) {
            explain.put("dealBreakers", candidate.score.dealBreakers);
        }
        return json(explain);
    }

    private double round(double d) {
        return Math.round(d * 100.0) / 100.0;
    }

    // ---------- mappers ----------

    private DecisionSessionResponse toResponse(DecisionSession session) {
        List<DecisionSessionResponse.AnswerResponse> answers =
                answerRepository.findBySessionId(session.getId()).stream()
                        .map(a -> new DecisionSessionResponse.AnswerResponse(
                                a.getId(), a.getQuestion().getQuestionKey(),
                                a.getQuestion().getQuestionText(),
                                a.getQuestion().getQuestionType(),
                                a.getAnswerValue(), a.getCreatedAt()))
                        .toList();
        return new DecisionSessionResponse(
                session.getId(), session.getTitle(), session.getCategory().getSlug(),
                session.getCategory().getName(), session.getWizard() == null ? null : session.getWizard().getId(),
                session.getBudgetMin(), session.getBudgetMax(), session.getPriorityWeights(),
                session.getRequirementProfile(), session.getStatus(), session.getCreatedAt(),
                session.getUpdatedAt(), answers);
    }

    private RecommendationResponse toRecResponse(Recommendation rec) {
        Product p = rec.getProduct();
        ProductSummaryResponse summary = new ProductSummaryResponse(
                p.getId(), p.getName(), p.getSlug(), p.getBrand(), p.getModel(),
                p.getCategory().getSlug(), p.getCategory().getName(), p.getImageUrl(),
                p.getBasePrice(), bestPrice(p), p.getCurrency(), p.getAvgRating(),
                p.getReviewCount() == null ? 0 : p.getReviewCount());
        return new RecommendationResponse(
                rec.getId(), rec.getRankPosition(), summary, rec.getOverallScore(),
                rec.getConfidenceRating(), rec.getBudgetCategory(), rec.getValueScore(),
                rec.getFeatureMatch(), rec.getPerformanceMatch(), rec.getReviewSentiment(),
                rec.getScoreBreakdown(), rec.getExplainability(), rec.getAdvantages(),
                rec.getDisadvantages(), rec.getDealBreakers(), rec.getTradeOffs());
    }

    // ---------- value objects ----------

    private record Candidate(Product product, Score score) {
    }

    private record Score(double overall, double confidence, String budgetCategory,
                         double value, double featureMatch, double performanceMatch,
                         double reviewSentiment, Map<String, Double> dimensions,
                         Map<String, Double> usedWeights, List<String> advantages,
                         List<String> disadvantages, List<String> dealBreakers,
                         List<String> tradeOffs, BigDecimal bestPrice) {
    }

    // small numeric helpers on specs
    private BigDecimal ramOf(Map<String, ProductSpecification> specs) {
        return num(specs, "ram");
    }

    private BigDecimal storageOf(Map<String, ProductSpecification> specs) {
        return num(specs, "storage");
    }

    private BigDecimal num(Map<String, ProductSpecification> specs, String key) {
        ProductSpecification s = specs.get(key);
        if (s == null) return null;
        if (s.getNumericValue() != null) return s.getNumericValue();
        if (s.getBooleanValue() != null) return s.getBooleanValue() ? BigDecimal.ONE : BigDecimal.ZERO;
        if (s.getTextValue() != null) {
            try {
                return new BigDecimal(s.getTextValue().replaceAll("[^0-9.]", ""));
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private String text(Map<String, ProductSpecification> specs, String key) {
        ProductSpecification s = specs.get(key);
        return s == null ? null : s.getTextValue();
    }
}