package com.thinkstack.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thinkstack.dto.request.AnswerSubmissionRequest;
import com.thinkstack.dto.request.StartSessionRequest;
import com.thinkstack.dto.response.ComparisonCell;
import com.thinkstack.dto.response.ComparisonItem;
import com.thinkstack.dto.response.ComparisonResponse;
import com.thinkstack.dto.response.ComparisonSpecRow;
import com.thinkstack.dto.response.DecisionSessionResponse;
import com.thinkstack.dto.response.PriceResponse;
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
import com.thinkstack.entity.SpecificationDefinition;
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
import com.thinkstack.repository.SpecificationDefinitionRepository;
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

    private static final Set<String> ALLOWED_STATUSES =
            Set.of("IN_PROGRESS", "COMPLETED", "PURCHASED", "ARCHIVED");

    private final DecisionSessionRepository sessionRepository;
    private final DecisionWizardRepository wizardRepository;
    private final WizardQuestionRepository questionRepository;
    private final WizardAnswerRepository answerRepository;
    private final ProductRepository productRepository;
    private final ProductSpecificationRepository productSpecRepository;
    private final ProductPriceRepository priceRepository;
    private final RecommendationRepository recommendationRepository;
    private final DecisionAlternativeRepository alternativeRepository;
    private final SpecificationDefinitionRepository specDefinitionRepository;
    private final ObjectMapper objectMapper;
    private final RecommendationEngine engine;

    public DecisionService(DecisionSessionRepository sessionRepository,
                           DecisionWizardRepository wizardRepository,
                           WizardQuestionRepository questionRepository,
                           WizardAnswerRepository answerRepository,
                           ProductRepository productRepository,
                           ProductSpecificationRepository productSpecRepository,
                           ProductPriceRepository priceRepository,
                           RecommendationRepository recommendationRepository,
                           DecisionAlternativeRepository alternativeRepository,
                           SpecificationDefinitionRepository specDefinitionRepository,
                           ObjectMapper objectMapper,
                           RecommendationEngine engine) {
        this.sessionRepository = sessionRepository;
        this.wizardRepository = wizardRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.productRepository = productRepository;
        this.productSpecRepository = productSpecRepository;
        this.priceRepository = priceRepository;
        this.recommendationRepository = recommendationRepository;
        this.alternativeRepository = alternativeRepository;
        this.specDefinitionRepository = specDefinitionRepository;
        this.objectMapper = objectMapper;
        this.engine = engine;
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

    @Transactional
    public DecisionSessionResponse updateStatus(UUID sessionId, String status) {
        DecisionSession session = requireOwned(sessionId);
        if (status == null || !ALLOWED_STATUSES.contains(status)) {
            throw new ThinkStackException(
                    "Invalid status. Allowed: " + ALLOWED_STATUSES, "BAD_REQUEST");
        }
        session.setStatus(status);
        return toResponse(sessionRepository.save(session));
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
            RecommendationEngine.ProductInput input = toEngineInput(product, specsByProduct.get(product.getId()));
            RecommendationEngine.Constraints constraints = new RecommendationEngine.Constraints(
                    budgetMax, osPreference, ramMin, storageMin, preferredBrands);
            RecommendationEngine.Result score = engine.score(input, constraints, weights);
            candidates.add(new Candidate(product, score));
        }
        candidates.sort(Comparator.comparing((Candidate c) -> c.score.overall()).reversed());

        int rank = 1;
        for (Candidate candidate : candidates) {
            Recommendation rec = Recommendation.builder()
                    .session(session)
                    .product(candidate.product)
                    .rankPosition(rank)
                    .overallScore(bd(candidate.score.overall()))
                    .confidenceRating(bd(candidate.score.confidence()))
                    .budgetCategory(candidate.score.budgetCategory())
                    .valueScore(bd(candidate.score.value()))
                    .featureMatch(bd(candidate.score.featureMatch()))
                    .performanceMatch(bd(candidate.score.performanceMatch()))
                    .reviewSentiment(bd(candidate.score.reviewSentiment()))
                    .scoreBreakdown(scoreBreakdownJson(candidate.score))
                    .explainability(explainabilityJson(candidate))
                    .advantages(json(candidate.score.advantages()))
                    .disadvantages(json(candidate.score.disadvantages()))
                    .dealBreakers(json(candidate.score.dealBreakers()))
                    .tradeOffs(json(candidate.score.tradeOffs()))
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

    // ---------- side-by-side comparison ----------

    @Transactional(readOnly = true)
    public ComparisonResponse compareSession(UUID sessionId, boolean onlyAlternatives) {
        DecisionSession session = requireOwned(sessionId);

        List<Recommendation> recommendations = onlyAlternatives
                ? java.util.Collections.emptyList()
                : recommendationRepository.findBySessionIdOrderByRankPositionAsc(sessionId);
        List<DecisionAlternative> alternatives = alternativeRepository.findBySessionId(sessionId);

        // columns: alternatives when requested/needed, otherwise ranked recommendations,
        // falling back to alternatives when no recommendations have been generated yet.
        Map<UUID, Recommendation> recByProduct = new java.util.HashMap<>();
        List<Product> products = new java.util.ArrayList<>();
        if (!recommendations.isEmpty()) {
            for (Recommendation r : recommendations) {
                products.add(r.getProduct());
                recByProduct.put(r.getProduct().getId(), r);
            }
        } else {
            for (DecisionAlternative a : alternatives) {
                products.add(a.getProduct());
            }
        }
        if (products.isEmpty()) {
            return emptyComparison(session);
        }

        List<ComparisonItem> items = new java.util.ArrayList<>();
        for (Product product : products) {
            Recommendation rec = recByProduct.get(product.getId());
            items.add(new ComparisonItem(
                    product.getId(), toSummary(product),
                    rec == null ? null : rec.getRankPosition(),
                    rec == null ? null : rec.getOverallScore(),
                    rec == null ? null : rec.getBudgetCategory(),
                    priceRepository.findByProductIdOrderByPriceAsc(product.getId()).stream()
                            .map(this::toPrice).toList()));
        }

        // rows: union of spec defs for the category, ordered by display order
        Map<String, Map<UUID, ProductSpecification>> specsByKey = new java.util.LinkedHashMap<>();
        for (Product product : products) {
            for (ProductSpecification s : productSpecRepository.findByProductId(product.getId())) {
                specsByKey.computeIfAbsent(s.getSpecDef().getKeyName(), k -> new java.util.HashMap<>())
                        .put(product.getId(), s);
            }
        }
        List<ComparisonSpecRow> rows = new java.util.ArrayList<>();
        List<SpecificationDefinition> defs =
                specDefinitionRepository.findByCategoryIdOrderByDisplayOrderAsc(session.getCategory().getId());
        for (SpecificationDefinition def : defs) {
            if (!specsByKey.containsKey(def.getKeyName())) continue;
            Map<UUID, ProductSpecification> cellMap = specsByKey.get(def.getKeyName());
            List<ComparisonCell> cells = products.stream().map(p -> {
                ProductSpecification s = cellMap.get(p.getId());
                if (s == null) {
                    return new ComparisonCell(p.getId(), null, null, null, null);
                }
                String display = displayValue(s, def);
                return new ComparisonCell(p.getId(), display, s.getTextValue(),
                        s.getNumericValue(), s.getBooleanValue());
            }).toList();
            rows.add(new ComparisonSpecRow(def.getKeyName(), def.getName(),
                    def.getDataType(), def.getUnit(), cells));
        }

        return new ComparisonResponse(sessionId, session.getCategory().getSlug(),
                session.getCategory().getName(), java.time.Instant.now(), items, rows);
    }

    private ComparisonResponse emptyComparison(DecisionSession session) {
        return new ComparisonResponse(session.getId(), session.getCategory().getSlug(),
                session.getCategory().getName(), java.time.Instant.now(),
                java.util.Collections.emptyList(), java.util.Collections.emptyList());
    }

    private String displayValue(ProductSpecification spec, SpecificationDefinition def) {
        return switch (def.getDataType()) {
            case "NUMERIC" -> spec.getNumericValue() == null ? null
                    : spec.getNumericValue().stripTrailingZeros().toPlainString()
                    + (def.getUnit() != null ? " " + def.getUnit() : "");
            case "BOOLEAN" -> spec.getBooleanValue() == null ? null
                    : (spec.getBooleanValue() ? "Yes" : "No");
            default -> spec.getTextValue();
        };
    }

    private ProductSummaryResponse toSummary(Product product) {
        return new ProductSummaryResponse(
                product.getId(), product.getName(), product.getSlug(), product.getBrand(),
                product.getModel(), product.getCategory().getSlug(),
                product.getCategory().getName(), product.getImageUrl(), product.getBasePrice(),
                bestPrice(product), product.getCurrency(), product.getAvgRating(),
                product.getReviewCount() == null ? 0 : product.getReviewCount());
    }

    private PriceResponse toPrice(ProductPrice price) {
        return new PriceResponse(
                price.getId(), price.getSellerName(), price.getSellerUrl(), price.getPrice(),
                price.getOriginalPrice(), price.getCurrency(), price.getInStock(),
                price.getShippingCost(), price.getAvailability(), price.getSellerRating(),
                price.getDeliveryInfo(), price.getLastCheckedAt());
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

    // ---------- scoring engine adapter ----------

    private RecommendationEngine.ProductInput toEngineInput(
            Product product, Map<String, ProductSpecification> specs) {
        Map<String, RecommendationEngine.SpecValue> specValues = new LinkedHashMap<>();
        specs.forEach((key, spec) -> specValues.put(key,
                new RecommendationEngine.SpecValue(
                        spec.getTextValue(), spec.getNumericValue(), spec.getBooleanValue())));
        return new RecommendationEngine.ProductInput(
                product.getBrand(), product.getAvgRating(), product.getReviewCount(),
                bestPrice(product), specValues);
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
        Map<String, Double> questionWeights = new LinkedHashMap<>();
        for (String dim : List.of("performance", "battery", "portability", "display", "gaming")) {
            WizardQuestion question = questions.get(dim);
            if (question == null) continue;
            questionWeights.put(dim, question.getWeight() == null ? 1.0 : question.getWeight().doubleValue());
        }
        return engine.deriveWeights(questionWeights, profile);
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

    private String scoreBreakdownJson(RecommendationEngine.Result score) {
        Map<String, Double> breakdown = new LinkedHashMap<>();
        breakdown.put("overall", round(score.overall()));
        breakdown.put("featureMatch", round(score.featureMatch()));
        breakdown.put("value", round(score.value()));
        breakdown.put("reviewSentiment", round(score.reviewSentiment()));
        breakdown.put("performanceMatch", round(score.performanceMatch()));
        score.dimensions().forEach((dim, val) -> breakdown.put("dim." + dim, round(val * 100)));
        score.usedWeights().forEach((dim, w) -> breakdown.put("weight." + dim, round(w / 5 * 100)));
        return json(breakdown);
    }

    private String explainabilityJson(Candidate candidate) {
        RecommendationEngine.Result score = candidate.score;
        Map<String, Object> explain = new LinkedHashMap<>();
        explain.put("summary", "This option scored "
                + Math.round(score.overall()) + "/100 overall based on your answers.");
        explain.put("bestFeatures", score.advantages());
        explain.put("weaknesses", score.disadvantages());
        explain.put("budgetNote", score.budgetCategory().replace('_', ' ').toLowerCase());
        if (!score.dealBreakers().isEmpty()) {
            explain.put("dealBreakers", score.dealBreakers());
        }
        Map<String, Object> dimensionNotes = new LinkedHashMap<>();
        Map<String, Double> weights = score.usedWeights();
        for (Map.Entry<String, Double> e : score.dimensions().entrySet()) {
            String dim = e.getKey();
            Double dimScore = e.getValue();
            Double importance = weights.get(dim);
            if (importance == null) continue;
            Map<String, Object> note = new LinkedHashMap<>();
            note.put("score", round(dimScore * 100));
            note.put("importance", round(importance / 5 * 100));
            note.put("verdict", verdict(dimScore));
            note.put("detail", dimensionDetail(dim, dimScore));
            dimensionNotes.put(dim, note);
        }
        explain.put("dimensions", dimensionNotes);
        return json(explain);
    }

    private String verdict(double score) {
        if (score >= 0.8) return "Excellent fit";
        if (score >= 0.6) return "Good fit";
        if (score >= 0.4) return "Moderate fit";
        return "Weak fit";
    }

    private String dimensionDetail(String dim, double score) {
        return switch (dim) {
            case "performance" -> score >= 0.8
                    ? "Strong processor and RAM keep up with demanding workloads."
                    : "The processor/RAM combo may feel limited for heavy tasks.";
            case "battery" -> score >= 0.8
                    ? "Long battery life that comfortably covers a full day."
                    : "Battery life is modest; a charger will often be needed.";
            case "portability" -> score >= 0.8
                    ? "Light and easy to carry around."
                    : "Heavier than ideal for frequent travel.";
            case "display" -> score >= 0.8
                    ? "Sharp high-resolution panel with a good screen area."
                    : "The display is average, not a standout feature.";
            case "gaming" -> score >= 0.8
                    ? "Discrete GPU handles modern games well."
                    : "Lacks the dedicated GPU modern games expect.";
            default -> "Rated based on your stated importance.";
        };
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

    private record Candidate(Product product, RecommendationEngine.Result score) {
    }
}