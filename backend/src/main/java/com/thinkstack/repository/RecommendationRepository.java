package com.thinkstack.repository;

import com.thinkstack.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, UUID> {

    List<Recommendation> findBySessionIdOrderByRankPositionAsc(UUID sessionId);

    void deleteBySessionId(UUID sessionId);
}