package com.thinkstack.dto.response;

import com.thinkstack.entity.Bookmark;

import java.time.Instant;
import java.util.UUID;

/** A user bookmark for a product or a decision session. */
public record BookmarkResponse(
        UUID id,
        String bookmarkType,
        BookmarkProduct product,
        BookmarkSession session,
        Instant createdAt) {

    public record BookmarkProduct(
            UUID id, String name, String slug, String brand,
            String imageUrl, java.math.BigDecimal bestPrice, java.math.BigDecimal avgRating,
            int reviewCount) {
    }

    public record BookmarkSession(
            UUID id, String title, String categorySlug, String status, Instant createdAt) {
    }
}