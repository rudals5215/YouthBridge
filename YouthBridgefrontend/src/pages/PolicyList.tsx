import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { REGIONS, getRegionLabel } from "../constants/Regions";
import { usePolicies } from "../hooks/usePolicies";
import PolicyCardSkeleton from "../components/PolicyCardSkeleton";
import "./PolicyList.css";

const CATEGORIES = [
  { key: "취업지원", icon: "ri-briefcase-line",     bg: "var(--cat-job-bg)",     color: "var(--cat-job-color)" },
  { key: "주거지원", icon: "ri-home-4-line",         bg: "var(--cat-housing-bg)", color: "var(--cat-housing-color)" },
  { key: "창업지원", icon: "ri-rocket-line",         bg: "var(--cat-startup-bg)", color: "var(--cat-startup-color)" },
  { key: "교육지원", icon: "ri-graduation-cap-line", bg: "var(--cat-edu-bg)",     color: "var(--cat-edu-color)" },
  { key: "생활지원", icon: "ri-heart-line",          bg: "var(--cat-life-bg)",    color: "var(--cat-life-color)" },
  { key: "문화지원", icon: "ri-palette-line",        bg: "var(--cat-culture-bg)", color: "var(--cat-culture-color)" },
  { key: "금융지원", icon: "ri-bank-line",           bg: "var(--cat-finance-bg)", color: "var(--cat-finance-color)" },
  { key: "건강지원", icon: "ri-heart-pulse-line",    bg: "var(--cat-health-bg)",  color: "var(--cat-health-color)" },
];

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  const delta = 2;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return pages;
}

function PolicyList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const regionParam   = searchParams.get("region")    ?? "";
  const ageParam      = searchParams.get("age")        ?? "";
  const categoryParam = searchParams.get("category")   ?? "";
  const keywordParam  = searchParams.get("keyword")    ?? "";

  const [keyword, setKeyword]           = useState(keywordParam);
  const [selectedRegion, setSelectedRegion] = useState(regionParam);
  const [selectedAge, setSelectedAge]   = useState(ageParam);
  // 카테고리 중복 선택 — string[] 로 변경
  const [selectedCats, setSelectedCats] = useState<string[]>(
    categoryParam ? categoryParam.split(",").filter(Boolean) : []
  );
  const [sortBy, setSortBy]             = useState("latest");
  const [currentPage, setCurrentPage]   = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setSelectedRegion(regionParam); }, [regionParam]);
  useEffect(() => { setKeyword(keywordParam); }, [keywordParam]);
  useEffect(() => {
    setSelectedCats(categoryParam ? categoryParam.split(",").filter(Boolean) : []);
  }, [categoryParam]);

  // 필터 바뀌면 1페이지 리셋
  useEffect(() => { setCurrentPage(1); }, [selectedRegion, selectedAge, selectedCats.join(","), keyword]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set(key, value) : next.delete(key);
    setSearchParams(next);
  };

  const handleKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("keyword", val), 400);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    updateParam("region", e.target.value);
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedAge(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("age", val), 500);
  };

  // 카테고리 토글 — 중복 선택 지원
  const handleCat = (value: string) => {
    const next = selectedCats.includes(value)
      ? selectedCats.filter((c) => c !== value)
      : [...selectedCats, value];
    setSelectedCats(next);
    const nextParam = next.join(",");
    const params = new URLSearchParams(searchParams);
    nextParam ? params.set("category", nextParam) : params.delete("category");
    setSearchParams(params);
  };

  const resetFilters = () => {
    setKeyword(""); setSelectedRegion(""); setSelectedAge(""); setSelectedCats([]);
    setSearchParams(new URLSearchParams());
  };

  const { policies, isLoading, error, totalPages, total } = usePolicies({
    region:     selectedRegion || undefined,
    age:        selectedAge ? parseInt(selectedAge) : undefined,
    categories: selectedCats.length > 0 ? selectedCats : undefined, // 다중 카테고리
    keyword:    keyword      || undefined,
    page:       currentPage - 1,
    size:       10,
  });

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const activeFilterCount = [
    selectedRegion,
    selectedAge,
    selectedCats.length > 0 ? "cats" : "",
  ].filter(Boolean).length;

  const getCatMeta = (cat: string) =>
    CATEGORIES.find((c) => c.key === cat) ?? {
      bg: "var(--gray-100)", color: "var(--gray-500)", icon: "ri-file-list-line"
    };

  return (
    <div className="pl-page">

      {/* 헤더 */}
      <div className="pl-header">
        <div className="pl-header-inner">
          <h1 className="pl-header-title">청년 정책 목록</h1>
          <p className="pl-header-sub">
            총 <strong>{total}개</strong>의 청년 지원 정책이 있습니다
          </p>
          <form
            className="pl-search-bar"
            onSubmit={(e) => { e.preventDefault(); updateParam("keyword", keyword); }}
          >
            <div className="pl-search-input-wrap">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="정책명, 키워드 검색..."
                value={keyword}
                onChange={handleKeyword}
              />
            </div>
            <button type="submit" className="pl-search-btn">검색</button>
          </form>
        </div>
      </div>

      {/* 본문 */}
      <div className="pl-body">
        <div className="pl-body-inner">

          {/* 사이드바 */}
          <aside className="pl-sidebar">
            <div className="pl-filter-card">
              <div className="pl-filter-header">
                <span className="pl-filter-title">
                  <i className="ri-equalizer-line" /> 상세 필터
                </span>
                {activeFilterCount > 0 && (
                  <button className="pl-filter-reset" onClick={resetFilters}>초기화</button>
                )}
              </div>

              {/* 지역 select */}
              <div className="pl-filter-group">
                <label className="pl-filter-group-title">
                  <i className="ri-map-pin-line" /> 지역
                </label>
                <div className="pl-select-wrap">
                  <select value={selectedRegion} onChange={handleRegionChange}>
                    <option value="">전체</option>
                    {REGIONS.filter((r) => r.value !== "").map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <i className="ri-arrow-down-s-line" />
                </div>
              </div>

              {/* 연령 입력 */}
              <div className="pl-filter-group">
                <label className="pl-filter-group-title">
                  <i className="ri-user-line" /> 연령 <span className="pl-filter-hint">(만 나이)</span>
                </label>
                <div className="pl-age-input-wrap">
                  <input
                    type="number"
                    className={`pl-age-input ${selectedAge && (parseInt(selectedAge) < 1 || parseInt(selectedAge) > 100) ? "error" : ""}`}
                    placeholder="예) 27"
                    min={1} max={100}
                    value={selectedAge}
                    onChange={handleAgeChange}
                  />
                  {selectedAge && (
                    <button className="pl-age-clear" onClick={() => { setSelectedAge(""); updateParam("age", ""); }}>✕</button>
                  )}
                </div>
                {selectedAge && !isNaN(parseInt(selectedAge)) && (
                  <p className="pl-age-hint">만 {selectedAge}세 기준으로 필터링</p>
                )}
              </div>

              {/* 카테고리 — 중복 선택 가능 */}
              <div className="pl-filter-group">
                <div className="pl-filter-group-title">
                  <i className="ri-price-tag-3-line" /> 카테고리
                  {selectedCats.length > 0 && (
                    <span className="pl-cat-count-badge">{selectedCats.length}</span>
                  )}
                </div>
                <p className="pl-filter-hint" style={{ marginBottom: "0.5rem" }}>복수 선택 가능</p>
                <div className="pl-cat-list">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCats.includes(cat.key);
                    return (
                      <button
                        key={cat.key}
                        className={`pl-cat-btn ${isSelected ? "active" : ""}`}
                        onClick={() => handleCat(cat.key)}
                        style={isSelected
                          ? { background: cat.bg, color: cat.color, borderColor: cat.color }
                          : {}}
                      >
                        <span className="pl-cat-icon" style={{ background: cat.bg, color: cat.color }}>
                          <i className={cat.icon} />
                        </span>
                        <span>{cat.key}</span>
                        {isSelected && <i className="ri-check-line" style={{ marginLeft: "auto", fontSize: "0.75rem" }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* 목록 */}
          <main className="pl-main">
            <div className="pl-main-header">
              <div className="pl-main-count">
                <strong>{total}개</strong> 정책
                {activeFilterCount > 0 && (
                  <span className="pl-active-badge">{activeFilterCount}개 필터 적용</span>
                )}
              </div>
              <div className="pl-sort-wrap">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="latest">최신순</option>
                  <option value="deadline">마감임박순</option>
                  <option value="name">이름순</option>
                </select>
                <i className="ri-arrow-down-s-line" />
              </div>
            </div>

            <div className="pl-card-list">
              {isLoading ? (
                <PolicyCardSkeleton count={5} />
              ) : error ? (
                <div className="pl-empty">
                  <i className="ri-error-warning-line" />
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()}>다시 시도</button>
                </div>
              ) : policies.length > 0 ? (
                policies.map((policy) => {
                  const meta = getCatMeta(policy.category);
                  return (
                    <Link key={policy.id} to={`/policies/${policy.id}`} className="pl-card">
                      <div className="pl-card-left" style={{ background: meta.bg }}>
                        <div className="pl-card-icon" style={{ background: `${meta.color}20`, color: meta.color }}>
                          <i className={meta.icon} />
                        </div>
                      </div>
                      <div className="pl-card-body">
                        <div className="pl-card-top-row">
                          <h3 className="pl-card-title">{policy.title}</h3>
                          {policy.dday !== null && policy.dday !== undefined && (
                            <span className="pl-card-dday">
                              <i className="ri-time-line" /> D-{policy.dday}
                            </span>
                          )}
                        </div>
                        <p className="pl-card-desc">{policy.description}</p>
                        <div className="pl-card-tags">
                          <span className="pl-tag-cat" style={{ color: meta.color, background: meta.bg }}>
                            {policy.category}
                          </span>
                          <span className="pl-tag-region">
                            <i className="ri-map-pin-line" /> {getRegionLabel(policy.region)}
                          </span>
                          {(policy.minAge || policy.maxAge) && (
                            <span className="pl-tag-age">
                              만 {policy.minAge}~{policy.maxAge}세
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="pl-card-arrow">
                        <i className="ri-arrow-right-s-line" />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="pl-empty">
                  <i className="ri-search-line" />
                  <p>조건에 맞는 정책이 없어요</p>
                  <button onClick={resetFilters}>필터 초기화</button>
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="pl-pagination">
                <button className="pl-page-btn pl-page-arrow" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} title="처음">
                  <i className="ri-skip-left-line" />
                </button>
                <button className="pl-page-btn pl-page-arrow" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} title="이전">
                  <i className="ri-arrow-left-s-line" />
                </button>
                {pageNumbers.map((p, i) =>
                  p === "..." ? (
                    <span key={`e-${i}`} className="pl-page-ellipsis">...</span>
                  ) : (
                    <button key={p} className={`pl-page-btn ${currentPage === p ? "active" : ""}`} onClick={() => setCurrentPage(p)}>
                      {p}
                    </button>
                  )
                )}
                <button className="pl-page-btn pl-page-arrow" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} title="다음">
                  <i className="ri-arrow-right-s-line" />
                </button>
                <button className="pl-page-btn pl-page-arrow" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} title="마지막">
                  <i className="ri-skip-right-line" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default PolicyList;
