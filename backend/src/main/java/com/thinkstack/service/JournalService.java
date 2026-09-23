package com.thinkstack.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thinkstack.dto.request.JournalEntryRequest;
import com.thinkstack.dto.response.JournalEntryResponse;
import com.thinkstack.entity.DecisionJournal;
import com.thinkstack.entity.User;
import com.thinkstack.exception.ThinkStackException;
import com.thinkstack.repository.DecisionJournalRepository;
import com.thinkstack.repository.DecisionSessionRepository;
import com.thinkstack.repository.ProductRepository;
import com.thinkstack.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Post-purchase reflection entries; feeds the Decision DNA. */
@Service
public class JournalService {

    private final DecisionJournalRepository journalRepository;
    private final DecisionSessionRepository sessionRepository;
    private final ProductRepository productRepository;
    private final DnaService dnaService;
    private final ObjectMapper objectMapper;

    public JournalService(DecisionJournalRepository journalRepository,
                          DecisionSessionRepository sessionRepository,
                          ProductRepository productRepository,
                          DnaService dnaService,
                          ObjectMapper objectMapper) {
        this.journalRepository = journalRepository;
        this.sessionRepository = sessionRepository;
        this.productRepository = productRepository;
        this.dnaService = dnaService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public JournalEntryResponse create(JournalEntryRequest request) {
        DecisionJournal entry = DecisionJournal.builder()
                .user(User.builder().id(SecurityUtils.currentUserId()).build())
                .build();
        apply(entry, request);
        EntrySaved saved = new EntrySaved(journalRepository.save(entry));
        dnaService.refreshFromUser(SecurityUtils.currentUserId());
        return saved.asResponse();
    }

    @Transactional(readOnly = true)
    public List<JournalEntryResponse> list() {
        return journalRepository.findByUserIdOrderByCreatedAtDesc(SecurityUtils.currentUserId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public JournalEntryResponse update(UUID entryId, JournalEntryRequest request) {
        DecisionJournal entry = requireOwned(entryId);
        apply(entry, request);
        JournalEntryResponse response = toResponse(journalRepository.save(entry));
        dnaService.refreshFromUser(SecurityUtils.currentUserId());
        return response;
    }

    @Transactional
    public void delete(UUID entryId) {
        journalRepository.delete(requireOwned(entryId));
    }

    private DecisionJournal apply(DecisionJournal entry, JournalEntryRequest request) {
        if (request.getSessionId() != null) {
            entry.setSession(sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new ThinkStackException("Session not found", "NOT_FOUND")));
        }
        if (request.getProductId() != null) {
            entry.setProduct(productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ThinkStackException("Product not found", "NOT_FOUND")));
        }
        entry.setTitle(request.getTitle());
        entry.setNotes(request.getNotes());
        entry.setOutcome(request.getOutcome());
        entry.setOutcomeNotes(request.getOutcomeNotes());
        entry.setSatisfactionRating(request.getSatisfactionRating());
        entry.setWouldBuyAgain(request.getWouldBuyAgain());
        if (request.getTags() != null && !request.getTags().isBlank()) {
            try {
                entry.setTags(objectMapper.writeValueAsString(request.getTags()));
            } catch (Exception e) {
                entry.setTags(null);
            }
        }
        return entry;
    }

    private DecisionJournal requireOwned(UUID entryId) {
        DecisionJournal entry = journalRepository.findById(entryId)
                .orElseThrow(() -> new ThinkStackException("Journal entry not found", "NOT_FOUND"));
        if (entry.getUser() == null
                || !entry.getUser().getId().equals(SecurityUtils.currentUserId())) {
            throw new ThinkStackException("Not your journal entry", "FORBIDDEN");
        }
        return entry;
    }

    private JournalEntryResponse toResponse(DecisionJournal entry) {
        return new JournalEntryResponse(
                entry.getId(),
                entry.getSession() == null ? null : entry.getSession().getId(),
                entry.getProduct() == null ? null : entry.getProduct().getId(),
                entry.getProduct() == null ? null : entry.getProduct().getName(),
                entry.getTitle(), entry.getNotes(), entry.getOutcome(),
                entry.getOutcomeNotes(), entry.getSatisfactionRating(),
                entry.getWouldBuyAgain(), entry.getTags(),
                entry.getCreatedAt(), entry.getUpdatedAt());
    }

    private record EntrySaved(DecisionJournal value) {
        public JournalEntryResponse asResponse() {
            return new JournalEntryResponse(
                    value.getId(),
                    value.getSession() == null ? null : value.getSession().getId(),
                    value.getProduct() == null ? null : value.getProduct().getId(),
                    value.getProduct() == null ? null : value.getProduct().getName(),
                    value.getTitle(), value.getNotes(), value.getOutcome(),
                    value.getOutcomeNotes(), value.getSatisfactionRating(),
                    value.getWouldBuyAgain(), value.getTags(),
                    value.getCreatedAt(), value.getUpdatedAt());
        }
    }
}