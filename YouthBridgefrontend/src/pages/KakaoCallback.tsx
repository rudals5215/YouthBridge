import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { kakaoLogin } from "../apis/authApi";
import { useAuthStore } from "../stores/authStore";
import "./KakaoCallback.css";

function KakaoCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = useState("");

  // 이미 처리 중인지 체크 — StrictMode나 리렌더로 인한 중복 실행 방지
  // useRef는 값이 바뀌어도 리렌더가 일어나지 않아요
  const isProcessing = useRef(false);

  useEffect(() => {
    // 이미 처리 중이면 무시
    if (isProcessing.current) return;
    isProcessing.current = true;

    const code = searchParams.get("code");

    if (!code) {
      setErrorMsg("인가 코드가 없어요. 다시 시도해주세요.");
      return;
    }

    kakaoLogin(code)
      .then((response) => {
        setAuth(response);
        navigate("/");
      })
      .catch((err) => {
        console.error("[KakaoCallback] 로그인 실패:", err);
        setErrorMsg("카카오 로그인에 실패했어요. 다시 시도해주세요.");
        isProcessing.current = false; // 실패 시 재시도 가능하게 초기화
      });
  }, []);

  if (errorMsg) {
    return (
      <div className="kakao-callback">
        <div className="callback-box error">
          <i className="ri-error-warning-line" />
          <p>{errorMsg}</p>
          <button onClick={() => navigate("/login")}>로그인으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="kakao-callback">
      <div className="callback-box">
        <div className="kakao-spinner" />
        <p>카카오 로그인 처리 중이에요...</p>
      </div>
    </div>
  );
}

export default KakaoCallback;
