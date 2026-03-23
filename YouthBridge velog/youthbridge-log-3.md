# YouthBridge 개발일지 #3 — 라우터 & 페이지 구조 설계

> React Router로 SPA의 페이지 이동을 구현했어요.  
> Navbar 컴포넌트와 공통 레이아웃 구조도 함께 잡았어요.

---

## 이번 글에서 다루는 것

- React Router 기본 구조 설계
- Navbar 컴포넌트 (sticky, active 표시, 모바일 햄버거)
- 페이지별 URL 구조
- 404 페이지 처리

---

## 1. URL 구조 설계

```
/              — 홈 (히어로 섹션 + 추천 정책)
/policies      — 정책 목록 (필터, 검색)
/policies/:id  — 정책 상세
/recommend     — 맞춤 추천
/login         — 로그인
/signup        — 회원가입
/mypage        — 마이페이지 (로그인 필요)
/admin         — 관리자 (ADMIN 권한 필요)
*              — 404
```

---

## 2. AppRouter 구조

```tsx
function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />  {/* 모든 페이지에서 공통으로 보임 */}
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/policies"     element={<PolicyList />} />
        <Route path="/policies/:id" element={<PolicyDetail />} />
        <Route path="/recommend"    element={<Recommend />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/signup"       element={<Signup />} />
        <Route path="/mypage"       element={<MyPage />} />
        <Route path="/admin"        element={<AdminPage />} />
        <Route path="*"             element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

`<Navbar />`를 `<Routes>` 밖에 놓으면 모든 페이지에서 항상 보여요. 특정 페이지(관리자, 로그인)에서 Navbar를 숨기고 싶으면 각 페이지 컴포넌트 안에서 처리해요.

`<Route path="*">`는 위의 모든 경로에 매칭되지 않을 때 실행돼요. 반드시 가장 마지막에 놓아야 해요.

---

## 3. Navbar 컴포넌트

### active 표시

`useLocation()`으로 현재 URL을 읽어서 해당 메뉴에만 active 스타일을 줘요.

```tsx
const location = useLocation();
const isActive = (path: string) => location.pathname === path;

<Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
  홈
</Link>
```

하드코딩하면 페이지 이동해도 active가 바뀌지 않아요.

### sticky Navbar

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;  /* 다른 요소 위에 표시 */
}
```

`position: sticky`는 스크롤해도 화면 상단에 고정돼요. `position: fixed`와 다르게 레이아웃 공간을 차지해서 아래 컨텐츠가 Navbar에 가려지지 않아요.

### 모바일 햄버거 메뉴

```tsx
const [menuOpen, setMenuOpen] = useState(false);

// 메뉴 열기/닫기
<button onClick={() => setMenuOpen((v) => !v)}>

// 링크 클릭 시 메뉴 닫기
<Link to="/policies" onClick={() => setMenuOpen(false)}>
  정책 목록
</Link>
```

링크 클릭 시 `setMenuOpen(false)`를 호출하지 않으면, 모바일에서 페이지 이동 후에도 드로어가 열린 채로 남아있어요.

---

## 4. 페이지별 헤더 여백

Navbar가 sticky라서 각 페이지 헤더 상단에 여백이 필요해요. Vite 기본 템플릿에서 `padding-top: 6rem` 같은 큰 값을 쓰면 헤더가 너무 아래로 내려가요.

```css
/* 각 페이지 헤더 — Navbar 높이(60px)만큼 여백 */
.pl-header {
  padding: 1.75rem 1.5rem;  /* 6rem → 1.75rem으로 수정 */
}
```

---

## 5. 404 페이지

```tsx
function NotFound() {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>페이지를 찾을 수 없어요</p>
      <Link to="/">홈으로 돌아가기</Link>
    </div>
  );
}
```

---

## 다음 할 일

- [x] 라우터 & 페이지 구조 설계 완료
- [ ] Home 페이지 구현
- [ ] PolicyList 페이지 구현
