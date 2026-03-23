package com.YouthBridge.YouthBridge.domain.bookmark.controller;

import com.YouthBridge.YouthBridge.domain.bookmark.dto.BookmarkResponse;
import com.YouthBridge.YouthBridge.domain.bookmark.service.BookmarkService;
import com.YouthBridge.YouthBridge.global.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final com.YouthBridge.YouthBridge.domain.user.repository.UserRepository userRepository;

    // GET /api/bookmarks
    // 내 즐겨찾기 목록 전체 조회
    // 헤더: Authorization: Bearer {토큰}
    @GetMapping
    public ResponseEntity<List<BookmarkResponse>> getBookmarks(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(bookmarkService.getBookmarks(userId));
    }

    // POST /api/bookmarks/{policyId}
    // 즐겨찾기 추가
    @PostMapping("/{policyId}")
    public ResponseEntity<BookmarkResponse> addBookmark(
            @PathVariable Long policyId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        BookmarkResponse response = bookmarkService.addBookmark(userId, policyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // DELETE /api/bookmarks/{policyId}
    // 즐겨찾기 삭제
    @DeleteMapping("/{policyId}")
    public ResponseEntity<Map<String, String>> removeBookmark(
            @PathVariable Long policyId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        bookmarkService.removeBookmark(userId, policyId);
        return ResponseEntity.ok(Map.of("message", "즐겨찾기가 삭제됐어요"));
    }

    // GET /api/bookmarks/check/{policyId}
    // 특정 정책 즐겨찾기 여부 확인
    // 정책 상세 페이지에서 하트 아이콘 채울지 말지 결정할 때 사용
    @GetMapping("/check/{policyId}")
    public ResponseEntity<Map<String, Boolean>> checkBookmark(
            @PathVariable Long policyId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        boolean bookmarked = bookmarkService.isBookmarked(userId, policyId);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }

    // UserDetails(이메일)로 유저 ID 가져오는 헬퍼 메서드
    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없어요"))
                .getId();
    }
}
