package com.YouthBridge.YouthBridge.domain.notice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "notices")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 작성자 이름 (관리자)
    @Column(nullable = false, length = 20)
    private String authorName;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public static Notice create(String title, String content, String authorName) {
        Notice n = new Notice();
        n.title = title;
        n.content = content;
        n.authorName = authorName;
        return n;
    }
}
