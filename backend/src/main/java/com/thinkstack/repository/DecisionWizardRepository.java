package com.thinkstack.repository;

import com.thinkstack.entity.DecisionWizard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DecisionWizardRepository extends JpaRepository<DecisionWizard, UUID> {

    Optional<DecisionWizard> findByCategorySlug(String categorySlug);

    Optional<DecisionWizard> findByCategoryId(UUID categoryId);

    Optional<DecisionWizard> findByCategorySlugAndIsActiveTrue(String categorySlug);
}