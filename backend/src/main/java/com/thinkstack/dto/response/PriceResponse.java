package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** A single seller's current offer for a product. */
public record PriceResponse(
        UUID id,
        String sellerName,
        String sellerUrl,
        BigDecimal price,
        BigDecimal originalPrice,
        String currency,
        boolean inStock,
        BigDecimal shippingCost,
        String availability,
        BigDecimal sellerRating,
        String deliveryInfo,
        Instant lastCheckedAt) {
}