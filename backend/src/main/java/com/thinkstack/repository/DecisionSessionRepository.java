package com.thinkstack.repository;

import com.thinkstack.entity.DecisionSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DecisionSessionRepository extends JpaRepository<DecisionSession, UUID> {

    List<DecisionSession> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<DecisionSession> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status);

    List<DecisionSession> findByCategoryIdOrderByCreatedAtDesc(UUID categoryId);
}