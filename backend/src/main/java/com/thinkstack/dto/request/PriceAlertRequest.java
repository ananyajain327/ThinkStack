package com.thinkstack.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceAlertRequest {

    @NotNull
    private UUID productId;

    @NotNull
    @DecimalMin(value = "0", inclusive = false)
    private BigDecimal targetPrice;
}