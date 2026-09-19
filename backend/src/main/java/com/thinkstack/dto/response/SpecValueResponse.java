package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

/** A product's value for one specification, merged with its definition metadata. */
public record SpecValueResponse(
        UUID specDefId,
        String keyName,
        String name,
        String dataType,
        String unit,
        String explanation,
        String textValue,
        BigDecimal numericValue,
        Boolean booleanValue,
        String displayValue) {
}