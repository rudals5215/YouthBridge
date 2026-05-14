package com.YouthBridge.YouthBridge.domain.policy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.sql.Types;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "policies")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 공공 API에서 받은 원본 ID (중복 저장 방지용)
    @Column(unique = true, length = 100)
    private String externalId;

    // 정책명
    @Column(nullable = false, length = 200)
    private String title;

    // 정책 요약 설명
//    @Column(length = 500)
    @JdbcTypeCode(Types.LONGVARCHAR) // PostgreSQL의 TEXT 타입과 매핑되도록 명시
    @Column(columnDefinition = "TEXT")
    private String description;

    // 지원 내용 (상세)
    @Column(columnDefinition = "TEXT")
    private String content;

    // 카테고리 (취업지원, 주거지원 등)
    @Column(length = 50)
    private String category;

    // 지역 (seoul, busan, all 등)
    @Column(length = 20)
    private String region;

    // 최소 나이 조건
    @Column
    private Integer minAge;

    // 최대 나이 조건
    @Column
    private Integer maxAge;

    // 신청 시작일
    @Column
    private LocalDate applyStartDate;

    // 신청 마감일
    @Column
    private LocalDate applyEndDate;

    // 신청 URL
//    @Column(length = 1000)
    @Column(columnDefinition = "TEXT")
    private String applyUrl;

    // 주관 기관
    @Column(length = 100)
    private String organization;

    // 정책 상태 (ACTIVE: 접수중, CLOSED: 마감, UPCOMING: 예정)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PolicyStatus status = PolicyStatus.ACTIVE;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // ── 생성 메서드 ───────────────────────────────────────
    public static Policy create(String externalId, String title, String description,
                                 String category, String region) {
        Policy policy = new Policy();
        policy.externalId = externalId;
        policy.title = title;
        policy.description = description;
        policy.category = category;
        policy.region = region;
        return policy;
    }

    // ── 공공 API 데이터로 전체 업데이트 ───────────────────
    public void update(String title, String description, String content,
                       Integer minAge, Integer maxAge,
                       LocalDate applyStartDate, LocalDate applyEndDate,
                       String applyUrl, String organization) {
        this.title = title;
        this.description = description;
        this.content = content;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.applyStartDate = applyStartDate;
        this.applyEndDate = applyEndDate;
        this.applyUrl = applyUrl;
        this.organization = organization;
    }

    // ── 상태 변경 ─────────────────────────────────────────
    public void updateStatus(PolicyStatus status) {
        this.status = status;
    }

    // ── 마감 여부 확인 ────────────────────────────────────
    public boolean isExpired() {
        if (applyEndDate == null) return false;
        return applyEndDate.isBefore(LocalDate.now());
    }
}
