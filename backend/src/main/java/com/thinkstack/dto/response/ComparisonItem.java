package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** One product column in a side-by-side comparison. */
public record ComparisonItem(
        UUID productId,
        ProductSummaryResponse product,
        Integer rank,
        BigDecimal overallScore,
        String budgetCategory,
        List<PriceResponse> sellers) {
}