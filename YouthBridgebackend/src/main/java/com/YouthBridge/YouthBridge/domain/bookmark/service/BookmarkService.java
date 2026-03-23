package com.YouthBridge.YouthBridge.domain.bookmark.service;

import com.YouthBridge.YouthBridge.domain.bookmark.dto.BookmarkResponse;
import com.YouthBridge.YouthBridge.domain.bookmark.entity.Bookmark;
import com.YouthBridge.YouthBridge.domain.bookmark.repository.BookmarkRepository;
import com.YouthBridge.YouthBridge.domain.policy.entity.Policy;
import com.YouthBridge.YouthBridge.domain.policy.repository.PolicyRepository;
import com.YouthBridge.YouthBridge.domain.user.entity.User;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import com.YouthBridge.YouthBridge.global.exception.CustomException;
import com.YouthBridge.YouthBridge.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;

    // ── 즐겨찾기 추가 ─────────────────────────────────────
    @Transactional
    public BookmarkResponse addBookmark(Long userId, Long policyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new CustomException(ErrorCode.POLICY_NOT_FOUND));

        if (bookmarkRepository.existsByUserIdAndPolicyId(userId, policyId)) {
            throw new CustomException(ErrorCode.DUPLICATE_BOOKMARK);
        }

        Bookmark bookmark = Bookmark.create(user, policy);
        return BookmarkResponse.from(bookmarkRepository.save(bookmark));
    }

    // ── 즐겨찾기 삭제 ─────────────────────────────────────
    @Transactional
    public void removeBookmark(Long userId, Long policyId) {
        Bookmark bookmark = bookmarkRepository.findByUserIdAndPolicyId(userId, policyId)
                .orElseThrow(() -> new CustomException(ErrorCode.BOOKMARK_NOT_FOUND));

        if (!bookmark.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.BOOKMARK_FORBIDDEN);
        }

        bookmarkRepository.delete(bookmark);
    }

    // ── 즐겨찾기 목록 조회 ────────────────────────────────
    public List<BookmarkResponse> getBookmarks(Long userId) {
        return bookmarkRepository.findByUserId(userId)
                .stream()
                .map(BookmarkResponse::from)
                .toList();
    }

    // ── 즐겨찾기 여부 확인 ────────────────────────────────
    public boolean isBookmarked(Long userId, Long policyId) {
        return bookmarkRepository.existsByUserIdAndPolicyId(userId, policyId);
    }
}
