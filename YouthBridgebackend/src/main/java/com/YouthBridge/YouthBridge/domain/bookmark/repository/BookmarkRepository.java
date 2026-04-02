package com.YouthBridge.YouthBridge.domain.bookmark.repository;

import com.YouthBridge.YouthBridge.domain.bookmark.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    List<Bookmark> findByUserId(Long userId);

    boolean existsByUserIdAndPolicyId(Long userId, Long policyId);

    Optional<Bookmark> findByUserIdAndPolicyId(Long userId, Long policyId);

    long countByUserId(Long userId);

    // 마감일이 특정 날짜인 즐겨찾기 목록 (마감 알림 스케줄러용)
    @Query("SELECT b FROM Bookmark b JOIN FETCH b.user JOIN FETCH b.policy " +
           "WHERE b.policy.applyEndDate = :date")
    List<Bookmark> findByPolicyApplyEndDate(@Param("date") LocalDate date);
}
