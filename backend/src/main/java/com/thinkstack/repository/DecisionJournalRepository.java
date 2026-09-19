package com.thinkstack.repository;

import com.thinkstack.entity.DecisionJournal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DecisionJournalRepository extends JpaRepository<DecisionJournal, UUID> {

    List<DecisionJournal> findByUserIdOrderByCreatedAtDesc(UUID userId);
}