package com.YouthBridge.YouthBridge.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

// 서비스에서 발생하는 모든 에러를 여기서 관리해요
// 새 에러가 생기면 여기에 추가하면 돼요
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // ── 유저 관련 ─────────────────────────────────────────
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "유저를 찾을 수 없어요", "USER_NOT_FOUND"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일이에요", "DUPLICATE_EMAIL"),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않아요", "INVALID_PASSWORD"),
    WRONG_CURRENT_PASSWORD(HttpStatus.BAD_REQUEST, "현재 비밀번호가 올바르지 않아요", "WRONG_CURRENT_PASSWORD"),
    SOCIAL_LOGIN_USER(HttpStatus.BAD_REQUEST, "소셜 로그인 계정은 비밀번호를 변경할 수 없어요", "SOCIAL_LOGIN_USER"),
    DEACTIVATED_USER(HttpStatus.UNAUTHORIZED, "비활성화된 계정이에요", "DEACTIVATED_USER"),

    // ── 정책 관련 ─────────────────────────────────────────
    POLICY_NOT_FOUND(HttpStatus.NOT_FOUND, "정책을 찾을 수 없어요", "POLICY_NOT_FOUND"),

    // ── 즐겨찾기 관련 ─────────────────────────────────────
    BOOKMARK_NOT_FOUND(HttpStatus.NOT_FOUND, "즐겨찾기를 찾을 수 없어요", "BOOKMARK_NOT_FOUND"),
    DUPLICATE_BOOKMARK(HttpStatus.CONFLICT, "이미 즐겨찾기한 정책이에요", "DUPLICATE_BOOKMARK"),
    BOOKMARK_FORBIDDEN(HttpStatus.FORBIDDEN, "본인의 즐겨찾기만 삭제할 수 있어요", "BOOKMARK_FORBIDDEN"),

    // ── 인증/인가 관련 ────────────────────────────────────
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "로그인이 필요해요", "UNAUTHORIZED"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없어요", "FORBIDDEN"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰이에요", "INVALID_TOKEN"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰이에요. 다시 로그인해주세요", "EXPIRED_TOKEN"),

    // ── 소셜 로그인 관련 ──────────────────────────────────
    KAKAO_LOGIN_FAILED(HttpStatus.BAD_GATEWAY, "카카오 로그인 중 오류가 발생했어요. 잠시 후 다시 시도해주세요", "KAKAO_LOGIN_FAILED"),

    // ── 서버 오류 ─────────────────────────────────────────
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했어요. 잠시 후 다시 시도해주세요", "INTERNAL_SERVER_ERROR");

    private final HttpStatus status;
    private final String message;
    private final String code;
}
