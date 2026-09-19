package com.thinkstack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private UUID userId;
    private String username;
    private String email;
    private String role;
    private String accessToken;
    private String refreshToken;
    private long expiresInSeconds;
    private Instant issuedAt;
    private Instant expiresAt;
}
