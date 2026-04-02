import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { getAdminStats, getAdminUsers, deletePolicy, syncPublicApi, getSyncStatus } from "../apis/adminApi";
import { createNotice, deleteNotice, fetchNotices } from "../apis/noticeApi";
import type { AdminStats, AdminUser, SyncStatus } from "../apis/adminApi";
import type { NoticeItem } from "../apis/noticeApi";
import "./AdminPage.css";

const TABS = ["대시보드", "회원 관리", "정책 관리", "공지사항"] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  "대시보드":  "ri-dashboard-line",
  "회원 관리": "ri-group-line",
  "정책 관리": "ri-file-list-3-line",
  "공지사항":  "ri-megaphone-line",
};

function AdminPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("대시보드");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="admin-page">
      <div className="admin-inner">
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <i className="ri-shield-star-line" />
            <span>관리자 페이지</span>
          </div>
          <nav className="admin-nav">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`admin-nav-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <i className={TAB_ICONS[tab]} />
                {tab}
              </button>
            ))}
          </nav>
          <button className="admin-back-btn" onClick={() => navigate("/")}>
            <i className="ri-arrow-left-line" /> 사이트로 돌아가기
          </button>
        </aside>

        <main className="admin-content">
          <div className="admin-content-header">
            <h1>{activeTab}</h1>
          </div>
          {activeTab === "대시보드"  && <DashboardTab />}
          {activeTab === "회원 관리" && <UserManageTab />}
          {activeTab === "정책 관리" && <PolicyManageTab />}
          {activeTab === "공지사항"  && <NoticeTab />}
        </main>
      </div>
    </div>
  );
}

// ── 대시보드 탭 ────────────────────────────────────────
function DashboardTab() {
  const { user } = useAuthStore();
  const [stats, setStats]       = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncing, setSyncing]   = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    getAdminStats().then(setStats).catch(() => {}).finally(() => setIsLoading(false));
    // 초기 동기화 상태도 확인
    getSyncStatus().then(setSyncStatus).catch(() => {});
  }, [user]);

  // 동기화 진행 중이면 2초마다 폴링
  const startPolling = () => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const status = await getSyncStatus();
        setSyncStatus(status);
        if (!status.running) {
          stopPolling();
          setSyncing(false);
          // 통계 새로고침
          getAdminStats().then(setStats).catch(() => {});
        }
      } catch (_e) { stopPolling(); setSyncing(false); }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => () => stopPolling(), []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      await syncPublicApi();
    } catch (_e) { /* 202는 정상 */ }
    startPolling();
  };

  const statItems = stats ? [
    { label: "전체 회원",      value: stats.totalUsers.toLocaleString(),    icon: "ri-group-line",       color: "var(--cat-job-color)" },
    { label: "전체 정책",      value: stats.totalPolicies.toLocaleString(), icon: "ri-file-list-3-line", color: "var(--cat-housing-color)" },
    { label: "오늘 신규 가입", value: stats.todaySignups.toLocaleString(),  icon: "ri-user-add-line",    color: "var(--cat-startup-color)" },
    { label: "즐겨찾기 수",    value: stats.totalBookmarks.toLocaleString(),icon: "ri-bookmark-line",    color: "var(--cat-edu-color)" },
  ] : [];

  return (
    <div>
      {isLoading ? (
        <div className="stat-grid">
          {[1,2,3,4].map((i) => (
            <div key={i} className="stat-card">
              <div style={{ width: "44px", height: "44px", borderRadius: "0.75rem", background: "var(--gray-100)" }} />
              <div>
                <div style={{ width: "80px", height: "24px", borderRadius: "4px", background: "var(--gray-100)", marginBottom: "6px" }} />
                <div style={{ width: "60px", height: "14px", borderRadius: "4px", background: "var(--gray-100)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stat-grid">
          {statItems.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ color: s.color, background: `${s.color}15` }}>
                <i className={s.icon} />
              </div>
              <div>
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-card">
        <h3 className="admin-card-title">공공 API 수동 동기화</h3>
        <p className="admin-card-desc">
          온통청년 OpenAPI에서 최신 정책 데이터를 가져와요.
          자동 동기화는 매일 오전 6시, 오후 6시에 실행돼요.
        </p>
        <div className="sync-row">
          <button className="sync-btn" onClick={handleSync} disabled={syncing}>
            <i className={syncing ? "ri-loader-4-line spin" : "ri-refresh-line"} />
            {syncing ? "동기화 중..." : "지금 동기화하기"}
          </button>
        </div>

        {/* 동기화 상태 패널 */}
        {syncStatus && (
          <div className={`sync-status-panel ${syncStatus.running ? "running" : syncStatus.errorMsg ? "error" : "done"}`}>
            {syncStatus.running ? (
              <><i className="ri-loader-4-line spin" /> 동기화 진행 중... 잠시 기다려주세요</>
            ) : syncStatus.errorMsg ? (
              <><i className="ri-error-warning-line" /> 오류: {syncStatus.errorMsg}</>
            ) : (
              <div className="sync-result">
                <i className="ri-checkbox-circle-line" />
                <span>동기화 완료! ({syncStatus.finishedAt})</span>
                <div className="sync-counts">
                  <span className="sync-count new">신규 {syncStatus.saved}건</span>
                  <span className="sync-count update">업데이트 {syncStatus.updated}건</span>
                  <span className="sync-count delete">마감처리 {syncStatus.deleted}건</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 회원 관리 탭 ───────────────────────────────────────
function UserManageTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = (kw?: string) => {
    setIsLoading(true);
    getAdminUsers(0, 20, kw)
      .then((data) => {
        setUsers(data.content);
        setTotal(data.totalElements);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(val), 400);
  };

  return (
    <div className="admin-card">
      <div className="admin-table-header">
        <h3 className="admin-card-title">
          회원 목록 <span style={{ fontSize: "0.8rem", color: "var(--gray-400)", fontWeight: 400 }}>총 {total}명</span>
        </h3>
        <div className="admin-search">
          <i className="ri-search-line" />
          <input placeholder="이름, 이메일 검색" value={keyword} onChange={handleSearch} />
        </div>
      </div>

      {isLoading ? (
        <p style={{ padding: "2rem", textAlign: "center", color: "var(--gray-400)" }}>불러오는 중...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>이메일</th>
              <th>지역</th>
              <th>로그인 방식</th>
              <th>가입일</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="text-muted">{u.id}</td>
                <td className="font-bold">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.region ?? "-"}</td>
                <td>
                  <span className={`status-badge ${u.provider ? "kakao" : "active"}`}>
                    {u.provider ?? "이메일"}
                  </span>
                </td>
                <td className="text-muted">{u.createdAt?.slice(0, 10)}</td>
                <td>
                  <span className={`status-badge ${u.active ? "active" : "inactive"}`}>
                    {u.active ? "활성" : "비활성"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── 정책 관리 탭 ───────────────────────────────────────
function PolicyManageTab() {
  const [policies, setPolicies]   = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword]     = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const PAGE_SIZE = 20;

  const fetchPolicies = (kw?: string, page = 1) => {
    setIsLoading(true);
    const params = new URLSearchParams({
      size: String(PAGE_SIZE),
      page: String(page - 1), // 백엔드 0-based
    });
    if (kw) params.set("keyword", kw);
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
    fetch(`${API_BASE}/api/policies?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPolicies(data.policies ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.totalElements ?? 0);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchPolicies(); }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPolicies(val, 1), 400);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPolicies(keyword, page);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 정책을 삭제할까요?`)) return;
    try {
      await deletePolicy(id);
      fetchPolicies(keyword, currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message ?? "삭제 중 오류가 발생했어요");
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-table-header">
        <h3 className="admin-card-title">
          정책 목록 <span style={{ fontSize: "0.8rem", color: "var(--gray-400)", fontWeight: 400 }}>총 {total}개</span>
        </h3>
        <div className="admin-search">
          <i className="ri-search-line" />
          <input placeholder="정책명 검색" value={keyword} onChange={handleSearch} />
        </div>
      </div>

      {isLoading ? (
        <p style={{ padding: "2rem", textAlign: "center", color: "var(--gray-400)" }}>불러오는 중...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>정책명</th>
              <th>카테고리</th>
              <th>지역</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id}>
                <td className="text-muted">{p.id}</td>
                <td className="font-bold">{p.title}</td>
                <td>{p.category}</td>
                <td>{p.region}</td>
                <td>
                  <span className={`status-badge ${p.status === "ACTIVE" ? "active" : "inactive"}`}>
                    {p.status === "ACTIVE" ? "접수중" : p.status === "UPCOMING" ? "예정" : "마감"}
                  </span>
                </td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(p.id, p.title)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button className="admin-page-btn" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
            <i className="ri-skip-left-line" />
          </button>
          <button className="admin-page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            <i className="ri-arrow-left-s-line" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
            const page = start + i;
            return (
              <button key={page} className={`admin-page-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => handlePageChange(page)}>
                {page}
              </button>
            );
          })}
          <button className="admin-page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            <i className="ri-arrow-right-s-line" />
          </button>
          <button className="admin-page-btn" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
            <i className="ri-skip-right-line" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── 공지사항 탭 ────────────────────────────────────────
function NoticeTab() {
  const [notices, setNotices]     = useState<NoticeItem[]>([]);
  const [title, setTitle]         = useState("");
  const [content, setContent]     = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [errorMsg, setErrorMsg]   = useState("");

  useEffect(() => {
    fetchNotices(0, 20)
      .then((data) => setNotices(data.content))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!title || !content) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const created = await createNotice(title, content);
      setNotices((prev) => [created, ...prev]);
      setSaved(true);
      setTitle(""); setContent("");
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message ?? "등록 중 오류가 발생했어요");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("공지사항을 삭제할까요?")) return;
    try {
      await deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch {
      alert("삭제 중 오류가 발생했어요");
    }
  };

  return (
    <div>
      {/* 작성 폼 */}
      <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
        <h3 className="admin-card-title">공지사항 작성</h3>
        <div className="notice-form">
          <input
            className="notice-title-input"
            placeholder="공지사항 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="notice-content-input"
            placeholder="공지사항 내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
          {errorMsg && <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>{errorMsg}</p>}
          <button
            className="notice-submit-btn"
            onClick={handleSubmit}
            disabled={!title || !content || saving}
          >
            {saving ? "등록 중..." : saved ? "✓ 등록됐어요" : "공지사항 등록"}
          </button>
        </div>
      </div>

      {/* 목록 */}
      <div className="admin-card">
        <h3 className="admin-card-title">공지사항 목록</h3>
        {isLoading ? (
          <p style={{ padding: "1rem", color: "var(--gray-400)", fontSize: "0.875rem" }}>불러오는 중...</p>
        ) : notices.length === 0 ? (
          <p style={{ padding: "1rem", color: "var(--gray-400)", fontSize: "0.875rem" }}>등록된 공지사항이 없어요</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>작성자</th>
                <th>날짜</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.id}>
                  <td className="font-bold">{n.title}</td>
                  <td>{n.authorName}</td>
                  <td className="text-muted">{n.createdAt?.slice(0, 10)}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(n.id)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
