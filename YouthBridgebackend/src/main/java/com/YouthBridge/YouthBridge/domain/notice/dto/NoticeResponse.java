package com.YouthBridge.YouthBridge.domain.notice.dto;

import com.YouthBridge.YouthBridge.domain.notice.entity.Notice;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NoticeResponse {
    private Long id;
    private String title;
    private String content;
    private String authorName;
    private LocalDateTime createdAt;

    public static NoticeResponse from(Notice n) {
        return NoticeResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .authorName(n.getAuthorName())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
