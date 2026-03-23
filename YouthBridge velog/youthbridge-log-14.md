# YouthBridge 개발일지 #14 — 마이페이지 + 관리자 페이지 프론트 연동

> 더미 데이터로만 동작하던 마이페이지와 관리자 페이지를 실제 API와 연결했어요.  
> 권한 기반 라우터 가드, 관리자 계정 자동 생성까지 함께 정리해요.

---

## 이번 글에서 다루는 것

- 마이페이지 API 연동 (내 정보 수정, 관심 분야, 비밀번호 변경, 회원 탈퇴)
- 관리자 페이지 API 연동 (통계, 회원 목록, 정책 삭제, 수동 동기화)
- ProtectedRoute — 로그인/권한 체크 라우터 가드
- 관리자 계정 더미 데이터 자동 생성
- role 기반 Navbar 분기

---

## 1. 마이페이지 API 연동

`userApi.ts`를 새로 만들어서 마이페이지 관련 API를 분리했어요.

```ts
// 내 정보 수정
export const updateProfile = async (data: UpdateProfileRequest): Promise<UserResponse> => {
  const response = await axiosInstance.patch<UserResponse>("/api/users/me", data);
  return response.data;
};

// 비밀번호 변경
export const updatePassword = async (data: UpdatePasswordRequest): Promise<void> => {
  await axiosInstance.patch("/api/users/me/password", data);
};

// 회원 탈퇴
export const withdraw = async (): Promise<void> => {
  await axiosInstance.delete("/api/users/me");
};
```

### 내 정보 수정 후 Navbar 즉시 반영

내 정보를 수정하면 Navbar의 이름도 바로 바뀌어야 해요. `authStore`에 `updateUser` 메서드를 추가해서 저장 성공 시 전역 상태도 업데이트했어요.

```ts
// authStore.ts
updateUser: (info: Partial<UserInfo>) => {
  set((state) => ({
    user: state.user ? { ...state.user, ...info } : null,
  }));
},
```

```tsx
// MyPage.tsx — 저장 후 Zustand 상태 업데이트
const updated = await updateProfile({ name, region });
updateUser({ name: updated.name, region: updated.region });
```

### 소셜 로그인 계정 비밀번호 변경 방지

카카오 로그인 유저는 비밀번호가 없어서 변경 불가예요. `user.provider` 값으로 소셜 유저를 판단해요.

```tsx
const isSocial = !!user?.provider;

{isSocial ? (
  <p>카카오 로그인 계정은 비밀번호를 변경할 수 없어요</p>
) : (
  <비밀번호 변경 폼 />
)}
```

---

## 2. 관리자 페이지 API 연동

`adminApi.ts`를 새로 만들어서 관리자 API를 분리했어요.

```ts
export const getAdminStats  = async () => axiosInstance.get("/api/admin/stats");
export const getAdminUsers  = async (page, size, keyword) => axiosInstance.get("/api/admin/users", { params });
export const deletePolicy   = async (id) => axiosInstance.delete(`/api/admin/policies/${id}`);
export const syncPublicApi  = async () => axiosInstance.post("/api/admin/sync");
```

회원 목록 검색에 디바운스를 적용했어요. 타이핑할 때마다 API가 호출되면 낭비이기 때문이에요.

```tsx
const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  setKeyword(val);
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => fetchUsers(val), 400);
};
```

---

## 3. 관리자 계정 더미 데이터 자동 생성

개발 중에 `ddl-auto=create-drop`으로 설정하면 서버 재시작마다 테이블이 초기화돼요. 그래서 `DataInitializer`에 관리자 계정 자동 생성 로직을 추가했어요.

```java
private void initAdmin() {
    if (userRepository.existsByEmail("admin@youthbridge.com")) return;

    User admin = User.createLocal(
            "admin@youthbridge.com",
            passwordEncoder.encode("admin1234!"),
            "관리자"
    );
    admin.promoteToAdmin(); // role = "ADMIN"
    userRepository.save(admin);
    log.info("관리자 계정 생성 완료!");
}
```

`User.java`에 `promoteToAdmin()` 메서드를 추가했어요.

```java
public void promoteToAdmin() {
    this.role = "ADMIN";
}
```

---

## 4. ProtectedRoute — 라우터 가드

`/mypage`와 `/admin`을 아무나 접근하지 못하도록 막았어요.

```tsx
function ProtectedRoute({ children, requiredRole }: Props) {
  const { isLoggedIn, user } = useAuthStore();

  if (!isLoggedIn || !user) {
    alert("로그인이 필요합니다!");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
    alert("관리자가 아닙니다!");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

```tsx
// AppRouter.tsx
<Route path="/mypage" element={
  <ProtectedRoute>
    <MyPage />
  </ProtectedRoute>
} />

<Route path="/admin" element={
  <ProtectedRoute requiredRole="ADMIN">
    <AdminPage />
  </ProtectedRoute>
} />
```

---

## 5. role 기반 Navbar 분기

관리자가 로그인하면 Navbar에 방패 아이콘 + "관리자"가 표시되고 클릭하면 `/admin`으로 이동해요. 일반 유저는 이름 + `/mypage`로 이동해요.

```tsx
<Link to={user.role === "ADMIN" ? "/admin" : "/mypage"} className="btn-mypage">
  <div className="user-avatar">
    {user.role === "ADMIN" ? <i className="ri-shield-star-line" /> : user.name[0]}
  </div>
  <span>{user.role === "ADMIN" ? "관리자" : user.name}</span>
</Link>
```

---

## 트러블슈팅

### 문제 1 — 관리자로 로그인해도 Navbar에 "관리자" 대신 일반 유저 표시

**원인**

`authStore.ts`의 `setAuth`에서 `role`을 하드코딩해두었어요.

```typescript
// 잘못된 코드
role: "USER",  // 항상 USER로 저장

// 올바른 코드
role: response.role ?? "USER",  // 백엔드에서 받은 role 사용
```

**원인 2 — AuthResponse 타입에 role 누락**

`authApi.ts`의 `AuthResponse` 인터페이스에 `role` 필드가 없어서 TypeScript가 `response.role`을 인식 못 했어요.

```typescript
// 수정 전
export interface AuthResponse {
  accessToken: string;
  userId: number;
  email: string;
  name: string;
  region: string;
  // role 없음!
}

// 수정 후
export interface AuthResponse {
  accessToken: string;
  userId: number;
  email: string;
  name: string;
  region: string;
  role: string;  // 추가
}
```

**원인 3 — localStorage에 이전 데이터 잔존**

`role` 필드 추가 전에 로그인한 상태라 localStorage에 `role: "USER"`로 저장된 상태였어요. 새로고침해도 이전 데이터를 그대로 써서 관리자인데도 `role: "USER"`로 인식했어요.

```js
// 브라우저 콘솔에서 초기화
localStorage.removeItem("auth-storage")
localStorage.removeItem("accessToken")
```

로그아웃 후 다시 로그인하면 새로운 `role` 값으로 저장돼요.

---

## 다음 할 일

- [x] 마이페이지 API 연동 완료
- [x] 관리자 페이지 API 연동 완료
- [x] ProtectedRoute 구현 완료
- [ ] UI 수정 (Home 통계, 정책 목록 카테고리 중복 선택)
- [ ] 공공 API 크롤링 (API 키 승인 대기)
- [ ] 배포