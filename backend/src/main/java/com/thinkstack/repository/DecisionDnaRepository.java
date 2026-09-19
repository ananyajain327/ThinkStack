package com.thinkstack.repository;

import com.thinkstack.entity.DecisionDna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DecisionDnaRepository extends JpaRepository<DecisionDna, UUID> {

    List<DecisionDna> findByUserId(UUID userId);

    Optional<DecisionDna> findByUserIdAndFactor(UUID userId, String factor);
}