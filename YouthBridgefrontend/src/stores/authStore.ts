import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "../apis/authApi";

// 로그인한 유저 정보 타입
interface UserInfo {
  userId: number;
  email: string;
  name: string;
  region: string;
  role: string;       // "USER" or "ADMIN"
  provider?: string;  // 소셜 로그인 제공자 (kakao 등, 일반 로그인은 undefined)
}

// 스토어 타입 정의
interface AuthStore {
  user: UserInfo | null;
  accessToken: string | null;
  isLoggedIn: boolean;

  // 로그인 성공 시 호출 — 유저 정보 + 토큰 저장
  setAuth: (response: AuthResponse) => void;

  // 유저 정보만 업데이트 (마이페이지 저장 후 반영)
  updateUser: (info: Partial<UserInfo>) => void;

  // 로그아웃 시 호출 — 상태 초기화
  clearAuth: () => void;
}

// persist 미들웨어 — 새로고침해도 로그인 상태 유지 (localStorage에 저장)
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,

      setAuth: (response: AuthResponse) => {
        localStorage.setItem("accessToken", response.accessToken);
        set({
          user: {
            userId: response.userId,
            email: response.email,
            name: response.name,
            region: response.region,
            role: response.role ?? "USER",  // role 없으면 USER 기본값
          },
          accessToken: response.accessToken,
          isLoggedIn: true,
        });
      },

      // 마이페이지에서 이름, 지역 등 수정 후 Navbar에 바로 반영
      updateUser: (info: Partial<UserInfo>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...info } : null,
        }));
      },

      clearAuth: () => {
        localStorage.removeItem("accessToken");
        set({
          user: null,
          accessToken: null,
          isLoggedIn: false,
        });
      },
    }),
    {
      name: "auth-storage", // localStorage 키 이름
    }
  )
);
