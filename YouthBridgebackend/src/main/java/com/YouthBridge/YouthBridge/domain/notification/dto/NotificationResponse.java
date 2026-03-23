package com.YouthBridge.YouthBridge.domain.notification.dto;

import com.YouthBridge.YouthBridge.domain.notification.entity.Notification;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {
    private Long id;
    private String message;
    private Long policyId;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .message(n.getMessage())
                .policyId(n.getPolicyId())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
