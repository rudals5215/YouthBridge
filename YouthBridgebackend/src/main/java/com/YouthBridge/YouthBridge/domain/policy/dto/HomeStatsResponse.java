package com.YouthBridge.YouthBridge.domain.policy.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class HomeStatsResponse {
    private long totalPolicies;              // 전체 정책 수
    private long totalUsers;                 // 전체 회원 수
    private Map<String, Long> categoryCount; // 카테고리별 정책 수
    private Map<String, Long> regionCount;   // 지역별 정책 수
}
