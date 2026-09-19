package com.thinkstack.repository;

import com.thinkstack.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findByCategoryId(UUID categoryId, Pageable pageable);

    Page<Product> findByCategoryIdAndIsActiveOrderByAvgRatingDesc(UUID categoryId, Boolean isActive, Pageable pageable);

    Optional<Product> findBySlug(String slug);

    List<Product> findByBrand(String brand);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId " +
           "AND p.isActive = true " +
           "AND p.basePrice BETWEEN :minPrice AND :maxPrice " +
           "ORDER BY p.avgRating DESC")
    List<Product> findActiveByCategoryAndPriceRange(
            @Param("categoryId") UUID categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice);
}