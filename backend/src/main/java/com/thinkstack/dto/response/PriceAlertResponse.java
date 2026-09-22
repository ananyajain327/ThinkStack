package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** A price alert with the product's current best price and trigger status. */
public record PriceAlertResponse(
        UUID id,
        UUID productId,
        String productName,
        String productSlug,
        String imageUrl,
        BigDecimal targetPrice,
        BigDecimal currentBestPrice,
        /** TRIGGERED when currentBestPrice <= targetPrice, otherwise ACTIVE. */
        String status,
        Boolean isActive,
        Instant createdAt) {
}