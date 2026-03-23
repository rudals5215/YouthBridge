import axiosInstance from "./axiosInstance";

// ── 타입 정의 ─────────────────────────────────────────
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  birthYear?: number;
  region?: string;
  interests?: string;
  provider?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  region?: string;
  interests?: string;
  birthYear?: number;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ── API 함수 ──────────────────────────────────────────

// 내 정보 조회
export const getMe = async (): Promise<UserResponse> => {
  const response = await axiosInstance.get<UserResponse>("/api/users/me");
  return response.data;
};

// 내 정보 수정 (이름, 지역, 관심분야)
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UserResponse> => {
  const response = await axiosInstance.patch<UserResponse>("/api/users/me", data);
  return response.data;
};

// 비밀번호 변경
export const updatePassword = async (
  data: UpdatePasswordRequest
): Promise<void> => {
  await axiosInstance.patch("/api/users/me/password", data);
};

// 회원 탈퇴
export const withdraw = async (): Promise<void> => {
  await axiosInstance.delete("/api/users/me");
};
