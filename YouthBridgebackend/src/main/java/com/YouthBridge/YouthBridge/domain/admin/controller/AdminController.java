package com.YouthBridge.YouthBridge.domain.admin.controller;

import com.YouthBridge.YouthBridge.domain.admin.dto.AdminStatsResponse;
import com.YouthBridge.YouthBridge.domain.admin.dto.AdminUserResponse;
import com.YouthBridge.YouthBridge.domain.admin.service.AdminService;
import com.YouthBridge.YouthBridge.domain.admin.service.SyncStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final SyncStatusService syncStatusService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserResponse>> getUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false)    String keyword) {
        return ResponseEntity.ok(adminService.getUsers(page, size, keyword));
    }

    @DeleteMapping("/policies/{id}")
    public ResponseEntity<Map<String, String>> deletePolicy(@PathVariable Long id) {
        adminService.deletePolicy(id);
        return ResponseEntity.ok(Map.of("message", "정책이 삭제됐어요"));
    }

    // 수동 동기화 시작 — 즉시 202 응답 후 백그라운드 실행
    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> sync() {
        if (syncStatusService.getStatus().running()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "이미 동기화가 진행 중이에요"));
        }
        adminService.syncPublicApiAsync();
        return ResponseEntity.accepted()
            .body(Map.of("message", "동기화가 시작됐어요"));
    }

    // 동기화 상태 폴링 — 프론트에서 2초마다 호출
    @GetMapping("/sync/status")
    public ResponseEntity<SyncStatusService.StatusDto> getSyncStatus() {
        return ResponseEntity.ok(syncStatusService.getStatus());
    }
}
