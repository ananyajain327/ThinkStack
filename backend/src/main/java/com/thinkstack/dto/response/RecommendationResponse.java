package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

/** A single ranked recommendation with full explainability. */
public record RecommendationResponse(
        UUID id,
        int rankPosition,
        ProductSummaryResponse product,
        BigDecimal overallScore,
        BigDecimal confidenceRating,
        String budgetCategory,
        BigDecimal valueScore,
        BigDecimal featureMatch,
        BigDecimal performanceMatch,
        BigDecimal reviewSentiment,
        String scoreBreakdown,
        String explainability,
        String advantages,
        String disadvantages,
        String dealBreakers,
        String tradeOffs) {
}