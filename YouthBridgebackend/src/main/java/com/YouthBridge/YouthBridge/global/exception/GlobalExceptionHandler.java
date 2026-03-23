package com.YouthBridge.YouthBridge.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

// @RestControllerAdvice — 모든 컨트롤러에서 발생하는 예외를 여기서 잡아요
// 각 컨트롤러에 try-catch를 일일이 쓰지 않아도 돼요
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── CustomException 처리 ──────────────────────────────
    // throw new CustomException(ErrorCode.DUPLICATE_EMAIL) 처럼 던진 예외
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException e) {
        log.warn("[CustomException] code={}, message={}", e.getErrorCode().getCode(), e.getMessage());
        return ResponseEntity
                .status(e.getStatus())
                .body(ErrorResponse.of(
                        e.getStatus().value(),
                        e.getMessage(),
                        e.getErrorCode().getCode()
                ));
    }

    // ── 입력값 검증 실패 처리 (@Valid 실패) ───────────────
    // @NotBlank, @Email, @Size 등 검증 실패 시 발생
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException e) {
        // 여러 검증 오류 중 첫 번째 메시지를 반환
        String message = e.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        log.warn("[ValidationException] {}", message);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(400, message, "VALIDATION_ERROR"));
    }

    // ── IllegalArgumentException 처리 ────────────────────
    // 기존 서비스 코드에서 throw new IllegalArgumentException(...) 던진 것들
    // 나중에 전부 CustomException으로 교체하면 이 핸들러는 제거 가능
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException e) {
        log.warn("[IllegalArgumentException] {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(400, e.getMessage(), "BAD_REQUEST"));
    }

    // ── IllegalStateException 처리 ───────────────────────
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(
            IllegalStateException e) {
        log.warn("[IllegalStateException] {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(409, e.getMessage(), "CONFLICT"));
    }

    // ── 그 외 모든 예외 처리 ──────────────────────────────
    // 예상치 못한 서버 오류
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("[UnhandledException] {}", e.getMessage(), e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(
                        500,
                        "서버 오류가 발생했어요. 잠시 후 다시 시도해주세요",
                        "INTERNAL_SERVER_ERROR"
                ));
    }
}
