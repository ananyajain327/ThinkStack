package com.thinkstack.dto.response;

import java.time.Instant;
import java.util.UUID;

/** One post-purchase journal entry. */
public record JournalEntryResponse(
        UUID id,
        UUID sessionId,
        UUID productId,
        String productName,
        String title,
        String notes,
        String outcome,
        String outcomeNotes,
        Integer satisfactionRating,
        Boolean wouldBuyAgain,
        String tags,
        Instant createdAt,
        Instant updatedAt) {
}