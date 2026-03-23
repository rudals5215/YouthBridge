import axios from "axios";

// 모든 API 요청의 기본 설정
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080", // Spring Boot 서버 주소
  timeout: 10000,                   // 10초 안에 응답 없으면 에러
  headers: {
    "Content-Type": "application/json",
  },
});

// ── 요청 인터셉터 ─────────────────────────────────────
// API 요청을 보내기 전에 자동으로 실행돼요
// localStorage에 저장된 토큰을 꺼내서 헤더에 붙여줘요
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── 응답 인터셉터 ─────────────────────────────────────
// API 응답이 왔을 때 자동으로 실행돼요
// 401이 오면 토큰 만료 → 로그아웃 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로컬스토리지 정리 + 로그인 페이지로
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
