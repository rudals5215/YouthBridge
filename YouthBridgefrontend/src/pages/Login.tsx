import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, redirectToKakao } from "../apis/authApi";
import { useAuthStore } from "../stores/authStore";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      setAuth(response);        // 전역 상태 + localStorage에 저장
      navigate("/");            // 홈으로 이동
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ?? "이메일 또는 비밀번호가 올바르지 않아요"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* 왼쪽 패널 */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link to="/" className="auth-logo">🌉 YouthBridge</Link>
          <h2 className="auth-left-title">
            나에게 맞는<br />청년정책을<br />한눈에 확인하세요
          </h2>
          <p className="auth-left-desc">
            지역별·나이별 맞춤 청년 지원 정책<br />
            1,247개를 무료로 탐색하세요
          </p>
          <ul className="auth-left-features">
            <li><i className="ri-check-line" /> 취업·창업 지원금 최대 5,000만원</li>
            <li><i className="ri-check-line" /> 주거비 월 최대 20만원 지원</li>
            <li><i className="ri-check-line" /> 국가장학금·생활지원 한번에</li>
          </ul>
        </div>
      </div>

      {/* 오른쪽 폼 */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1 className="auth-form-title">로그인</h1>
          <p className="auth-form-sub">
            계정이 없으신가요? <Link to="/signup" className="auth-link">회원가입</Link>
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>이메일</label>
              <div className="auth-input-wrap">
                <i className="ri-mail-line" />
                <input
                  type="email" placeholder="example@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>비밀번호</label>
              <div className="auth-input-wrap">
                <i className="ri-lock-line" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="비밀번호 입력"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw((v) => !v)}>
                  <i className={showPw ? "ri-eye-off-line" : "ri-eye-line"} />
                </button>
              </div>
            </div>

            <div className="auth-remember-row">
              <label className="auth-checkbox-label">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>로그인 상태 유지</span>
              </label>
              <button type="button" className="auth-forgot">비밀번호 찾기</button>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
            {errorMsg && <p className="auth-error-msg">{errorMsg}</p>}
          </form>

          <div className="auth-divider"><span>또는 소셜 로그인</span></div>

          <div className="auth-social-list">
            <button className="auth-social-btn kakao" onClick={redirectToKakao}>
              <span className="kakao-icon">K</span>
              카카오로 계속하기
            </button>
            <button className="auth-social-btn naver" disabled>
              <span className="naver-icon">N</span>
              네이버로 계속하기 (준비 중)
            </button>
            <button className="auth-social-btn google" disabled>
              <i className="ri-google-fill" />
              Google로 계속하기 (준비 중)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
