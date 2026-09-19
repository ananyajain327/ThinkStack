package com.thinkstack.repository;

import com.thinkstack.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, UUID> {

    List<ProductReview> findByProductId(UUID productId);

    List<ProductReview> findByProductIdOrderByReviewDateDesc(UUID productId);

    List<ProductReview> findByProductIdAndReviewType(UUID productId, String reviewType);
}