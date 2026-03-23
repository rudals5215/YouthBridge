package com.YouthBridge.YouthBridge.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class KakaoLoginRequest {

    // 프론트에서 카카오 인가 코드를 받아서 보내줘요
    @NotBlank(message = "인가 코드가 없어요")
    private String code;
}
