package com.thinkstack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** A point in a product's price history (used for charts and price-drop detection). */
@Entity
@Table(name = "price_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "seller_name", length = 200)
    private String sellerName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(length = 3)
    @Builder.Default
    private String currency = "INR";

    /** When this price point was recorded (also serves as the creation time). */
    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;
}