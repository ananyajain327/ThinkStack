package com.thinkstack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * A user's decision session (what they are trying to buy, their budget,
 * and their priorities). User-specific data is kept separate from the
 * global product catalog.
 */
@Entity
@Table(name = "decision_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DecisionSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wizard_id")
    private DecisionWizard wizard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(length = 300)
    private String title;

    @Column(name = "budget_min", precision = 12, scale = 2)
    private BigDecimal budgetMin;

    @Column(name = "budget_max", precision = 12, scale = 2)
    private BigDecimal budgetMax;

    /** Derived priority weights (JSON) used by the recommendation engine. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "priority_weights", columnDefinition = "jsonb")
    private String priorityWeights;

    /** Computed requirement profile / normalized wizard answers (JSON). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "requirement_profile", columnDefinition = "jsonb")
    private String requirementProfile;

    /** IN_PROGRESS / COMPLETED / ABANDONED */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "IN_PROGRESS";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}