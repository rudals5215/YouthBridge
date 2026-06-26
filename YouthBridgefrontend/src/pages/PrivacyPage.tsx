import "./PrivacyPage.css";

function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <div className="legal-header-inner">
          <h1>개인정보처리방침</h1>
          <p>최종 업데이트: 2026년 4월</p>
        </div>
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <h2>1. 수집하는 개인정보 항목</h2>
          <p>YouthBridge는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
          <ul>
            <li><strong>회원가입 시:</strong> 이메일 주소, 비밀번호(암호화 저장), 이름</li>
            <li><strong>카카오 소셜 로그인 시:</strong> 카카오 계정 이메일, 닉네임</li>
            <li><strong>서비스 이용 시:</strong> 관심 분야, 즐겨찾기한 정책, 서비스 이용 기록</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>2. 개인정보 수집 및 이용 목적</h2>
          <ul>
            <li>회원 가입 및 본인 확인</li>
            <li>맞춤형 청년 정책 추천 서비스 제공</li>
            <li>즐겨찾기 및 알림 기능 제공</li>
            <li>서비스 개선을 위한 통계 분석</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. 개인정보 보유 및 이용 기간</h2>
          <p>회원 탈퇴 시 즉시 삭제됩니다. 단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
          <ul>
            <li>소비자 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래법)</li>
            <li>접속에 관한 기록: 3개월 (통신비밀보호법)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. 개인정보의 제3자 제공</h2>
          <p>YouthBridge는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우는 예외입니다.</p>
          <ul>
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. 개인정보 보호를 위한 기술적 조치</h2>
          <ul>
            <li>비밀번호는 BCrypt 알고리즘으로 암호화하여 저장</li>
            <li>JWT 토큰을 활용한 인증 처리</li>
            <li>HTTPS를 통한 데이터 암호화 전송</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. 이용자의 권리</h2>
          <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다.</p>
          <ul>
            <li>마이페이지에서 직접 정보 수정 및 탈퇴 가능</li>
            <li>이메일 문의: support@youthbridge.com</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. 쿠키 및 광고</h2>
          <p>YouthBridge는 Google AdSense를 통한 광고를 제공할 수 있습니다. Google은 쿠키를 사용하여 광고를 게재하며, 이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer">Google 광고 설정</a>에서 개인 맞춤 광고를 비활성화할 수 있습니다.</p>
        </section>

        <section className="legal-section">
          <h2>8. 개인정보 보호책임자</h2>
          <p>개인정보 처리에 관한 문의사항은 아래로 연락 주시기 바랍니다.</p>
          <ul>
            <li>이메일: support@youthbridge.com</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPage;
