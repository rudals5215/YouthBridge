package com.YouthBridge.YouthBridge.domain.admin.controller;

import com.YouthBridge.YouthBridge.domain.admin.dto.AdminStatsResponse;
import com.YouthBridge.YouthBridge.domain.admin.dto.AdminUserResponse;
import com.YouthBridge.YouthBridge.domain.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// 모든 /api/admin/** 경로는 SecurityConfig에서 ROLE_ADMIN만 접근 가능하게 설정 예정
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // GET /api/admin/stats — 대시보드 통계
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    // GET /api/admin/users?page=0&size=20&keyword=홍길동
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(adminService.getUsers(page, size, keyword));
    }

    // DELETE /api/admin/policies/{id} — 정책 삭제
    @DeleteMapping("/policies/{id}")
    public ResponseEntity<Map<String, String>> deletePolicy(@PathVariable Long id) {
        adminService.deletePolicy(id);
        return ResponseEntity.ok(Map.of("message", "정책이 삭제됐어요"));
    }

    // POST /api/admin/sync — 공공 API 수동 동기화
    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> syncPublicApi() {
        adminService.syncPublicApi();
        return ResponseEntity.ok(Map.of("message", "동기화가 완료됐어요"));
    }
}
