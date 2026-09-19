package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** A review with full source transparency. */
public record ReviewResponse(
        UUID id,
        String reviewType,
        String source,
        String sourceUrl,
        String authorName,
        BigDecimal rating,
        String title,
        String content,
        String sentiment,
        BigDecimal sentimentScore,
        boolean verifiedPurchase,
        int helpfulCount,
        LocalDate reviewDate,
        Instant createdAt) {
}