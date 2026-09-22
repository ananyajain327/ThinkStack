package com.thinkstack.service;

import com.thinkstack.dto.request.PriceAlertRequest;
import com.thinkstack.dto.response.PriceAlertResponse;
import com.thinkstack.entity.Notification;
import com.thinkstack.entity.PriceAlert;
import com.thinkstack.entity.Product;
import com.thinkstack.entity.ProductPrice;
import com.thinkstack.entity.User;
import com.thinkstack.exception.ThinkStackException;
import com.thinkstack.repository.NotificationRepository;
import com.thinkstack.repository.PriceAlertRepository;
import com.thinkstack.repository.ProductPriceRepository;
import com.thinkstack.repository.ProductRepository;
import com.thinkstack.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/** User price alerts and price-drop notification generation. */
@Service
public class PriceAlertService {

    private final PriceAlertRepository alertRepository;
    private final ProductRepository productRepository;
    private final ProductPriceRepository priceRepository;
    private final NotificationRepository notificationRepository;

    public PriceAlertService(PriceAlertRepository alertRepository,
                             ProductRepository productRepository,
                             ProductPriceRepository priceRepository,
                             NotificationRepository notificationRepository) {
        this.alertRepository = alertRepository;
        this.productRepository = productRepository;
        this.priceRepository = priceRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public PriceAlertResponse createPriceAlert(PriceAlertRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ThinkStackException("Product not found", "NOT_FOUND"));
        UUID userId = SecurityUtils.currentUserId();

        if (alertRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new ThinkStackException("Price alert already exists for this product", "ALREADY_EXISTS");
        }
        PriceAlert alert = alertRepository.save(PriceAlert.builder()
                .user(User.builder().id(userId).build())
                .product(product)
                .targetPrice(request.getTargetPrice())
                .build());
        return toResponse(alert);
    }

    @Transactional(readOnly = true)
    public List<PriceAlertResponse> myAlerts() {
        return alertRepository.findByUserIdOrderByCreatedAtDesc(SecurityUtils.currentUserId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void deleteAlert(UUID alertId) {
        PriceAlert alert = requireOwned(alertId);
        alertRepository.delete(alert);
    }

    @Transactional
    public void toggleAlert(UUID alertId) {
        PriceAlert alert = requireOwned(alertId);
        alert.setIsActive(!Boolean.TRUE.equals(alert.getIsActive()));
        alertRepository.save(alert);
    }

    /** Evaluates each active alert against today's cheapest price and emits notifications. */
    @Transactional
    public int checkForPriceDrops() {
        UUID userId = SecurityUtils.currentUserId();
        List<PriceAlert> alerts = alertRepository.findByUserIdAndIsActiveTrue(userId);
        int triggered = 0;
        for (PriceAlert alert : alerts) {
            BigDecimal best = bestPrice(alert.getProduct());
            if (best != null && best.compareTo(alert.getTargetPrice()) <= 0) {
                boolean alreadyNotified = notificationRepository
                        .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).stream()
                        .anyMatch(n -> n.getType().equals("PRICE_ALERT")
                                && n.getProduct() != null
                                && n.getProduct().getId().equals(alert.getProduct().getId()));
                if (!alreadyNotified) {
                    notificationRepository.save(Notification.builder()
                            .user(User.builder().id(userId).build())
                            .type("PRICE_ALERT")
                            .title("Price alert: " + alert.getProduct().getName())
                            .body("Your target price of ₹" + alert.getTargetPrice()
                                    + " is now available at ₹" + best)
                            .product(alert.getProduct())
                            .build());
                    triggered++;
                }
            }
        }
        return triggered;
    }

    private PriceAlert requireOwned(UUID alertId) {
        PriceAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ThinkStackException("Price alert not found", "NOT_FOUND"));
        if (alert.getUser() == null
                || !alert.getUser().getId().equals(SecurityUtils.currentUserId())) {
            throw new ThinkStackException("Not your price alert", "FORBIDDEN");
        }
        return alert;
    }

    private PriceAlertResponse toResponse(PriceAlert alert) {
        Product p = alert.getProduct();
        BigDecimal best = bestPrice(p);
        boolean triggered = best != null && best.compareTo(alert.getTargetPrice()) <= 0;
        return new PriceAlertResponse(
                alert.getId(), p.getId(), p.getName(), p.getSlug(), p.getImageUrl(),
                alert.getTargetPrice(), best,
                triggered ? "TRIGGERED" : "ACTIVE",
                alert.getIsActive(), alert.getCreatedAt());
    }

    private BigDecimal bestPrice(Product product) {
        return priceRepository.findByProductIdOrderByPriceAsc(product.getId()).stream()
                .filter(ProductPrice::getInStock)
                .map(ProductPrice::getPrice)
                .min(Comparator.naturalOrder())
                .orElse(product.getBasePrice());
    }
}