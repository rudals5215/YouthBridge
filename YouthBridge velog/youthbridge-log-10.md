# YouthBridge 개발일지 #10 — 마이페이지 구현

> 즐겨찾기 페이지를 따로 만드는 대신 마이페이지에 통합했어요.  
> 프론트 5개 탭 구조와 백엔드 API를 함께 설계했어요.

---

## 이번 글에서 다루는 것

- 마이페이지 5개 탭 구조 설계 이유
- 백엔드 마이페이지 API 구현
- 회원 탈퇴를 실제 삭제 대신 비활성화로 처리한 이유

---

## 1. 탭 구조 설계

```
마이페이지
├── 내 정보     — 이름, 이메일, 지역 표시 및 수정
├── 즐겨찾기    — 저장한 정책 목록 + 삭제 버튼
├── 관심 분야   — 카테고리 복수 선택
├── 보안        — 비밀번호 변경, 회원 탈퇴
└── 알림        — 마감 알림 등 (준비 중)
```

즐겨찾기 페이지를 별도로 만들지 않고 마이페이지 탭으로 통합한 이유는 Navbar가 너무 복잡해지기 때문이에요. 즐겨찾기는 로그인 후에만 쓰는 기능이라 마이페이지 안에 있는 게 자연스러워요.

---

## 2. 마이페이지 진입 권한

로그인 안 하면 로그인 페이지로 리다이렉트해요.

```tsx
useEffect(() => {
  if (!isLoggedIn) navigate("/login");
}, [isLoggedIn, navigate]);
```

---

## 3. 즐겨찾기 탭 — 실제 API 연동

```tsx
function BookmarkTab() {
  const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);

  useEffect(() => {
    fetchBookmarks().then(setBookmarks);
  }, []);

  const handleRemove = async (policyId: number) => {
    await removeBookmark(policyId);
    // 삭제 후 목록에서 바로 제거 (API 재호출 없이)
    setBookmarks((prev) => prev.filter((b) => b.policyId !== policyId));
  };
}
```

즐겨찾기 삭제 후 `fetchBookmarks()`를 다시 호출하지 않고 상태에서 바로 제거해요. 불필요한 API 요청을 줄일 수 있어요.

---

## 4. 백엔드 마이페이지 API

| 메서드 | URL | 설명 |
|---|---|---|
| GET | `/api/users/me` | 내 정보 조회 |
| PATCH | `/api/users/me` | 이름, 지역, 관심분야 수정 |
| PATCH | `/api/users/me/password` | 비밀번호 변경 |
| DELETE | `/api/users/me` | 회원 탈퇴 |

### 비밀번호 변경 시 소셜 로그인 계정 예외 처리

```java
public void updatePassword(Long userId, UpdatePasswordRequest request) {
    User user = findUser(userId);

    // 소셜 로그인 유저는 비밀번호 변경 불가
    if (user.getProvider() != null) {
        throw new CustomException(ErrorCode.SOCIAL_LOGIN_USER);
    }

    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
        throw new CustomException(ErrorCode.WRONG_CURRENT_PASSWORD);
    }

    user.updatePassword(passwordEncoder.encode(request.getNewPassword()));
}
```

---

## 5. 회원 탈퇴 — 실제 삭제 대신 비활성화

```java
public void deactivate() {
    this.active = false;
}
```

실제로 DB에서 삭제하지 않고 `active = false`로만 처리해요. 이유가 있어요.

- 개인정보 처리 방침상 탈퇴 후 일정 기간 데이터를 보관해야 할 수 있어요
- 탈퇴한 사람이 다시 가입할 때 이전 데이터를 복구할 수 있어요
- 혹시라도 실수로 탈퇴한 경우 관리자가 복구 가능해요

나중에 배치 작업으로 탈퇴 후 30일이 지난 계정을 완전히 삭제할 예정이에요.

---

## 트러블슈팅

### 문제 — 소셜 로그인 유저가 비밀번호 변경을 시도할 수 있어요

**증상**

카카오 로그인 유저에게도 비밀번호 변경 폼이 그대로 표시됐어요. 카카오 유저는 비밀번호가 없는데 변경 버튼을 누르면 에러가 발생해요.

**원인**

소셜 로그인 유저와 일반 로그인 유저를 구분하는 처리가 없었어요.

**해결**

`user.provider` 값으로 소셜 유저인지 확인해서 분기 처리했어요.

```tsx
const isSocial = !!user?.provider; // null이면 일반 로그인

{isSocial ? (
  <p>카카오 로그인 계정은 비밀번호를 변경할 수 없어요</p>
) : (
  <비밀번호 변경 폼 />
)}
```

백엔드에서도 소셜 유저 요청을 막아요.

```java
if (user.getProvider() != null) {
    throw new CustomException(ErrorCode.SOCIAL_LOGIN_USER);
}
```

---

## 다음 할 일

- [x] 마이페이지 구현 완료
- [ ] 관리자 페이지 구현
- [ ] 예외 처리 공통화
