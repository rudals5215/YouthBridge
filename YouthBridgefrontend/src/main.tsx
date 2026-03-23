import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./global.css";

// StrictMode를 제거한 이유:
// 개발 모드에서 useEffect를 2번 실행시키는데,
// 카카오 인가 코드처럼 1회용 값을 처리할 때 두 번째 실행에서 오류가 남
// 배포 환경(production)에서는 StrictMode 없이도 useEffect가 1번만 실행되므로 문제없음
createRoot(document.getElementById("root")!).render(
  <App />
);
