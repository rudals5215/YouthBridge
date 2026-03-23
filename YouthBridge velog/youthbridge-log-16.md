# YouthBridge 개발일지 #16 — 공지사항 + 인앱 알림 구현

> 작동은 하지만 미완성이었던 기능들을 마무리했어요.  
> 공지사항 백엔드 API, 인앱 알림(빨간 점 + 드롭다운), 알림 자동 삭제 스케줄러까지 구현했어요.

---

## 이번 글에서 다루는 것

- 공지사항 백엔드 + 프론트 구현
- 인앱 알림 설계 (푸시 대신 빨간 점 + 드롭다운)
- Navbar 알림 벨 + 드롭다운
- 마이페이지 알림 탭 실제 연동
- 7일 지난 읽은 알림 자동 삭제 스케줄러
- 알림 읽음 처리 state 동기화 트러블슈팅
- 기타 UI 수정 (통계바, 카테고리 버튼, Footer)

---

## 1. 왜 푸시 알림 대신 인앱 알림인가

처음엔 알림 기능을 어떻게 구현할지 고민이 많았어요. 푸시 알림은 구현 난이도가 높고 서버 부담도 있어서 현재 단계에서는 오버엔지니어링이에요.

**인앱 알림 (빨간 점 + 알림 목록)으로 충분한 이유**

```
푸시 알림이 필요한 경우
- 사용자가 앱 밖에 있어도 알림을 줘야 할 때
- 실시간성이 매우 중요할 때 (채팅, 거래 등)
- 재방문 유도가 목적일 때

인앱 알림으로 충분한 경우  ← YouthBridge가 여기에 해당
- 로그인했을 때 새 정책 알림을 보여주면 됨
- 정책 정보는 실시간성보다 정확성이 중요
```

구현 방식은 이렇게요.

```
새 정책 등록 → DB에 알림 데이터 저장
사용자 로그인 → 안읽은 알림 수 조회 → Navbar에 빨간 점
벨 클릭 → 알림 목록 드롭다운 → 전체 읽음 처리
```

---

## 2. DB 설계

### notifications 테이블

```java
@Entity
public class Notification {
    private Long id;
    private User user;       // 알림 받는 유저
    private String message;  // 알림 내용
    private Long policyId;   // 클릭 시 이동할 정책 (없으면 null)
    private boolean isRead;  // 읽음 여부
    private LocalDateTime createdAt;
}
```

### notices 테이블 (공지사항)

```java
@Entity
public class Notice {
    private Long id;
    private String title;
    private String content;
    private String authorName; // 작성자 이름
    private LocalDateTime createdAt;
}
```

---

## 3. 알림 API

| 메서드 | URL | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/notifications` | 7일 이내 알림 목록 | ✅ |
| GET | `/api/notifications/unread-count` | 안읽은 알림 수 | ✅ |
| PATCH | `/api/notifications/read` | 전체 읽음 처리 | ✅ |

7일 이내 알림만 조회하고, 안읽은 것이 먼저 오도록 정렬했어요.

```java
@Query("""
    SELECT n FROM Notification n
    WHERE n.user.id = :userId
    AND n.createdAt >= :since
    ORDER BY n.isRead ASC, n.createdAt DESC
""")
List<Notification> findRecentByUserId(@Param("userId") Long userId,
                                       @Param("since") LocalDateTime since);
```

`ORDER BY n.isRead ASC`가 포인트예요. `isRead`가 `false(0)`인 것이 `true(1)`보다 앞에 오니까 안읽은 것이 자동으로 상단에 배치돼요.

---

## 4. 7일 자동 삭제 스케줄러

읽은 알림이 계속 쌓이면 DB가 불필요하게 커져요. 매일 자정에 7일 지난 읽은 알림을 자동 삭제해요.

```java
// NotificationService.java
@Scheduled(cron = "0 0 0 * * *")  // 매일 자정
@Transactional
public void deleteOldNotifications() {
    LocalDateTime before = LocalDateTime.now().minusDays(7);
    notificationRepository.deleteOldReadNotifications(before);
    log.info("[Scheduler] 7일 지난 읽은 알림 삭제 완료");
}
```

`@Scheduled`를 쓰려면 별도 Config 클래스에 `@EnableScheduling`을 추가해야 해요.

```java
@Configuration
@EnableScheduling
public class SchedulingConfig {}
```

---

## 5. Navbar 알림 드롭다운

벨 아이콘 클릭 시 드롭다운이 열리고 알림 목록을 보여줘요.

```
안읽은 알림  ← 상단 (틸 배경, 굵은 글씨)
읽은 알림   ← 하단 (50% 투명)
```

외부 클릭 시 닫히는 처리를 `useRef`로 구현했어요.

```tsx
const notifRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleClick = (e: MouseEvent) => {
    if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
      setShowNotif(false);
    }
  };
  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
}, []);
```

---

## 6. 공지사항 API

| 메서드 | URL | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/notices` | 공지사항 목록 | ❌ |
| POST | `/api/admin/notices` | 공지사항 작성 | ADMIN |
| DELETE | `/api/admin/notices/{id}` | 공지사항 삭제 | ADMIN |

관리자 페이지에서 작성/삭제, `/notices` 페이지에서 아코디언 형태로 조회해요.

---

## 트러블슈팅

### 문제 1 — 벨 클릭해도 알림이 읽음 처리 안 됨

**증상**

벨을 클릭해서 알림을 봤는데 드롭다운을 닫고 다시 열면 여전히 "새 알림"으로 표시돼요.

**원인**

`markAllAsRead()`를 호출해서 DB는 업데이트했는데, 프론트 state의 `isRead` 값은 그대로 `false`였어요.

```tsx
// 잘못된 코드 — DB만 업데이트, state는 그대로
await markAllAsRead();
setUnreadCount(0);
// notifications state는 여전히 isRead: false
```

**해결**

읽음 처리 후 state도 `.map()`으로 일괄 업데이트해요.

```tsx
// 올바른 코드 — DB + state 동시 업데이트
await markAllAsRead();
setUnreadCount(0);
setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
```

### 문제 2 — useEffect 안에서 setState 직접 호출 경고

**증상**

```
Error: Calling setState synchronously within an effect can trigger cascading renders
```

**원인**

```tsx
useEffect(() => {
  if (!isLoggedIn) {
    setUnreadCount(0);  // ← 이게 문제
    return;
  }
  // ...
}, [isLoggedIn]);
```

**해결**

로그아웃 시 state 초기화는 `useEffect` 안에서 직접 하지 않아도 돼요. `isLoggedIn`이 `false`가 되면 컴포넌트가 리렌더링되면서 자연스럽게 처리돼요.

```tsx
useEffect(() => {
  if (!isLoggedIn) return; // setUnreadCount(0) 제거
  fetchUnreadCount().then(setUnreadCount).catch(() => {});
}, [isLoggedIn]);
```

---

## 파일 변경 사항

```
백엔드 (신규)
domain/notification/  ← Notification 엔티티, Repository, Service, Controller
domain/notice/        ← Notice 엔티티, Repository, Service, Controller
global/config/SchedulingConfig.java ← @EnableScheduling

수정
global/config/DataInitializer.java  ← 알림/공지 더미 데이터 추가
global/config/SecurityConfig.java   ← /api/notices/** permitAll

프론트 (신규)
src/apis/notificationApi.ts
src/apis/noticeApi.ts
src/pages/NoticePage.tsx / .css

수정
Navbar.tsx / .css  ← 알림 벨 + 드롭다운
MyPage.tsx / .css  ← 알림 탭 실제 연동
AdminPage.tsx      ← 공지사항 API 연동, 불필요한 alert 제거
Home.tsx           ← Footer 링크 정리, 통계바 4개
```

---

## 다음 할 일

- [x] 공지사항 기능 완료
- [x] 인앱 알림 완료
- [ ] 공공 API 크롤링 (API 키 승인 대기)
- [ ] 배포 (Vercel + Render + Railway)
