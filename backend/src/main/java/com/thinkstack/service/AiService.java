package com.thinkstack.service;

import com.thinkstack.dto.response.DecisionSummaryResponse;

import java.util.UUID;

public interface AiService {
    /**
     * Generate a concise, factual summary of a decision session and its top recommendations.
     * Must never fabricate prices/specs. If AI is disabled or unavailable, returns null.
     */
    DecisionSummaryResponse generateDecisionSummary(UUID sessionId);
}
