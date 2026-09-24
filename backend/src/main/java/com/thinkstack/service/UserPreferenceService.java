package com.thinkstack.service;

import com.thinkstack.dto.request.UserPreferenceRequest;
import com.thinkstack.dto.response.UserPreferenceResponse;
import com.thinkstack.entity.User;
import com.thinkstack.entity.UserPreference;
import com.thinkstack.repository.UserPreferenceRepository;
import com.thinkstack.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/** Reads and updates the current user's saved decision preferences. */
@Service
public class UserPreferenceService {

    private final UserPreferenceRepository preferenceRepository;

    public UserPreferenceService(UserPreferenceRepository preferenceRepository) {
        this.preferenceRepository = preferenceRepository;
    }

    @Transactional(readOnly = true)
    public UserPreferenceResponse getCurrent() {
        return toResponse(findOrCreate(SecurityUtils.currentUserId()));
    }

    @Transactional
    public UserPreferenceResponse update(UserPreferenceRequest request) {
        UserPreference preference = findOrCreate(SecurityUtils.currentUserId());
        if (request.getExperienceLevel() != null) {
            preference.setExperienceLevel(request.getExperienceLevel());
        }
        if (request.getBrandPreferences() != null) {
            preference.setBrandPreferences(request.getBrandPreferences());
        }
        if (request.getOsPreferences() != null) {
            preference.setOsPreferences(request.getOsPreferences());
        }
        if (request.getDefaultCurrency() != null) {
            preference.setDefaultCurrency(request.getDefaultCurrency());
        }
        if (request.getNotifyPriceDrops() != null) {
            preference.setNotifyPriceDrops(request.getNotifyPriceDrops());
        }
        return toResponse(preferenceRepository.save(preference));
    }

    private UserPreference findOrCreate(UUID userId) {
        return preferenceRepository.findByUserId(userId).orElseGet(() -> {
            UserPreference created = UserPreference.builder()
                    .user(User.builder().id(userId).build())
                    .build();
            return preferenceRepository.save(created);
        });
    }

    private UserPreferenceResponse toResponse(UserPreference preference) {
        return new UserPreferenceResponse(
                preference.getId(), preference.getExperienceLevel(),
                preference.getBrandPreferences(), preference.getOsPreferences(),
                preference.getDefaultCurrency(), preference.getNotifyPriceDrops(),
                preference.getCreatedAt(), preference.getUpdatedAt());
    }
}