package com.thinkstack.security;

import com.thinkstack.exception.ThinkStackException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Signs and verifies HMAC-SHA JWTs for access and refresh tokens.
 * The signing key is derived from the configured secret (must be at least 32 bytes).
 */
@Service
public class JwtService {

    public static final String CLAIM_USERNAME = "username";
    public static final String CLAIM_EMAIL = "email";
    public static final String CLAIM_ROLE = "role";
    public static final String CLAIM_TYPE = "typ";

    public static final String TYPE_ACCESS = "access";
    public static final String TYPE_REFRESH = "refresh";

    private final SecretKey key;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${thinkstack.jwt.secret}") String secret,
            @Value("${thinkstack.jwt.expiration-ms}") long accessExpirationMs,
            @Value("${thinkstack.jwt.refresh-expiration-ms}") long refreshExpirationMs) {

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "thinkstack.jwt.secret must be at least 32 bytes; set JWT_SECRET");
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateAccessToken(UUID userId, String username, String email, String role) {
        return buildToken(userId, username, email, role, TYPE_ACCESS, accessExpirationMs);
    }

    public String generateRefreshToken(UUID userId, String username, String email, String role) {
        return buildToken(userId, username, email, role, TYPE_REFRESH, refreshExpirationMs);
    }

    private String buildToken(UUID userId, String username, String email, String role,
                              String type, long expirationMs) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIM_USERNAME, username)
                .claim(CLAIM_EMAIL, email)
                .claim(CLAIM_ROLE, role)
                .claim(CLAIM_TYPE, type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }

    public UUID extractUserId(String token) {
        String subject = extractAllClaims(token).getSubject();
        if (subject == null) {
            throw new ThinkStackException("Token has no subject", "INVALID_TOKEN");
        }
        return UUID.fromString(subject);
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).get(CLAIM_USERNAME, String.class);
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).get(CLAIM_EMAIL, String.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get(CLAIM_ROLE, String.class);
    }

    public boolean isTokenType(String token, String type) {
        return type.equals(extractAllClaims(token).get(CLAIM_TYPE, String.class));
    }

    public boolean isTokenValid(String token) {
        try {
            return extractAllClaims(token).getExpiration().after(new Date());
        } catch (RuntimeException ex) {
            return false;
        }
    }

    public boolean isAccessTokenValid(String token) {
        return isTokenValid(token)
                && TYPE_ACCESS.equals(extractAllClaims(token).get(CLAIM_TYPE, String.class));
    }

    public boolean isRefreshTokenValid(String token) {
        return isTokenValid(token)
                && TYPE_REFRESH.equals(extractAllClaims(token).get(CLAIM_TYPE, String.class));
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception ex) {
            throw new ThinkStackException("Invalid or expired token", "INVALID_TOKEN");
        }
    }
}