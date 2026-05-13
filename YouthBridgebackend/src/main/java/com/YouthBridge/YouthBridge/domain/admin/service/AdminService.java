package com.YouthBridge.YouthBridge.domain.admin.service;

import com.YouthBridge.YouthBridge.domain.admin.dto.AdminStatsResponse;
import com.YouthBridge.YouthBridge.domain.admin.dto.AdminUserResponse;
import com.YouthBridge.YouthBridge.domain.bookmark.repository.BookmarkRepository;
import com.YouthBridge.YouthBridge.domain.policy.entity.PolicyStatus;
import com.YouthBridge.YouthBridge.domain.policy.repository.PolicyRepository;
import com.YouthBridge.YouthBridge.domain.policy.service.PolicyCrawlerService;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final BookmarkRepository bookmarkRepository;
    private final PolicyCrawlerService crawlerService;

    public AdminStatsResponse getStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalPolicies(policyRepository.count())
                .activePolicies(policyRepository.countByStatus(PolicyStatus.ACTIVE))
                .totalBookmarks(bookmarkRepository.count())
                .todaySignups(userRepository.countByCreatedAtAfter(todayStart))
                .build();
    }

    public Page<AdminUserResponse> getUsers(int page, int size, String keyword) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (keyword != null && !keyword.isBlank()) {
            return userRepository.findByEmailContainingOrNameContaining(keyword, keyword, pageable)
                    .map(AdminUserResponse::from);
        }
        return userRepository.findAll(pageable).map(AdminUserResponse::from);
    }

    @Transactional
    public void deletePolicy(Long policyId) {
        if (!policyRepository.existsById(policyId)) {
            throw new IllegalArgumentException("정책을 찾을 수 없어요. id: " + policyId);
        }
        policyRepository.deleteById(policyId);
    }

    // 비동기 — 즉시 반환 후 백그라운드에서 크롤링
    @Async
    @Transactional
    public void syncPublicApiAsync() {
        log.info("[Admin] 공공 API 수동 동기화 시작 (비동기)");
        crawlerService.crawlAndSave();
    }
}
