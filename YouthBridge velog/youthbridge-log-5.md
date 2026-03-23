# YouthBridge 개발일지 #5 — PolicyList 페이지 구현

> 필터 사이드바, 검색, 페이지네이션까지 가장 복잡한 페이지를 만들었어요.  
> 디바운스, URL 파라미터 동기화, 커스텀 훅 설계 등 고민이 많았어요.

---

## 이번 글에서 다루는 것

- 사이드바 필터 설계 (지역 select, 나이 입력, 카테고리 버튼)
- URL 파라미터와 필터 상태 동기화
- 디바운스(debounce) 적용
- 페이지네이션 구현 (`<< < 7 8 9 > >>`)
- usePolicies 커스텀 훅

---

## 1. 필터 설계 고민

처음엔 지역을 버튼 18개로 깔았는데, 사이드바가 너무 길어졌어요. 그래서 `select` 드롭다운으로 바꿨어요.

연령 필터도 고민이 있었어요. "19~24세 / 25~29세" 같은 구간 버튼은 UX가 편하지만 정책의 나이 기준은 "만 34세 이하"처럼 세밀해요. 구간으로 필터링하면 경계선에 있는 사람이 놓칠 수 있어요. 그래서 나이를 직접 입력하는 방식을 선택했어요.

```
지역: select 드롭다운  ← 버튼 18개보다 사이드바가 깔끔
나이: 숫자 직접 입력   ← 만 나이 기준으로 정확한 필터링
카테고리: 버튼 목록    ← 8개라 보기 좋고 클릭이 직관적
```

---

## 2. URL 파라미터와 상태 동기화

필터 조건을 URL에 반영하면 세 가지 장점이 있어요. 새로고침 유지, 뒤로가기 유지, 링크 공유 가능.

```tsx
const [searchParams, setSearchParams] = useSearchParams();

// URL → 상태 초기화
const regionParam = searchParams.get("region") ?? "";
const [selectedRegion, setSelectedRegion] = useState(regionParam);

// 상태 변경 → URL 업데이트
const updateParam = (key: string, value: string) => {
  const next = new URLSearchParams(searchParams);
  value ? next.set(key, value) : next.delete(key);
  setSearchParams(next);
};
```

`value ? next.set() : next.delete()` 부분이 중요해요. 빈 값일 때 파라미터를 삭제하지 않으면 URL이 `?region=&age=&category=` 처럼 지저분해져요.

---

## 3. 디바운스 적용

입력할 때마다 필터링이 실행되면 낭비예요. 나중에 API 호출로 바꾸면 요청이 과도하게 나가는 문제도 생겨요.

```tsx
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  setSelectedAge(val);

  // 기존 타이머 취소
  if (debounceRef.current) clearTimeout(debounceRef.current);

  // 0.5초 후에 실행
  debounceRef.current = setTimeout(() => {
    updateParam("age", val);
  }, 500);
};
```

`useRef`를 쓰는 이유는 타이머 ID를 컴포넌트가 리렌더링 되어도 유지해야 하기 때문이에요. `useState`로 관리하면 상태가 바뀔 때마다 리렌더링이 발생해요.

---

## 4. 페이지네이션 — `<< < 7 8 9 > >>`

페이지가 많을 때 중간을 `...`으로 줄이는 함수를 만들었어요.

```ts
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  const delta = 2; // 현재 페이지 양쪽으로 2개씩 표시

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return pages;
}
```

예를 들어 30페이지 중 15페이지면 `1 ... 13 14 15 16 17 ... 30`이 돼요.

필터가 바뀌면 1페이지로 리셋하는 것도 중요해요.

```tsx
useEffect(() => {
  setCurrentPage(1);
}, [selectedRegion, selectedAge, selectedCat, keyword]);
```

---

## 5. usePolicies 커스텀 훅

필터, 로딩, 에러 상태를 컴포넌트 밖으로 분리해서 `PolicyList.tsx`를 깔끔하게 유지했어요.

```ts
export function usePolicies(filters: PolicyFilters) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchPolicies(filters)
      .then((data) => {
        if (cancelled) return;
        setPolicies(data.policies);
        setTotal(data.totalElements);
        setTotalPages(data.totalPages);
      })
      .catch(() => {
        if (cancelled) return;
        setError("정책을 불러오지 못했어요");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    // cleanup — 빠르게 필터를 바꿀 때 이전 요청 결과가 뒤늦게 도착해서 덮어쓰는 현상 방지
    return () => { cancelled = true; };
  }, [filters.region, filters.age, filters.category, filters.keyword, filters.page]);

  return { policies, isLoading, error, total, totalPages };
}
```

`cancelled` 플래그는 컴포넌트가 언마운트 되거나 필터가 빠르게 바뀔 때 이전 API 응답이 늦게 도착해서 화면이 깜빡이는 현상을 막아줘요.

---

## 트러블슈팅

### 문제 — 필터 초기화 시 URL에 빈 파라미터가 남아요

**증상**

필터를 초기화하면 URL이 `/policies?region=&age=&category=` 형태로 지저분하게 남아요.

**원인**

URL 파라미터를 업데이트할 때 빈 값 처리를 빠뜨렸어요.

```tsx
// 잘못된 코드 — 빈 값도 그냥 set()
const updateParam = (key: string, value: string) => {
  const next = new URLSearchParams(searchParams);
  next.set(key, value); // value가 ""여도 그대로 설정됨
  setSearchParams(next);
};
```

**해결**

값이 비어있으면 `delete()`로 파라미터를 완전히 제거해야 해요.

```tsx
const updateParam = (key: string, value: string) => {
  const next = new URLSearchParams(searchParams);
  value ? next.set(key, value) : next.delete(key); // ← 핵심
  setSearchParams(next);
};
```

---

## 다음 할 일

- [x] PolicyList 페이지 구현 완료
- [ ] PolicyDetail 페이지 구현
- [ ] Recommend 페이지 구현
