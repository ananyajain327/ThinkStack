package com.thinkstack.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Side-by-side comparison of a decision session's recommended alternatives. */
public record ComparisonResponse(
        UUID sessionId,
        String categorySlug,
        String categoryName,
        Instant generatedAt,
        List<ComparisonItem> items,
        List<ComparisonSpecRow> specRows) {
}