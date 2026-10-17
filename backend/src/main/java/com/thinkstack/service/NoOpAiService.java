package com.thinkstack.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thinkstack.config.AiProperties;
import com.thinkstack.dto.response.DecisionSummaryResponse;
import com.thinkstack.dto.response.RecommendationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(prefix = "ai", name = "enabled",
        havingValue = "false", matchIfMissing = true)
public class NoOpAiService implements AiService {
    private static final Logger log = LoggerFactory.getLogger(NoOpAiService.class);
    private final DecisionService decisionService;
    private final AiProperties properties;
    private final ObjectMapper objectMapper;

    public NoOpAiService(DecisionService decisionService, AiProperties properties, ObjectMapper objectMapper) {
        this.decisionService = decisionService;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    public DecisionSummaryResponse generateDecisionSummary(UUID sessionId) {
        List<RecommendationResponse> recs = decisionService.getRecommendations(sessionId);
        if (recs.isEmpty()) {
            return new DecisionSummaryResponse("Decision", "Unknown", 0, null,
                    List.of(), List.of(), false, Instant.now());
        }
        RecommendationResponse top = recs.get(0);

        // If AI is configured we could call an external provider here. To guarantee we never
        // fabricate data, this build ships a deterministic, local summariser derived strictly
        // from the already-computed scores/explainability.
        boolean aiGenerated = false;
        if (properties.isEnabled() && properties.getApiKey() != null && !properties.getApiKey().isBlank()) {
            log.debug("AI enabled; still using local summariser in this build to avoid fabrication");
        }

        List<String> reasons = parseJsonList(top.advantages());
        reasons = reasons.stream().limit(2).toList();

        List<String> caveats = parseJsonList(top.dealBreakers());
        caveats = new ArrayList<>(caveats.stream().limit(2).toList());
        if (caveats.isEmpty()) {
            caveats.addAll(parseJsonList(top.tradeOffs()).stream().limit(1).toList());
        }

        return new DecisionSummaryResponse(
                top.product().name(),
                top.product().categoryName(),
                recs.size(),
                top.product().name() + " (" + Math.round(top.overallScore().doubleValue()) + "/100)",
                reasons,
                caveats,
                aiGenerated,
                Instant.now());
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
