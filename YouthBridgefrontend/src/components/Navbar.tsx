import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllAsRead,
} from "../apis/notificationApi";
import type { NotificationItem } from "../apis/notificationApi";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, clearAuth } = useAuthStore();

  // 알림 상태
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    clearAuth();
    navigate("/");
    setMenuOpen(false);
  };

  // 로그인 시 안읽은 알림 수 조회
  useEffect(() => {
    if (!isLoggedIn) return; // setUnreadCount(0) 제거 — 로그아웃 시 clearAuth에서 처리
    fetchUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, [isLoggedIn, location.pathname]);

  // 알림 패널 외부 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleBellClick = async () => {
    if (!showNotif) {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
        // 읽음 처리 후 state도 isRead: true로 업데이트
        if (data.some((n) => !n.isRead)) {
          await markAllAsRead();
          setUnreadCount(0);
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }
      } catch (_e) {
        /* 알림 로드 실패 시 무시 */
      }
    }
    setShowNotif((v) => !v);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* 로고 */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          🌉 YouthBridge
        </Link>

        {/* 데스크탑 메뉴 */}
        <nav className="navbar-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            홈
          </Link>
          <Link
            to="/policies"
            className={`nav-link ${isActive("/policies") ? "active" : ""}`}
          >
            정책 목록
          </Link>
          <Link
            to="/recommend"
            className={`nav-link ${isActive("/recommend") ? "active" : ""}`}
          >
            맞춤 추천
          </Link>
        </nav>

        {/* 로그인/유저 영역 */}
        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              {/* 알림 벨 */}
              <div className="notif-wrap" ref={notifRef}>
                <button className="notif-bell" onClick={handleBellClick}>
                  <i className="ri-notification-3-line" />
                  {unreadCount > 0 && (
                    <span className="notif-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* 알림 드롭다운 */}
                {showNotif && (
                  <div className="notif-dropdown">
                    <div className="notif-dropdown-header">
                      <span>알림</span>
                      {notifications.some((n) => !n.isRead) && (
                        <span className="notif-unread-count">
                          안읽은 {notifications.filter((n) => !n.isRead).length}
                          개
                        </span>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        <i className="ri-notification-off-line" />
                        <p>7일 이내 알림이 없어요</p>
                      </div>
                    ) : (
                      <ul className="notif-list">
                        {/* 안읽은 알림 먼저 */}
                        {notifications.filter((n) => !n.isRead).length > 0 && (
                          <li className="notif-section-label">새 알림</li>
                        )}
                        {notifications
                          .filter((n) => !n.isRead)
                          .map((n) => (
                            <li
                              key={n.id}
                              className="notif-item unread"
                              onClick={() => {
                                setShowNotif(false);
                                if (n.policyId)
                                  navigate(`/policies/${n.policyId}`);
                              }}
                            >
                              <i className="ri-information-line notif-icon" />
                              <div>
                                <p className="notif-msg">{n.message}</p>
                                <p className="notif-time">
                                  {n.createdAt?.slice(0, 10)}
                                </p>
                              </div>
                            </li>
                          ))}
                        {/* 읽은 알림 */}
                        {notifications.filter((n) => n.isRead).length > 0 && (
                          <li className="notif-section-label read-label">
                            읽은 알림
                          </li>
                        )}
                        {notifications
                          .filter((n) => n.isRead)
                          .map((n) => (
                            <li
                              key={n.id}
                              className="notif-item read"
                              onClick={() => {
                                setShowNotif(false);
                                if (n.policyId)
                                  navigate(`/policies/${n.policyId}`);
                              }}
                            >
                              <i className="ri-check-line notif-icon read-icon" />
                              <div>
                                <p className="notif-msg">{n.message}</p>
                                <p className="notif-time">
                                  {n.createdAt?.slice(0, 10)}
                                </p>
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                    <div className="notif-footer">
                      <Link to="/mypage" onClick={() => setShowNotif(false)}>
                        전체 알림 보기
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 마이페이지/관리자 */}
              <Link
                to={user.role === "ADMIN" ? "/admin" : "/mypage"}
                className="btn-mypage"
              >
                <div
                  className="user-avatar"
                  style={
                    user.role === "ADMIN"
                      ? {
                          background: "rgba(0,201,177,0.2)",
                          color: "var(--primary-500)",
                        }
                      : {}
                  }
                >
                  {user.role === "ADMIN" ? (
                    <i className="ri-shield-star-line" />
                  ) : (
                    user.name[0]
                  )}
                </div>
                <span className="user-name">
                  {user.role === "ADMIN" ? "관리자" : user.name}
                </span>
              </Link>
              <button className="btn-logout" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                로그인
              </Link>
              <Link to="/signup" className="btn-signup">
                회원가입
              </Link>
            </div>
          )}
        </div>

        {/* 햄버거 버튼 (모바일) */}
        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="메뉴 열기"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* 모바일 드로어 */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link
          to="/"
          className={`mobile-link ${isActive("/") ? "active" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          홈
        </Link>
        <Link
          to="/policies"
          className={`mobile-link ${isActive("/policies") ? "active" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          정책 목록
        </Link>
        <Link
          to="/recommend"
          className={`mobile-link ${isActive("/recommend") ? "active" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          맞춤 추천
        </Link>
        {user && (
          <Link
            to={user.role === "ADMIN" ? "/admin" : "/mypage"}
            className={`mobile-link ${isActive(user.role === "ADMIN" ? "/admin" : "/mypage") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {user.role === "ADMIN" ? "관리자 페이지" : "마이페이지"}
          </Link>
        )}
        <div className="mobile-auth">
          {user ? (
            <button className="btn-logout" onClick={handleLogout}>
              로그아웃
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-login"
                onClick={() => setMenuOpen(false)}
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="btn-signup"
                onClick={() => setMenuOpen(false)}
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
