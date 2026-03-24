import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { getAdminStats, getAdminUsers, deletePolicy, syncPublicApi } from "../apis/adminApi";
import { createNotice, deleteNotice, fetchNotices } from "../apis/noticeApi";
import type { AdminStats, AdminUser } from "../apis/adminApi";
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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    // ADMIN 아닐 때는 API 호출 안 함
    if (user?.role !== "ADMIN") return;
    getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      await syncPublicApi();
      setSyncMsg("✓ 동기화가 완료됐어요!");
    } catch (err: any) {
      setSyncMsg(err.response?.data?.message ?? "❌ 동기화 중 오류가 발생했어요");
    } finally {
      setSyncing(false);
    }
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
          공공데이터포털에서 최신 정책 데이터를 즉시 가져와요.
          자동 크롤링은 매일 오전 6시, 오후 6시에 실행돼요.
        </p>
        <div className="sync-row">
          <button className="sync-btn" onClick={handleSync} disabled={syncing}>
            <i className={syncing ? "ri-loader-4-line spin" : "ri-refresh-line"} />
            {syncing ? "동기화 중..." : "지금 동기화하기"}
          </button>
          {syncMsg && <span className="sync-msg">{syncMsg}</span>}
        </div>
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
  // 정책 목록은 기존 /api/policies 사용
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPolicies = (kw?: string) => {
    setIsLoading(true);
    const params = new URLSearchParams({ size: "20" });
    if (kw) params.set("keyword", kw);
    fetch(`http://localhost:8080/api/policies?${params}`)
      .then((r) => r.json())
      .then((data) => setPolicies(data.policies ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchPolicies(); }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPolicies(val), 400);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 정책을 삭제할까요?`)) return;
    try {
      await deletePolicy(id);
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message ?? "삭제 중 오류가 발생했어요");
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-table-header">
        <h3 className="admin-card-title">정책 목록</h3>
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
