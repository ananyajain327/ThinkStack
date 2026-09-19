package com.thinkstack.repository;

import com.thinkstack.entity.WizardAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WizardAnswerRepository extends JpaRepository<WizardAnswer, UUID> {

    List<WizardAnswer> findBySessionId(UUID sessionId);
}