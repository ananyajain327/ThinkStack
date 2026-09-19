package com.thinkstack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** A single seller's current price for a product. */
@Entity
@Table(name = "product_prices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "seller_name", nullable = false, length = 200)
    private String sellerName;

    @Column(name = "seller_url", length = 512)
    private String sellerUrl;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /** Strikethrough/original price, used to compute the discount. */
    @Column(name = "original_price", precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(length = 3)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "in_stock", nullable = false)
    @Builder.Default
    private Boolean inStock = true;

    @Column(name = "shipping_cost", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(length = 50)
    private String availability;

    @Column(name = "seller_rating", precision = 3, scale = 2)
    private BigDecimal sellerRating;

    @Column(name = "delivery_info", length = 200)
    private String deliveryInfo;

    @Column(name = "last_checked_at")
    private Instant lastCheckedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}