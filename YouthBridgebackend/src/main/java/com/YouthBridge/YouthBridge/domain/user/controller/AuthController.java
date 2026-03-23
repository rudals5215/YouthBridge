package com.YouthBridge.YouthBridge.domain.user.controller;

import com.YouthBridge.YouthBridge.domain.user.dto.AuthResponse;
import com.YouthBridge.YouthBridge.domain.user.dto.KakaoLoginRequest;
import com.YouthBridge.YouthBridge.domain.user.dto.LoginRequest;
import com.YouthBridge.YouthBridge.domain.user.dto.SignupRequest;
import com.YouthBridge.YouthBridge.domain.user.service.AuthService;
import com.YouthBridge.YouthBridge.domain.user.service.KakaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final KakaoService kakaoService;

    // POST /api/auth/signup
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // GET /api/auth/check-email?email=test@test.com
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(Map.of("duplicate", authService.checkEmailDuplicate(email)));
    }

    // POST /api/auth/kakao
    // 프론트에서 카카오 인가 코드를 보내면 JWT 발급해서 응답
    @PostMapping("/kakao")
    public ResponseEntity<AuthResponse> kakaoLogin(@Valid @RequestBody KakaoLoginRequest request) {
        return ResponseEntity.ok(kakaoService.kakaoLogin(request.getCode()));
    }
}
