# YouthBridge 개발일지 #9 — 프론트-백엔드 연결 (axios + Zustand)

> 더미 데이터로 동작하던 프론트엔드를 실제 백엔드 API와 연결했어요.  
> axios 인터셉터로 토큰 자동 처리, Zustand로 로그인 상태 전역 관리를 구현했어요.

---

## 이번 글에서 다루는 것

- axios 인스턴스 만들기 (baseURL, 인터셉터)
- Zustand + persist로 로그인 상태 유지
- 더미 데이터 → 실제 API 교체
- 백엔드 페이지네이션 연동

---

## 1. axios 인스턴스

모든 API 요청에 공통 설정을 적용하기 위해 `axiosInstance.ts`를 만들었어요.

```ts
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
});
```

### 요청 인터셉터 — 토큰 자동 첨부

API 요청을 보내기 전에 자동으로 JWT 토큰을 헤더에 붙여줘요. 각 API 함수마다 토큰 처리 코드를 따로 쓰지 않아도 돼요.

```ts
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 응답 인터셉터 — 토큰 만료 자동 처리

401이 오면 토큰 만료로 판단해서 자동으로 로그아웃 처리해요.

```ts
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## 2. Zustand로 로그인 상태 관리

로그인 상태를 여러 컴포넌트에서 공유해야 해서 Zustand를 썼어요.

```ts
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      setAuth: (response) => {
        localStorage.setItem("accessToken", response.accessToken);
        set({ user: { ... }, isLoggedIn: true });
      },

      clearAuth: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, isLoggedIn: false });
      },
    }),
    { name: "auth-storage" }
  )
);
```

`persist` 미들웨어를 쓴 이유는 새로고침해도 로그인 상태가 유지되게 하기 위해서예요. 없으면 새로고침할 때마다 로그아웃 상태가 돼요.

---

## 3. 더미 데이터 → 실제 API 교체

```ts
// 전 — mockPolicies.ts에서 가져오던 방식
const result = MOCK_POLICIES.filter((p) => ...);

// 후 — 백엔드 API 호출
fetchPolicies(filters).then((data) => {
  setPolicies(data.policies);
  setTotalPages(data.totalPages);
});
```

### 백엔드 페이지네이션 연동

기존에는 프론트에서 직접 `slice()`로 잘랐는데, 이제 백엔드가 잘라서 줘요.

```ts
// 전 — 프론트에서 자르기
const pagedPolicies = policies.slice((page - 1) * 10, page * 10);

// 후 — 백엔드가 이미 잘라서 줌
const { policies } = usePolicies({ page: currentPage - 1, size: 10 });
// 백엔드는 0 기반 페이지 → -1 처리
```

---

## 4. Navbar 로그인 상태 반영

```tsx
const { user, isLoggedIn, clearAuth } = useAuthStore();

{user ? (
  <div className="user-menu">
    <Link to="/mypage">
      <div className="user-avatar">{user.name[0]}</div>
      <span>{user.name}</span>
    </Link>
    <button onClick={handleLogout}>로그아웃</button>
  </div>
) : (
  <>
    <Link to="/login">로그인</Link>
    <Link to="/signup">회원가입</Link>
  </>
)}
```

---

## 트러블슈팅

### 문제 — 새로고침하면 로그인이 풀려요

**증상**

로그인 후 페이지를 새로고침하면 Navbar에서 로그인 상태가 사라지고 로그인 전 상태로 돌아가요.

**원인**

Zustand 스토어는 메모리에만 저장되기 때문에 새로고침하면 초기화돼요.

**해결**

`persist` 미들웨어를 적용해서 localStorage에 상태를 저장했어요.

```ts
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({ ... }),
    { name: "auth-storage" } // localStorage 키 이름
  )
);
```

---

## 다음 할 일

- [x] 프론트-백엔드 연결 완료
- [ ] 마이페이지 구현
- [ ] 관리자 페이지 구현
