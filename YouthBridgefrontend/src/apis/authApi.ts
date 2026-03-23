import axiosInstance from "./axiosInstance";

// ── 타입 정의 ─────────────────────────────────────────
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  birthYear?: number;
  region?: string;
  interests?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  userId: number;
  email: string;
  name: string;
  region: string;
  role: string;
}

// ── API 함수 ──────────────────────────────────────────

// 회원가입
export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>("/api/auth/signup", data);
  return response.data;
};

// 로그인
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>("/api/auth/login", data);
  return response.data;
};

// 카카오 로그인 — 인가 코드를 백엔드로 전달
export const kakaoLogin = async (code: string): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>("/api/auth/kakao", { code });
  return response.data;
};

// 카카오 로그인 페이지로 리다이렉트
export const redirectToKakao = () => {
  const KAKAO_CLIENT_ID = "2a20189772741d8f70c47c384207ec5b";
  const REDIRECT_URI = "http://localhost:5173/oauth/kakao";
  const kakaoAuthUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${KAKAO_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code`;
  window.location.href = kakaoAuthUrl;
};

// 이메일 중복 확인
export const checkEmail = async (email: string): Promise<boolean> => {
  const response = await axiosInstance.get<{ duplicate: boolean }>(
    `/api/auth/check-email?email=${email}`
  );
  return response.data.duplicate;
};
