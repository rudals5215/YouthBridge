import axiosInstance from "./axiosInstance";

export interface NoticeItem {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface NoticePage {
  content: NoticeItem[];
  totalElements: number;
  totalPages: number;
  number: number;
}

// 공지사항 목록 (누구나)
export const fetchNotices = async (page = 0, size = 10): Promise<NoticePage> => {
  const res = await axiosInstance.get<NoticePage>("/api/notices", { params: { page, size } });
  return res.data;
};

// 공지사항 작성 (관리자)
export const createNotice = async (title: string, content: string): Promise<NoticeItem> => {
  const res = await axiosInstance.post<NoticeItem>("/api/admin/notices", { title, content });
  return res.data;
};

// 공지사항 삭제 (관리자)
export const deleteNotice = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/admin/notices/${id}`);
};
