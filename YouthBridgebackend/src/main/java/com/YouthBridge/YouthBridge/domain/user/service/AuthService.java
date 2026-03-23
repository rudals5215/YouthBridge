package com.YouthBridge.YouthBridge.domain.user.service;

import com.YouthBridge.YouthBridge.domain.user.dto.AuthResponse;
import com.YouthBridge.YouthBridge.domain.user.dto.LoginRequest;
import com.YouthBridge.YouthBridge.domain.user.dto.SignupRequest;
import com.YouthBridge.YouthBridge.domain.user.entity.User;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import com.YouthBridge.YouthBridge.global.exception.CustomException;
import com.YouthBridge.YouthBridge.global.exception.ErrorCode;
import com.YouthBridge.YouthBridge.global.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    // ── 회원가입 ──────────────────────────────────────────
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.createLocal(request.getEmail(), encodedPassword, request.getName());

        if (request.getBirthYear() != null || request.getRegion() != null) {
            user.updateProfile(request.getBirthYear(), request.getRegion(), request.getInterests());
        }

        User savedUser = userRepository.save(user);
        String token = jwtProvider.generateToken(savedUser.getId(), savedUser.getEmail());
        return AuthResponse.of(token, savedUser);
    }

    // ── 로그인 ────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_PASSWORD));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        if (!user.isActive()) {
            throw new CustomException(ErrorCode.DEACTIVATED_USER);
        }

        String token = jwtProvider.generateToken(user.getId(), user.getEmail());
        return AuthResponse.of(token, user);
    }

    // ── 이메일 중복 확인 ──────────────────────────────────
    public boolean checkEmailDuplicate(String email) {
        return userRepository.existsByEmail(email);
    }
}
