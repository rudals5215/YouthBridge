package com.YouthBridge.YouthBridge.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

// @EnableScheduling — @Scheduled 어노테이션 활성화
// @EnableAsync       — @Async 어노테이션 활성화
@Configuration
@EnableScheduling
@EnableAsync
public class SchedulingConfig {
}
