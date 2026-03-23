package com.YouthBridge.YouthBridge.domain.policy.controller;

import com.YouthBridge.YouthBridge.domain.policy.dto.PolicyListRequest;
import com.YouthBridge.YouthBridge.domain.policy.dto.PolicyListResponse;
import com.YouthBridge.YouthBridge.domain.policy.dto.PolicyResponse;
import com.YouthBridge.YouthBridge.domain.policy.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    // GET /api/policies
    // 쿼리 파라미터로 필터 조건 받기
    // 예시: /api/policies?region=seoul&age=25&category=주거지원&page=0&size=10
    @GetMapping
    public ResponseEntity<PolicyListResponse> getPolicies(
            @ModelAttribute PolicyListRequest request) {
        return ResponseEntity.ok(policyService.getPolicies(request));
    }

    // GET /api/policies/{id}
    // 정책 단건 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<PolicyResponse> getPolicy(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getPolicy(id));
    }
}
