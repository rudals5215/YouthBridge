package com.YouthBridge.YouthBridge.domain.policy.repository;

import com.YouthBridge.YouthBridge.domain.policy.entity.Policy;
import com.YouthBridge.YouthBridge.domain.policy.entity.PolicyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PolicyRepository extends JpaRepository<Policy, Long> {

    boolean existsByExternalId(String externalId);
    Optional<Policy> findByExternalId(String externalId);

    // ORDER BY는 Pageable의 Sort로 처리 (동적 정렬)
    @Query("""
        SELECT p FROM Policy p
        WHERE (:region IS NULL OR p.region = :region OR p.region = 'all')
        AND (:category IS NULL OR p.category = :category)
        AND (:age IS NULL OR (
            (p.minAge IS NULL OR p.minAge <= :age) AND
            (p.maxAge IS NULL OR p.maxAge >= :age)
        ))
        AND (
            :keyword IS NULL OR
            p.title LIKE CONCAT('%', :keyword, '%') OR
            p.description LIKE CONCAT('%', :keyword, '%')
        )
        AND (:status IS NULL OR p.status = :status)
    """)
    Page<Policy> findByFilters(
        @Param("region")   String region,
        @Param("category") String category,
        @Param("age")      Integer age,
        @Param("keyword")  String keyword,
        @Param("status")   PolicyStatus status,
        Pageable pageable
    );

    @Query("""
        SELECT p FROM Policy p
        WHERE (:region IS NULL OR p.region = :region OR p.region = 'all')
        AND (:#{#categories == null || #categories.isEmpty()} = true OR p.category IN :categories)
        AND (:age IS NULL OR (
            (p.minAge IS NULL OR p.minAge <= :age) AND
            (p.maxAge IS NULL OR p.maxAge >= :age)
        ))
        AND (
            :keyword IS NULL OR
            p.title LIKE CONCAT('%', :keyword, '%') OR
            p.description LIKE CONCAT('%', :keyword, '%')
        )
        AND (:status IS NULL OR p.status = :status)
    """)
    Page<Policy> findByFiltersMultiCategory(
        @Param("region")     String region,
        @Param("categories") List<String> categories,
        @Param("age")        Integer age,
        @Param("keyword")    String keyword,
        @Param("status")     PolicyStatus status,
        Pageable pageable
    );

    long countByStatus(PolicyStatus status);

    // CLOSED 정책 일괄 삭제 (동기화 시 정리용)
    @Modifying
    @Query("DELETE FROM Policy p WHERE p.status = :status")
    void deleteByStatus(@Param("status") PolicyStatus status);

    @Query("SELECT p.category, COUNT(p) FROM Policy p GROUP BY p.category")
    List<Object[]> countByCategory();

    @Query("SELECT p.region, COUNT(p) FROM Policy p GROUP BY p.region")
    List<Object[]> countByRegion();
}
