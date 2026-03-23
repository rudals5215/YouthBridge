# YouthBridge 개발일지 #7 — 회원가입 / 로그인 페이지 구현

> 회원가입을 한 화면에 다 넣으면 사용자가 이탈해요.  
> 3단계로 나눠서 부담을 줄이고, 실시간 유효성 검사도 추가했어요.

---

## 이번 글에서 다루는 것

- 회원가입 3단계 스텝 설계 이유
- 실시간 유효성 검사 (비밀번호 일치, 버튼 비활성화)
- 로그인 페이지 구현
- 소셜 로그인 버튼 UI (카카오 / 네이버 / 구글)

---

## 1. 회원가입을 3단계로 나눈 이유

한 화면에 이메일, 비밀번호, 이름, 생년, 지역, 관심분야, 약관 동의를 다 넣으면 처음 보는 사람이 지쳐서 이탈해요.

```
1단계  이메일 + 비밀번호       ← 부담 적은 정보부터
2단계  이름, 지역, 관심분야, 약관  ← 서비스 맞춤화 정보
3단계  완료 화면              ← 다음 행동 유도
```

각 단계마다 필수 입력 전엔 다음으로 못 가게 막았어요.

```tsx
const canStep1 = email && password.length >= 8 && pwMatch;
const canStep2 = name && birthYear && region && agreeTerms && agreePrivacy;

<button type="submit" disabled={!canStep1}>다음 단계</button>
```

---

## 2. 실시간 유효성 검사

비밀번호 확인 불일치 에러는 아직 입력 안 했을 때는 보여주지 않아요.

```tsx
const pwMatch = password === confirmPw;

{/* confirmPw가 비어있을 때는 에러 안 보임 */}
{confirmPw && !pwMatch && (
  <p className="auth-error-msg">비밀번호가 일치하지 않아요</p>
)}
```

`confirmPw && !pwMatch` 조건이 중요해요. 처음부터 에러가 떠있으면 사용자 경험이 나빠요.

---

## 3. 로그인 페이지

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg("");
  setIsLoading(true);

  try {
    const response = await login({ email, password });
    setAuth(response);  // Zustand에 토큰 + 유저 정보 저장
    navigate("/");
  } catch (err: any) {
    setErrorMsg(
      err.response?.data?.message ?? "이메일 또는 비밀번호가 올바르지 않아요"
    );
  } finally {
    setIsLoading(false);
  }
};
```

`err.response?.data?.message`는 백엔드에서 보내준 에러 메시지예요. 없으면 기본 메시지를 보여줘요.

---

## 4. 소셜 로그인 버튼 UI

카카오, 네이버, 구글 버튼은 일단 UI만 만들고 실제 연동은 나중에 해요.

```tsx
<button className="social-btn kakao">
  <img src="/kakao-icon.svg" alt="카카오" />
  카카오로 로그인
</button>
```

카카오 로그인은 카카오 브랜드 가이드라인에 따라 노란 배경에 검은 텍스트를 써야 해요. 마음대로 색상을 바꾸면 안 돼요.

---

## 트러블슈팅

### 문제 — 비밀번호 확인 에러가 페이지 열자마자 표시됐어요

**증상**

회원가입 페이지를 열면 아직 아무것도 입력하지 않았는데 "비밀번호가 일치하지 않아요" 에러가 바로 표시됐어요.

**원인**

```tsx
// 잘못된 코드 — confirmPw가 빈 문자열이어도 조건이 true
{!pwMatch && <p>비밀번호가 일치하지 않아요</p>}
```

처음 렌더링 시 `password = ""`이고 `confirmPw = ""`라서 둘이 같아 `pwMatch = true`가 되어야 하는데, 초기값이 서로 달라지는 순간 바로 에러가 떴어요.

**해결**

`confirmPw`에 뭔가 입력했을 때만 비교하도록 조건을 추가했어요.

```tsx
// 올바른 코드 — confirmPw에 입력이 있을 때만 검사
{confirmPw && !pwMatch && (
  <p>비밀번호가 일치하지 않아요</p>
)}
```

`confirmPw &&` 조건이 핵심이에요. 아직 입력 안 했으면 에러를 보여주지 않아요.

---

## 다음 할 일

- [x] 회원가입 / 로그인 페이지 구현 완료
- [ ] Spring Boot 백엔드 구현 시작
- [ ] DB 설계 (users, policies, bookmarks)
