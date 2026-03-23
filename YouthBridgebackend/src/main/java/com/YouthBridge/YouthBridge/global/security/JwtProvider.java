package com.YouthBridge.YouthBridge.global.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtProvider {

    private final SecretKey secretKey;
    private final long expiration;

    // application.properties의 jwt.secret, jwt.expiration 값을 자동으로 주입받아요
    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    // ── 토큰 생성 ─────────────────────────────────────────
    // 로그인 성공 시 유저 ID와 이메일을 담아서 토큰을 만들어요
    public String generateToken(Long userId, String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(String.valueOf(userId))   // 토큰 주인 (유저 ID)
                .claim("email", email)             // 추가 정보
                .issuedAt(now)                     // 발급 시간
                .expiration(expiryDate)            // 만료 시간 (기본 24시간)
                .signWith(secretKey)               // 서명 (위변조 방지)
                .compact();
    }

    // ── 토큰에서 유저 ID 꺼내기 ───────────────────────────
    public Long getUserId(String token) {
        return Long.parseLong(
                getClaims(token).getSubject()
        );
    }

    // ── 토큰에서 이메일 꺼내기 ────────────────────────────
    public String getEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    // ── 토큰 유효성 검사 ──────────────────────────────────
    // 유효하면 true, 만료/위변조 등 문제 있으면 false
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            // 토큰 만료
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            // 서명 오류, 형식 오류 등
            return false;
        }
    }

    // ── 공통: 토큰 파싱 ───────────────────────────────────
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
