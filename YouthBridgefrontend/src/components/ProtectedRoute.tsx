import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface Props {
  children: React.ReactNode;
  requiredRole?: "USER" | "ADMIN";
}

function ProtectedRoute({ children, requiredRole }: Props) {
  const { isLoggedIn, user } = useAuthStore();

  if (!isLoggedIn || !user) {
    alert("로그인이 필요합니다!");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
    alert("관리자가 아닙니다!");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
