# YouthBridge 개발일지 #11 — 관리자 페이지 구현

> 관리자 페이지는 일반 Navbar 없이 독립된 레이아웃으로 만들었어요.  
> ROLE_ADMIN 권한 분리, 수동 동기화 버튼의 필요성도 정리해요.

---

## 이번 글에서 다루는 것

- 관리자 페이지를 일반 레이아웃과 분리한 이유
- ROLE_ADMIN 권한 처리
- 공공 API 수동 동기화 버튼이 왜 필요한가
- 백엔드 관리자 API 구현

---

## 1. 관리자 페이지 구성

```
관리자 페이지 (/admin)
├── 대시보드    — 회원 수, 정책 수, 즐겨찾기 수 통계 + 수동 동기화 버튼
├── 회원 관리   — 회원 목록 테이블 + 이름/이메일 검색
├── 정책 관리   — 정책 테이블 + 수정/삭제
└── 공지사항    — 공지 작성 폼
```

---

## 2. 독립 레이아웃으로 만든 이유

관리자 페이지는 일반 사용자 Navbar가 필요 없어요. 오히려 있으면 공간 낭비고 사용자가 관리자 화면에 있는지 헷갈려요.

```tsx
// AppRouter에서 AdminPage는 Navbar 없이 독립 렌더링
<Route path="/admin" element={<AdminPage />} />

// AdminPage 안에 자체 사이드바 포함
function AdminPage() {
  return (
    <div className="admin-page">
      <aside className="admin-sidebar"> ... </aside>
      <main className="admin-content"> ... </main>
    </div>
  );
}
```

---

## 3. ROLE_ADMIN 권한 처리

`User` 엔티티에 `role` 필드를 추가했어요.

```java
@Column(nullable = false, length = 20)
private String role = "USER"; // 기본값 USER, 관리자는 ADMIN
```

`SecurityConfig`에서 `/api/admin/**` 경로는 `ROLE_ADMIN`만 접근 가능하게 설정했어요.

```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

관리자 계정은 DB에서 직접 role을 바꿔요.

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@test.com';
```

---

## 4. 공공 API 수동 동기화 버튼

자동 크롤링은 하루 2번(오전 6시, 오후 6시) 실행해요. 그런데 중요한 정책이 새로 나왔는데 다음 크롤링까지 12시간 기다려야 하는 상황이 생길 수 있어요. 버튼 하나로 즉시 실행할 수 있게 만들었어요.

```java
// AdminService.java
public void syncPublicApi() {
    log.info("[Admin] 공공 API 수동 동기화 시작");
    // TODO: PolicyCrawlerService.crawlAndSave() 호출
    // 공공 API 연동 완료 후 여기에 연결할 예정
    log.info("[Admin] 공공 API 수동 동기화 완료");
}
```

---

## 5. 백엔드 관리자 API

| 메서드 | URL | 설명 |
|---|---|---|
| GET | `/api/admin/stats` | 대시보드 통계 |
| GET | `/api/admin/users` | 회원 목록 (검색, 페이징) |
| DELETE | `/api/admin/policies/{id}` | 정책 삭제 |
| POST | `/api/admin/sync` | 공공 API 수동 동기화 |

통계는 DB에서 `count()` 쿼리로 가져와요.

```java
public AdminStatsResponse getStats() {
    LocalDateTime todayStart = LocalDate.now().atStartOfDay();

    return AdminStatsResponse.builder()
            .totalUsers(userRepository.count())
            .totalPolicies(policyRepository.count())
            .activePolicies(policyRepository.countByStatus(PolicyStatus.ACTIVE))
            .totalBookmarks(bookmarkRepository.count())
            .todaySignups(userRepository.countByCreatedAtAfter(todayStart))
            .build();
}
```

---

## 트러블슈팅

### 문제 — 관리자 페이지에 아무나 접근할 수 있어요

**증상**

로그인하지 않은 상태에서 `/admin` URL을 직접 입력하면 관리자 페이지가 그대로 열렸어요.

**원인**

라우터에서 권한 체크 없이 그냥 컴포넌트를 렌더링했어요.

```tsx
// 문제 — 누구나 접근 가능
<Route path="/admin" element={<AdminPage />} />
```

**해결**

`ProtectedRoute` 컴포넌트를 만들어서 role 기반 접근 제어를 구현했어요.

```tsx
// 관리자만 접근 가능
<Route path="/admin" element={
  <ProtectedRoute requiredRole="ADMIN">
    <AdminPage />
  </ProtectedRoute>
} />
```

비로그인 → `"로그인이 필요합니다!"` 알림 후 `/login`으로 이동
일반 유저 → `"관리자가 아닙니다!"` 알림 후 `/`으로 이동

---

## 다음 할 일

- [x] 관리자 페이지 구현 완료
- [ ] 예외 처리 공통화
- [ ] 카카오 소셜 로그인
