package com.thinkstack.controller;

import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.NotificationResponse;
import com.thinkstack.service.NotificationService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Authenticated notifications for the current user. */
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> list(
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        return ApiResponse.ok(notificationService.listNotifications(unreadOnly));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> unreadCount() {
        return ApiResponse.ok(Map.of("count", notificationService.unreadCount()));
    }

    @PostMapping("/{notificationId}/read")
    public ApiResponse<Void> markRead(@PathVariable UUID notificationId) {
        notificationService.markRead(notificationId);
        return ApiResponse.ok(null);
    }

    @PostMapping("/read-all")
    public ApiResponse<Map<String, Integer>> markAllRead() {
        return ApiResponse.ok(Map.of("markedRead", notificationService.markAllRead()));
    }

    @DeleteMapping("/{notificationId}")
    public ApiResponse<Void> delete(@PathVariable UUID notificationId) {
        notificationService.deleteNotification(notificationId);
        return ApiResponse.ok(null);
    }
}