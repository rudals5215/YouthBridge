package com.YouthBridge.YouthBridge.domain.policy.service;

import com.YouthBridge.YouthBridge.domain.policy.dto.PolicyListRequest;
import com.YouthBridge.YouthBridge.domain.policy.dto.PolicyListResponse;
import com.YouthBridge.YouthBridge.domain.policy.dto.PolicyResponse;
import com.YouthBridge.YouthBridge.domain.policy.entity.Policy;
import com.YouthBridge.YouthBridge.domain.policy.entity.PolicyStatus;
import com.YouthBridge.YouthBridge.domain.policy.repository.PolicyRepository;
import com.YouthBridge.YouthBridge.global.exception.CustomException;
import com.YouthBridge.YouthBridge.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PolicyService {

    private final PolicyRepository policyRepository;

    public PolicyListResponse getPolicies(PolicyListRequest request) {

        // status String → PolicyStatus enum 변환
        PolicyStatus statusEnum = null;
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                statusEnum = PolicyStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                statusEnum = null; // 잘못된 값이면 전체 조회
            }
        }

        // ── 정렬 기준 변환 ────────────────────────────────
        Sort sort = switch (request.getSort() != null ? request.getSort() : "latest") {
            case "deadline" -> Sort.by(Sort.Order.asc("applyEndDate").nullsLast());
            case "name"     -> Sort.by(Sort.Direction.ASC, "title");
            default         -> Sort.by(Sort.Order.desc("createdAt"),Sort.Order.asc("applyEndDate").nullsLast()); // latest
        };

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Policy> policyPage;
        List<String> categories = request.getCategories();

        if (categories != null && !categories.isEmpty()) {
            policyPage = policyRepository.findByFiltersMultiCategory(
                    request.getRegion(),
                    categories,
                    request.getAge(),
                    request.getKeyword(),
                    statusEnum,
                    pageable
            );
        } else {
            policyPage = policyRepository.findByFilters(
                    request.getRegion(),
                    request.getCategory(),
                    request.getAge(),
                    request.getKeyword(),
                    statusEnum,
                    pageable
            );
        }

        return PolicyListResponse.from(policyPage.map(PolicyResponse::from));
    }

    public PolicyResponse getPolicy(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.POLICY_NOT_FOUND));
        return PolicyResponse.from(policy);
    }
}
