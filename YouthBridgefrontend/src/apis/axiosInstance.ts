import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
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
  (error) => Promise.reject(error)
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
    }

    // 403 — 알림/관리자 API는 콘솔 에러 없이 조용히 무시
    // (ProtectedRoute와 catch(()=>{}) 에서 이미 처리)
    if (status === 403) {
      const isSilent =
        url.includes("/api/notifications") ||
        url.includes("/api/admin");
      if (isSilent) return Promise.resolve({ data: null, status: 403 });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
