import axiosInstance from "./axiosInstance";

// ── 타입 정의 ─────────────────────────────────────────
export interface BookmarkResponse {
  bookmarkId: number;
  policyId: number;
  title: string;
  description: string;
  category: string;
  region: string;
  minAge?: number;
  maxAge?: number;
  applyEndDate?: string;
  status: "ACTIVE" | "UPCOMING" | "CLOSED";
  dday?: number;
  bookmarkedAt: string;
}

// ── API 함수 ──────────────────────────────────────────

// 내 즐겨찾기 목록 조회
export const fetchBookmarks = async (): Promise<BookmarkResponse[]> => {
  const response = await axiosInstance.get<BookmarkResponse[]>("/api/bookmarks");
  return response.data;
};

// 즐겨찾기 추가
export const addBookmark = async (policyId: number): Promise<BookmarkResponse> => {
  const response = await axiosInstance.post<BookmarkResponse>(`/api/bookmarks/${policyId}`);
  return response.data;
};

// 즐겨찾기 삭제
export const removeBookmark = async (policyId: number): Promise<void> => {
  await axiosInstance.delete(`/api/bookmarks/${policyId}`);
};

// 즐겨찾기 여부 확인
export const checkBookmark = async (policyId: number): Promise<boolean> => {
  const response = await axiosInstance.get<{ bookmarked: boolean }>(
    `/api/bookmarks/check/${policyId}`
  );
  return response.data.bookmarked;
};
