package com.thinkstack.dto.response;

import java.time.Instant;
import java.util.List;

public record DecisionSummaryResponse(
        String sessionTitle,
        String category,
        int recommendationCount,
        String topRecommendation,
        List<String> keyReasons,
        List<String> caveats,
        boolean aiGenerated,
        Instant generatedAt) {
}
