package com.YouthBridge.YouthBridge.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableJpaAuditing
public class JpaConfig {

    // RestTemplate — 카카오 API 같은 외부 HTTP 요청에 사용
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
