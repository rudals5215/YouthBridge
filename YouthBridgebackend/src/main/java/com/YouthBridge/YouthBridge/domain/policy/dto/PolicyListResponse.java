package com.YouthBridge.YouthBridge.domain.policy.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Builder
public class PolicyListResponse {

    private List<PolicyResponse> policies;  // 정책 목록
    private int currentPage;                // 현재 페이지 (0부터)
    private int totalPages;                 // 전체 페이지 수
    private long totalElements;             // 전체 정책 수
    private boolean hasNext;                // 다음 페이지 존재 여부
    private boolean hasPrevious;            // 이전 페이지 존재 여부

    // Page<Policy> → PolicyListResponse 변환
    public static PolicyListResponse from(Page<PolicyResponse> page) {
        return PolicyListResponse.builder()
                .policies(page.getContent())
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
