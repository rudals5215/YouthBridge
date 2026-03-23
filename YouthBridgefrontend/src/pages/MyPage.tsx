import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { fetchBookmarks, removeBookmark } from "../apis/bookmarkApi";
import { updateProfile, updatePassword, withdraw } from "../apis/userApi";
import type { BookmarkResponse } from "../apis/bookmarkApi";
import { getRegionLabel, REGIONS } from "../constants/Regions";
import "./MyPage.css";

const TABS = ["내 정보", "즐겨찾기", "관심 분야", "보안", "알림"] as const;
type Tab = (typeof TABS)[number];

const INTERESTS_LIST = [
  {
    key: "취업지원",
    icon: "ri-briefcase-line",
    color: "var(--cat-job-color)",
    bg: "var(--cat-job-bg)",
  },
  {
    key: "주거지원",
    icon: "ri-home-4-line",
    color: "var(--cat-housing-color)",
    bg: "var(--cat-housing-bg)",
  },
  {
    key: "창업지원",
    icon: "ri-rocket-line",
    color: "var(--cat-startup-color)",
    bg: "var(--cat-startup-bg)",
  },
  {
    key: "교육지원",
    icon: "ri-graduation-cap-line",
    color: "var(--cat-edu-color)",
    bg: "var(--cat-edu-bg)",
  },
  {
    key: "생활지원",
    icon: "ri-heart-line",
    color: "var(--cat-life-color)",
    bg: "var(--cat-life-bg)",
  },
  {
    key: "문화지원",
    icon: "ri-palette-line",
    color: "var(--cat-culture-color)",
    bg: "var(--cat-culture-bg)",
  },
  {
    key: "금융지원",
    icon: "ri-bank-line",
    color: "var(--cat-finance-color)",
    bg: "var(--cat-finance-bg)",
  },
  {
    key: "건강지원",
    icon: "ri-heart-pulse-line",
    color: "var(--cat-health-color)",
    bg: "var(--cat-health-bg)",
  },
];

const TAB_ICONS: Record<Tab, string> = {
  "내 정보": "ri-user-line",
  즐겨찾기: "ri-bookmark-line",
  "관심 분야": "ri-heart-line",
  보안: "ri-shield-line",
  알림: "ri-notification-line",
};

function MyPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("내 정보");

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  if (!user) return null;

  const handleWithdraw = async () => {
    try {
      await withdraw();
      clearAuth();
      navigate("/");
    } catch {
      alert("탈퇴 처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="mypage">
      <div className="mypage-inner">
        <aside className="mypage-sidebar">
          <div className="mypage-profile">
            <div className="mypage-avatar">{user.name[0]}</div>
            <p className="mypage-name">{user.name}</p>
            <p className="mypage-email">{user.email}</p>
          </div>
          <nav className="mypage-nav">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`mypage-nav-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <i className={TAB_ICONS[tab]} />
                {tab}
              </button>
            ))}
            <hr className="mypage-nav-divider" />
            <button
              className="mypage-nav-btn danger"
              onClick={() => {
                clearAuth();
                navigate("/");
              }}
            >
              <i className="ri-logout-box-line" />
              로그아웃
            </button>
          </nav>
        </aside>

        <main className="mypage-content">
          {activeTab === "내 정보" && <InfoTab user={user} />}
          {activeTab === "즐겨찾기" && <BookmarkTab />}
          {activeTab === "관심 분야" && <InterestsTab user={user} />}
          {activeTab === "보안" && <SecurityTab onWithdraw={handleWithdraw} />}
          {activeTab === "알림" && <NotificationTab />}
        </main>
      </div>
    </div>
  );
}

// ── 내 정보 탭 ─────────────────────────────────────────
function InfoTab({ user }: { user: any }) {
  const { updateUser } = useAuthStore();
  const [name, setName] = useState(user.name ?? "");
  const [region, setRegion] = useState(user.region ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg("이름을 입력해주세요");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      const updated = await updateProfile({ name, region });
      // Zustand 전역 상태에도 반영 → Navbar 이름 즉시 업데이트
      updateUser({ name: updated.name, region: updated.region });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message ?? "저장 중 오류가 발생했어요");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mypage-section">
      <h2 className="mypage-section-title">내 정보</h2>
      <div className="info-fields">
        <div className="info-field">
          <label>이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력"
          />
        </div>
        <div className="info-field">
          <label>이메일</label>
          <input value={user.email} disabled className="disabled" />
          <p className="field-hint">이메일은 변경할 수 없어요</p>
        </div>
        <div className="info-field">
          <label>거주 지역</label>
          <div className="pl-select-wrap">
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">미설정</option>
              {REGIONS.filter((r) => r.value !== "").map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <i className="ri-arrow-down-s-line" />
          </div>
        </div>
      </div>
      {errorMsg && (
        <p className="field-error" style={{ marginBottom: "0.75rem" }}>
          {errorMsg}
        </p>
      )}
      <button
        className="mypage-save-btn"
        onClick={handleSave}
        disabled={isLoading}
      >
        {isLoading ? "저장 중..." : saved ? "✓ 저장됐어요" : "저장하기"}
      </button>
    </div>
  );
}

// ── 즐겨찾기 탭 ────────────────────────────────────────
function BookmarkTab() {
  const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks()
      .then(setBookmarks)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleRemove = async (policyId: number) => {
    try {
      await removeBookmark(policyId);
      setBookmarks((prev) => prev.filter((b) => b.policyId !== policyId));
    } catch {
      alert("삭제 중 오류가 발생했어요");
    }
  };

  if (isLoading)
    return (
      <div className="mypage-loading">
        <i className="ri-loader-4-line" /> 불러오는 중...
      </div>
    );

  return (
    <div className="mypage-section">
      <h2 className="mypage-section-title">
        즐겨찾기 <span className="count-badge">{bookmarks.length}</span>
      </h2>
      {bookmarks.length === 0 ? (
        <div className="mypage-empty">
          <i className="ri-bookmark-line" />
          <p>즐겨찾기한 정책이 없어요</p>
          <a href="/policies">정책 둘러보기 →</a>
        </div>
      ) : (
        <div className="bookmark-list">
          {bookmarks.map((b) => (
            <div key={b.bookmarkId} className="bookmark-card">
              <div className="bookmark-info">
                <div className="bookmark-tags">
                  <span className="bm-tag">{b.category}</span>
                  <span className="bm-tag">{getRegionLabel(b.region)}</span>
                  {b.dday !== null && b.dday !== undefined && (
                    <span className="bm-tag dday">D-{b.dday}</span>
                  )}
                </div>
                <h3 className="bookmark-title">{b.title}</h3>
                <p className="bookmark-desc">{b.description}</p>
              </div>
              <div className="bookmark-actions">
                <a href={`/policies/${b.policyId}`} className="bm-view-btn">
                  상세보기
                </a>
                <button
                  className="bm-remove-btn"
                  onClick={() => handleRemove(b.policyId)}
                >
                  <i className="ri-bookmark-fill" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 관심 분야 탭 ───────────────────────────────────────
function InterestsTab({ user }: { user: any }) {
  const { updateUser } = useAuthStore();
  const currentInterests = user.interests ? user.interests.split(",") : [];
  const [selected, setSelected] = useState<string[]>(currentInterests);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggle = (key: string) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const handleSave = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await updateProfile({ interests: selected.join(",") });
      updateUser({ interests: selected.join(",") } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message ?? "저장 중 오류가 발생했어요");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mypage-section">
      <h2 className="mypage-section-title">관심 분야</h2>
      <p className="mypage-section-desc">
        관심 분야를 설정하면 맞춤 정책을 추천받을 수 있어요
      </p>
      <div className="interests-grid">
        {INTERESTS_LIST.map((item) => (
          <button
            key={item.key}
            className={`interest-btn ${selected.includes(item.key) ? "active" : ""}`}
            onClick={() => toggle(item.key)}
            style={
              selected.includes(item.key)
                ? {
                    background: item.bg,
                    borderColor: item.color,
                    color: item.color,
                  }
                : {}
            }
          >
            <div
              className="interest-icon"
              style={{ background: item.bg, color: item.color }}
            >
              <i className={item.icon} />
            </div>
            <span>{item.key}</span>
            {selected.includes(item.key) && (
              <i
                className="ri-check-line interest-check"
                style={{ color: item.color }}
              />
            )}
          </button>
        ))}
      </div>
      {errorMsg && (
        <p className="field-error" style={{ marginBottom: "0.75rem" }}>
          {errorMsg}
        </p>
      )}
      <button
        className="mypage-save-btn"
        onClick={handleSave}
        disabled={isLoading}
      >
        {isLoading ? "저장 중..." : saved ? "✓ 저장됐어요" : "저장하기"}
      </button>
    </div>
  );
}

// ── 보안 탭 ────────────────────────────────────────────
function SecurityTab({ onWithdraw }: { onWithdraw: () => void }) {
  const { user } = useAuthStore();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);

  const pwMatch = newPw === confirmPw;
  const isSocial = !!user?.provider; // 소셜 로그인 유저 여부

  const handleChangePw = async () => {
    if (!pwMatch) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      await updatePassword({ currentPassword: currentPw, newPassword: newPw });
      setSaved(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ?? "비밀번호 변경 중 오류가 발생했어요",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mypage-section">
      <h2 className="mypage-section-title">비밀번호 변경</h2>

      {isSocial ? (
        <div className="mypage-empty" style={{ padding: "2rem 0" }}>
          <i className="ri-kakao-talk-fill" style={{ color: "#FEE500" }} />
          <p>
            카카오 로그인 계정은
            <br />
            비밀번호를 변경할 수 없어요
          </p>
        </div>
      ) : (
        <>
          <div className="info-fields">
            <div className="info-field">
              <label>현재 비밀번호</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="현재 비밀번호 입력"
              />
            </div>
            <div className="info-field">
              <label>새 비밀번호</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="8자 이상 입력"
              />
            </div>
            <div className="info-field">
              <label>새 비밀번호 확인</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="비밀번호 재입력"
                className={confirmPw && !pwMatch ? "error" : ""}
              />
              {confirmPw && !pwMatch && (
                <p className="field-error">비밀번호가 일치하지 않아요</p>
              )}
            </div>
          </div>
          {errorMsg && (
            <p className="field-error" style={{ marginBottom: "0.75rem" }}>
              {errorMsg}
            </p>
          )}
          <button
            className="mypage-save-btn"
            onClick={handleChangePw}
            disabled={!currentPw || !newPw || !pwMatch || isLoading}
          >
            {isLoading
              ? "변경 중..."
              : saved
                ? "✓ 변경됐어요"
                : "비밀번호 변경"}
          </button>
        </>
      )}

      <hr className="mypage-divider" />

      <h2 className="mypage-section-title danger-title">회원 탈퇴</h2>
      <p className="mypage-section-desc">
        탈퇴 시 모든 데이터가 삭제되며 복구할 수 없어요.
      </p>
      {!showWithdraw ? (
        <button
          className="mypage-danger-btn"
          onClick={() => setShowWithdraw(true)}
        >
          회원 탈퇴하기
        </button>
      ) : (
        <div className="withdraw-confirm">
          <p>정말 탈퇴하시겠어요?</p>
          <div className="withdraw-buttons">
            <button
              className="withdraw-cancel"
              onClick={() => setShowWithdraw(false)}
            >
              취소
            </button>
            <button className="withdraw-ok" onClick={onWithdraw}>
              탈퇴하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 알림 탭 ────────────────────────────────────────────
function NotificationTab() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import("../apis/notificationApi").then(
      async ({ fetchNotifications, markAllAsRead }) => {
        try {
          const data = await fetchNotifications();
          // 안읽은 것 있으면 읽음 처리 후 state 업데이트
          if (data.some((n: any) => !n.isRead)) {
            await markAllAsRead();
            setNotifications(data.map((n: any) => ({ ...n, isRead: true })));
          } else {
            setNotifications(data);
          }
        } catch (_e) {
          /* 무시 */
        } finally {
          setIsLoading(false);
        }
      },
    );
  }, []);

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  if (isLoading)
    return (
      <div className="mypage-loading">
        <i className="ri-loader-4-line" /> 불러오는 중...
      </div>
    );

  return (
    <div className="mypage-section">
      <h2 className="mypage-section-title">
        알림
        {unread.length > 0 && (
          <span className="count-badge">{unread.length}</span>
        )}
      </h2>
      <p className="mypage-section-desc">
        7일 이내 알림만 표시돼요. 읽은 알림은 7일 후 자동 삭제돼요.
      </p>

      {notifications.length === 0 ? (
        <div className="mypage-empty">
          <i className="ri-notification-off-line" />
          <p>새로운 알림이 없어요</p>
        </div>
      ) : (
        <div className="notification-list">
          {unread.length > 0 && (
            <>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--primary-500)",
                  margin: "0 0 0.5rem",
                }}
              >
                새 알림 {unread.length}개
              </p>
              {unread.map((n: any) => (
                <div key={n.id} className="notification-item unread">
                  <div style={{ flex: 1 }}>
                    <p className="notification-label">{n.message}</p>
                    <p className="notification-desc">
                      {n.createdAt?.slice(0, 10)}
                    </p>
                  </div>
                  {n.policyId && (
                    <a href={`/policies/${n.policyId}`} className="bm-view-btn">
                      정책 보기
                    </a>
                  )}
                </div>
              ))}
            </>
          )}

          {read.length > 0 && (
            <>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--gray-400)",
                  margin: "1rem 0 0.5rem",
                }}
              >
                읽은 알림
              </p>
              {read.map((n: any) => (
                <div
                  key={n.id}
                  className="notification-item"
                  style={{ opacity: 0.5 }}
                >
                  <div style={{ flex: 1 }}>
                    <p className="notification-label">{n.message}</p>
                    <p className="notification-desc">
                      {n.createdAt?.slice(0, 10)}
                    </p>
                  </div>
                  {n.policyId && (
                    <a href={`/policies/${n.policyId}`} className="bm-view-btn">
                      정책 보기
                    </a>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MyPage;
