package com.thinkstack.service;

import com.thinkstack.dto.request.LoginRequest;
import com.thinkstack.dto.request.RefreshRequest;
import com.thinkstack.dto.request.RegisterRequest;
import com.thinkstack.dto.response.AuthResponse;
import com.thinkstack.entity.User;
import com.thinkstack.exception.ThinkStackException;
import com.thinkstack.repository.UserRepository;
import com.thinkstack.security.JwtService;
import com.thinkstack.security.ThinkStackUserDetails;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Register, login and token-refresh operations for the ThinkStack API.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ThinkStackException("Email is already registered", "EMAIL_TAKEN");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ThinkStackException("Username is already taken", "USERNAME_TAKEN");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName() != null
                        ? request.getDisplayName()
                        : request.getUsername())
                .role("USER")
                .isActive(true)
                .build();

        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getUsernameOrEmail())
                .or(() -> userRepository.findByUsername(request.getUsernameOrEmail()))
                .orElseThrow(() -> new ThinkStackException("Invalid credentials", "INVALID_CREDENTIALS"));

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        if (!jwtService.isRefreshTokenValid(request.getRefreshToken())) {
            throw new ThinkStackException("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
        }

        User user = userRepository.findById(jwtService.extractUserId(request.getRefreshToken()))
                .orElseThrow(() -> new ThinkStackException("User not found", "USER_NOT_FOUND"));

        return buildAuthResponse(user);
    }

    public AuthResponse fromDetails(ThinkStackUserDetails userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ThinkStackException("User not found", "USER_NOT_FOUND"));
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        Instant now = Instant.now();
        return AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(jwtService.generateAccessToken(
                        user.getId(), user.getUsername(), user.getEmail(), user.getRole()))
                .refreshToken(jwtService.generateRefreshToken(
                        user.getId(), user.getUsername(), user.getEmail(), user.getRole()))
                .issuedAt(now)
                .build();
    }
}