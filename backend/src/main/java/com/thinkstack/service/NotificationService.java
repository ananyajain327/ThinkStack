package com.thinkstack.service;

import com.thinkstack.dto.response.NotificationResponse;
import com.thinkstack.entity.Notification;
import com.thinkstack.exception.ThinkStackException;
import com.thinkstack.repository.NotificationRepository;
import com.thinkstack.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Reads and manages the current user's notifications. */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listNotifications(boolean unreadOnly) {
        UUID userId = SecurityUtils.currentUserId();
        List<Notification> notifications = unreadOnly
                ? notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return notificationRepository.countByUserIdAndIsReadFalse(SecurityUtils.currentUserId());
    }

    @Transactional
    public void markRead(UUID notificationId) {
        Notification notification = requireOwned(notificationId);
        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notification.setReadAt(Instant.now());
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public int markAllRead() {
        UUID userId = SecurityUtils.currentUserId();
        List<Notification> unread =
                notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification n : unread) {
            n.setIsRead(true);
            n.setReadAt(Instant.now());
            notificationRepository.save(n);
        }
        return unread.size();
    }

    @Transactional
    public void deleteNotification(UUID notificationId) {
        Notification notification = requireOwned(notificationId);
        notificationRepository.delete(notification);
    }

    private Notification requireOwned(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ThinkStackException("Notification not found", "NOT_FOUND"));
        if (notification.getUser() == null
                || !notification.getUser().getId().equals(SecurityUtils.currentUserId())) {
            throw new ThinkStackException("Not your notification", "FORBIDDEN");
        }
        return notification;
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(), n.getBody(),
                n.getProduct() == null ? null : n.getProduct().getId(),
                n.getProduct() == null ? null : n.getProduct().getName(),
                n.getProduct() == null ? null : n.getProduct().getSlug(),
                n.getIsRead(), n.getReadAt(), n.getCreatedAt());
    }
}