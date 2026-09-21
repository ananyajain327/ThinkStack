package com.thinkstack.controller;

import com.thinkstack.dto.request.AnswerSubmissionRequest;
import com.thinkstack.dto.request.StartSessionRequest;
import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.ComparisonResponse;
import com.thinkstack.dto.response.DecisionSessionResponse;
import com.thinkstack.dto.response.RecommendationResponse;
import com.thinkstack.service.DecisionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** Authenticated decision sessions, adaptive answers and recommendations. */
@RestController
@RequestMapping("/api/v1/decisions")
public class DecisionController {

    private final DecisionService decisionService;

    public DecisionController(DecisionService decisionService) {
        this.decisionService = decisionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DecisionSessionResponse> startSession(
            @Valid @RequestBody StartSessionRequest request) {
        return ApiResponse.created(decisionService.startSession(request));
    }

    @GetMapping("/mine")
    public ApiResponse<List<DecisionSessionResponse>> mySessions() {
        return ApiResponse.ok(decisionService.mySessions());
    }

    @GetMapping("/{sessionId}")
    public ApiResponse<DecisionSessionResponse> getSession(@PathVariable UUID sessionId) {
        return ApiResponse.ok(decisionService.getSession(sessionId));
    }

    @PostMapping("/{sessionId}/answers")
    public ApiResponse<DecisionSessionResponse> submitAnswers(
            @PathVariable UUID sessionId,
            @RequestBody List<@Valid AnswerSubmissionRequest> answers) {
        return ApiResponse.ok(decisionService.submitAnswers(sessionId, answers));
    }

    @PostMapping("/{sessionId}/recommendations")
    public ApiResponse<List<RecommendationResponse>> runRecommendations(
            @PathVariable UUID sessionId) {
        return ApiResponse.ok(decisionService.runRecommendations(sessionId));
    }

    @GetMapping("/{sessionId}/recommendations")
    public ApiResponse<List<RecommendationResponse>> getRecommendations(
            @PathVariable UUID sessionId) {
        return ApiResponse.ok(decisionService.getRecommendations(sessionId));
    }

    @GetMapping("/{sessionId}/compare")
    public ApiResponse<ComparisonResponse> compare(@PathVariable UUID sessionId) {
        return ApiResponse.ok(decisionService.compareSession(sessionId, false));
    }

    @GetMapping("/{sessionId}/compare/alternatives")
    public ApiResponse<ComparisonResponse> compareAlternatives(@PathVariable UUID sessionId) {
        return ApiResponse.ok(decisionService.compareSession(sessionId, true));
    }

    @PostMapping("/{sessionId}/alternatives/{productId}")
    public ApiResponse<Void> addAlternative(@PathVariable UUID sessionId,
                                            @PathVariable UUID productId) {
        decisionService.addAlternative(sessionId, productId);
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/{sessionId}/alternatives/{productId}")
    public ApiResponse<Void> removeAlternative(@PathVariable UUID sessionId,
                                               @PathVariable UUID productId) {
        decisionService.removeAlternative(sessionId, productId);
        return ApiResponse.ok(null);
    }
}