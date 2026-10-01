package com.thinkstack.service;

import com.thinkstack.dto.response.FeedItemResponse;
import com.thinkstack.entity.Notification;
import com.thinkstack.entity.PriceAlert;
import com.thinkstack.entity.Product;
import com.thinkstack.repository.DecisionSessionRepository;
import com.thinkstack.repository.NotificationRepository;
import com.thinkstack.repository.PriceAlertRepository;
import com.thinkstack.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Aggregates the current user's recent activity (decision sessions, price alerts,
 * notifications) into a single chronological feed.
 */
@Service
public class FeedService {

    private final DecisionSessionRepository sessionRepository;
    private final PriceAlertRepository priceAlertRepository;
    private final NotificationRepository notificationRepository;

    public FeedService(DecisionSessionRepository sessionRepository,
                       PriceAlertRepository priceAlertRepository,
                       NotificationRepository notificationRepository) {
        this.sessionRepository = sessionRepository;
        this.priceAlertRepository = priceAlertRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<FeedItemResponse> getFeed(int limit) {
        UUID userId = SecurityUtils.currentUserId();
        int n = Math.min(Math.max(limit, 5), 100);
        List<FeedItemResponse> items = new ArrayList<>();

        sessionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().limit(n).forEach(s -> items.add(new FeedItemResponse(
                        s.getId(), "session", s.getTitle(),
                        "Decision session " + s.getStatus().toLowerCase().replace('_', ' '),
                        "compare", s.getStatus(),
                        s.getCategory() != null ? s.getCategory().getSlug() : null,
                        null, null, null, s.getCreatedAt())));

        priceAlertRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().limit(n).forEach(a -> items.add(new FeedItemResponse(
                        a.getId(), "price_alert",
                        "Price alert " + (a.getIsActive() ? "active" : "paused"),
                        "Target " + a.getTargetPrice() + " on " + productName(a),
                        "notifications", a.getIsActive() ? "ACTIVE" : "PAUSED",
                        a.getProduct() != null && a.getProduct().getCategory() != null
                                ? a.getProduct().getCategory().getSlug() : null,
                        productName(a),
                        a.getProduct() != null ? a.getProduct().getSlug() : null,
                        null, a.getCreatedAt())));

        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().limit(n).forEach(x -> items.add(new FeedItemResponse(
                        x.getId(), "notification", x.getTitle(), x.getBody(), "alarm",
                        Boolean.TRUE.equals(x.getIsRead()) ? "READ" : "UNREAD",
                        null, null, null, x.getIsRead(), x.getCreatedAt())));

        items.sort(Comparator.comparing(FeedItemResponse::occurredAt).reversed());
        return items.stream().limit(n).toList();
    }

    private String productName(PriceAlert alert) {
        Product product = alert.getProduct();
        if (product == null) return "product";
        return product.getBrand() + " " + product.getModel();
    }
}