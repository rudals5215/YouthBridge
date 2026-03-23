package com.YouthBridge.YouthBridge.domain.user.dto;

import com.YouthBridge.YouthBridge.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String accessToken;  // JWT 토큰
    private Long userId;
    private String email;
    private String name;
    private String region;
    private String role;          // USER or ADMIN

    // User 엔티티 → AuthResponse 변환
    public static AuthResponse of(String token, User user) {
        return AuthResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .region(user.getRegion())
                .role(user.getRole())
                .build();
    }
}
