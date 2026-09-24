package com.thinkstack.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferenceRequest {

    @Pattern(regexp = "BEGINNER|INTERMEDIATE|ADVANCED", message = "experienceLevel must be BEGINNER, INTERMEDIATE or ADVANCED")
    private String experienceLevel;

    private String brandPreferences;

    private String osPreferences;

    @Pattern(regexp = "INR|USD|EUR", message = "defaultCurrency must be INR, USD or EUR")
    private String defaultCurrency;

    private Boolean notifyPriceDrops;
}