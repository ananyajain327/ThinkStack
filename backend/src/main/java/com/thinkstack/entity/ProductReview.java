package com.thinkstack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** A review of a product. Every review keeps its source for transparency. */
@Entity
@Table(name = "product_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** USER / EXPERT / EDITORIAL */
    @Column(name = "review_type", nullable = false, length = 20)
    @Builder.Default
    private String reviewType = "USER";

    /** Where the review came from, e.g. "Amazon.in" or "TechNook (expert)". */
    @Column(length = 100)
    private String source;

    @Column(name = "source_url", length = 512)
    private String sourceUrl;

    @Column(name = "author_name", length = 200)
    private String authorName;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    /** POSITIVE / NEUTRAL / NEGATIVE */
    @Column(length = 20)
    private String sentiment;

    @Column(name = "sentiment_score", precision = 5, scale = 4)
    private BigDecimal sentimentScore;

    @Column(name = "verified_purchase", nullable = false)
    @Builder.Default
    private Boolean verifiedPurchase = false;

    @Column(name = "helpful_count", nullable = false)
    @Builder.Default
    private Integer helpfulCount = 0;

    @Column(name = "review_date")
    private LocalDate reviewDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}