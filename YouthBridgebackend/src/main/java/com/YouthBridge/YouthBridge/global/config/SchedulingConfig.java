package com.YouthBridge.YouthBridge.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

// @EnableScheduling — 이게 있어야 @Scheduled 어노테이션이 동작해요
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
