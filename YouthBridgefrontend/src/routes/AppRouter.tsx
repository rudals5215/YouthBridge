import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";
import PolicyList from "../pages/PolicyList";
import PolicyDetail from "../pages/PolicyDetail";
import Recommend from "../pages/Recommend";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import MyPage from "../pages/MyPage";
import AdminPage from "../pages/AdminPage";
import NoticePage from "../pages/NoticePage";
import KakaoCallback from "../pages/KakaoCallback";
import NotFound from "../pages/NotFound";

function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* 누구나 접근 가능 */}
        <Route path="/"             element={<Home />} />
        <Route path="/policies"     element={<PolicyList />} />
        <Route path="/policies/:id" element={<PolicyDetail />} />
        <Route path="/recommend"    element={<Recommend />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/signup"       element={<Signup />} />
        <Route path="/notices"      element={<NoticePage />} />
        <Route path="/oauth/kakao"  element={<KakaoCallback />} />

        {/* 로그인 필요 */}
        <Route path="/mypage" element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        } />

        {/* 관리자만 접근 가능 */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
