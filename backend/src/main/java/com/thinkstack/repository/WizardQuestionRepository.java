package com.thinkstack.repository;

import com.thinkstack.entity.WizardQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WizardQuestionRepository extends JpaRepository<WizardQuestion, UUID> {

    List<WizardQuestion> findByWizardIdOrderByDisplayOrderAsc(UUID wizardId);
}