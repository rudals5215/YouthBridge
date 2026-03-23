import axiosInstance from "./axiosInstance";

// ── 타입 정의 ─────────────────────────────────────────
export interface Policy {
  id: number;
  title: string;
  description: string;
  content?: string;
  category: string;
  region: string;
  minAge?: number;
  maxAge?: number;
  applyStartDate?: string;
  applyEndDate?: string;
  applyUrl?: string;
  organization?: string;
  status: "ACTIVE" | "UPCOMING" | "CLOSED";
  expired: boolean;
  dday?: number;
  createdAt: string;
}

export interface PolicyListResponse {
  policies: Policy[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PolicyFilters {
  region?: string;
  age?: number;
  category?: string;       // 단일 카테고리 (기존 호환)
  categories?: string[];   // 다중 카테고리 (중복 선택)
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
}

// ── API 함수 ──────────────────────────────────────────

// 정책 목록 조회 (필터 + 페이지네이션)
export const fetchPolicies = async (
  filters: PolicyFilters = {}
): Promise<PolicyListResponse> => {
  const { categories, ...rest } = filters;

  // undefined/빈 값 제거
  const params = new URLSearchParams();
  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.append(k, String(v));
  });

  // categories 배열 → ?categories=취업지원&categories=주거지원
  if (categories && categories.length > 0) {
    categories.forEach((c) => params.append("categories", c));
  }

  const response = await axiosInstance.get<PolicyListResponse>("/api/policies", { params });
  return response.data;
};

// 정책 단건 조회
export const fetchPolicyById = async (id: number): Promise<Policy> => {
  const response = await axiosInstance.get<Policy>(`/api/policies/${id}`);
  return response.data;
};
