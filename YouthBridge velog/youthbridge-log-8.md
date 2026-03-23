# YouthBridge 개발일지 #8 — Spring Boot 백엔드 구현

> Spring Boot + Java + MariaDB + JPA 조합으로 백엔드를 만들었어요.  
> 처음 세팅할 때 틀렸던 것들과 왜 이렇게 짰는지 위주로 정리해요.

---

## 이번 글에서 다루는 것

- 프로젝트 세팅 시 틀렸던 것들 (버전, 드라이버, ddl-auto)
- 도메인 기반 패키지 구조 설계
- 엔티티 설계 (User, Policy, Bookmark)
- JWT 인증 구현
- API 설계 및 Postman 테스트

---

## 1. 프로젝트 세팅 — 처음부터 틀렸던 것들

**① Spring Boot 버전이 존재하지 않았어요**

```groovy
// 잘못된 버전 (4.x는 아직 출시 전)
id 'org.springframework.boot' version '4.0.3'

// 올바른 최신 안정 버전
id 'org.springframework.boot' version '3.4.3'
```

**② 의존성 이름이 틀렸어요**

```groovy
// 틀린 것
implementation 'org.springframework.boot:spring-boot-starter-webmvc'

// 올바른 것
implementation 'org.springframework.boot:spring-boot-starter-web'
```

**③ MySQL vs MariaDB 드라이버 불일치**

`build.gradle`에는 MySQL 드라이버를 쓰고 `application.properties`에는 MariaDB 드라이버를 쓰고 있었어요. MariaDB를 쓰니까 드라이버도 MariaDB로 통일했어요.

```groovy
runtimeOnly 'org.mariadb.jdbc:mariadb-java-client'
```

**④ `ddl-auto=create-drop` 위험해요**

```properties
# 위험! 서버 끄면 테이블 + 데이터 전부 삭제
spring.jpa.hibernate.ddl-auto=create-drop

# 안전한 설정 — 없으면 생성, 있으면 유지
spring.jpa.hibernate.ddl-auto=update
```

---

## 2. 패키지 구조 — 도메인 기반

저번 프로젝트에서 레이어 기반 구조를 써봤기 때문에 이번엔 도메인 기반으로 했어요.

```
domain/
├── user/
│   ├── entity/      User.java
│   ├── repository/  UserRepository.java
│   ├── service/     AuthService.java
│   ├── controller/  AuthController.java
│   └── dto/         SignupRequest, LoginRequest, AuthResponse
├── policy/
│   └── ...
└── bookmark/
    └── ...

global/
├── config/    JpaConfig.java, SecurityConfig.java
├── security/  JwtProvider.java, JwtFilter.java
└── exception/ GlobalExceptionHandler.java
```

도메인 기반은 파일이 많아질수록 같은 도메인끼리 모여있어서 찾기 편하고, 실무에서도 많이 쓰는 방식이에요.

---

## 3. 엔티티 설계

### User

```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;       // 로그인 ID

    private String password;    // BCrypt 암호화

    private String region;
    private String interests;   // "취업지원,주거지원" 형태
    private String role = "USER"; // USER or ADMIN
    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;
}
```

`@CreatedDate`는 JPA Auditing 기능이에요. `JpaConfig`에 `@EnableJpaAuditing`을 붙여야 동작해요.

### Policy

```java
@Column(unique = true)
private String externalId; // 공공 API 원본 ID (중복 저장 방지)

@Enumerated(EnumType.STRING)
private PolicyStatus status; // ACTIVE, UPCOMING, CLOSED
```

`externalId`를 따로 두는 이유는 공공 API에서 데이터를 받아올 때 이미 저장된 정책인지 확인하기 위해서예요.

`@Enumerated(EnumType.STRING)`은 DB에 숫자(0,1,2) 대신 문자열("ACTIVE")로 저장해요. 숫자로 저장하면 나중에 Enum 순서가 바뀔 때 데이터가 꼬여요.

### Bookmark

```java
@Table(uniqueConstraints = @UniqueConstraint(
    columnNames = {"user_id", "policy_id"}
))
public class Bookmark {
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    private Policy policy;
}
```

`uniqueConstraints`로 같은 유저가 같은 정책을 중복 즐겨찾기하지 못하게 막았어요.

`FetchType.LAZY`는 즐겨찾기를 조회할 때 연결된 User와 Policy를 바로 가져오지 않고, 실제로 필요할 때만 쿼리를 날려요. 성능 최적화의 기본이에요.

---

## 4. JWT 인증

```
로그인 → 서버가 JWT 토큰 발급
↓
이후 모든 요청 헤더에 토큰 첨부
Authorization: Bearer eyJhbGci...
↓
JwtFilter가 토큰 검증 → 유효하면 SecurityContext에 인증 정보 저장
```

비밀번호는 절대 평문으로 저장하면 안 돼요.

```java
// 회원가입 시
String encoded = passwordEncoder.encode("password123");
// DB에 "$2a$10$..." 형태로 저장

// 로그인 시 비교
passwordEncoder.matches("password123", encoded); // true
```

---

## 5. API 설계

| 메서드 | URL | 인증 |
|---|---|---|
| POST | `/api/auth/signup` | ❌ |
| POST | `/api/auth/login` | ❌ |
| GET | `/api/policies` | ❌ |
| GET | `/api/policies/{id}` | ❌ |
| GET | `/api/bookmarks` | ✅ |
| POST | `/api/bookmarks/{policyId}` | ✅ |
| DELETE | `/api/bookmarks/{policyId}` | ✅ |

---

## 트러블슈팅

### 문제 1 — 패키지 경로 불일치로 Spring이 빈(Bean)을 못 찾아요

**증상**

서버 시작 시 `NoSuchBeanDefinitionException` 에러가 발생하거나 컨트롤러가 동작하지 않아요.

**원인**

파일의 `package` 선언이 실제 폴더 경로랑 달랐어요.

```java
// 실제 폴더: com/YouthBridge/YouthBridge/domain/user/entity/
package com.YouthBridge.domain.user.entity;         // ← 틀림
package com.YouthBridge.YouthBridge.domain.user.entity; // ← 맞음
```

**해결**

IntelliJ `Ctrl + Shift + R`로 전체 찾아바꾸기로 한 번에 수정했어요.

---

### 문제 2 — SecurityConfig 없이 서버 실행 시 모든 요청이 401

**증상**

백엔드 서버를 실행하고 API를 호출하면 아무 설정 없이도 모든 요청에 401 Unauthorized가 반환됐어요.

**원인**

Spring Security는 `SecurityConfig`가 없으면 기본적으로 모든 요청을 차단해요. "설정이 없으면 허용"이 아니라 "설정이 없으면 전부 막음"이 기본값이에요.

**해결**

`SecurityConfig.java`를 추가하고 공개 API에 `permitAll()`을 명시적으로 설정했어요.

```java
.requestMatchers("/api/auth/**", "/api/policies/**").permitAll()
.anyRequest().authenticated()
```

---

### 문제 3 — `ddl-auto=create-drop`으로 서버 재시작마다 데이터 날아감

**증상**

서버를 끄고 다시 켜면 테이블과 데이터가 전부 사라졌어요.

**원인**

`create-drop`은 서버 시작 시 테이블 생성, 종료 시 테이블 삭제예요.

**해결**

개발 중에는 `update`로 변경했어요.

```properties
# 위험
spring.jpa.hibernate.ddl-auto=create-drop

# 안전 (없으면 생성, 있으면 유지)
spring.jpa.hibernate.ddl-auto=update
```

---

## 다음 할 일

- [x] Spring Boot 백엔드 구현 완료
- [ ] axios + Zustand로 프론트-백엔드 연결
- [ ] 마이페이지 구현
