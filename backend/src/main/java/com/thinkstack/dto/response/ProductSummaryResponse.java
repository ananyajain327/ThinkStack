package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

/** Lightweight product representation used in list endpoints. */
public record ProductSummaryResponse(
        UUID id,
        String name,
        String slug,
        String brand,
        String model,
        String categorySlug,
        String categoryName,
        String imageUrl,
        BigDecimal basePrice,
        BigDecimal bestPrice,
        String currency,
        BigDecimal avgRating,
        int reviewCount) {
}