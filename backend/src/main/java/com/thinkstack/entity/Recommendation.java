package com.thinkstack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recommendations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "product_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private DecisionSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "rank_position", nullable = false)
    private Integer rankPosition;

    @Column(name = "overall_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "confidence_rating", nullable = false, precision = 5, scale = 2)
    private BigDecimal confidenceRating;

    /** WITHIN_BUDGET / SLIGHTLY_ABOVE_BUDGET / PREMIUM_ALTERNATIVE / EXCEPTIONAL_VALUE / POOR_VALUE / NOT_SUITABLE */
    @Column(name = "budget_category", length = 30)
    private String budgetCategory;

    @Column(name = "value_score", precision = 5, scale = 2)
    private BigDecimal valueScore;

    @Column(name = "feature_match", precision = 5, scale = 2)
    private BigDecimal featureMatch;

    @Column(name = "performance_match", precision = 5, scale = 2)
    private BigDecimal performanceMatch;

    @Column(name = "review_sentiment", precision = 5, scale = 2)
    private BigDecimal reviewSentiment;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "score_breakdown", columnDefinition = "jsonb")
    private String scoreBreakdown;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String explainability;

    /** Good points tied to the user's priorities. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String advantages;

    /** Weak points and trade-offs. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String disadvantages;

    /** Hard constraints this product violates (if any). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "deal_breakers", columnDefinition = "jsonb")
    private String dealBreakers;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String tradeOffs;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}