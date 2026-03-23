# YouthBridge 개발일지 #12 — 예외 처리 공통화 (@ControllerAdvice)

> API마다 다른 형태로 에러가 오면 프론트에서 처리하기 어려워요.  
> ErrorCode + CustomException + GlobalExceptionHandler 3단계 구조로 통일했어요.

---

## 이번 글에서 다루는 것

- 예외 처리 공통화가 필요한 이유
- ErrorCode — 에러 목록 한 곳에서 관리
- CustomException — 비즈니스 예외 클래스
- GlobalExceptionHandler — 전역 예외 처리
- 기존 서비스 코드 교체

---

## 1. 예외 처리 공통화가 필요한 이유

기존에는 에러가 나면 Spring 기본 형태로 응답이 왔어요.

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/auth/signup"
}
```

무슨 에러인지 알기 어렵고 API마다 형태가 달라질 수 있어요. 프론트에서는 이런 응답으로 통일됐으면 해요.

```json
{
  "status": 409,
  "message": "이미 사용 중인 이메일이에요",
  "code": "DUPLICATE_EMAIL",
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 2. 3단계 구조

### ① ErrorCode — 모든 에러를 한 곳에서 관리

```java
public enum ErrorCode {
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "유저를 찾을 수 없어요", "USER_NOT_FOUND"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일이에요", "DUPLICATE_EMAIL"),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않아요", "INVALID_PASSWORD"),
    POLICY_NOT_FOUND(HttpStatus.NOT_FOUND, "정책을 찾을 수 없어요", "POLICY_NOT_FOUND"),
    DUPLICATE_BOOKMARK(HttpStatus.CONFLICT, "이미 즐겨찾기한 정책이에요", "DUPLICATE_BOOKMARK"),
    // ...
}
```

새 에러가 생기면 여기에 한 줄 추가하면 돼요.

### ② CustomException — 비즈니스 예외

```java
// 전 — 메시지를 직접 입력
throw new IllegalArgumentException("이미 사용 중인 이메일이에요");

// 후 — ErrorCode로 통일
throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
```

`CustomException`은 `ErrorCode`를 받아서 HTTP 상태 코드, 메시지, 코드를 모두 가지고 있어요.

### ③ GlobalExceptionHandler — 전역 예외 처리

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // CustomException 처리
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException e) {
        return ResponseEntity
                .status(e.getStatus())
                .body(ErrorResponse.of(e.getStatus().value(), e.getMessage(), e.getErrorCode().getCode()));
    }

    // @Valid 실패 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(400).body(ErrorResponse.of(400, message, "VALIDATION_ERROR"));
    }

    // 예상 못한 서버 오류
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("[UnhandledException] {}", e.getMessage(), e);
        return ResponseEntity.status(500)
                .body(ErrorResponse.of(500, "서버 오류가 발생했어요", "INTERNAL_SERVER_ERROR"));
    }
}
```

`@RestControllerAdvice`는 모든 컨트롤러에서 발생하는 예외를 여기서 잡아요. 각 컨트롤러에 try-catch를 일일이 쓰지 않아도 돼요.

---

## 3. 프론트에서 에러 처리

이제 모든 에러가 같은 형태로 오니까 프론트에서 이렇게 처리하면 돼요.

```ts
} catch (err: any) {
  // 백엔드에서 보내준 메시지를 바로 사용
  setErrorMsg(err.response?.data?.message ?? "오류가 발생했어요");
}
```

에러 코드로 분기 처리도 할 수 있어요.

```ts
const code = err.response?.data?.code;
if (code === "DUPLICATE_EMAIL") {
  setEmailError("이미 사용 중인 이메일이에요");
}
```

---

## 트러블슈팅

### 문제 — API마다 에러 응답 형태가 달라요

**증상**

어떤 API는 에러 시 `{ message: "..." }`를 주고, 어떤 API는 Spring 기본 에러 형태인 `{ timestamp, status, error, path }`를 줬어요. 프론트에서 에러 메시지를 일관되게 처리할 수 없었어요.

**원인**

예외 처리를 각 서비스마다 제각각 하고 있었어요.

```java
// 어떤 서비스 — IllegalArgumentException 던짐
throw new IllegalArgumentException("이메일이 중복돼요");

// 다른 서비스 — RuntimeException 던짐
throw new RuntimeException("정책을 찾을 수 없어요");
```

**해결**

`ErrorCode` → `CustomException` → `GlobalExceptionHandler` 3단계 구조로 통일했어요.

```java
// 이제 모든 서비스에서 이렇게 통일
throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
```

모든 에러 응답이 동일한 형태로 와요.

```json
{
  "status": 409,
  "message": "이미 사용 중인 이메일이에요",
  "code": "DUPLICATE_EMAIL",
  "timestamp": "2026-03-23T10:30:00"
}
```

---

## 다음 할 일

- [x] 예외 처리 공통화 완료
- [ ] 카카오 소셜 로그인
- [ ] 공공 API 크롤링 (API 키 승인 대기 중)
- [ ] 배포
