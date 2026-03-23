package com.YouthBridge.YouthBridge.domain.user.service;

import com.YouthBridge.YouthBridge.domain.user.dto.AuthResponse;
import com.YouthBridge.YouthBridge.domain.user.entity.User;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import com.YouthBridge.YouthBridge.global.exception.CustomException;
import com.YouthBridge.YouthBridge.global.exception.ErrorCode;
import com.YouthBridge.YouthBridge.global.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KakaoService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final RestTemplate restTemplate;

    @Value("${kakao.client-id}")
    private String clientId;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    // ── 카카오 로그인 전체 흐름 ───────────────────────────
    @Transactional
    public AuthResponse kakaoLogin(String code) {
        // 1. 인가 코드로 카카오 액세스 토큰 발급
        String kakaoAccessToken = getKakaoAccessToken(code);


        // 2. 카카오 액세스 토큰으로 유저 정보 조회
        Map<String, Object> userInfo = getKakaoUserInfo(kakaoAccessToken);

        // 3. 카카오 유저 정보로 우리 서비스 로그인/회원가입 처리
        User user = findOrCreateUser(userInfo);

        // 4. 우리 서비스 JWT 발급
        String token = jwtProvider.generateToken(user.getId(), user.getEmail());
        return AuthResponse.of(token, user);
    }

    // ── 1단계: 인가 코드 → 카카오 액세스 토큰 ────────────
    private String getKakaoAccessToken(String code) {
        log.info("[KakaoService] client_id={}", clientId);
        log.info("[KakaoService] redirect_uri={}", redirectUri);
        log.info("[KakaoService] code={}", code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", clientId);
        body.add("redirect_uri", redirectUri);
        body.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://kauth.kakao.com/oauth/token",
                request,
                Map.class
            );

            if (response.getBody() == null) {
                throw new CustomException(ErrorCode.KAKAO_LOGIN_FAILED);
            }

            return (String) response.getBody().get("access_token");

        } catch (Exception e) {
            log.error("[KakaoService] 토큰 발급 실패: {}", e.getMessage());
            throw new CustomException(ErrorCode.KAKAO_LOGIN_FAILED);
        }
    }

    // ── 2단계: 카카오 액세스 토큰 → 유저 정보 ────────────
    @SuppressWarnings("unchecked")
    private Map<String, Object> getKakaoUserInfo(String kakaoAccessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(kakaoAccessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.GET,
                request,
                Map.class
            );

            if (response.getBody() == null) {
                throw new CustomException(ErrorCode.KAKAO_LOGIN_FAILED);
            }

            return response.getBody();

        } catch (Exception e) {
            log.error("[KakaoService] 유저 정보 조회 실패: {}", e.getMessage());
            throw new CustomException(ErrorCode.KAKAO_LOGIN_FAILED);
        }
    }

    // ── 3단계: 유저 찾거나 생성 ──────────────────────────
    @SuppressWarnings("unchecked")
    private User findOrCreateUser(Map<String, Object> userInfo) {
        // 카카오 고유 ID
        String providerId = String.valueOf(userInfo.get("id"));

        // 닉네임 추출
        Map<String, Object> kakaoAccount = (Map<String, Object>) userInfo.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
        String nickname = (String) profile.get("nickname");

        // 이메일 없이 카카오 ID 기반 임시 이메일 생성
        // 비즈니스 인증 없이는 이메일 수집이 안 되기 때문
        String email = "kakao_" + providerId + "@kakao.com";

        // 이미 가입된 유저인지 확인
        return userRepository.findByProviderAndProviderId("kakao", providerId)
                .orElseGet(() -> {
                    // 처음 카카오 로그인 → 자동 회원가입
                    log.info("[KakaoService] 신규 카카오 유저 등록: {}", nickname);
                    User newUser = User.createSocial(email, nickname, "kakao", providerId);
                    return userRepository.save(newUser);
                });
    }
}
