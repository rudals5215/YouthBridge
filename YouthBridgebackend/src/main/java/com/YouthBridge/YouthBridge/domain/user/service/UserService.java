package com.YouthBridge.YouthBridge.domain.user.service;

import com.YouthBridge.YouthBridge.domain.user.dto.UpdatePasswordRequest;
import com.YouthBridge.YouthBridge.domain.user.dto.UpdateProfileRequest;
import com.YouthBridge.YouthBridge.domain.user.dto.UserResponse;
import com.YouthBridge.YouthBridge.domain.user.entity.User;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── 내 정보 조회 ──────────────────────────────────────
    public UserResponse getMe(Long userId) {
        User user = findUser(userId);
        return UserResponse.from(user);
    }

    // ── 내 정보 수정 ──────────────────────────────────────
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUser(userId);
        user.updateProfile(
                request.getBirthYear(),
                request.getRegion(),
                request.getInterests()
        );
        // 이름 수정은 User 엔티티에 메서드 추가 필요
        if (request.getName() != null) {
            user.updateName(request.getName());
        }
        return UserResponse.from(user);
    }

    // ── 비밀번호 변경 ─────────────────────────────────────
    @Transactional
    public void updatePassword(Long userId, UpdatePasswordRequest request) {
        User user = findUser(userId);

        // 소셜 로그인 유저는 비밀번호 변경 불가
        if (user.getProvider() != null) {
            throw new IllegalStateException("소셜 로그인 계정은 비밀번호를 변경할 수 없어요");
        }

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않아요");
        }

        // 새 비밀번호로 변경
        user.updatePassword(passwordEncoder.encode(request.getNewPassword()));
    }

    // ── 회원 탈퇴 ─────────────────────────────────────────
    @Transactional
    public void withdraw(Long userId) {
        User user = findUser(userId);
        // 실제로 삭제하지 않고 비활성화 처리
        // 나중에 개인정보 처리 방침에 따라 일정 기간 후 완전 삭제
        user.deactivate();
    }

    // ── 공통: 유저 조회 ───────────────────────────────────
    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없어요"));
    }
}
