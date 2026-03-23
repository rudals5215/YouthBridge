import axiosInstance from "./axiosInstance";

export interface HomeStats {
  totalPolicies: number;
  totalUsers: number;
  categoryCount: Record<string, number>;
  regionCount: Record<string, number>;
}

export const fetchHomeStats = async (): Promise<HomeStats> => {
  const response = await axiosInstance.get<HomeStats>("/api/home/stats");
  return response.data;
};
