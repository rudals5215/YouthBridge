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
  category?: string;
  categories?: string[];
  keyword?: string;
  status?: string;
  sort?: "latest" | "deadline" | "name";
  page?: number;
  size?: number;
}

// ── API 함수 ──────────────────────────────────────────

// 정책 목록 조회 (필터 + 페이지네이션)
export const fetchPolicies = async (
  filters: PolicyFilters = {}
): Promise<PolicyListResponse> => {
  const { categories, ...rest } = filters;

  const params = new URLSearchParams();

  // status 기본값 ACTIVE (마감 정책은 기본 제외)
  if (!rest.status) rest.status = "ACTIVE";

  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.append(k, String(v));
  });

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
