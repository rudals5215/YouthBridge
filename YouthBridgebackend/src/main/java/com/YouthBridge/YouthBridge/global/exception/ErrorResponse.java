package com.YouthBridge.YouthBridge.global.exception;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ErrorResponse {

    private int status;           // HTTP 상태 코드
    private String message;       // 사용자에게 보여줄 메시지
    private String code;          // 에러 코드 (프론트에서 분기 처리할 때 사용)
    private LocalDateTime timestamp;

    public static ErrorResponse of(int status, String message, String code) {
        return ErrorResponse.builder()
                .status(status)
                .message(message)
                .code(code)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
