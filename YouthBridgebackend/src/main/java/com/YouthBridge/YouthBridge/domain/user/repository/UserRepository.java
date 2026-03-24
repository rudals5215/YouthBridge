package com.YouthBridge.YouthBridge.domain.user.repository;

import com.YouthBridge.YouthBridge.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    // 오늘 가입한 유저 수 (관리자 대시보드)
    long countByCreatedAtAfter(LocalDateTime dateTime);

    // 이메일 또는 이름으로 검색 (관리자 회원 목록)
    Page<User> findByEmailContainingOrNameContaining(
            String email, String name, Pageable pageable);

    // 관심 분야에 해당 카테고리가 포함된 유저 조회 (새 정책 알림 발송)
    List<User> findByInterestsContaining(String category);
}
