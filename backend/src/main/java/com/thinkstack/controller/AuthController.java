package com.thinkstack.controller;

import com.thinkstack.dto.request.LoginRequest;
import com.thinkstack.dto.request.RefreshRequest;
import com.thinkstack.dto.request.RegisterRequest;
import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.AuthResponse;
import com.thinkstack.security.SecurityUtils;
import com.thinkstack.security.ThinkStackUserDetails;
import com.thinkstack.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Registered successfully", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Logged in successfully", authService.login(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.ok("Token refreshed", authService.refresh(request));
    }

    @GetMapping("/me")
    public ApiResponse<AuthResponse> me(@AuthenticationPrincipal ThinkStackUserDetails userDetails) {
        return ApiResponse.ok("Current user", authService.fromDetails(userDetails));
    }
}