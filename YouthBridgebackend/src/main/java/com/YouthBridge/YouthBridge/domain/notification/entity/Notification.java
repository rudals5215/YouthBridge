package com.YouthBridge.YouthBridge.domain.notification.entity;

import com.YouthBridge.YouthBridge.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 알림 메시지
    @Column(nullable = false, length = 300)
    private String message;

    // 클릭 시 이동할 정책 ID (없으면 null)
    @Column
    private Long policyId;

    // 읽음 여부
    @Column(nullable = false)
    private boolean isRead = false;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public static Notification create(User user, String message, Long policyId) {
        Notification n = new Notification();
        n.user = user;
        n.message = message;
        n.policyId = policyId;
        return n;
    }

    public void markAsRead() {
        this.isRead = true;
    }
}
