package com.thinkstack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Decision DNA: a lightly-updated profile of a user's product-decision
 * preferences (e.g. "prioritizes value", "prefers long battery life").
 * It only reflects purchasing preferences, never sensitive attributes.
 */
@Entity
@Table(name = "decision_dna",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "factor"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DecisionDna {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String factor;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal score = BigDecimal.ZERO;

    @Column(name = "sample_size", nullable = false)
    @Builder.Default
    private Integer sampleSize = 0;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}