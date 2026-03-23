package com.YouthBridge.YouthBridge.domain.policy.controller;

import com.YouthBridge.YouthBridge.domain.policy.dto.HomeStatsResponse;
import com.YouthBridge.YouthBridge.domain.policy.repository.PolicyRepository;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;

    // GET /api/home/stats — 홈 화면 통계 (누구나 접근 가능)
    @GetMapping("/stats")
    public ResponseEntity<HomeStatsResponse> getStats() {

        // 카테고리별 정책 수
        Map<String, Long> categoryCount = policyRepository.countByCategory()
                .stream()
                .collect(Collectors.toMap(
                        arr -> (String) arr[0],
                        arr -> (Long) arr[1]
                ));

        // 지역별 정책 수 (all 제외)
        Map<String, Long> regionCount = policyRepository.countByRegion()
                .stream()
                .filter(arr -> !"all".equals(arr[0]))
                .collect(Collectors.toMap(
                        arr -> (String) arr[0],
                        arr -> (Long) arr[1]
                ));

        return ResponseEntity.ok(HomeStatsResponse.builder()
                .totalPolicies(policyRepository.count())
                .totalUsers(userRepository.count())
                .categoryCount(categoryCount)
                .regionCount(regionCount)
                .build());
    }
}
