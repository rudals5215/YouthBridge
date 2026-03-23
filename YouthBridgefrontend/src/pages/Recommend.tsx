import { useState } from "react";
import { Link } from "react-router-dom";
import { REGIONS, getRegionLabel } from "../constants/Regions";
import { fetchPolicies, type Policy } from "../apis/policyApi";
import "./Recommend.css";

const CATEGORIES = [
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

const AGE_RANGES = [
  { value: "19-24", label: "19 ~ 24세" },
  { value: "25-29", label: "25 ~ 29세" },
  { value: "30-34", label: "30 ~ 34세" },
  { value: "35-39", label: "35 ~ 39세" },
];

const SITUATIONS = [
  { key: "취업준비중", icon: "ri-search-eye-line", label: "취업 준비 중" },
  { key: "재직중", icon: "ri-briefcase-4-line", label: "재직 중" },
  { key: "대학(원)생", icon: "ri-graduation-cap-line", label: "대학(원)생" },
  { key: "창업준비중", icon: "ri-rocket-line", label: "창업 준비 중" },
  { key: "프리랜서", icon: "ri-computer-line", label: "프리랜서" },
  { key: "기타", icon: "ri-more-line", label: "기타" },
];

const STEPS = ["지역 선택", "연령대", "관심 분야", "나의 상황"];

const getCatMeta = (key: string) =>
  CATEGORIES.find((c) => c.key === key) ?? {
    bg: "var(--gray-100)",
    color: "var(--gray-500)",
    icon: "ri-file-list-line",
  };

function Recommend() {
  const [step, setStep] = useState(0);
  const [region, setRegion] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [situation, setSituation] = useState("");

  // 결과 상태
  const [results, setResults] = useState<Policy[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const toggleCat = (key: string) =>
    setCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );

  const canNext =
    [region !== "", ageRange !== "", categories.length > 0, situation !== ""][
      step
    ] ?? true;

  // 연령대 → 나이 중간값 변환
  const ageRangeToMidAge = (range: string): number => {
    const [min] = range.split("-").map(Number);
    return min + 2; // 예: 19-24 → 21
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }

    // 마지막 단계 → API 호출
    setIsLoading(true);
    try {
      const age = ageRange ? ageRangeToMidAge(ageRange) : undefined;
      const data = await fetchPolicies({
        region: region || undefined,
        age,
        categories: categories.length > 0 ? categories : undefined,
        size: 20,
        page: 0,
      });
      setResults(data.policies);
      setTotal(data.totalElements);
      setStep(4); // 결과 화면으로
    } catch {
      alert("추천 정책을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setRegion("");
    setAgeRange("");
    setCategories([]);
    setSituation("");
    setResults(null);
  };

  // 결과 화면으로 이동할 PolicyList URL 생성
  const toPolicyListUrl = () => {
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (categories.length > 0) params.set("category", categories.join(","));
    return `/policies?${params.toString()}`;
  };

  return (
    <div className="rc-page">
      {/* 헤더 */}
      <div className="rc-header">
        <div className="rc-header-inner">
          <h1 className="rc-header-title">맞춤 정책 추천</h1>
          <p className="rc-header-sub">
            몇 가지 질문에 답하면 나에게 맞는 정책을 찾아드려요
          </p>

          {/* 스텝 진행 바 */}
          {step < 4 && (
            <div className="rc-steps">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`rc-step ${i < step ? "done" : i === step ? "active" : ""}`}
                >
                  <div className="rc-step-circle">
                    {i < step ? <i className="ri-check-line" /> : i + 1}
                  </div>
                  <span className="rc-step-label">{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="rc-body">
        <div className="rc-card">
          {/* ── 0단계: 지역 ── */}
          {step === 0 && (
            <div className="rc-step-content">
              <h2 className="rc-step-title">거주 지역을 선택해주세요</h2>
              <div className="rc-region-grid">
                <button
                  className={`rc-region-btn ${region === "" ? "active" : ""}`}
                  onClick={() => setRegion("")}
                >
                  전국
                </button>
                {REGIONS.filter((r) => r.value !== "").map((r) => (
                  <button
                    key={r.value}
                    className={`rc-region-btn ${region === r.value ? "active" : ""}`}
                    onClick={() => setRegion(r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 1단계: 연령대 ── */}
          {step === 1 && (
            <div className="rc-step-content">
              <h2 className="rc-step-title">연령대를 선택해주세요</h2>
              <div className="rc-age-grid">
                {AGE_RANGES.map((a) => (
                  <button
                    key={a.value}
                    className={`rc-age-btn ${ageRange === a.value ? "active" : ""}`}
                    onClick={() => setAgeRange(a.value)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 2단계: 관심 분야 ── */}
          {step === 2 && (
            <div className="rc-step-content">
              <h2 className="rc-step-title">
                관심 분야를 선택해주세요{" "}
                <span className="rc-multi-hint">(복수 선택 가능)</span>
              </h2>
              <div className="rc-cat-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    className={`rc-cat-btn ${categories.includes(cat.key) ? "active" : ""}`}
                    onClick={() => toggleCat(cat.key)}
                    style={
                      categories.includes(cat.key)
                        ? {
                            background: cat.bg,
                            borderColor: cat.color,
                            color: cat.color,
                          }
                        : {}
                    }
                  >
                    <div
                      className="rc-cat-icon"
                      style={{ background: cat.bg, color: cat.color }}
                    >
                      <i className={cat.icon} />
                    </div>
                    <span>{cat.key}</span>
                    {categories.includes(cat.key) && (
                      <i
                        className="ri-check-line rc-cat-check"
                        style={{ color: cat.color }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 3단계: 상황 ── */}
          {step === 3 && (
            <div className="rc-step-content">
              <h2 className="rc-step-title">현재 나의 상황은?</h2>
              <div className="rc-situation-grid">
                {SITUATIONS.map((s) => (
                  <button
                    key={s.key}
                    className={`rc-situation-btn ${situation === s.key ? "active" : ""}`}
                    onClick={() => setSituation(s.key)}
                  >
                    <i className={s.icon} />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 4단계: 결과 ── */}
          {step === 4 && (
            <div className="rc-result">
              <div className="rc-result-header">
                <div>
                  <h2 className="rc-result-title">
                    <i className="ri-magic-line" /> 추천 정책 {total}개를
                    찾았어요!
                  </h2>
                  <div className="rc-result-tags">
                    {region && (
                      <span className="rc-tag">
                        <i className="ri-map-pin-line" />{" "}
                        {getRegionLabel(region)}
                      </span>
                    )}
                    {ageRange && (
                      <span className="rc-tag">
                        <i className="ri-user-line" />{" "}
                        {AGE_RANGES.find((a) => a.value === ageRange)?.label}
                      </span>
                    )}
                    {categories.map((c) => (
                      <span
                        key={c}
                        className="rc-tag"
                        style={{
                          color: getCatMeta(c).color,
                          background: getCatMeta(c).bg,
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rc-result-actions">
                  <button className="rc-reset-btn" onClick={handleReset}>
                    <i className="ri-refresh-line" /> 다시 추천받기
                  </button>
                  <Link to={toPolicyListUrl()} className="rc-more-btn">
                    전체 목록에서 더 보기 <i className="ri-arrow-right-line" />
                  </Link>
                </div>
              </div>

              {results && results.length > 0 ? (
                <div className="rc-result-list">
                  {results.map((policy) => {
                    const meta = getCatMeta(policy.category);
                    return (
                      <Link
                        key={policy.id}
                        to={`/policies/${policy.id}`}
                        className="rc-result-card"
                      >
                        <div
                          className="rc-result-card-left"
                          style={{ background: meta.bg }}
                        >
                          <div
                            className="rc-result-icon"
                            style={{
                              background: `${meta.color}20`,
                              color: meta.color,
                            }}
                          >
                            <i className={meta.icon} />
                          </div>
                        </div>
                        <div className="rc-result-card-body">
                          <div className="rc-result-card-top">
                            <h3 className="rc-result-card-title">
                              {policy.title}
                            </h3>
                            {policy.dday !== null &&
                              policy.dday !== undefined && (
                                <span className="rc-dday">
                                  <i className="ri-time-line" /> D-{policy.dday}
                                </span>
                              )}
                          </div>
                          <p className="rc-result-card-desc">
                            {policy.description}
                          </p>
                          <div className="rc-result-card-tags">
                            <span
                              style={{ color: meta.color, background: meta.bg }}
                              className="rc-tag-sm"
                            >
                              {policy.category}
                            </span>
                            <span className="rc-tag-sm">
                              {getRegionLabel(policy.region)}
                            </span>
                            {(policy.minAge || policy.maxAge) && (
                              <span className="rc-tag-sm">
                                만 {policy.minAge}~{policy.maxAge}세
                              </span>
                            )}
                          </div>
                        </div>
                        <i className="ri-arrow-right-s-line rc-result-arrow" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rc-empty">
                  <i className="ri-search-line" />
                  <p>조건에 맞는 정책이 없어요</p>
                  <button onClick={handleReset}>조건 다시 선택하기</button>
                </div>
              )}
            </div>
          )}

          {/* 이전/다음 버튼 */}
          {step < 4 && (
            <div className="rc-actions">
              {step > 0 && (
                <button
                  className="rc-btn-prev"
                  onClick={() => setStep((s) => s - 1)}
                >
                  <i className="ri-arrow-left-line" /> 이전
                </button>
              )}
              <button
                className={`rc-btn-next ${!canNext || isLoading ? "disabled" : ""}`}
                onClick={handleNext}
                disabled={!canNext || isLoading}
              >
                {isLoading ? (
                  "찾는 중..."
                ) : step === 3 ? (
                  <>
                    <i className="ri-magic-line" /> 맞춤 정책 찾기
                  </>
                ) : (
                  <>
                    다음 <i className="ri-arrow-right-line" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Recommend;
