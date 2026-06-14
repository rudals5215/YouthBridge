import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchHomeStats, type HomeStats } from "../apis/homeApi";
import { fetchPolicies, type Policy } from "../apis/policyApi";
import { getRegionLabel } from "../constants/Regions";
import "./Home.css";

const CATEGORIES = [
  {
    key: "취업지원",
    icon: "ri-briefcase-line",
    bg: "var(--cat-job-bg)",
    color: "var(--cat-job-color)",
  },
  {
    key: "주거지원",
    icon: "ri-home-4-line",
    bg: "var(--cat-housing-bg)",
    color: "var(--cat-housing-color)",
  },
  {
    key: "창업지원",
    icon: "ri-rocket-line",
    bg: "var(--cat-startup-bg)",
    color: "var(--cat-startup-color)",
  },
  {
    key: "교육지원",
    icon: "ri-graduation-cap-line",
    bg: "var(--cat-edu-bg)",
    color: "var(--cat-edu-color)",
  },
  {
    key: "생활지원",
    icon: "ri-heart-line",
    bg: "var(--cat-life-bg)",
    color: "var(--cat-life-color)",
  },
  {
    key: "문화지원",
    icon: "ri-palette-line",
    bg: "var(--cat-culture-bg)",
    color: "var(--cat-culture-color)",
  },
  {
    key: "금융지원",
    icon: "ri-bank-line",
    bg: "var(--cat-finance-bg)",
    color: "var(--cat-finance-color)",
  },
  {
    key: "건강지원",
    icon: "ri-heart-pulse-line",
    bg: "var(--cat-health-bg)",
    color: "var(--cat-health-color)",
  },
];

// 지역별 배경 이미지
const REGION_IMAGES: Record<string, string> = {
  // 서울: 청계천
  seoul:
    "https://images.unsplash.com/photo-1601621915196-2621bfb0cd6e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8JUVDJTg0JTlDJUVDJTlBJUI4fGVufDB8fDB8fHww",

  // 경기: 수원 화성
  gyeonggi:
    "https://images.unsplash.com/photo-1673201069831-b54f304484e2?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8JUVDJTg4JTk4JUVDJTlCJTkwfGVufDB8fDB8fHww",

  // 부산: 광안대교
  busan:
    "https://images.unsplash.com/photo-1702040093537-b8c34eaa0f5c?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fCVFQiVCNiU4MCVFQyU4MiVCMHxlbnwwfHwwfHx8MA%3D%3D",

  // 인천: 송도 센트럴파크 야경
  incheon:
    "https://images.unsplash.com/photo-1675135531731-609e26ada232?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8JUVDJTlEJUI4JUVDJUIyJTlDfGVufDB8fDB8fHww",

  // 대구: 대구 수성못
  daegu:
    "https://www.telltrip.com/wp-content/uploads/2026/03/daegu-suseongmot-lake-cherry-blossom-tour5.webp",

  // 대전: 대전 엑스포 과학공원 한빛탑 전경
  daejeon:
    "https://cdn.cctoday.co.kr/news/photo/202308/2182496_619426_4256.jpg",

  // 광주: 광주 무등산
  gwangju:
    "https://i.namu.wiki/i/v2LP0GxoRvJfgjYbpLQMD2zosiWnpglgLApuK1zFkJMafLaA9CFUwAwIIuPOZAL6TTdp8rVwvDX5M_cqQNLo-g.webp",

  // 울산: 울산 산업단지 야경
  ulsan:
    "https://search.pstatic.net/sunny/?src=https%3A%2F%2Ft1.daumcdn.net%2Fcafeattach%2F1LBcw%2F86567620368afcc4b60d78a4112c145a4dce9f32&type=sc960_832",
};

const POPULAR_KEYWORDS = [
  "월세지원",
  "취업지원금",
  "청년도약계좌",
  "창업자금",
  "장학금",
];

// 카테고리 메타 정보 찾기
const getCatMeta = (category: string) =>
  CATEGORIES.find((c) => c.key === category) ?? {
    bg: "var(--gray-100)",
    color: "var(--gray-500)",
    icon: "ri-file-list-line",
  };

function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [category, setCategory] = useState("");

  const [stats, setStats] = useState<HomeStats | null>(null);
  const [latestPolicies, setLatestPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    // 홈 통계 + 최신 정책 병렬 호출
    Promise.all([fetchHomeStats(), fetchPolicies({ size: 4, page: 0 })])
      .then(([statsData, policyData]) => {
        setStats(statsData);
        setLatestPolicies(policyData.policies);
      })
      .catch(() => {});
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (region) params.set("region", region);
    if (category) params.set("category", category);
    navigate(`/policies?${params.toString()}`);
  };

  // 지역별 정책 — 서울, 경기, 부산, 인천 고정
  const FIXED_REGIONS = [
    { value: "seoul", label: "서울" },
    { value: "gyeonggi", label: "경기" },
    { value: "busan", label: "부산" },
    { value: "incheon", label: "인천" },
  ];

  return (
    <div className="home-container">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-badge">
            <i className="ri-fire-line" />
            {stats
              ? `${stats.totalPolicies.toLocaleString()}개의 청년 지원 정책`
              : "최신 청년 지원 정책"}
            이 등록되어 있어요
          </span>
          <h1 className="hero-title">
            나에게 딱 맞는
            <br />
            <span className="hero-point">청년정책</span>을 찾아보세요
          </h1>
          <p className="hero-desc">
            지역별·나이별 맞춤 청년 지원 정책을 한눈에 탐색하고 혜택을
            누려보세요
          </p>

          <div className="search-box">
            <div className="search-input-wrap">
              <i className="ri-search-line search-input-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="정책명, 키워드로 검색하세요 (예: 월세지원, 취업, 창업)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="search-selects">
              <div className="select-wrap">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="">📍 지역 선택</option>
                  <option value="seoul">서울</option>
                  <option value="busan">부산</option>
                  <option value="gyeonggi">경기</option>
                  <option value="incheon">인천</option>
                  <option value="daegu">대구</option>
                  <option value="daejeon">대전</option>
                  <option value="gwangju">광주</option>
                  <option value="ulsan">울산</option>
                  <option value="sejong">세종</option>
                  <option value="gangwon">강원</option>
                  <option value="chungbuk">충북</option>
                  <option value="chungnam">충남</option>
                  <option value="jeonbuk">전북</option>
                  <option value="jeonnam">전남</option>
                  <option value="gyeongbuk">경북</option>
                  <option value="gyeongnam">경남</option>
                  <option value="jeju">제주</option>
                </select>
                <i className="ri-arrow-down-s-line select-arrow" />
              </div>
              <div className="select-wrap">
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                >
                  <option value="">👤 연령대 선택</option>
                  <option value="19-24">19~24세</option>
                  <option value="25-29">25~29세</option>
                  <option value="30-34">30~34세</option>
                  <option value="35-39">35~39세</option>
                </select>
                <i className="ri-arrow-down-s-line select-arrow" />
              </div>
              <div className="select-wrap">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">🏷️ 카테고리</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.key}
                    </option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line select-arrow" />
              </div>
            </div>
            <button className="search-btn" onClick={handleSearch}>
              <i className="ri-search-line" /> 정책 찾기
            </button>
          </div>

          <div className="popular-keywords">
            <span className="popular-label">인기 검색:</span>
            {POPULAR_KEYWORDS.map((kw) => (
              <button
                key={kw}
                className="keyword-tag"
                onClick={() => {
                  setKeyword(kw);
                  navigate(`/policies?keyword=${kw}`);
                }}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 통계 바 ── */}
      <section className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-icon">
              <i className="ri-file-list-3-line" />
            </div>
            <div>
              <div className="stat-number">
                {stats ? stats.totalPolicies.toLocaleString() : "—"}
                <span className="stat-unit">개</span>
              </div>
              <div className="stat-label">등록된 정책</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <i className="ri-user-heart-line" />
            </div>
            <div>
              <div className="stat-number">
                {stats ? stats.totalUsers.toLocaleString() : "—"}
                <span className="stat-unit">명</span>
              </div>
              <div className="stat-label">누적 이용자</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <i className="ri-map-pin-line" />
            </div>
            <div>
              <div className="stat-number">
                17<span className="stat-unit">개</span>
              </div>
              <div className="stat-label">지원 지역</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <i className="ri-price-tag-3-line" />
            </div>
            <div>
              <div className="stat-number">
                8<span className="stat-unit">개</span>
              </div>
              <div className="stat-label">지원 카테고리</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 인기 카테고리 ── */}
      <section className="section bg-white">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">인기 카테고리</h2>
              <p className="section-desc">
                관심 분야를 선택해 관련 정책을 빠르게 찾아보세요
              </p>
            </div>
            <Link to="/policies" className="section-more">
              전체보기 <i className="ri-arrow-right-line" />
            </Link>
          </div>
          <div className="category-grid">
            {CATEGORIES.map((cat) => {
              const count = stats?.categoryCount?.[cat.key] ?? 0;
              return (
                <Link
                  key={cat.key}
                  to={`/policies?category=${cat.key}`}
                  className="category-card"
                  style={{ background: cat.bg }}
                >
                  <div
                    className="category-card-icon"
                    style={{ background: `${cat.color}20`, color: cat.color }}
                  >
                    <i className={cat.icon} />
                  </div>
                  <p className="category-card-name">{cat.key}</p>
                  <p className="category-card-count">
                    {count > 0 ? `${count}개` : "—"}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 최신 정책 ── */}
      <section className="section" style={{ background: "var(--gray-50)" }}>
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">최신 추천 정책</h2>
              <p className="section-desc">
                지금 바로 신청 가능한 정책들을 확인하세요
              </p>
            </div>
            <Link to="/policies" className="section-more">
              전체 정책 보기 <i className="ri-arrow-right-line" />
            </Link>
          </div>
          <div className="featured-grid">
            {latestPolicies.length > 0
              ? latestPolicies.map((policy) => {
                  const meta = getCatMeta(policy.category);
                  return (
                    <Link
                      key={policy.id}
                      to={`/policies/${policy.id}`}
                      className="featured-card"
                    >
                      <div
                        className="featured-card-top"
                        style={{ background: meta.bg }}
                      >
                        <div
                          className="featured-card-icon"
                          style={{
                            background: `${meta.color}20`,
                            color: meta.color,
                          }}
                        >
                          <i className={meta.icon} />
                        </div>
                        {!policy.expired &&
                          policy.dday !== null &&
                          policy.dday !== undefined &&
                          policy.dday <= 7 && (
                            <span className="badge-new">마감임박</span>
                          )}
                      </div>
                      <div className="featured-card-body">
                        <h3 className="featured-card-title">{policy.title}</h3>
                        <p className="featured-card-desc">
                          {policy.description}
                        </p>
                        <div className="featured-card-footer">
                          <div className="featured-card-tags">
                            <span
                              className="tag-category"
                              style={{ color: meta.color, background: meta.bg }}
                            >
                              {policy.category}
                            </span>
                            <span className="tag-region">
                              {getRegionLabel(policy.region)}
                            </span>
                          </div>
                          {policy.dday !== null &&
                            policy.dday !== undefined && (
                              <span className="tag-dday">
                                <i className="ri-time-line" /> D-{policy.dday}
                              </span>
                            )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              : // 로딩 중 스켈레톤
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="featured-card skeleton">
                    <div className="featured-card-top skeleton-box" />
                    <div className="featured-card-body">
                      <div
                        className="skeleton-line w80"
                        style={{ height: "16px", marginBottom: "8px" }}
                      />
                      <div
                        className="skeleton-line w100"
                        style={{ height: "12px", marginBottom: "4px" }}
                      />
                      <div
                        className="skeleton-line w60"
                        style={{ height: "12px" }}
                      />
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ── AI 맞춤 추천 CTA ── */}
      <section className="section bg-white">
        <div className="section-inner">
          <div className="cta-banner">
            <div className="cta-left">
              <span className="cta-badge">
                <i className="ri-magic-line" /> AI 맞춤 추천 서비스
              </span>
              <h2 className="cta-title">
                나에게 딱 맞는 정책을
                <br />
                추천받으세요
              </h2>
              <p className="cta-desc">
                거주 지역, 나이, 관심 분야를 입력하면
                <br />
                AI가 최적의 청년 정책을 맞춤 추천해 드립니다
              </p>
              <Link to="/recommend" className="cta-btn">
                맞춤 추천 받기 <i className="ri-arrow-right-line" />
              </Link>
            </div>
            <div className="cta-right">
              <div className="cta-features">
                {[
                  {
                    icon: "ri-map-pin-line",
                    color: "var(--cat-housing-color)",
                    bg: "var(--cat-housing-bg)",
                    title: "지역별 정책",
                    desc: "거주 지역에 맞는 지자체 지원 정책을 찾아보세요",
                  },
                  {
                    icon: "ri-user-line",
                    color: "var(--cat-finance-color)",
                    bg: "var(--cat-finance-bg)",
                    title: "나이별 정책",
                    desc: "현재 나이에 맞는 조건의 정책만 필터링해 드려요",
                  },
                  {
                    icon: "ri-notification-line",
                    color: "var(--cat-job-color)",
                    bg: "var(--cat-job-bg)",
                    title: "마감 알림",
                    desc: "북마크한 정책의 신청 마감을 미리 알려드려요",
                  },
                ].map((f) => (
                  <div key={f.title} className="cta-feature-item">
                    <div
                      className="cta-feature-icon"
                      style={{ background: f.bg, color: f.color }}
                    >
                      <i className={f.icon} />
                    </div>
                    <div>
                      <p className="cta-feature-title">{f.title}</p>
                      <p className="cta-feature-desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 지역별 인기 정책 ── */}
      <section className="section" style={{ background: "var(--gray-50)" }}>
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">지역별 인기 정책</h2>
              <p className="section-desc">
                거주 지역을 선택해 해당 지역의 맞춤 정책을 확인하세요
              </p>
            </div>
            <Link to="/policies" className="section-more">
              전체 지역 보기 <i className="ri-arrow-right-line" />
            </Link>
          </div>
          <div className="region-grid">
            {FIXED_REGIONS.map((r) => {
              const count =
                stats?.regionCount?.[r.value] ||
                stats?.regionCount?.[r.value.toUpperCase()] ||
                stats?.regionCount?.[r.label];

              // 💡 r.value가 대문자(SEOUL)든 소문자(seoul)든 무조건 소문자로 바꿔서 이미지 주소를 매칭합니다.
              const regionKey = r.value.toLowerCase();
              const imageUrl = REGION_IMAGES[regionKey];

              return (
                <Link
                  key={r.value}
                  to={`/policies?region=${r.value}`}
                  className="region-card"
                >
                  {/* 💡 imageUrl이 존재할 때만 렌더링 */}
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={r.label}
                      className="region-card-img"
                      onError={(e) => {
                        // 💡 404 에러 시 숨기지 말고, 기본 플레이스홀더 이미지로 대체해서 엑박/까만 화면을 방지합니다.
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&q=80";
                      }}
                    />
                  )}
                  <div className="region-card-overlay" />
                  <div className="region-card-body">
                    <span className="region-card-name">{r.label}</span>
                    <span className="region-card-count">
                      {count ? `${count}개` : "—"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                🌉 YouthBridge
              </Link>
              <p className="footer-brand-desc">
                청년의 더 나은 내일을 위한
                <br />
                정책 정보 플랫폼
              </p>
              <div className="footer-socials">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social"
                >
                  <i className="ri-instagram-line" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social"
                >
                  <i className="ri-youtube-line" />
                </a>
                <a
                  href="https://pf.kakao.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social"
                >
                  <i className="ri-kakao-talk-line" />
                </a>
              </div>
            </div>
            <div className="footer-links">
              <h4>서비스</h4>
              <ul>
                <li>
                  <Link to="/policies">정책목록</Link>
                </li>
                <li>
                  <Link to="/recommend">맞춤추천</Link>
                </li>
                <li>
                  <Link to="/mypage">마이페이지</Link>
                </li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>카테고리</h4>
              <ul>
                <li>
                  <Link to="/policies?category=취업지원">취업지원</Link>
                </li>
                <li>
                  <Link to="/policies?category=주거지원">주거지원</Link>
                </li>
                <li>
                  <Link to="/policies?category=창업지원">창업지원</Link>
                </li>
                <li>
                  <Link to="/policies?category=교육지원">교육지원</Link>
                </li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>고객지원</h4>
              <ul>
                <li>
                  <Link to="/notices">공지사항</Link>
                </li>
                <li>
                  <Link to="/contact">문의하기</Link>
                </li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>회사정보</h4>
              <ul>
                <li>
                  <Link to="/about">서비스 소개</Link>
                </li>
                <li>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "0.875rem",
                    }}
                  >
                    이용약관 (준비 중)
                  </span>
                </li>
                <li>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "0.875rem",
                    }}
                  >
                    개인정보처리방침 (준비 중)
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 YouthBridge. All rights reserved.</p>
            <p>
              본 사이트의 정책 정보는 각 기관의 공식 발표를 기반으로 합니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
