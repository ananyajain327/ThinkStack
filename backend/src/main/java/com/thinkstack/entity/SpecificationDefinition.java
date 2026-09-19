package com.thinkstack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "specification_definitions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"category_id", "key_name"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecificationDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "key_name", nullable = false, length = 100)
    private String keyName;

    /** TEXT / NUMERIC / BOOLEAN */
    @Column(name = "data_type", nullable = false, length = 20)
    @Builder.Default
    private String dataType = "TEXT";

    @Column(name = "unit", length = 30)
    private String unit;

    /** Beginner-friendly, plain-language explanation of what this spec means. */
    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private Boolean isRequired = false;

    @Column(name = "is_filterable", nullable = false)
    @Builder.Default
    private Boolean isFilterable = false;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}