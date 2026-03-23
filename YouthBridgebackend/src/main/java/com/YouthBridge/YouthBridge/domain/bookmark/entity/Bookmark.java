package com.YouthBridge.YouthBridge.domain.bookmark.entity;

import com.YouthBridge.YouthBridge.domain.policy.entity.Policy;
import com.YouthBridge.YouthBridge.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "bookmarks",
    // 같은 사용자가 같은 정책을 중복 즐겨찾기 하지 못하도록 복합 유니크 제약
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "policy_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 즐겨찾기한 사용자 (N:1 — 한 유저가 여러 즐겨찾기)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 즐겨찾기한 정책 (N:1 — 한 정책에 여러 즐겨찾기)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ── 생성 메서드 ───────────────────────────────────────
    public static Bookmark create(User user, Policy policy) {
        Bookmark bookmark = new Bookmark();
        bookmark.user = user;
        bookmark.policy = policy;
        return bookmark;
    }
}
