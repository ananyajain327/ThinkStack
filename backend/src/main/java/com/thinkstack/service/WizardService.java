package com.thinkstack.service;

import com.thinkstack.dto.response.WizardResponse;
import com.thinkstack.entity.DecisionWizard;
import com.thinkstack.entity.WizardQuestion;
import com.thinkstack.exception.ThinkStackException;
import com.thinkstack.repository.DecisionWizardRepository;
import com.thinkstack.repository.WizardQuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Read-side surface for the ThinkStack decision wizards. */
@Service
public class WizardService {

    private final DecisionWizardRepository wizardRepository;
    private final WizardQuestionRepository questionRepository;

    public WizardService(DecisionWizardRepository wizardRepository,
                         WizardQuestionRepository questionRepository) {
        this.wizardRepository = wizardRepository;
        this.questionRepository = questionRepository;
    }

    @Transactional(readOnly = true)
    public List<WizardResponse> listWizards() {
        return wizardRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public WizardResponse getWizardByCategory(String categorySlug) {
        DecisionWizard wizard = wizardRepository.findByCategorySlugAndIsActiveTrue(categorySlug)
                .orElseThrow(() -> new ThinkStackException(
                        "No wizard found for category: " + categorySlug, "NOT_FOUND"));
        return toResponse(wizard);
    }

    private WizardResponse toResponse(DecisionWizard wizard) {
        List<WizardResponse.WizardQuestionResponse> questions =
                questionRepository.findByWizardIdOrderByDisplayOrderAsc(wizard.getId())
                        .stream().map(this::toQuestion).toList();
        return new WizardResponse(
                wizard.getId(), wizard.getName(), wizard.getDescription(),
                wizard.getCategory().getSlug(), wizard.getCategory().getName(), questions);
    }

    private WizardResponse.WizardQuestionResponse toQuestion(WizardQuestion q) {
        return new WizardResponse.WizardQuestionResponse(
                q.getId(), q.getQuestionKey(), q.getQuestionText(), q.getQuestionType(),
                q.getOptions(), q.getHelpText(), q.getVisibleIf(), q.getWeight(),
                q.getDisplayOrder(), q.getIsRequired());
    }
}