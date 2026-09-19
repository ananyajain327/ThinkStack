package com.thinkstack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/**
 * Stores a user's product-decision preferences (NOT sensitive attributes).
 * Each user has at most one preferences row.
 */
@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** BEGINNER / INTERMEDIATE / ADVANCED */
    @Column(name = "experience_level", length = 20)
    private String experienceLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "brand_preferences", columnDefinition = "jsonb")
    private String brandPreferences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "os_preferences", columnDefinition = "jsonb")
    private String osPreferences;

    @Column(name = "default_currency", nullable = false, length = 3)
    @Builder.Default
    private String defaultCurrency = "INR";

    @Column(name = "notify_price_drops", nullable = false)
    @Builder.Default
    private Boolean notifyPriceDrops = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}