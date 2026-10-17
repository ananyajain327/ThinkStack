package com.thinkstack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Explicit lifecycle transition for a decision session. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDecisionStatusRequest {

    @NotBlank
    @Pattern(
            regexp = "IN_PROGRESS|COMPLETED|PURCHASED|ARCHIVED",
            message = "status must be one of IN_PROGRESS, COMPLETED, PURCHASED, ARCHIVED")
    private String status;
}
