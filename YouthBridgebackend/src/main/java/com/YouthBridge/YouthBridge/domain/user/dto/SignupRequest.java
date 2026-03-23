package com.YouthBridge.YouthBridge.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class SignupRequest {

    @NotBlank(message = "이메일을 입력해주세요")
    @Email(message = "이메일 형식이 올바르지 않아요")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요")
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 해요")
    private String password;

    @NotBlank(message = "이름을 입력해주세요")
    private String name;

    // 아래는 선택 입력 (회원가입 2단계)
    private Integer birthYear;
    private String region;
    private String interests; // "취업지원,주거지원" 형태
}
