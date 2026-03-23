# YouthBridge 개발일지 #13 — 카카오 소셜 로그인 구현

> 이메일/비밀번호 로그인에 카카오 소셜 로그인을 추가했어요.  
> 비즈니스 인증 없이 닉네임만 받는 방식으로 구현했어요.

---

## 이번 글에서 다루는 것

- 카카오 로그인 전체 흐름
- 비즈니스 인증 없이 이메일 못 받는 문제 해결
- 백엔드 KakaoService 구현
- 프론트 콜백 페이지 구현

---

## 1. 카카오 로그인 전체 흐름

```
① 프론트 — 카카오 로그인 버튼 클릭 → 카카오 인가 URL로 리다이렉트
② 카카오 — 로그인 창 + 동의 화면
③ 카카오 — 동의 완료 → redirect URI로 인가 코드(code) 전달
④ 프론트 — /oauth/kakao 페이지에서 code 받음 → 백엔드로 전달
⑤ 백엔드 — code로 카카오 액세스 토큰 발급
⑥ 백엔드 — 카카오 액세스 토큰으로 유저 정보 조회
⑦ 백엔드 — 신규면 회원가입, 기존이면 로그인 → JWT 발급
⑧ 프론트 — JWT 저장 → 홈으로 이동
```

---

## 2. 이메일을 못 받는 문제

카카오 로그인에서 이메일 수집을 **필수 동의**로 설정하려면 비즈니스 인증이 필요해요. 개인 개발자는 선택 동의로만 설정할 수 있는데, 선택이라 사용자가 거부할 수 있어요.

**해결 방법 — 임시 이메일 생성**

```java
// 이메일이 없으면 카카오 ID 기반으로 임시 이메일 생성
String email = "kakao_" + providerId + "@kakao.com";
```

이 방식의 장단점이에요.

- 장점: 이메일 없이도 회원 DB에 저장 가능, 로그인마다 같은 계정으로 식별 가능
- 단점: 실제 이메일이 아니라 비밀번호 찾기나 알림 발송 불가

나중에 비즈니스 인증을 받으면 실제 이메일로 업데이트하는 마이그레이션이 필요해요.

---

## 3. 백엔드 KakaoService

인가 코드를 받아서 카카오 API를 두 번 호출해요.

```java
public AuthResponse kakaoLogin(String code) {
    // 1. 인가 코드 → 카카오 액세스 토큰
    String kakaoAccessToken = getKakaoAccessToken(code);

    // 2. 카카오 액세스 토큰 → 유저 정보
    Map<String, Object> userInfo = getKakaoUserInfo(kakaoAccessToken);

    // 3. 유저 찾거나 새로 생성
    User user = findOrCreateUser(userInfo);

    // 4. 우리 JWT 발급
    String token = jwtProvider.generateToken(user.getId(), user.getEmail());
    return AuthResponse.of(token, user);
}
```

처음 카카오 로그인하는 사람은 `findOrCreateUser`에서 자동으로 회원가입이 돼요.

```java
return userRepository.findByProviderAndProviderId("kakao", providerId)
    .orElseGet(() -> {
        // 없으면 자동 회원가입
        User newUser = User.createSocial(email, nickname, "kakao", providerId);
        return userRepository.save(newUser);
    });
```

`findByProviderAndProviderId`로 카카오 로그인인지, 어떤 카카오 계정인지 특정해요. 같은 카카오 계정으로 다시 로그인하면 같은 유저가 나와요.

---

## 4. 프론트 — 카카오 리다이렉트 URL 생성

```ts
export const redirectToKakao = () => {
  const kakaoAuthUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${KAKAO_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code`;
  window.location.href = kakaoAuthUrl;
};
```

`encodeURIComponent`로 redirect_uri를 인코딩하는 게 중요해요. 안 하면 URL 파라미터가 깨질 수 있어요.

---

## 5. 프론트 — 콜백 페이지 (KakaoCallback.tsx)

카카오가 `http://localhost:5173/oauth/kakao?code=XXXXX`로 리다이렉트해요. 이 페이지에서 code를 꺼내서 백엔드로 보내요.

```tsx
useEffect(() => {
  const code = searchParams.get("code");
  if (!code) return;

  kakaoLogin(code)
    .then((response) => {
      setAuth(response); // JWT 저장
      navigate("/");     // 홈으로
    })
    .catch(() => {
      setErrorMsg("카카오 로그인에 실패했어요");
    });
}, []);
```

`useEffect`의 의존성 배열이 `[]`인 이유는 마운트 시 딱 한 번만 실행해야 하기 때문이에요. 의존성을 넣으면 콜백 처리가 여러 번 실행될 수 있어요.

---

## 트러블슈팅

### 문제 1 — 로그인 처리 중 화면에서 멈추고 홈 이동 후 로그인 안 됨

**증상**
- 카카오 로그인 후 "카카오 로그인 처리 중..." 화면이 뜨다가 홈으로 이동
- Navbar에 로그인 상태가 반영 안 됨
- 다시 카카오 로그인 시도하면 "실패했어요" 메시지

**원인 — React StrictMode의 useEffect 2회 실행**

React 개발 모드의 StrictMode는 버그를 찾기 위해 `useEffect`를 **의도적으로 2번 실행**해요. 카카오 인가 코드는 1회용이라 첫 번째 실행에서 소비되고, 두 번째 실행에서 이미 사용된 코드로 요청하니 실패하는 거예요.

```
1번째 useEffect 실행 → 인가 코드 소비 → 백엔드 요청 중...
2번째 useEffect 실행 → 같은 코드로 재요청 → 카카오가 이미 사용된 코드라 거부
→ 첫 번째 요청도 경쟁 상태로 꼬여서 저장 실패
```

**해결**

두 가지를 같이 수정했어요.

```tsx
// ① main.tsx — StrictMode 제거
// StrictMode는 useEffect를 2번 실행시켜서 1회용 값 처리 시 문제 발생
createRoot(document.getElementById("root")!).render(<App />);
```

```tsx
// ② KakaoCallback.tsx — 중복 실행 방지 ref 추가
const isProcessing = useRef(false);

useEffect(() => {
  if (isProcessing.current) return; // 이미 처리 중이면 무시
  isProcessing.current = true;

  kakaoLogin(code).then(...).catch(...);
}, []);
```

---

### 문제 2 — 카카오 로그인 시 502 에러 (토큰 발급 401)

**증상**

```
POST http://localhost:8080/api/auth/kakao 502 (Bad Gateway)
[KakaoService] 토큰 발급 실패: 401 on POST request for "https://kauth.kakao.com/oauth/token"
```

**원인 — redirect_uri 불일치 + 클라이언트 시크릿 활성화**

카카오 디벨로퍼스에 등록된 Redirect URI와 코드에서 보내는 값이 달랐어요. 카카오는 redirect_uri가 정확히 일치하지 않으면 401을 반환해요. 슬래시 하나, 대소문자 하나도 다르면 안 돼요.

디버그 로그를 추가해서 실제로 어떤 값이 전달되는지 확인했어요.

```java
log.info("[KakaoService] client_id={}", clientId);
log.info("[KakaoService] redirect_uri={}", redirectUri);
log.info("[KakaoService] code={}", code);
```

값을 확인하고 카카오 디벨로퍼스 Redirect URI와 `application.properties` 값을 동일하게 맞췄어요.

---

### 문제 3 — 카카오 로그인 성공 후 DB 저장 실패

**증상**

```
Column 'password' cannot be null
```

**원인 — 소셜 로그인 유저는 비밀번호가 없는데 nullable = false**

`User` 엔티티의 `password` 컬럼이 `nullable = false`로 설정되어 있었어요. 일반 회원가입 유저는 비밀번호가 있지만, 카카오 로그인 유저는 비밀번호가 없어요.

**해결**

```java
// 수정 전 — nullable = false라 소셜 로그인 유저 저장 불가
@Column(nullable = false)
private String password;

// 수정 후 — nullable 허용 (소셜 로그인 유저는 null)
@Column
private String password;
```

일반 회원가입 시 비밀번호 필수 검증은 DB 레벨이 아닌 `SignupRequest`의 `@NotBlank`로 처리해요.

```java
// SignupRequest.java — 서비스 레벨에서 필수 검증
@NotBlank(message = "비밀번호를 입력해주세요")
@Size(min = 8, message = "비밀번호는 8자 이상이어야 해요")
private String password;
```

`@NotBlank`가 있으면 비밀번호 없이 회원가입 요청이 오면 DB까지 도달하기 전에 400 에러로 막혀요.

---

## 다음 할 일

- [x] 카카오 소셜 로그인 구현 완료
- [ ] 공공 API 크롤링 (API 키 승인 대기 중)
- [ ] 배포 (Vercel + AWS EC2 + RDS)