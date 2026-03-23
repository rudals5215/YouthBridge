package com.YouthBridge.YouthBridge.domain.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStatsResponse {
    private long totalUsers;       // 전체 회원 수
    private long totalPolicies;    // 전체 정책 수
    private long activePolicies;   // 접수 중인 정책 수
    private long totalBookmarks;   // 전체 즐겨찾기 수
    private long todaySignups;     // 오늘 신규 가입 수
}
