package com.YouthBridge.YouthBridge.domain.notification.controller;

import com.YouthBridge.YouthBridge.domain.notification.dto.NotificationResponse;
import com.YouthBridge.YouthBridge.domain.notification.service.NotificationService;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // GET /api/notifications — 내 알림 목록
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    // GET /api/notifications/unread-count — 안읽은 알림 수
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    // PATCH /api/notifications/read — 전체 읽음 처리
    @PatchMapping("/read")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "모든 알림을 읽었어요"));
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없어요"))
                .getId();
    }
}
