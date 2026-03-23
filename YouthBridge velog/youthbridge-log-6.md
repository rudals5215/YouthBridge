# YouthBridge 개발일지 #6 — PolicyDetail & Recommend 페이지 구현

> 정책 상세 페이지와 맞춤추천 단계형 위저드를 만들었어요.  
> 두 페이지의 목적이 달라서 설계 방향도 달리 잡았어요.

---

## 이번 글에서 다루는 것

- PolicyDetail — useParams로 URL에서 ID 추출, 즐겨찾기 버튼
- Recommend — 5단계 스텝 위저드 설계
- 정책목록 필터 vs 맞춤추천의 차이

---

## 1. PolicyDetail — 정책 상세 페이지

### useParams로 ID 가져오기

```tsx
const { id } = useParams<{ id: string }>();
const { policy, isLoading, error } = usePolicyById(id ?? "");
```

URL이 `/policies/3`이면 `id`가 `"3"`이 돼요. 백엔드 API는 숫자를 받으니까 `Number(id)`로 변환해서 보내요.

### 로딩 → 에러 → 정상 순서

```tsx
if (isLoading) return <SkeletonUI />;
if (error || !policy) return <NotFoundUI />;
return <PolicyDetailContent policy={policy} />;
```

이 순서를 지키는 게 중요해요. 로딩 중에 `policy.title`에 접근하면 `undefined` 에러가 나거든요.

### 즐겨찾기 버튼

```tsx
const handleBookmark = async () => {
  if (!isLoggedIn) {
    alert("로그인이 필요한 기능이에요");
    return;
  }
  if (bookmarked) {
    await removeBookmark(Number(id));
    setBookmarked(false);
  } else {
    await addBookmark(Number(id));
    setBookmarked(true);
  }
};
```

로그인 안 한 상태에서 클릭하면 알림이 뜨고, 로그인 상태면 즐겨찾기가 토글돼요.

---

## 2. Recommend — 맞춤추천 페이지

### 정책목록 vs 맞춤추천의 차이

처음엔 두 페이지가 거의 같았어요. 둘 다 지역/나이/카테고리로 필터링하는 거라서요. 차별화 방향을 이렇게 잡았어요.

| | 정책 목록 | 맞춤추천 |
|---|---|---|
| 대상 | 특정 정책을 찾는 사람 | 어떤 혜택을 받을 수 있는지 모르는 사람 |
| 방식 | 직접 필터 조작 | 질문에 답하면 추천 |
| 결과 | 조건 맞는 전체 목록 | 나에게 맞는 TOP 추천 |
| 연령 입력 | 나이 직접 입력 (정확한 나이 기준) | 연령대 선택 버튼 (빠른 단계 진행) |

맞춤추천은 나중에 백엔드에서 "이 조건이면 이 정책이 제일 유리합니다" 같은 스코어링 로직을 붙일 예정이에요.

### 5단계 스텝 위저드

```
1단계  지역 선택    — 전국 / 시도 선택
2단계  연령대 선택  — 19~24 / 25~29 / 30~34 / 35~39세
3단계  관심 분야   — 카테고리 복수 선택
4단계  현재 상황   — 취업준비중, 재직중, 창업준비중 등
5단계  결과        — 맞춤 정책 목록
```

```tsx
const [step, setStep] = useState(1);
const totalSteps = 5;

// 진행률 표시
const progress = ((step - 1) / (totalSteps - 1)) * 100;

<div className="progress-bar">
  <div className="progress-fill" style={{ width: `${progress}%` }} />
</div>
```

단계별로 뒤로가기 버튼도 만들었어요. `step > 1`일 때만 보여줘요.

```tsx
{step > 1 && (
  <button onClick={() => setStep((s) => s - 1)}>이전</button>
)}
```

---

## 트러블슈팅

### 문제 — 맞춤추천이 정책목록 필터와 차이가 없었어요

**증상**

맞춤추천 페이지를 만들었는데 "지역 선택 → 카테고리 선택 → 결과"라서 정책목록 사이드바 필터랑 사실상 똑같은 기능이었어요. 별도 페이지를 만든 의미가 없었어요.

**원인**

맞춤추천의 목적을 제대로 정의하지 않은 채 구현부터 시작했어요.

**해결**

두 기능의 차이를 명확히 정의하고 설계를 수정했어요.

| | 정책목록 | 맞춤추천 |
|---|---|---|
| 대상 | 특정 정책을 찾는 사람 | 어떤 혜택을 받을 수 있는지 모르는 사람 |
| 방식 | 직접 필터 조작 | 질문에 답하면 추천 |
| 결과 | 조건 맞는 전체 목록 | 나에게 맞는 TOP 추천 |

맞춤추천은 단계형 질문(위저드) 방식으로 바꾸고, 나중에 스코어링 로직을 붙일 수 있는 구조로 설계했어요.

---

## 다음 할 일

- [x] PolicyDetail 페이지 구현 완료
- [x] Recommend 페이지 구현 완료
- [ ] 회원가입 / 로그인 페이지 구현
