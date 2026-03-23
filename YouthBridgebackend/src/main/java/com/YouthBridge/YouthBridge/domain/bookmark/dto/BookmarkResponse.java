package com.YouthBridge.YouthBridge.domain.bookmark.dto;

import com.YouthBridge.YouthBridge.domain.bookmark.entity.Bookmark;
import com.YouthBridge.YouthBridge.domain.policy.entity.PolicyStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class BookmarkResponse {

    private Long bookmarkId;       // 즐겨찾기 ID
    private Long policyId;         // 정책 ID
    private String title;          // 정책명
    private String description;    // 정책 설명
    private String category;       // 카테고리
    private String region;         // 지역
    private Integer minAge;        // 최소 나이
    private Integer maxAge;        // 최대 나이
    private LocalDate applyEndDate; // 마감일
    private PolicyStatus status;   // 정책 상태
    private Long dday;             // 마감까지 남은 일수
    private LocalDateTime bookmarkedAt; // 즐겨찾기 등록 시간

    // Bookmark 엔티티 → BookmarkResponse 변환
    public static BookmarkResponse from(Bookmark bookmark) {
        Long dday = null;
        if (bookmark.getPolicy().getApplyEndDate() != null) {
            dday = (long) LocalDate.now()
                    .until(bookmark.getPolicy().getApplyEndDate())
                    .getDays();
        }

        return BookmarkResponse.builder()
                .bookmarkId(bookmark.getId())
                .policyId(bookmark.getPolicy().getId())
                .title(bookmark.getPolicy().getTitle())
                .description(bookmark.getPolicy().getDescription())
                .category(bookmark.getPolicy().getCategory())
                .region(bookmark.getPolicy().getRegion())
                .minAge(bookmark.getPolicy().getMinAge())
                .maxAge(bookmark.getPolicy().getMaxAge())
                .applyEndDate(bookmark.getPolicy().getApplyEndDate())
                .status(bookmark.getPolicy().getStatus())
                .dday(dday)
                .bookmarkedAt(bookmark.getCreatedAt())
                .build();
    }
}
