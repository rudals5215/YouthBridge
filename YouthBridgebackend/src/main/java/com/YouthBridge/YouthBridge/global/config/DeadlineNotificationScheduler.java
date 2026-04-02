package com.YouthBridge.YouthBridge.global.config;

import com.YouthBridge.YouthBridge.domain.bookmark.entity.Bookmark;
import com.YouthBridge.YouthBridge.domain.bookmark.repository.BookmarkRepository;
import com.YouthBridge.YouthBridge.domain.notification.entity.Notification;
import com.YouthBridge.YouthBridge.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeadlineNotificationScheduler {

    private final BookmarkRepository bookmarkRepository;
    private final NotificationRepository notificationRepository;

    // 매일 오전 9시 실행 — 마감 임박 정책 알림
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void sendDeadlineNotifications() {
        log.info("[Scheduler] 마감 알림 발송 시작");
        int count = 0;

        LocalDate today = LocalDate.now();

        // 마감 7일, 3일, 1일 전 체크
        int[] daysBeforeList = {7, 3, 1};

        for (int daysBefore : daysBeforeList) {
            LocalDate targetDate = today.plusDays(daysBefore);

            // 해당 날짜에 마감되는 즐겨찾기 정책 조회
            List<Bookmark> bookmarks = bookmarkRepository
                    .findByPolicyApplyEndDate(targetDate);

            for (Bookmark bookmark : bookmarks) {
                String message = String.format(
                    "즐겨찾기한 '%s' 정책이 %d일 후 마감돼요!",
                    bookmark.getPolicy().getTitle(), daysBefore
                );

                // 중복 알림 방지 — 같은 정책에 대해 오늘 이미 발송했는지 체크
                boolean alreadySent = notificationRepository
                        .existsByUserIdAndPolicyIdAndCreatedAtAfter(
                            bookmark.getUser().getId(),
                            bookmark.getPolicy().getId(),
                            today.atStartOfDay()
                        );

                if (!alreadySent) {
                    notificationRepository.save(
                        Notification.create(
                            bookmark.getUser(),
                            message,
                            bookmark.getPolicy().getId()
                        )
                    );
                    count++;
                }
            }
        }

        log.info("[Scheduler] 마감 알림 {}건 발송 완료", count);
    }
}
