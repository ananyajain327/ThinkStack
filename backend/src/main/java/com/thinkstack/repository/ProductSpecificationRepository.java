package com.thinkstack.repository;

import com.thinkstack.entity.ProductSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductSpecificationRepository extends JpaRepository<ProductSpecification, UUID> {

    List<ProductSpecification> findByProductId(UUID productId);
}