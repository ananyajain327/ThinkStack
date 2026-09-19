package com.thinkstack.controller;

import com.thinkstack.dto.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @Value("${spring.application.name:ThinkStack API}")
    private String appName;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> healthData = Map.of(
                "status", "UP",
                "service", appName,
                "version", "0.1.0-SNAPSHOT",
                "timestamp", Instant.now().toString()
        );

        return ResponseEntity.ok(ApiResponse.ok("Service is healthy", healthData));
    }
}
