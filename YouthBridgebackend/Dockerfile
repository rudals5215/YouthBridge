# ── 1단계: 빌드 ──────────────────────────────────
FROM gradle:8.5-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle bootJar --no-daemon

# ── 2단계: 실행 ──────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

# 타임존 설정 (한국시간)
ENV TZ=Asia/Seoul

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
