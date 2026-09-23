package com.thinkstack.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntryRequest {

    private UUID sessionId;

    private UUID productId;

    @NotBlank
    @Size(max = 300)
    private String title;

    private String notes;

    /** PURCHASED | DECIDED_OTHER | NOT_PURCHASED */
    private String outcome;

    private String outcomeNotes;

    @Min(1)
    @Max(5)
    private Integer satisfactionRating;

    private Boolean wouldBuyAgain;

    private String tags;
}