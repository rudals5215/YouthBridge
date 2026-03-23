package com.YouthBridge.YouthBridge.domain.user.repository;

import com.YouthBridge.YouthBridge.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 이메일로 유저 찾기 (로그인할 때 사용)
    Optional<User> findByEmail(String email);

    // 이메일 중복 확인 (회원가입할 때 사용)
    boolean existsByEmail(String email);

    // 소셜 로그인 유저 찾기
    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    // 오늘 가입한 유저 수 (관리자 대시보드)
    long countByCreatedAtAfter(LocalDateTime dateTime);

    // 이메일 또는 이름으로 검색 (관리자 회원 목록)
    Page<User> findByEmailContainingOrNameContaining(
            String email, String name, Pageable pageable);
}
