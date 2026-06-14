package com.YouthBridge.YouthBridge.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // ⚠️ 실제 사용 중인 대표 도메인과 Vercel 프로젝트 주소를 모두 등록합니다.
                .allowedOrigins(
                        "https://youth-bridge.vercel.app",
                        "https://youth-bridge-9453am9km-rudals5215s-projects.vercel.app"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}