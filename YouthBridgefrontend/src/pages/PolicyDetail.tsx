import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { usePolicyById } from "../hooks/usePolicies";
import { getRegionLabel } from "../constants/Regions";
import {
  addBookmark,
  removeBookmark,
  checkBookmark,
} from "../apis/bookmarkApi";
import { useAuthStore } from "../stores/authStore";
import "./PolicyDetail.css";

// 카테고리별 색상 매핑
const CATEGORY_META: Record<
  string,
  { bg: string; color: string; icon: string }
> = {
  취업지원: {
    bg: "var(--cat-job-bg)",
    color: "var(--cat-job-color)",
    icon: "ri-briefcase-line",
  },
  주거지원: {
    bg: "var(--cat-housing-bg)",
    color: "var(--cat-housing-color)",
    icon: "ri-home-4-line",
  },
  창업지원: {
    bg: "var(--cat-startup-bg)",
    color: "var(--cat-startup-color)",
    icon: "ri-rocket-line",
  },
  교육지원: {
    bg: "var(--cat-edu-bg)",
    color: "var(--cat-edu-color)",
    icon: "ri-graduation-cap-line",
  },
  생활지원: {
    bg: "var(--cat-life-bg)",
    color: "var(--cat-life-color)",
    icon: "ri-heart-line",
  },
  문화지원: {
    bg: "var(--cat-culture-bg)",
    color: "var(--cat-culture-color)",
    icon: "ri-palette-line",
  },
  금융지원: {
    bg: "var(--cat-finance-bg)",
    color: "var(--cat-finance-color)",
    icon: "ri-bank-line",
  },
  건강지원: {
    bg: "var(--cat-health-bg)",
    color: "var(--cat-health-color)",
    icon: "ri-heart-pulse-line",
  },
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "접수중",
  UPCOMING: "접수 예정",
  CLOSED: "마감",
};

function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const { policy, isLoading, error } = usePolicyById(id ?? "");
  const { isLoggedIn } = useAuthStore();

  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // 로그인 상태면 즐겨찾기 여부 확인
  useEffect(() => {
    if (!isLoggedIn || !id) return;
    checkBookmark(Number(id))
      .then(setBookmarked)
      .catch(() => {}); // 에러 무시
  }, [id, isLoggedIn]);

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능이에요");
      return;
    }
    setBookmarkLoading(true);
    try {
      if (bookmarked) {
        await removeBookmark(Number(id));
        setBookmarked(false);
      } else {
        await addBookmark(Number(id));
        setBookmarked(true);
      }
    } catch {
      alert("잠시 후 다시 시도해주세요");
    } finally {
      setBookmarkLoading(false);
    }
  };

  // ── 로딩 상태 ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="policy-detail-page">
        <div className="detail-container">
          <div className="detail-skeleton">
            <div className="skeleton-line w60" />
            <div className="skeleton-line w40" />
            <div className="skeleton-line w80" />
            <div className="skeleton-line w100" />
          </div>
        </div>
      </div>
    );
  }

  // ── 에러 / 404 ───────────────────────────────────────
  if (error || !policy) {
    return (
      <div className="policy-detail-page">
        <div className="not-found">
          <i className="ri-error-warning-line" />
          <p>😢 정책 정보를 찾을 수 없어요.</p>
          <Link to="/policies">← 목록으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  const regionLabel = getRegionLabel(policy.region);
  const meta = CATEGORY_META[policy.category] ?? {
    bg: "var(--gray-100)",
    color: "var(--gray-500)",
    icon: "ri-file-list-line",
  };

  // ── CLOSED 정책 차단 화면 ─────────────────────────────
  if (policy.status === "CLOSED" || policy.expired) {
    return (
      <div className="policy-detail-page">
        <div className="detail-container">
          <Link to="/policies" className="back-link">
            <i className="ri-arrow-left-line" /> 목록으로
          </Link>
          <div className="detail-closed-banner">
            <div className="closed-icon">
              <i className="ri-time-line" />
            </div>
            <h2>마감된 공고예요</h2>
            <p>
              <strong>{policy.title}</strong>의 신청 기간이 종료됐어요.
            </p>
            {policy.applyEndDate && (
              <p className="closed-date">마감일: {policy.applyEndDate}</p>
            )}
            <div className="closed-actions">
              <Link to="/policies" className="btn-go-list">
                <i className="ri-search-line" /> 다른 정책 찾기
              </Link>
              <Link to="/recommend" className="btn-go-recommend">
                <i className="ri-magic-line" /> 맞춤 정책 추천받기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="policy-detail-page">
      <div className="detail-container">
        {/* 뒤로가기 */}
        <Link to="/policies" className="back-link">
          <i className="ri-arrow-left-line" /> 목록으로
        </Link>

        {/* 헤더 */}
        <header className="detail-header">
          <div className="detail-icon-wrap" style={{ background: meta.bg }}>
            <div
              className="detail-icon"
              style={{ background: `${meta.color}20`, color: meta.color }}
            >
              <i className={meta.icon} />
            </div>
          </div>

          <div className="detail-badges">
            <span
              className="badge badge-category"
              style={{ color: meta.color, background: meta.bg }}
            >
              {policy.category}
            </span>
            <span className="badge badge-region">{regionLabel}</span>
            <span
              className={`badge badge-status ${policy.status.toLowerCase()}`}
            >
              {STATUS_LABEL[policy.status] ?? policy.status}
            </span>
            {policy.dday !== null &&
              policy.dday !== undefined &&
              !policy.expired && (
                <span className="badge badge-dday">D-{policy.dday}</span>
              )}
            {policy.expired && (
              <span className="badge badge-expired">마감</span>
            )}
          </div>

          <h1 className="detail-title">{policy.title}</h1>
          {policy.organization && (
            <p className="detail-org">
              <i className="ri-government-line" /> {policy.organization}
            </p>
          )}
          {(policy.applyStartDate || policy.applyEndDate) && (
            <p className="detail-period">
              <i className="ri-calendar-line" />
              {policy.applyStartDate ?? "?"} ~ {policy.applyEndDate ?? "상시"}
            </p>
          )}
        </header>

        {/* 본문 */}
        <section className="detail-content">
          <div className="detail-section">
            <h2>지원 대상</h2>
            <p>
              {policy.minAge && policy.maxAge
                ? `만 ${policy.minAge}세 ~ ${policy.maxAge}세 청년`
                : policy.minAge
                  ? `만 ${policy.minAge}세 이상 청년`
                  : policy.maxAge
                    ? `만 ${policy.maxAge}세 이하 청년`
                    : "청년 누구나"}
              {policy.region !== "all" && ` (${regionLabel} 거주)`}
            </p>
          </div>

          <div className="detail-section">
            <h2>지원 내용</h2>
            <p>{policy.description}</p>
          </div>

          {policy.content && (
            <div className="detail-section">
              <h2>상세 내용</h2>
              <p className="detail-content-text">{policy.content}</p>
            </div>
          )}

          <div className="detail-section">
            <h2>신청 방법</h2>
            <p>온라인 신청 — 아래 신청 사이트로 이동해주세요</p>
          </div>
        </section>

        {/* 하단 버튼 */}
        <footer className="detail-actions">
          <button
            className={`btn-save ${bookmarked ? "active" : ""}`}
            onClick={handleBookmark}
            disabled={bookmarkLoading}
          >
            <i
              className={bookmarked ? "ri-bookmark-fill" : "ri-bookmark-line"}
            />
            {bookmarked ? "저장됨" : "관심 정책 저장"}
          </button>
          {policy.applyUrl ? (
            <a
              href={policy.applyUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-apply"
            >
              신청 사이트로 이동 <i className="ri-external-link-line" />
            </a>
          ) : (
            <button className="btn-apply disabled" disabled>
              <i className="ri-information-line" /> 별도 신청 없음 (기관 문의)
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default PolicyDetail;
