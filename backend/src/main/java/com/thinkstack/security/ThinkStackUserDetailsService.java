package com.thinkstack.security;

import com.thinkstack.entity.User;
import com.thinkstack.exception.ThinkStackException;
import com.thinkstack.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Bridges ThinkStack's {@link User} (JPA) to Spring Security's {@link UserDetailsService}.
 * Loads by UUID (from the JWT subject) or by email/username (for login).
 */
@Service
public class ThinkStackUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public ThinkStackUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public ThinkStackUserDetails loadByUserId(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ThinkStackException("User not found", "USER_NOT_FOUND"));
        return new ThinkStackUserDetails(user);
    }

    @Override
    public ThinkStackUserDetails loadUserByUsername(String emailOrUsername)
            throws UsernameNotFoundException {
        User user = userRepository.findByEmail(emailOrUsername)
                .or(() -> userRepository.findByUsername(emailOrUsername))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new ThinkStackUserDetails(user);
    }
}
