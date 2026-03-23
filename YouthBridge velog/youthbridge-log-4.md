# YouthBridge 개발일지 #4 — Home 페이지 구현

> 서비스의 첫인상을 결정하는 홈 페이지를 만들었어요.  
> 히어로 검색박스에서 검색하면 URL 파라미터로 조건이 전달돼요.

---

## 이번 글에서 다루는 것

- 히어로 섹션 검색박스 구현
- 카테고리 그리드
- URL 파라미터로 검색 조건 전달하기
- 섹션별 구성

---

## 1. 홈 페이지 구성

```
Home
├── 히어로 섹션   — 키워드, 지역, 연령대 검색박스
├── 카테고리 그리드 — 8개 카테고리 바로가기
├── 추천 정책      — 마감임박 정책 카드
├── 맞춤추천 CTA  — 맞춤추천 페이지로 유도
└── 지역별 정책   — 지역 탭 + 정책 목록
```

---

## 2. 히어로 섹션 검색

검색 버튼을 누르면 URL 파라미터에 조건을 담아서 정책 목록 페이지로 이동해요.

```tsx
const handleSearch = () => {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  if (region)  params.set("region", region);
  navigate(`/policies?${params.toString()}`);
};
```

**왜 URL 파라미터를 쓰나요?**

URL에 검색 조건이 담기면 세 가지 장점이 있어요.

- 뒤로가기를 해도 검색 조건이 유지돼요
- 링크를 공유하면 같은 검색 결과를 볼 수 있어요
- 새로고침해도 조건이 날아가지 않아요

---

## 3. 카테고리 그리드

```tsx
const CATEGORIES = [
  { key: "취업지원", icon: "ri-briefcase-line",
    bg: "var(--cat-job-bg)", color: "var(--cat-job-color)" },
  { key: "주거지원", icon: "ri-home-4-line",
    bg: "var(--cat-housing-bg)", color: "var(--cat-housing-color)" },
  // ...
];

// 카테고리 클릭 → 해당 카테고리로 필터링된 정책 목록으로 이동
<Link to={`/policies?category=${cat.key}`}>
  <div className="cat-icon" style={{ background: cat.bg, color: cat.color }}>
    <i className={cat.icon} />
  </div>
  <span>{cat.key}</span>
</Link>
```

카테고리 색상 데이터는 `global.css`의 CSS 변수와 연결돼 있어요. 색상을 바꾸려면 `global.css` 한 줄만 수정하면 돼요.

---

## 4. 정책 카드 컴포넌트

정책 목록 페이지와 홈 페이지 모두 카드 UI를 공유해요. 카테고리 메타 정보를 가져오는 헬퍼 함수를 만들어서 재사용했어요.

```tsx
const getCatMeta = (category: string) =>
  CATEGORIES.find((c) => c.key === category) ?? {
    bg: "var(--gray-100)",
    color: "var(--gray-500)",
    icon: "ri-file-list-line",
  };
```

존재하지 않는 카테고리가 오면 기본값(회색)으로 표시해요.

---

## 다음 할 일

- [x] Home 페이지 구현 완료
- [ ] PolicyList 페이지 구현 (필터, 페이지네이션)
- [ ] PolicyDetail 페이지 구현
