package com.thinkstack.dto.request;

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
public class StartSessionRequest {

    /** Optional if categorySlug is provided. */
    private UUID wizardId;

    /** Alternative to wizardId: pick the active wizard for this category. */
    private String categorySlug;

    @Size(max = 300)
    private String title;
}