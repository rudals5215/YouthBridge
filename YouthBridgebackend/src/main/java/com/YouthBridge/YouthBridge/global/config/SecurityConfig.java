package com.YouthBridge.YouthBridge.global.config;

import com.YouthBridge.YouthBridge.global.security.CustomUserDetailsService;
import com.YouthBridge.YouthBridge.global.security.JwtFilter;
import com.YouthBridge.YouthBridge.global.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 — REST API는 토큰 방식이라 불필요
            .csrf(AbstractHttpConfigurer::disable)

            // CORS 설정 적용 (아래 corsConfigurationSource 사용)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 세션 사용 안 함 — JWT 방식이라 서버에 세션 저장 안 해요
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 요청별 접근 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 로그인 없이 접근 가능한 URL
                .requestMatchers(
                    "/api/auth/**",
                    "/api/policies/**",
                    "/api/home/**",
                    "/api/notices/**",       // 공지사항 조회는 누구나
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()
                // 관리자만 접근 가능
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // 나머지는 로그인 필요
                .anyRequest().authenticated()
            )

            // JWT 필터를 Spring Security 필터 앞에 추가
            // 매 요청마다 토큰 확인 → 유효하면 인증 처리
            .addFilterBefore(
                new JwtFilter(jwtProvider, userDetailsService),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // 비밀번호 암호화 (BCrypt)
    // 평문 비밀번호를 절대 DB에 저장하면 안 돼요
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager — 로그인 처리할 때 사용
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // CORS 설정 — 프론트(localhost:5173)에서 오는 요청 허용
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
            "http://localhost:5173",   // Vite 개발 서버
            "http://localhost:3000"    // 혹시 CRA 쓰면 이것도
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // 쿠키/인증 헤더 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
