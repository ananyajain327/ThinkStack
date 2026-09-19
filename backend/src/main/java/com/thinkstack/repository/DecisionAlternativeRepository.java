package com.thinkstack.repository;

import com.thinkstack.entity.DecisionAlternative;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DecisionAlternativeRepository extends JpaRepository<DecisionAlternative, UUID> {

    List<DecisionAlternative> findBySessionId(UUID sessionId);

    boolean existsBySessionIdAndProductId(UUID sessionId, UUID productId);
}