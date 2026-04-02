import { Link } from "react-router-dom";
import "./AboutPage.css";

function AboutPage() {
  return (
    <div className="about-page">

      {/* 헤더 */}
      <div className="about-header">
        <div className="about-header-inner">
          <h1>🌉 YouthBridge 소개</h1>
          <p>청년의 더 나은 내일을 위한 정책 정보 플랫폼</p>
        </div>
      </div>

      <div className="about-body">

        {/* 서비스 소개 */}
        <section className="about-section">
          <h2>왜 YouthBridge인가요?</h2>
          <p>
            정부와 지자체에서 제공하는 청년 지원 정책은 많지만,
            정보가 여러 사이트에 흩어져 있어 정작 혜택을 받을 수 있는 사람들이
            놓치는 경우가 많습니다.
          </p>
          <p>
            YouthBridge는 이 문제를 해결하기 위해 <strong>공공데이터포털의 청년 정책 데이터를
            자동으로 수집하고, 지역·나이·관심 분야 기반으로 맞춤 정책을 추천</strong>하는
            서비스입니다.
          </p>
        </section>

        {/* 주요 기능 */}
        <section className="about-section">
          <h2>주요 기능</h2>
          <div className="about-features">
            {[
              { icon: "ri-search-line",        color: "var(--cat-job-color)",     bg: "var(--cat-job-bg)",     title: "정책 통합 검색", desc: "지역, 나이, 카테고리, 키워드로 원하는 정책을 빠르게 찾아보세요" },
              { icon: "ri-magic-line",         color: "var(--cat-housing-color)", bg: "var(--cat-housing-bg)", title: "맞춤 정책 추천", desc: "거주 지역과 나이, 관심 분야를 입력하면 나에게 맞는 정책을 추천해드려요" },
              { icon: "ri-bookmark-line",      color: "var(--cat-edu-color)",     bg: "var(--cat-edu-bg)",     title: "즐겨찾기", desc: "관심 있는 정책을 저장하고 마감 3일 전 알림을 받아보세요" },
              { icon: "ri-notification-line",  color: "var(--cat-startup-color)", bg: "var(--cat-startup-bg)", title: "인앱 알림", desc: "새 정책 등록, 마감 임박 등 중요한 소식을 놓치지 마세요" },
            ].map((f) => (
              <div key={f.title} className="about-feature-card">
                <div className="about-feature-icon" style={{ background: f.bg, color: f.color }}>
                  <i className={f.icon} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 기술 스택 */}
        <section className="about-section">
          <h2>기술 스택</h2>
          <div className="about-stacks">
            {[
              { label: "Frontend", items: ["React", "TypeScript", "Zustand", "Vite"] },
              { label: "Backend",  items: ["Spring Boot", "Java 17", "JPA", "JWT"] },
              { label: "Database", items: ["MariaDB"] },
              { label: "Data",     items: ["온통청년 OpenAPI", "스케줄러 자동 수집"] },
            ].map((stack) => (
              <div key={stack.label} className="about-stack">
                <h4>{stack.label}</h4>
                <div className="stack-items">
                  {stack.items.map((item) => (
                    <span key={item} className="stack-badge">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <h2>지금 바로 청년 정책을 찾아보세요</h2>
          <div className="about-cta-btns">
            <Link to="/policies" className="cta-btn-primary">
              <i className="ri-search-line" /> 정책 목록 보기
            </Link>
            <Link to="/recommend" className="cta-btn-secondary">
              <i className="ri-magic-line" /> 맞춤 추천 받기
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

export default AboutPage;
