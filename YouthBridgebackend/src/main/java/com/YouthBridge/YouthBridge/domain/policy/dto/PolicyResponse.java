package com.YouthBridge.YouthBridge.domain.policy.dto;

import com.YouthBridge.YouthBridge.domain.policy.entity.Policy;
import com.YouthBridge.YouthBridge.domain.policy.entity.PolicyStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Getter
@Builder
public class PolicyResponse {

    private Long id;
    private String title;
    private String description;
    private String content;
    private String category;
    private String region;
    private Integer minAge;
    private Integer maxAge;
    private LocalDate applyStartDate;
    private LocalDate applyEndDate;
    private String applyUrl;
    private String organization;
    private PolicyStatus status;
    private boolean expired;       // 마감 여부
    private Long dday;             // 마감까지 남은 일수 (null이면 상시)
    private LocalDateTime createdAt;

    // Policy 엔티티 → PolicyResponse 변환
    public static PolicyResponse from(Policy policy) {
        // D-day 계산
        Long dday = null;
        if (policy.getApplyEndDate() != null) {
             dday = ChronoUnit.DAYS.between(LocalDate.now(), policy.getApplyEndDate());
        }

        return PolicyResponse.builder()
                .id(policy.getId())
                .title(policy.getTitle())
                .description(policy.getDescription())
                .content(policy.getContent())
                .category(policy.getCategory())
                .region(policy.getRegion())
                .minAge(policy.getMinAge())
                .maxAge(policy.getMaxAge())
                .applyStartDate(policy.getApplyStartDate())
                .applyEndDate(policy.getApplyEndDate())
                .applyUrl(policy.getApplyUrl())
                .organization(policy.getOrganization())
                .status(policy.getStatus())
                .expired(policy.isExpired())
                .dday(dday)
                .createdAt(policy.getCreatedAt())
                .build();
    }
}
