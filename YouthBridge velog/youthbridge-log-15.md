# YouthBridge 개발일지 #15 — UI 개선 (홈 통계 API 연동 + 카테고리 중복 선택)

> 더미 데이터로 하드코딩되어 있던 홈 화면의 통계, 최신 정책, 지역별 정책을 실제 API 데이터로 교체했어요.
> 정책 목록의 카테고리 필터도 복수 선택이 가능하도록 수정했어요.

---

## 이번 글에서 다루는 것

- 홈 통계 API 구현 (카테고리별/지역별 정책 수)
- 홈 화면 실제 데이터 연동 (통계, 최신 정책, 지역별 정책)
- 지역별 정책 카드에 사진 추가
- 정책 목록 카테고리 중복 선택 구현 (string → string[])

---

## 1. 홈 통계 API

홈 화면에서 필요한 데이터는 크게 세 가지예요.

```
- 전체 정책 수, 전체 회원 수 → 통계 바
- 카테고리별 정책 수 → 카테고리 그리드
- 지역별 정책 수 → 지역별 정책 섹션
```

이 세 가지를 한 번의 API 호출로 받아올 수 있게 `GET /api/home/stats`를 만들었어요.

```java
@GetMapping("/stats")
public ResponseEntity<HomeStatsResponse> getStats() {
    Map<String, Long> categoryCount = policyRepository.countByCategory()
            .stream()
            .collect(Collectors.toMap(arr -> (String) arr[0], arr -> (Long) arr[1]));

    Map<String, Long> regionCount = policyRepository.countByRegion()
            .stream()
            .filter(arr -> !"all".equals(arr[0])) // 전국(all) 제외
            .collect(Collectors.toMap(arr -> (String) arr[0], arr -> (Long) arr[1]));

    return ResponseEntity.ok(HomeStatsResponse.builder()
            .totalPolicies(policyRepository.count())
            .totalUsers(userRepository.count())
            .categoryCount(categoryCount)
            .regionCount(regionCount)
            .build());
}
```

`PolicyRepository`에 JPQL 집계 쿼리를 추가했어요.

```java
// 카테고리별 정책 수
@Query("SELECT p.category, COUNT(p) FROM Policy p GROUP BY p.category")
List<Object[]> countByCategory();

// 지역별 정책 수
@Query("SELECT p.region, COUNT(p) FROM Policy p GROUP BY p.region")
List<Object[]> countByRegion();
```

`Object[]`로 반환되는 이유는 JPQL에서 여러 컬럼을 선택하면 각 행이 배열 형태로 오기 때문이에요. `arr[0]`이 카테고리명, `arr[1]`이 개수예요.

---

## 2. 홈 화면 실제 데이터 연동

기존에는 모든 수치가 하드코딩되어 있었어요.

```tsx
// 수정 전 — 하드코딩
<div className="stat-number">1,247<span>개</span></div>
<p className="category-card-count">48개</p>
```

이제 API에서 받아온 실제 데이터를 표시해요.

```tsx
// 수정 후 — 실제 데이터
useEffect(() => {
  Promise.all([
    fetchHomeStats(),
    fetchPolicies({ size: 4, page: 0 }),
  ]).then(([statsData, policyData]) => {
    setStats(statsData);
    setLatestPolicies(policyData.policies);
  });
}, []);

// 통계 바
<div className="stat-number">
  {stats ? stats.totalPolicies.toLocaleString() : "—"}
  <span>개</span>
</div>

// 카테고리별 개수
const count = stats?.categoryCount?.[cat.key] ?? 0;
<p className="category-card-count">{count > 0 ? `${count}개` : "—"}</p>
```

`Promise.all`로 두 API를 병렬 호출해서 시간을 줄였어요. 순차 호출하면 두 API의 시간이 더해지지만, 병렬 호출하면 더 느린 쪽 시간만 걸려요.

---

## 3. 지역별 정책 카드에 사진 추가

지역별 정책 카드에 각 지역 사진을 넣었어요. Unsplash 무료 이미지를 사용했어요.

```tsx
const REGION_IMAGES: Record<string, string> = {
  seoul:    "https://images.unsplash.com/photo-1538485399081-7c8272e3c9d8?w=400&q=80",
  gyeonggi: "https://images.unsplash.com/photo-...",
  busan:    "https://images.unsplash.com/photo-...",
  // ...
};

<div className="region-card">
  <img
    src={REGION_IMAGES[regionValue]}
    alt={getRegionLabel(regionValue)}
    className="region-card-img"
    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
  />
  <div className="region-card-overlay" />
  <div className="region-card-body">
    <span className="region-card-name">{getRegionLabel(regionValue)}</span>
    <span className="region-card-count">{count}개</span>
  </div>
</div>
```

`onError`로 이미지 로드 실패 시 숨김 처리를 해서 깨진 이미지가 보이지 않아요.

지역별 정책 수는 많은 순으로 상위 4개만 보여줘요.

```tsx
const topRegions = stats
  ? Object.entries(stats.regionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
  : [];
```

---

## 4. 카테고리 중복 선택

기존에는 카테고리를 하나만 선택할 수 있었어요. `string` → `string[]`으로 바꿔서 복수 선택이 가능하게 했어요.

```tsx
// 수정 전 — 단일 선택
const [selectedCat, setSelectedCat] = useState(categoryParam);

const handleCat = (value: string) => {
  const next = selectedCat === value ? "" : value; // 토글
  setSelectedCat(next);
};

// 수정 후 — 복수 선택
const [selectedCats, setSelectedCats] = useState<string[]>(
  categoryParam ? categoryParam.split(",").filter(Boolean) : []
);

const handleCat = (value: string) => {
  const next = selectedCats.includes(value)
    ? selectedCats.filter((c) => c !== value) // 이미 선택된 거면 제거
    : [...selectedCats, value];               // 없으면 추가
  setSelectedCats(next);
  const nextParam = next.join(","); // "취업지원,주거지원" 형태로 URL에 저장
  params.set("category", nextParam);
};
```

URL에는 `?category=취업지원,주거지원` 형태로 저장돼요.

카테고리 버튼에 선택 개수 배지와 체크 아이콘을 추가했어요.

```tsx
<button className={`pl-cat-btn ${isSelected ? "active" : ""}`}>
  <span className="pl-cat-icon">
    <i className={cat.icon} />
  </span>
  <span>{cat.key}</span>
  {isSelected && <i className="ri-check-line" style={{ marginLeft: "auto" }} />}
</button>
```

### 백엔드 다중 카테고리 미지원 문제

현재 백엔드의 `findByFilters` 쿼리는 카테고리를 하나만 받아요.

```java
AND (:category IS NULL OR p.category = :category)
```

여러 개를 선택해도 첫 번째 카테고리만 필터링돼요. 추후 백엔드에서 `IN` 쿼리로 변경할 예정이에요.

```java
// 추후 수정 예정
AND (:categories IS NULL OR p.category IN :categories)
```

UI에서 2개 이상 선택 시 안내 메시지를 표시해서 사용자가 인지할 수 있게 해뒀어요.

---

## 파일 변경 사항

```
백엔드 (신규)
domain/policy/dto/HomeStatsResponse.java
domain/policy/controller/HomeController.java

백엔드 (수정)
domain/policy/repository/PolicyRepository.java  ← 집계 쿼리 추가
global/config/SecurityConfig.java               ← /api/home/** permitAll 추가

프론트엔드 (신규)
src/apis/homeApi.ts

프론트엔드 (수정)
src/pages/Home.tsx     ← 통계/최신 정책/지역별 정책 실제 데이터 연동
src/pages/Home.css     ← 지역 카드 이미지 스타일 추가
src/pages/PolicyList.tsx ← 카테고리 중복 선택
src/pages/PolicyList.css ← 카테고리 배지 스타일 추가
```

---

## 트러블슈팅

### 문제 1 — 통계 바가 두 줄로 깨져요

**증상**

통계 항목이 3개일 때는 잘 보였는데 4개로 늘리니까 두 줄로 넘어가면서 빈칸이 생겼어요.

**원인**

CSS grid 컬럼이 3개로 고정되어 있었어요.

```css
/* 문제 — 3개 고정 */
grid-template-columns: repeat(3, 1fr);
```

**해결**

4개로 맞추고 폰트 크기와 패딩을 살짝 줄여서 컴팩트하게 조정했어요.

```css
/* 해결 — 4개로 변경 */
grid-template-columns: repeat(4, 1fr);

.stat-number { font-size: 1.5rem; }   /* 1.875rem → 1.5rem */
.stat-item   { padding: 1.25rem; }    /* 1.75rem → 1.25rem */
```

---

### 문제 2 — 카테고리 버튼이 중복 선택 후 크기가 줄어들어요

**증상**

카테고리를 `string[]`으로 변경하면서 체크 아이콘을 추가했더니 버튼이 내용에 맞게 줄어들었어요.

**원인**

버튼에 `width: 100%`가 없어서 텍스트 길이에 맞게 줄어들었어요.

**해결**

```css
.pl-cat-btn {
  width: 100%;  /* ← 추가: 사이드바 너비 꽉 채우도록 */
}

.pl-cat-btn .ri-check-line {
  margin-left: auto;  /* 체크 아이콘을 오른쪽 끝에 고정 */
}
```

---

### 문제 3 — 카테고리 2개 이상 선택해도 전체 정책이 표시돼요

**증상**

취업지원 + 주거지원 두 개를 선택했는데 필터가 적용되지 않고 전체 정책이 나왔어요.

**원인**

백엔드가 카테고리를 하나만 받는 구조라 임시로 2개 이상이면 `undefined`를 전달하도록 처리했어요.

```tsx
// 임시 처리 — 2개 이상이면 필터 없음
category: selectedCats.length === 1 ? selectedCats[0] : undefined,
```

**해결**

백엔드에 `IN` 쿼리를 추가하고 `categories` 배열을 전달하는 방식으로 변경했어요.

```java
AND (:#{#categories == null || #categories.isEmpty()} = true
     OR p.category IN :categories)
```

```tsx
// 배열로 전달
categories: selectedCats.length > 0 ? selectedCats : undefined,
```

---

## 다음 할 일

- [x] 홈 통계 API 연동 완료
- [x] 카테고리 중복 선택 완료
- [x] 백엔드 다중 카테고리 IN 쿼리 완료
- [ ] 공공 API 크롤링 (API 키 승인 대기)
- [ ] 배포
