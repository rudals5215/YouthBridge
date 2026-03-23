package com.YouthBridge.YouthBridge.domain.user.dto;

import com.YouthBridge.YouthBridge.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private Integer birthYear;
    private String region;
    private String interests;
    private String provider;    // null이면 일반 로그인
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .birthYear(user.getBirthYear())
                .region(user.getRegion())
                .interests(user.getInterests())
                .provider(user.getProvider())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
