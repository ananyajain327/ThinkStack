package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** One factor in a user's decision DNA. */
public record DnaFactorResponse(
        UUID id,
        String factor,
        BigDecimal score,
        int sampleSize,
        Instant updatedAt) {
}