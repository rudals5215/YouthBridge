package com.YouthBridge.YouthBridge.domain.notice.controller;

import com.YouthBridge.YouthBridge.domain.notice.dto.NoticeResponse;
import com.YouthBridge.YouthBridge.domain.notice.service.NoticeService;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;
    private final UserRepository userRepository;

    // GET /api/notices — 공지사항 목록 (누구나)
    @GetMapping("/api/notices")
    public ResponseEntity<Page<NoticeResponse>> getNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(noticeService.getNotices(page, size));
    }

    // POST /api/admin/notices — 공지사항 작성 (관리자)
    @PostMapping("/api/admin/notices")
    public ResponseEntity<NoticeResponse> createNotice(
            @RequestBody NoticeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String authorName = userDetails.getUsername();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(noticeService.createNotice(request.getTitle(), request.getContent(), authorName));
    }

    // DELETE /api/admin/notices/{id} — 공지사항 삭제 (관리자)
    @DeleteMapping("/api/admin/notices/{id}")
    public ResponseEntity<Map<String, String>> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok(Map.of("message", "공지사항이 삭제됐어요"));
    }

    @Getter
    static class NoticeRequest {
        private String title;
        private String content;
    }
}
