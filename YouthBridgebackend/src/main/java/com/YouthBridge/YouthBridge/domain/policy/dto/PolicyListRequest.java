package com.YouthBridge.YouthBridge.domain.policy.dto;

import com.YouthBridge.YouthBridge.domain.policy.entity.PolicyStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PolicyListRequest {

    private String region;
    private Integer age;

    // 단일 카테고리 (기존 호환)
    private String category;

    // 다중 카테고리 — ?categories=취업지원&categories=주거지원 형태로 전달
    private List<String> categories;

    private String keyword;
    private PolicyStatus status;
    private int page = 0;
    private int size = 10;
}
