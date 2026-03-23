package com.YouthBridge.YouthBridge.domain.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class UpdateProfileRequest {

    @Size(min = 1, max = 20, message = "이름은 1~20자 사이여야 해요")
    private String name;

    private String region;
    private String interests; // "취업지원,주거지원" 형태
    private Integer birthYear;
}
