package com.thinkstack.security;

import com.thinkstack.exception.ThinkStackException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Convenience accessors for the currently authenticated user. Safe to call from
 * controller/service code once the JwtAuthenticationFilter has populated the context.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static ThinkStackUserDetails currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof ThinkStackUserDetails userDetails)) {
            throw new ThinkStackException("Authentication required", "UNAUTHENTICATED");
        }
        return userDetails;
    }

    public static UUID currentUserId() {
        return currentUser().getId();
    }
}
