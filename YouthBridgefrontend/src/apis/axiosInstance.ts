import axios from "axios";

const axiosInstance = axios.create({
  // 개발: http://localhost:8080
  // 배포: VITE_API_URL 환경변수 사용
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터 — 토큰 자동 첨부
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    // 401 — 토큰 만료 → 로그아웃
    if (status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 403 — 잘못된 권한 또는 유령 토큰 처리 (★ 수정 완료)
    if (status === 403) {
      // 만약 "null" 같은 찌꺼기 토큰 때문에 백엔드에서 403을 뱉은 거라면,
      // 다음 요청에 영향을 주지 않도록 로컬 스토리지에서 토큰 방을 완전히 빼버립니다.
      localStorage.removeItem("accessToken");

      const isSilent =
        url.includes("/api/notifications") || url.includes("/api/admin");

      // 알림/관리자 API는 사용자에게 굳이 빨간 콘솔 에러를 안 보여주고 조용히 넘어갑니다.
      if (isSilent) {
        return Promise.resolve({ data: null, status: 403 });
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
