package com.YouthBridge.YouthBridge.domain.admin.service;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 동기화 상태 추적 — 메모리에 저장 (서버 재시작 시 초기화)
 * 프론트가 폴링으로 상태를 확인해요
 */
@Component
public class SyncStatusService {

    private final AtomicBoolean running  = new AtomicBoolean(false);
    private final AtomicInteger saved    = new AtomicInteger(0);
    private final AtomicInteger updated  = new AtomicInteger(0);
    private final AtomicInteger deleted  = new AtomicInteger(0);
    private final AtomicReference<String> finishedAt = new AtomicReference<>(null);
    private final AtomicReference<String> errorMsg   = new AtomicReference<>(null);

    public void start() {
        running.set(true);
        saved.set(0); updated.set(0); deleted.set(0);
        finishedAt.set(null); errorMsg.set(null);
    }

    public void finish(int savedCount, int updatedCount, int deletedCount) {
        this.saved.set(savedCount);
        this.updated.set(updatedCount);
        this.deleted.set(deletedCount);
        this.finishedAt.set(LocalDateTime.now()
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        running.set(false);
    }

    public void error(String message) {
        this.errorMsg.set(message);
        running.set(false);
    }

    public record StatusDto(
        boolean running,
        Integer saved,
        Integer updated,
        Integer deleted,
        String finishedAt,
        String errorMsg
    ) {}

    public StatusDto getStatus() {
        return new StatusDto(
            running.get(),
            saved.get(),
            updated.get(),
            deleted.get(),
            finishedAt.get(),
            errorMsg.get()
        );
    }
}
