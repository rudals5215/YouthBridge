package com.YouthBridge.YouthBridge.domain.admin.service;

import com.YouthBridge.YouthBridge.domain.admin.dto.AdminStatsResponse;
import com.YouthBridge.YouthBridge.domain.admin.dto.AdminUserResponse;
import com.YouthBridge.YouthBridge.domain.bookmark.repository.BookmarkRepository;
import com.YouthBridge.YouthBridge.domain.policy.entity.PolicyStatus;
import com.YouthBridge.YouthBridge.domain.policy.repository.PolicyRepository;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

    // ── 대시보드 통계 ─────────────────────────────────────
    public AdminStatsResponse getStats() {
        // 오늘 0시 ~ 지금
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalPolicies(policyRepository.count())
                .activePolicies(policyRepository.countByStatus(PolicyStatus.ACTIVE))
                .totalBookmarks(bookmarkRepository.count())
                .todaySignups(userRepository.countByCreatedAtAfter(todayStart))
                .build();
    }

    // ── 회원 목록 조회 ────────────────────────────────────
    public Page<AdminUserResponse> getUsers(int page, int size, String keyword) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (keyword != null && !keyword.isBlank()) {
            return userRepository.findByEmailContainingOrNameContaining(keyword, keyword, pageable)
                    .map(AdminUserResponse::from);
        }
        return userRepository.findAll(pageable).map(AdminUserResponse::from);
    }

    // ── 정책 삭제 ─────────────────────────────────────────
    @Transactional
    public void deletePolicy(Long policyId) {
        if (!policyRepository.existsById(policyId)) {
            throw new IllegalArgumentException("정책을 찾을 수 없어요. id: " + policyId);
        }
        policyRepository.deleteById(policyId);
        log.info("[Admin] 정책 삭제 완료. policyId={}", policyId);
    }

    // ── 공공 API 수동 동기화 ──────────────────────────────
    // 실제 동기화 로직은 공공 API 크롤링 구현 후 연결
    @Transactional
    public void syncPublicApi() {
        log.info("[Admin] 공공 API 수동 동기화 시작");
        // TODO: PolicyCrawlerService.crawlAndSave() 호출
        log.info("[Admin] 공공 API 수동 동기화 완료");
    }
}
