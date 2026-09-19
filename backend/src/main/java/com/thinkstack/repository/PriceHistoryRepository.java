package com.thinkstack.repository;

import com.thinkstack.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, UUID> {

    List<PriceHistory> findByProductIdOrderByRecordedAtAsc(UUID productId);

    List<PriceHistory> findByProductIdAndSellerNameOrderByRecordedAtAsc(UUID productId, String sellerName);
}