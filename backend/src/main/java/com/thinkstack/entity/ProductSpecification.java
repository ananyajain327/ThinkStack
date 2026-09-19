package com.thinkstack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "product_specifications",
       uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "spec_def_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spec_def_id", nullable = false)
    private SpecificationDefinition specDef;

    @Column(name = "text_value", columnDefinition = "TEXT")
    private String textValue;

    @Column(name = "numeric_value", precision = 15, scale = 4)
    private BigDecimal numericValue;

    @Column(name = "boolean_value")
    private Boolean booleanValue;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}