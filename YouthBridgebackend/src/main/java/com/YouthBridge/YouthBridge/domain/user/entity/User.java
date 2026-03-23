package com.YouthBridge.YouthBridge.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 이메일 (로그인 ID로 사용, 중복 불가)
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // 비밀번호 (BCrypt로 암호화해서 저장)
    @Column
    private String password;

    // 이름
    @Column(nullable = false, length = 20)
    private String name;

    // 출생연도 (나이 계산에 사용)
    @Column
    private Integer birthYear;

    // 거주 지역 (seoul, busan 등)
    @Column(length = 20)
    private String region;

    // 관심 분야 (취업지원,주거지원 형태로 저장)
    @Column(length = 200)
    private String interests;

    // 소셜 로그인 제공자 (kakao, naver, google / null이면 일반 로그인)
    @Column(length = 20)
    private String provider;

    // 소셜 로그인 고유 ID
    @Column(length = 100)
    private String providerId;

    // 계정 활성화 여부
    @Column(nullable = false)
    private boolean active = true;

    // 권한 (USER, ADMIN)
    @Column(nullable = false, length = 20)
    private String role = "USER";

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // ── 생성 메서드 (일반 회원가입) ──────────────────────
    public static User createLocal(String email, String password, String name) {
        User user = new User();
        user.email = email;
        user.password = password;
        user.name = name;
        return user;
    }

    // ── 소셜 로그인 생성 메서드 ──────────────────────────
    public static User createSocial(String email, String name, String provider, String providerId) {
        User user = new User();
        user.email = email;
        user.name = name;
        user.provider = provider;
        user.providerId = providerId;
        return user;
    }

    // ── 추가 정보 업데이트 (회원가입 2단계) ───────────────
    public void updateProfile(Integer birthYear, String region, String interests) {
        this.birthYear = birthYear;
        this.region = region;
        this.interests = interests;
    }

    // ── 비밀번호 변경 ─────────────────────────────────────
    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    // ── 이름 변경 ─────────────────────────────────────────
    public void updateName(String name) {
        this.name = name;
    }

    // ── 회원 탈퇴 (비활성화) ──────────────────────────────
    public void deactivate() {
        this.active = false;
    }

    // ── 관리자 권한 부여 ──────────────────────────────────
    public void promoteToAdmin() {
        this.role = "ADMIN";
    }
}
