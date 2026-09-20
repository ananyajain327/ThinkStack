package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** A user's decision session with its answers so far. */
public record DecisionSessionResponse(
        UUID id,
        String title,
        String categorySlug,
        String categoryName,
        UUID wizardId,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        String priorityWeights,
        String requirementProfile,
        String status,
        Instant createdAt,
        Instant updatedAt,
        List<AnswerResponse> answers) {

    public record AnswerResponse(
            UUID id,
            String questionKey,
            String questionText,
            String questionType,
            String answerValue,
            Instant createdAt) {
    }
}