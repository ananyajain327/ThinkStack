package com.thinkstack.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thinkstack.dto.response.DnaFactorResponse;
import com.thinkstack.entity.DecisionDna;
import com.thinkstack.entity.DecisionJournal;
import com.thinkstack.entity.DecisionSession;
import com.thinkstack.entity.User;
import com.thinkstack.repository.DecisionDnaRepository;
import com.thinkstack.repository.DecisionJournalRepository;
import com.thinkstack.repository.DecisionSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Decision DNA: a per-user profile of decision preferences derived from
 * completed sessions (priority weights) and journal outcomes (satisfaction).
 */
@Service
public class DnaService {

    private final DecisionDnaRepository dnaRepository;
    private final DecisionSessionRepository sessionRepository;
    private final DecisionJournalRepository journalRepository;
    private final ObjectMapper objectMapper;

    public DnaService(DecisionDnaRepository dnaRepository,
                      DecisionSessionRepository sessionRepository,
                      DecisionJournalRepository journalRepository,
                      ObjectMapper objectMapper) {
        this.dnaRepository = dnaRepository;
        this.sessionRepository = sessionRepository;
        this.journalRepository = journalRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<DnaFactorResponse> getFactors(UUID userId) {
        return dnaRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    /** Recomputes the explicit permanent DNA from a user's completed activity. */
    @Transactional
    public List<DnaFactorResponse> refreshFromUser(UUID userId) {
        Map<String, Agg> aggregates = new LinkedHashMap<>();
        List<DecisionSession> completed =
                sessionRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "COMPLETED");
        for (DecisionSession session : completed) {
            Map<String, BigDecimal> weights = parseWeights(session.getPriorityWeights());
            if (weights.isEmpty()) continue;
            double max = weights.values().stream()
                    .mapToDouble(BigDecimal::doubleValue).max().orElse(1);
            for (Map.Entry<String, BigDecimal> e : weights.entrySet()) {
                Agg agg = aggregates.computeIfAbsent(
                        "priority." + e.getKey(), k -> new Agg(0, 0, 1));
                // relative priority within this session: 0..100
                agg.sum += e.getValue().doubleValue() / max * 100;
                agg.count += 1;
            }
        }
        List<DecisionJournal> journal = journalRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Agg satisfaction = new Agg(0, 0, 20);
        for (DecisionJournal entry : journal) {
            if (entry.getSatisfactionRating() != null) {
                satisfaction.sum += entry.getSatisfactionRating();
                satisfaction.count += 1;
            }
        }
        if (satisfaction.count > 0) {
            aggregates.put("satisfaction", satisfaction);
        }

        List<DnaFactorResponse> factors = new ArrayList<>();
        for (Map.Entry<String, Agg> e : aggregates.entrySet()) {
            Agg agg = e.getValue();
            double avg = agg.sum / Math.max(1, agg.count);
            double score = round(avg * agg.scale);
            factors.add(new DnaFactorResponse(null, e.getKey(),
                    BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP),
                    agg.count, null));
        }

        persist(userId, factors);
        return factors;
    }

    private void persist(UUID userId, List<DnaFactorResponse> factors) {
        Map<String, DecisionDna> existing = new HashMap<>();
        for (DecisionDna d : dnaRepository.findByUserId(userId)) {
            existing.put(d.getFactor(), d);
        }
        for (DnaFactorResponse factor : factors) {
            DecisionDna row = existing.get(factor.factor());
            if (row == null) {
                row = DecisionDna.builder()
                        .user(User.builder().id(userId).build())
                        .factor(factor.factor())
                        .build();
            }
            row.setScore(factor.score());
            row.setSampleSize(factor.sampleSize());
            dnaRepository.save(row);
        }
    }

    /** transient, factor-only projection used for recomputation stat values */
    private Map<String, BigDecimal> parseWeights(String json) {
        Map<String, BigDecimal> weights = new LinkedHashMap<>();
        if (json == null || json.isBlank()) return weights;
        try {
            Map<String, Double> parsed =
                    objectMapper.readValue(json, new TypeReference<Map<String, Double>>() {});
            parsed.forEach((k, v) -> weights.put(k, BigDecimal.valueOf(v)));
        } catch (Exception ignored) {
        }
        return weights;
    }

    private DnaFactorResponse toResponse(DecisionDna factor) {
        return new DnaFactorResponse(
                factor.getId(), factor.getFactor(), factor.getScore(),
                factor.getSampleSize(), factor.getUpdatedAt());
    }

    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    /** Sum + sample count (+ output scale) of one DNA factor across sources. */
    private static final class Agg {
        double sum;
        int count;
        double scale;

        Agg(double sum, int count, double scale) {
            this.sum = sum;
            this.count = count;
            this.scale = scale;
        }
    }
}