package com.thinkstack.dto.response;

import java.util.List;
import java.util.UUID;

/** One specification row across all compared products. */
public record ComparisonSpecRow(
        String specKey,
        String specName,
        String dataType,
        String unit,
        List<ComparisonCell> cells) {
}