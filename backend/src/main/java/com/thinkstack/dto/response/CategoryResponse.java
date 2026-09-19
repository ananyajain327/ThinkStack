package com.thinkstack.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Public representation of a product category including its filterable
 * specification definitions.
 */
public record CategoryResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String icon,
        Integer displayOrder,
        long productCount,
        List<SpecDefinitionResponse> specDefinitions) {

    public record SpecDefinitionResponse(
            UUID id,
            String name,
            String keyName,
            String dataType,
            String unit,
            String explanation,
            boolean isRequired,
            boolean isFilterable,
            Integer displayOrder) {
    }
}