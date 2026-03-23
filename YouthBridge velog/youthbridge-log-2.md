# YouthBridge 개발일지 #2 — 디자인 시스템 구축

> 색상을 하드코딩하면 나중에 수정할 때 모든 파일을 찾아다녀야 해요.  
> CSS 변수로 디자인 시스템을 만들어서 한 곳에서 관리해요.

---

## 이번 글에서 다루는 것

- CSS 변수(Custom Properties)로 색상 시스템 구축
- 브랜드 컬러, 중립 컬러, 카테고리 컬러 정의
- 폰트 설정 (Noto Sans KR)
- 전역 리셋 스타일

---

## 1. CSS 변수를 쓰는 이유

색상을 이렇게 직접 쓰면 문제가 생겨요.

```css
/* 나쁜 예 — 하드코딩 */
.btn { background: #00b8a0; }
.header { background: #0f172a; }
```

나중에 메인 색상을 바꾸려면 모든 파일을 열어서 `#00b8a0`을 찾아야 해요. CSS 변수를 쓰면 `global.css` 한 파일만 수정하면 돼요.

```css
/* 좋은 예 — CSS 변수 */
:root {
  --primary-500: #00b8a0;
  --navy-900: #0f172a;
}

.btn { background: var(--primary-500); }
.header { background: var(--navy-900); }
```

---

## 2. 색상 시스템

### 브랜드 컬러 (틸 계열)

```css
:root {
  --primary-50:  #e6faf7;  /* 가장 연한 배경 */
  --primary-100: #b3f0e8;
  --primary-200: #66e1d1;
  --primary-400: #00c9b1;
  --primary-500: #00b8a0;  /* 메인 컬러 */
  --primary-600: #009d89;  /* 호버 시 */
}
```

### 네이비 (헤더, 배경)

```css
  --navy-900: #0f172a;  /* 가장 진한 네이비 */
  --navy-800: #1e293b;
  --navy-700: #334155;
```

### 중립 색상 (텍스트, 배경)

```css
  --gray-50:  #f8fafb;  /* 페이지 배경 */
  --gray-100: #f1f5f9;  /* 카드 배경 */
  --gray-200: #e2e8f0;  /* 보더 */
  --gray-400: #94a3b8;  /* 플레이스홀더 */
  --gray-500: #64748b;  /* 서브 텍스트 */
  --gray-700: #334155;
  --gray-900: #0f172a;  /* 메인 텍스트 */
```

### 카테고리 컬러

카테고리별로 배경색과 텍스트 색상을 쌍으로 정의했어요. 어디서 써도 색상이 통일되고, 카테고리 색상을 바꿀 때 한 줄만 수정하면 돼요.

```css
  --cat-job-bg:     #edf7f2; --cat-job-color:     #4caf82;  /* 취업지원 */
  --cat-housing-bg: #e6faf8; --cat-housing-color: #00c9b1;  /* 주거지원 */
  --cat-startup-bg: #f4eeff; --cat-startup-color: #9c5cdb;  /* 창업지원 */
  --cat-edu-bg:     #fef6e8; --cat-edu-color:     #f4a340;  /* 교육지원 */
  --cat-life-bg:    #ffeded; --cat-life-color:    #ff6b6b;  /* 생활지원 */
  --cat-culture-bg: #e8fafc; --cat-culture-color: #26c6da;  /* 문화지원 */
  --cat-finance-bg: #fff3e8; --cat-finance-color: #ff8c42;  /* 금융지원 */
  --cat-health-bg:  #fde8f4; --cat-health-color:  #e91e8c;  /* 건강지원 */
```

---

## 3. 폰트 설정

Google Fonts에서 Noto Sans KR을 가져왔어요. 한글 가독성이 좋고, 다양한 굵기를 지원해요.

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap');

body {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--gray-50);
  color: var(--gray-900);
  line-height: 1.6;
}
```

`-apple-system, BlinkMacSystemFont`는 Noto Sans KR이 로드되기 전에 보여줄 시스템 폰트예요. 폰트 로딩 전 레이아웃이 깜빡이는 현상(FOUT)을 최소화해요.

---

## 4. 전역 리셋

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  font-family: inherit; /* 버튼 폰트가 body랑 달라지는 현상 방지 */
  cursor: pointer;
}
```

`box-sizing: border-box`는 padding과 border가 요소의 크기에 포함되게 해요. 이게 없으면 `width: 100px`에 `padding: 10px`을 주면 실제 크기가 120px이 돼서 레이아웃 계산이 복잡해져요.

---

## 다음 할 일

- [x] 디자인 시스템 구축 완료
- [ ] 라우터 & 페이지 구조 설계
- [ ] Navbar 컴포넌트 제작
