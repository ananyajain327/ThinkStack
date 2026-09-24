package com.thinkstack.dto.response;

import java.time.Instant;
import java.util.UUID;

/** A user's saved decision preferences. */
public record UserPreferenceResponse(
        UUID id,
        String experienceLevel,
        String brandPreferences,
        String osPreferences,
        String defaultCurrency,
        Boolean notifyPriceDrops,
        Instant createdAt,
        Instant updatedAt) {
}