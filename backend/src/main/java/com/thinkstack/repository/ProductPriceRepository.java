package com.thinkstack.repository;

import com.thinkstack.entity.ProductPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductPriceRepository extends JpaRepository<ProductPrice, UUID> {

    List<ProductPrice> findByProductId(UUID productId);

    List<ProductPrice> findByProductIdOrderByPriceAsc(UUID productId);

    List<ProductPrice> findBySellerNameAndPriceLessThanEqual(String sellerName, BigDecimal price);

    long countByProductId(UUID productId);
}