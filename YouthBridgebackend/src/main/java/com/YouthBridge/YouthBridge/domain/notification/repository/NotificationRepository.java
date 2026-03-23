package com.YouthBridge.YouthBridge.domain.notification.repository;

import com.YouthBridge.YouthBridge.domain.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 7일 이내 알림만 조회 (최신순)
    @Query("""
        SELECT n FROM Notification n
        WHERE n.user.id = :userId
        AND n.createdAt >= :since
        ORDER BY n.isRead ASC, n.createdAt DESC
    """)
    List<Notification> findRecentByUserId(
        @Param("userId") Long userId,
        @Param("since") LocalDateTime since
    );

    // 안읽은 알림 수
    long countByUserIdAndIsRead(Long userId, boolean isRead);

    // 전체 읽음 처리
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsRead(@Param("userId") Long userId);

    // 7일 지난 읽은 알림 삭제 (스케줄러)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.isRead = true AND n.createdAt < :before")
    void deleteOldReadNotifications(@Param("before") LocalDateTime before);
}
