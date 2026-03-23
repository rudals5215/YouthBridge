package com.YouthBridge.YouthBridge.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

// 비즈니스 로직에서 발생하는 예외를 통일된 형태로 던지기 위한 클래스예요
// 사용 예시: throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
@Getter
public class CustomException extends RuntimeException {

    private final ErrorCode errorCode;

    public CustomException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public HttpStatus getStatus() {
        return errorCode.getStatus();
    }
}
