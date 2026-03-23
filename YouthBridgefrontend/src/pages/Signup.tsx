import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { REGIONS } from "../constants/regions";
import { signup } from "../apis/authApi";
import { useAuthStore } from "../stores/authStore";
import "./Auth.css";

const INTERESTS = [
  { key: "취업",  icon: "ri-briefcase-line",     color: "var(--cat-job-color)" },
  { key: "주거",  icon: "ri-home-4-line",         color: "var(--cat-housing-color)" },
  { key: "창업",  icon: "ri-rocket-line",         color: "var(--cat-startup-color)" },
  { key: "교육",  icon: "ri-graduation-cap-line", color: "var(--cat-edu-color)" },
  { key: "생활",  icon: "ri-heart-line",          color: "var(--cat-life-color)" },
  { key: "문화",  icon: "ri-palette-line",        color: "var(--cat-culture-color)" },
  { key: "금융",  icon: "ri-bank-line",           color: "var(--cat-finance-color)" },
  { key: "건강",  icon: "ri-heart-pulse-line",    color: "var(--cat-health-color)" },
];

const STEP_LABELS = ["기본 정보", "추가 정보", "가입 완료"];

function Signup() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1단계
  const [email, setEmail]     = useState("");
  const [password, setPw]     = useState("");
  const [confirmPw, setConfPw]= useState("");
  const [showPw, setShowPw]   = useState(false);

  // 2단계
  const [name, setName]       = useState("");
  const [birthYear, setBirth] = useState("");
  const [region, setRegion]   = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [agreeAll, setAgreeAll]   = useState(false);
  const [agreeTerms, setTerms]    = useState(false);
  const [agreePrivacy, setPrivacy]= useState(false);
  const [agreeMarketing, setMkt]  = useState(false);

  const toggleInterest = (key: string) =>
    setInterests((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked); setTerms(checked); setPrivacy(checked); setMkt(checked);
  };

  const pwMatch  = password === confirmPw;
  const canStep1 = email && password.length >= 8 && pwMatch;
  const canStep2 = name && birthYear && region && agreeTerms && agreePrivacy;

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // 1단계 → 2단계
    if (step === 0) { setStep(1); return; }

    // 2단계 → 실제 회원가입 API 호출
    if (step === 1) {
      setIsLoading(true);
      try {
        const response = await signup({
          email,
          password,
          name,
          birthYear: birthYear ? parseInt(birthYear) : undefined,
          region: region || undefined,
          interests: interests.length > 0 ? interests.join(",") : undefined,
        });
        setAuth(response);  // 가입 후 자동 로그인
        setStep(2);         // 완료 화면으로
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.message ?? "회원가입 중 오류가 발생했어요. 다시 시도해주세요."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-page">

      {/* 왼쪽 패널 */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link to="/" className="auth-logo">🌉 YouthBridge</Link>
          <h2 className="auth-left-title">
            지금 가입하고<br />맞춤 정책을<br />추천받으세요
          </h2>
          <p className="auth-left-desc">
            회원가입 후 나에게 맞는 청년 정책을<br />맞춤으로 추천받을 수 있어요
          </p>

          {/* 스텝 표시 */}
          <div className="signup-step-indicator">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="signup-step-item">
                <div className={`signup-step-dot ${i < step ? "done" : i === step ? "active" : ""}`}>
                  {i < step ? <i className="ri-check-line" /> : i + 1}
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`signup-step-connector ${i < step ? "done" : ""}`} />
                )}
              </div>
            ))}
          </div>
          <p className="signup-step-label">{STEP_LABELS[step]}</p>
        </div>
      </div>

      {/* 오른쪽 폼 */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* 모바일 진행 바 */}
          <div className="signup-mobile-progress">
            {STEP_LABELS.map((_, i) => (
              <div key={i} className={`signup-progress-bar ${i <= step ? "active" : ""}`} />
            ))}
          </div>

          {/* 완료 화면 */}
          {step === 2 ? (
            <div className="signup-complete">
              <div className="signup-complete-icon">
                <i className="ri-checkbox-circle-line" />
              </div>
              <h2>가입 완료!</h2>
              <p><strong>{name}</strong>님 환영합니다!<br />이제 맞춤 청년정책을 추천받아보세요.</p>
              <button className="auth-submit-btn" onClick={() => navigate("/recommend")}>
                맞춤 추천 받으러 가기
              </button>
              <button className="auth-submit-btn outline" onClick={() => navigate("/")}>
                홈으로 이동
              </button>
            </div>
          ) : (
            <>
              <h1 className="auth-form-title">회원가입</h1>
              <p className="auth-form-sub">
                이미 계정이 있으신가요? <Link to="/login" className="auth-link">로그인</Link>
              </p>

              <form onSubmit={handleNext} className="auth-form">

                {/* 1단계 */}
                {step === 0 && (
                  <>
                    <div className="auth-field">
                      <label>이메일 *</label>
                      <div className="auth-input-wrap">
                        <i className="ri-mail-line" />
                        <input type="email" placeholder="example@email.com"
                          value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label>비밀번호 *</label>
                      <div className="auth-input-wrap">
                        <i className="ri-lock-line" />
                        <input type={showPw ? "text" : "password"} placeholder="8자 이상 입력"
                          value={password} onChange={(e) => setPw(e.target.value)} required />
                        <button type="button" className="auth-pw-toggle" onClick={() => setShowPw((v) => !v)}>
                          <i className={showPw ? "ri-eye-off-line" : "ri-eye-line"} />
                        </button>
                      </div>
                    </div>
                    <div className="auth-field">
                      <label>비밀번호 확인 *</label>
                      <div className={`auth-input-wrap ${confirmPw && !pwMatch ? "error" : ""}`}>
                        <i className="ri-lock-line" />
                        <input type="password" placeholder="비밀번호 재입력"
                          value={confirmPw} onChange={(e) => setConfPw(e.target.value)} required />
                      </div>
                      {confirmPw && !pwMatch && (
                        <p className="auth-error-msg">비밀번호가 일치하지 않습니다</p>
                      )}
                    </div>
                    <button type="submit" className="auth-submit-btn" disabled={!canStep1}>
                      다음 단계
                    </button>
                  </>
                )}

                {/* 2단계 */}
                {step === 1 && (
                  <>
                    <div className="auth-field">
                      <label>이름 *</label>
                      <div className="auth-input-wrap">
                        <i className="ri-user-line" />
                        <input type="text" placeholder="실명 입력"
                          value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label>출생연도 *</label>
                      <div className="auth-input-wrap">
                        <i className="ri-cake-line" />
                        <input type="number" placeholder="예: 1998"
                          value={birthYear} onChange={(e) => setBirth(e.target.value)} required />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label>거주 지역 *</label>
                      <div className="auth-input-wrap">
                        <i className="ri-map-pin-line" />
                        <select value={region} onChange={(e) => setRegion(e.target.value)} required>
                          <option value="">지역 선택</option>
                          {REGIONS.filter((r) => r.value !== "").map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="auth-field">
                      <label>관심 분야 <span className="auth-label-hint">(복수 선택 가능)</span></label>
                      <div className="signup-interest-grid">
                        {INTERESTS.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            className={`signup-interest-btn ${interests.includes(item.key) ? "active" : ""}`}
                            onClick={() => toggleInterest(item.key)}
                          >
                            <i className={item.icon} style={{ color: item.color }} />
                            <span>{item.key}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="signup-agree-box">
                      <label className="signup-agree-all">
                        <input type="checkbox" checked={agreeAll}
                          onChange={(e) => handleAgreeAll(e.target.checked)} />
                        <span>전체 동의</span>
                      </label>
                      <div className="signup-agree-list">
                        <label><input type="checkbox" checked={agreeTerms}
                          onChange={(e) => { setTerms(e.target.checked); setAgreeAll(e.target.checked && agreePrivacy); }} />
                          이용약관 동의 (필수)</label>
                        <label><input type="checkbox" checked={agreePrivacy}
                          onChange={(e) => { setPrivacy(e.target.checked); setAgreeAll(e.target.checked && agreeTerms); }} />
                          개인정보처리방침 동의 (필수)</label>
                        <label><input type="checkbox" checked={agreeMarketing}
                          onChange={(e) => setMkt(e.target.checked)} />
                          마케팅 정보 수신 동의 (선택)</label>
                      </div>
                    </div>
                    <div className="auth-step-buttons">
                      <button type="button" className="auth-submit-btn outline" onClick={() => setStep(0)}>이전</button>
                      <button type="submit" className="auth-submit-btn" disabled={!canStep2 || isLoading}>
                        {isLoading ? "가입 중..." : "가입하기"}
                      </button>
                    </div>
                    {errorMsg && <p className="auth-error-msg">{errorMsg}</p>}
                  </>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signup;
