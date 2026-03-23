import { Link, useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <p className="notfound-code">404</p>
        <h1 className="notfound-title">페이지를 찾을 수 없어요</h1>
        <p className="notfound-desc">
          주소가 잘못되었거나 삭제된 페이지예요.
        </p>
        <div className="notfound-actions">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← 이전 페이지
          </button>
          <Link to="/" className="btn-home">
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
