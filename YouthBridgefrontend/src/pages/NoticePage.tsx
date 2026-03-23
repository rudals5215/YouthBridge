import { useState, useEffect } from "react";
import { fetchNotices, type NoticeItem } from "../apis/noticeApi";
import "./NoticePage.css";

function NoticePage() {
  const [notices, setNotices]   = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetchNotices(0, 50)
      .then((data) => setNotices(data.content))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="notice-page">
      <div className="notice-header">
        <div className="notice-header-inner">
          <h1>공지사항</h1>
          <p>YouthBridge의 새로운 소식을 확인하세요</p>
        </div>
      </div>

      <div className="notice-body">
        {isLoading ? (
          <p className="notice-loading">불러오는 중...</p>
        ) : notices.length === 0 ? (
          <p className="notice-empty">등록된 공지사항이 없어요</p>
        ) : (
          <ul className="notice-list">
            {notices.map((n) => (
              <li key={n.id} className="notice-item">
                <button
                  className="notice-title-btn"
                  onClick={() => setExpanded(expanded === n.id ? null : n.id)}
                >
                  <span className="notice-title">{n.title}</span>
                  <div className="notice-meta">
                    <span className="notice-author">{n.authorName}</span>
                    <span className="notice-date">{n.createdAt?.slice(0, 10)}</span>
                    <i className={`ri-arrow-${expanded === n.id ? "up" : "down"}-s-line`} />
                  </div>
                </button>
                {expanded === n.id && (
                  <div className="notice-content">
                    <p>{n.content}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default NoticePage;
