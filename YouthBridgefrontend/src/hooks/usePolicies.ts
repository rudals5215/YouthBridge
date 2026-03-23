import { useState, useEffect } from "react";
import { fetchPolicies, type Policy, type PolicyFilters } from "../apis/policyApi";

interface UsePoliciesResult {
  policies: Policy[];
  isLoading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
}

export function usePolicies(filters: PolicyFilters): UsePoliciesResult {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchPolicies(filters)
      .then((data) => {
        if (cancelled) return;
        setPolicies(data.policies);
        setTotal(data.totalElements);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      })
      .catch(() => {
        if (cancelled) return;
        setError("정책을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [
    filters.region,
    filters.age,
    filters.category,
    filters.categories?.join(","),  // 배열은 join해서 의존성 비교
    filters.keyword,
    filters.page,
  ]);

  return { policies, isLoading, error, total, totalPages, currentPage };
}

// 정책 단건 조회 훅
import { fetchPolicyById } from "../apis/policyApi";

interface UsePolicyByIdResult {
  policy: Policy | null;
  isLoading: boolean;
  error: string | null;
}

export function usePolicyById(id: string): UsePolicyByIdResult {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchPolicyById(Number(id))
      .then((data) => {
        if (!cancelled) setPolicy(data);
      })
      .catch(() => {
        if (!cancelled) setError("정책을 찾을 수 없어요.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { policy, isLoading, error };
}
