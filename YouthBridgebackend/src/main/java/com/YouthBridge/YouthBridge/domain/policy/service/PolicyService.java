package com.YouthBridge.YouthBridge.domain.policy.service;

import com.YouthBridge.YouthBridge.domain.policy.dto.PolicyListRequest;
import com.YouthBridge.YouthBridge.domain.policy.dto.PolicyListResponse;
import com.YouthBridge.YouthBridge.domain.policy.dto.PolicyResponse;
import com.YouthBridge.YouthBridge.domain.policy.entity.Policy;
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
        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Policy> policyPage;

        // categories 리스트가 있으면 다중 카테고리 IN 쿼리 사용
        List<String> categories = request.getCategories();
        if (categories != null && !categories.isEmpty()) {
            policyPage = policyRepository.findByFiltersMultiCategory(
                    request.getRegion(),
                    categories,
                    request.getAge(),
                    request.getKeyword(),
                    request.getStatus(),
                    pageable
            );
        } else {
            // 단일 카테고리 또는 전체 조회
            policyPage = policyRepository.findByFilters(
                    request.getRegion(),
                    request.getCategory(),
                    request.getAge(),
                    request.getKeyword(),
                    request.getStatus(),
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
