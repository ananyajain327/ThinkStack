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
@Table(name = "wizard_questions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"wizard_id", "question_key"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WizardQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wizard_id", nullable = false)
    private DecisionWizard wizard;

    @Column(name = "question_key", nullable = false, length = 100)
    private String questionKey;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    /** SINGLE_CHOICE / MULTI_CHOICE / NUMBER / RANGE */
    @Column(name = "question_type", nullable = false, length = 30)
    @Builder.Default
    private String questionType = "SINGLE_CHOICE";

    /** Options as JSON. For choices: [{"label": "...", "value": "..."}].
     *  For NUMBER/RANGE: {"min":..., "max":..., "step":...}. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String options;

    /** Plain-language guidance shown to first-time buyers. */
    @Column(name = "help_text", columnDefinition = "TEXT")
    private String helpText;

    /** Optional JSON condition that decides whether this question is shown,
     *  e.g. {"question_key": "purpose", "equals": "gaming"}. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "visible_if", columnDefinition = "jsonb")
    private String visibleIf;

    /** Importance of this question when computing recommendation scores. */
    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal weight = BigDecimal.ONE;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private Boolean isRequired = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}