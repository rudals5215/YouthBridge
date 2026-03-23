# YouthBridge 개발일지 #1 — 개발 환경 세팅

> Vite + React + TypeScript 조합으로 프로젝트를 세팅했어요.  
> 처음 세팅할 때 놓치기 쉬운 것들 위주로 정리해요.

---

## 이번 글에서 다루는 것

- Vite로 React + TypeScript 프로젝트 생성
- React Router 설치 및 기본 라우터 설정
- Vite 기본 템플릿 CSS 정리 (이걸 안 하면 레이아웃이 망가짐)
- 폴더 구조 설계

---

## 1. 프로젝트 생성

```bash
npm create vite@latest youthbridge -- --template react-ts
cd youthbridge
npm install
npm install react-router-dom
```

---

## 2. Vite 기본 템플릿 CSS 정리

Vite로 프로젝트를 만들면 `index.css`와 `App.css`에 데모용 스타일이 들어있어요. 그냥 두면 레이아웃이 이상하게 됩니다.

**`index.css` 문제 코드**

```css
body {
  display: flex;
  place-items: center; /* ← 이게 문제! 페이지 전체를 중앙에 작게 배치함 */
  min-height: 100vh;
}
```

**`App.css` 문제 코드**

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;       /* ← 좌우 여백이 추가로 붙어서 폭이 좁아짐 */
  text-align: center;
}
```

둘 다 Vite 데모 페이지용 스타일이에요. 전부 지우고 깔끔하게 정리했어요.

```css
/* index.css — 렌더링 최적화만 남김 */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; }
body { margin: 0; min-width: 320px; min-height: 100vh; }
```

```css
/* App.css — root 제약 제거 */
#root { width: 100%; min-height: 100vh; }
```

---

## 3. 폴더 구조 설계

```
src/
├── apis/         ← API 호출 함수
├── assets/       ← 이미지, 폰트 등 정적 파일
├── components/   ← 여러 페이지에서 재사용하는 컴포넌트
├── constants/    ← 변하지 않는 상수 (지역 목록 등)
├── data/         ← 더미 데이터 (백엔드 연동 전 임시)
├── hooks/        ← 커스텀 훅
├── pages/        ← 페이지 컴포넌트
├── routes/       ← 라우터 설정
├── stores/       ← Zustand 전역 상태
├── types/        ← TypeScript 타입 정의
├── App.tsx
├── App.css
├── main.tsx
├── index.css
└── global.css    ← 디자인 시스템 (색상 변수, 폰트)
```

`utils/`와 `constants/`를 나누는 기준은 이렇게 잡았어요.
- `constants/` — 값이 바뀌지 않는 데이터 (지역 목록, 카테고리 목록)
- `utils/` — 재사용 가능한 함수 (날짜 포맷, 숫자 변환 등)

---

## 4. index.html에 CDN 추가

Remixicon 아이콘을 쓰기 위해 `index.html`에 CDN 링크를 추가했어요.

```html
<head>
  <link
    href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
    rel="stylesheet"
  />
</head>
```

그리고 `main.tsx`에 `global.css`를 import해요.

```tsx
import "./index.css";
import "./global.css"; // 디자인 시스템
import App from "./App.tsx";
```

---

## 트러블슈팅

### 문제 — 페이지 폭이 이상하게 좁았어요

**증상**

레이아웃을 잡는데 페이지가 화면 가운데에 좁게 뭉쳐 보였어요.

**원인**

Vite 기본 `index.css`와 `App.css`에 데모용 스타일이 그대로 남아있었어요.

```css
/* index.css — 데모용 코드 */
body {
  display: flex;
  place-items: center; /* ← 전체 내용을 화면 중앙에 작게 배치 */
}

/* App.css — 데모용 코드 */
#root {
  max-width: 1280px;
  padding: 2rem;       /* ← 좌우 여백이 추가로 붙어 폭이 좁아짐 */
  text-align: center;
}
```

**해결**

데모용 코드를 전부 제거했어요.

```css
/* index.css */
body { margin: 0; min-width: 320px; min-height: 100vh; }

/* App.css */
#root { width: 100%; min-height: 100vh; }
```

**배운 점** — 프레임워크가 자동 생성한 파일이라도 내용을 꼭 확인하고 필요 없는 건 지워야 해요.

---

## 다음 할 일

- [x] 개발 환경 세팅 완료
- [ ] 디자인 시스템 구축 (global.css)
- [ ] 공통 컴포넌트 제작 (Navbar)
