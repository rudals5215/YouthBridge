package com.YouthBridge.YouthBridge.domain.admin.dto;

import com.YouthBridge.YouthBridge.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserResponse {
    private Long id;
    private String email;
    private String name;
    private String region;
    private String provider;   // null이면 일반 로그인, "kakao" 등이면 소셜
    private boolean active;
    private LocalDateTime createdAt;

    public static AdminUserResponse from(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .region(user.getRegion())
                .provider(user.getProvider())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
