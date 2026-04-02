import axiosInstance from "./axiosInstance";

// ── 타입 정의 ─────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalPolicies: number;
  activePolicies: number;
  totalBookmarks: number;
  todaySignups: number;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  region?: string;
  provider?: string;  // null이면 일반 로그인
  active: boolean;
  createdAt: string;
}

export interface AdminUserPage {
  content: AdminUser[];
  totalElements: number;
  totalPages: number;
  number: number;
}

// ── API 함수 ──────────────────────────────────────────

// 대시보드 통계
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await axiosInstance.get<AdminStats>("/api/admin/stats");
  return response.data;
};

// 회원 목록 조회
export const getAdminUsers = async (
  page = 0,
  size = 20,
  keyword?: string
): Promise<AdminUserPage> => {
  const params: Record<string, any> = { page, size };
  if (keyword) params.keyword = keyword;
  const response = await axiosInstance.get<AdminUserPage>("/api/admin/users", { params });
  return response.data;
};

// 정책 삭제
export const deletePolicy = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/admin/policies/${id}`);
};

// 공공 API 수동 동기화
export interface SyncStatus {
  running: boolean;
  saved: number;
  updated: number;
  deleted: number;
  finishedAt: string | null;
  errorMsg: string | null;
}

export const getSyncStatus = async (): Promise<SyncStatus> => {
  const res = await axiosInstance.get<SyncStatus>("/api/admin/sync/status");
  return res.data;
};

// 공공 API 수동 동기화 — 크롤링이 수분 걸릴 수 있어서 timeout 별도 설정
export const syncPublicApi = async (): Promise<void> => {
  await axiosInstance.post("/api/admin/sync", null, {
    timeout: 600000,
  });
};
