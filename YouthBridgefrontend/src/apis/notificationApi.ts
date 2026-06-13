import axiosInstance from "./axiosInstance";

export interface NotificationItem {
  id: number;
  message: string;
  policyId?: number;
  isRead: boolean;
  createdAt: string;
}

export const fetchNotifications = async (): Promise<NotificationItem[]> => {
  const res = await axiosInstance.get<NotificationItem[]>("/api/notifications");
  return res.data;
};

// 1. Zustand 스토어 파싱 혹은 단순 가드로 해결하기 까다롭다면, 
//    요청을 보내기 전 스토리지 토큰 값이 실제 '유효한 값'인지 검증합니다.
export const fetchUnreadCount = async (): Promise<number> => {
  const token = localStorage.getItem("accessToken");

  // 토큰이 아예 없거나, 문자열 "null", "undefined" 같은 찌꺼기 값이 들어있다면 차단
  if (!token || token === "null" || token === "undefined") {
    return 0;
  }

  try {
    const res = await axiosInstance.get<{ count: number }>("/api/notifications/unread-count");
    return res.data.count;
  } catch (error) {
    // 만약 토큰이 만료되어 백엔드에서 403을 뱉는다면, 
    // 빨간 에러를 남기지 않고 조용히 0으로 처리하고 싶을 때 캐치해 줍니다.
    return 0; 
  }
};
export const markAllAsRead = async (): Promise<void> => {
  await axiosInstance.patch("/api/notifications/read");
};
