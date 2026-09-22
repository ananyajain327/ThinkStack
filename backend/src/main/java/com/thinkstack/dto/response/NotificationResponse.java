package com.thinkstack.dto.response;

import java.time.Instant;
import java.util.UUID;

/** A user notification (price drop, recommendation update, etc.). */
public record NotificationResponse(
        UUID id,
        String type,
        String title,
        String body,
        UUID productId,
        String productName,
        String productSlug,
        Boolean isRead,
        Instant readAt,
        Instant createdAt) {
}