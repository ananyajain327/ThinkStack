package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** A wizard with its ordered questions (options kept as raw JSON for the client to parse). */
public record WizardResponse(
        UUID id,
        String name,
        String description,
        String categorySlug,
        String categoryName,
        List<WizardQuestionResponse> questions) {

    public record WizardQuestionResponse(
            UUID id,
            String questionKey,
            String questionText,
            String questionType,
            String options,
            String helpText,
            String visibleIf,
            BigDecimal weight,
            Integer displayOrder,
            boolean required) {
    }
}