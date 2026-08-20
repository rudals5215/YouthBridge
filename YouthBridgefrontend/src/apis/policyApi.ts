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
  filters: PolicyFilters = {},
): Promise<PolicyListResponse> => {
  const { categories, ...rest } = filters;

  const params = new URLSearchParams();

  if (!rest.status) rest.status = "ACTIVE";

  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.append(k, String(v));
  });

  if (categories && categories.length > 0) {
    categories.forEach((c) => params.append("categories", c));
  }

  const response = await axiosInstance.get<PolicyListResponse>(
    "/api/policies",
    { params },
  );
  return response.data;
};

// 정책 단건 조회
export const fetchPolicyById = async (id: number): Promise<Policy> => {
  const response = await axiosInstance.get<Policy>(`/api/policies/${id}`);
  return response.data;
};

// 정책 스냅샷 조회 (콜드스타트 대비, GitHub raw 파일에서 즉시 로드)
export const fetchPolicySnapshot =
  async (): Promise<PolicyListResponse | null> => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/rudals5215/YouthBridge/main/data/policies-snapshot.json",
      );
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn("스냅샷 로드 실패, 실제 API 응답을 기다립니다.", e);
      return null;
    }
  };
