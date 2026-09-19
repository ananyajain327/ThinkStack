package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Full product detail: summary + description + specifications + sellers + reviews. */
public record ProductDetailResponse(
        UUID id,
        String name,
        String slug,
        String brand,
        String model,
        String categorySlug,
        String categoryName,
        String description,
        String imageUrl,
        BigDecimal basePrice,
        BigDecimal bestPrice,
        String currency,
        BigDecimal avgRating,
        int reviewCount,
        List<SpecValueResponse> specifications,
        List<PriceResponse> prices,
        List<ReviewResponse> reviews) {
}