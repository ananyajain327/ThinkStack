package com.thinkstack.controller;

import com.thinkstack.dto.request.UserPreferenceRequest;
import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.UserPreferenceResponse;
import com.thinkstack.service.UserPreferenceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Authenticated user preferences. */
@RestController
@RequestMapping("/api/v1/me/preferences")
public class UserPreferenceController {

    private final UserPreferenceService preferenceService;

    public UserPreferenceController(UserPreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    @GetMapping
    public ApiResponse<UserPreferenceResponse> get() {
        return ApiResponse.ok(preferenceService.getCurrent());
    }

    @PutMapping
    public ApiResponse<UserPreferenceResponse> update(
            @Valid @RequestBody UserPreferenceRequest request) {
        return ApiResponse.ok(preferenceService.update(request));
    }
}