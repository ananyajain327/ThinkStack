package com.thinkstack.repository;

import com.thinkstack.entity.SpecificationDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpecificationDefinitionRepository extends JpaRepository<SpecificationDefinition, UUID> {

    List<SpecificationDefinition> findByCategoryIdOrderByDisplayOrderAsc(UUID categoryId);

    List<SpecificationDefinition> findByCategorySlugOrderByDisplayOrderAsc(String categorySlug);
}