package com.thinkstack.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thinkstack.config.AiProperties;
import com.thinkstack.dto.response.DecisionSummaryResponse;
import com.thinkstack.dto.response.RecommendationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Optional OpenAI-backed summariser. Activated only when {@code ai.enabled=true} and an
 * API key is present; otherwise {@link NoOpAiService} handles the request. The prompt is
 * explicitly constrained to only use the provided facts so it never invents prices or specs,
 * and the response is returned as a free-text paragraph plus the original data.
 */
@Service
@ConditionalOnProperty(prefix = "ai", name = "enabled", havingValue = "true")
public class OpenAiAiService implements AiService {
    private static final Logger log = LoggerFactory.getLogger(OpenAiAiService.class);

    private final DecisionService decisionService;
    private final AiProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public OpenAiAiService(DecisionService decisionService, AiProperties properties, ObjectMapper objectMapper) {
        this.decisionService = decisionService;
        this.properties = properties;
        this.objectMapper = objectMapper;
        String base = (properties.getBaseUrl() == null || properties.getBaseUrl().isBlank())
                ? "https://api.openai.com/v1"
                : properties.getBaseUrl();
        this.restClient = RestClient.builder().baseUrl(base).build();
    }

    @Override
    public DecisionSummaryResponse generateDecisionSummary(UUID sessionId) {
        List<RecommendationResponse> recs = decisionService.getRecommendations(sessionId);
        if (recs.isEmpty()) {
            return new DecisionSummaryResponse("Decision", "Unknown", 0, null,
                    List.of(), List.of(), false, Instant.now());
        }
        RecommendationResponse top = recs.get(0);
        String prompt = buildPrompt(top, recs.size());
        try {
            String text = callModel(prompt);
            if (text != null && !text.isBlank()) {
                return new DecisionSummaryResponse(
                        top.product().name(),
                        top.product().categoryName(),
                        recs.size(),
                        top.product().name() + " (" + Math.round(top.overallScore().doubleValue()) + "/100)",
                        List.of(text),
                        List.of(),
                        true,
                        Instant.now());
            }
        } catch (Exception e) {
            log.warn("OpenAI summary failed, falling back to local summary: {}", e.getMessage());
        }
        // Fallback to the deterministic local summariser to guarantee a response.
        return new NoOpAiService(decisionService, properties, objectMapper)
                .generateDecisionSummary(sessionId);
    }

    private String buildPrompt(RecommendationResponse top, int total) {
        return "Summarise the top recommendation for a product decision. Use ONLY the facts below. "
                + "Do not invent prices, specs, or details not listed. Keep it under 60 words. "
                + "Top pick: " + top.product().name() + " by " + top.product().brand()
                + ", score " + top.overallScore() + "/100, best price " + top.product().bestPrice()
                + " " + top.product().currency() + ", budget category " + top.budgetCategory()
                + ", " + total + " options considered. Advantages: " + top.advantages()
                + ". Caveats: " + top.dealBreakers();
    }

    private String callModel(String prompt) {
        Map<String, Object> body = Map.of(
                "model", properties.getModel(),
                "max_tokens", properties.getMaxTokens(),
                "messages", List.of(Map.of("role", "user", "content", prompt)));
        String response = restClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + properties.getApiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);
        if (response == null) return null;
        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText(null);
        } catch (Exception e) {
            return null;
        }
    }
}
