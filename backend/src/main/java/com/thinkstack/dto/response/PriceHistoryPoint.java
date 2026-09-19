package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** One sample point in a product's historical price series. */
public record PriceHistoryPoint(
        UUID id,
        String sellerName,
        BigDecimal price,
        String currency,
        Instant recordedAt) {
}