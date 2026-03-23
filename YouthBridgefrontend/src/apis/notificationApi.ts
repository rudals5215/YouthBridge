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

export const fetchUnreadCount = async (): Promise<number> => {
  const res = await axiosInstance.get<{ count: number }>("/api/notifications/unread-count");
  return res.data.count;
};

export const markAllAsRead = async (): Promise<void> => {
  await axiosInstance.patch("/api/notifications/read");
};
