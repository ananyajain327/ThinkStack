package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

/** One specification cell for a product within a comparison row. */
public record ComparisonCell(
        UUID productId,
        String displayValue,
        String textValue,
        BigDecimal numericValue,
        Boolean booleanValue) {
}