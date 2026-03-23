package com.YouthBridge.YouthBridge.domain.bookmark.repository;

import com.YouthBridge.YouthBridge.domain.bookmark.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    // 특정 유저의 즐겨찾기 전체 조회
    List<Bookmark> findByUserId(Long userId);

    // 특정 유저가 특정 정책을 즐겨찾기 했는지 확인
    boolean existsByUserIdAndPolicyId(Long userId, Long policyId);

    // 즐겨찾기 단건 찾기 (삭제할 때 사용)
    Optional<Bookmark> findByUserIdAndPolicyId(Long userId, Long policyId);

    // 특정 유저의 즐겨찾기 수
    long countByUserId(Long userId);
}
