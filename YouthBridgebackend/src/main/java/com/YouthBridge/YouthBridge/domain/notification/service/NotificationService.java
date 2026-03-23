package com.YouthBridge.YouthBridge.domain.notification.service;

import com.YouthBridge.YouthBridge.domain.notification.dto.NotificationResponse;
import com.YouthBridge.YouthBridge.domain.notification.entity.Notification;
import com.YouthBridge.YouthBridge.domain.notification.repository.NotificationRepository;
import com.YouthBridge.YouthBridge.domain.user.entity.User;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import com.YouthBridge.YouthBridge.global.exception.CustomException;
import com.YouthBridge.YouthBridge.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // 7일 이내 알림 조회 (안읽은 것 먼저, 읽은 것 뒤에)
    public List<NotificationResponse> getNotifications(Long userId) {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        return notificationRepository.findRecentByUserId(userId, since)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    // 안읽은 알림 수
    public Map<String, Long> getUnreadCount(Long userId) {
        long count = notificationRepository.countByUserIdAndIsRead(userId, false);
        return Map.of("count", count);
    }

    // 전체 읽음 처리
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    // 알림 생성 (내부용)
    @Transactional
    public void createNotification(Long userId, String message, Long policyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        notificationRepository.save(Notification.create(user, message, policyId));
    }

    // 매일 자정 — 7일 지난 읽은 알림 자동 삭제
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void deleteOldNotifications() {
        LocalDateTime before = LocalDateTime.now().minusDays(7);
        notificationRepository.deleteOldReadNotifications(before);
        log.info("[Scheduler] 7일 지난 읽은 알림 삭제 완료");
    }
}
