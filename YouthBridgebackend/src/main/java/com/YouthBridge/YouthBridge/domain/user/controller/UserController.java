package com.YouthBridge.YouthBridge.domain.user.controller;

import com.YouthBridge.YouthBridge.domain.user.dto.UpdatePasswordRequest;
import com.YouthBridge.YouthBridge.domain.user.dto.UpdateProfileRequest;
import com.YouthBridge.YouthBridge.domain.user.dto.UserResponse;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import com.YouthBridge.YouthBridge.domain.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // GET /api/users/me — 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(userService.getMe(userId));
    }

    // PATCH /api/users/me — 내 정보 수정 (이름, 지역, 관심분야)
    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    // PATCH /api/users/me/password — 비밀번호 변경
    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @Valid @RequestBody UpdatePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        userService.updatePassword(userId, request);
        return ResponseEntity.ok(Map.of("message", "비밀번호가 변경됐어요"));
    }

    // DELETE /api/users/me — 회원 탈퇴
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> withdraw(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        userService.withdraw(userId);
        return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료됐어요"));
    }

    // 헬퍼 메서드
    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없어요"))
                .getId();
    }
}
