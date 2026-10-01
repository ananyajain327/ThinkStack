package com.thinkstack.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** One unified dashboard-feed item mixing sessions, alerts, notifications and journal entries. */
public record FeedItemResponse(
        UUID id,
        String type,
        String title,
        String body,
        String icon,
        String status,
        String category,
        String productName,
        String productSlug,
        Boolean read,
        Instant occurredAt) {
}