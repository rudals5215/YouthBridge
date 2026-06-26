import "./PrivacyPage.css";

function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <div className="legal-header-inner">
          <h1>이용약관</h1>
          <p>최종 업데이트: 2026년 4월</p>
        </div>
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <h2>제1조 (목적)</h2>
          <p>이 약관은 YouthBridge(이하 "서비스")가 제공하는 청년 정책 정보 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section className="legal-section">
          <h2>제2조 (서비스 내용)</h2>
          <p>YouthBridge는 다음과 같은 서비스를 제공합니다.</p>
          <ul>
            <li>청년 지원 정책 정보 제공 및 검색</li>
            <li>나이, 지역, 관심 분야 기반 맞춤 정책 추천</li>
            <li>정책 즐겨찾기 및 마감 알림</li>
            <li>공지사항 제공</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>제3조 (회원 가입)</h2>
          <ul>
            <li>이용자는 이메일 또는 카카오 계정으로 회원 가입할 수 있습니다.</li>
            <li>만 14세 미만의 아동은 회원 가입을 할 수 없습니다.</li>
            <li>회원은 실명 및 실제 정보를 입력해야 하며, 타인의 정보를 도용해서는 안 됩니다.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>제4조 (이용자의 의무)</h2>
          <ul>
            <li>서비스를 통해 얻은 정보를 무단으로 복제, 배포, 상업적으로 이용하는 행위를 금지합니다.</li>
            <li>다른 이용자의 개인정보를 침해하는 행위를 금지합니다.</li>
            <li>서비스의 정상적인 운영을 방해하는 행위를 금지합니다.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>제5조 (서비스 제공의 제한)</h2>
          <p>서비스는 다음의 경우 서비스 제공을 일시 중단하거나 제한할 수 있습니다.</p>
          <ul>
            <li>시스템 점검, 보수, 교체가 필요한 경우</li>
            <li>천재지변, 국가비상사태 등 불가항력적 사유가 발생한 경우</li>
            <li>이용자가 본 약관을 위반한 경우</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>제6조 (정보 제공의 정확성)</h2>
          <p>YouthBridge는 온통청년 공공 API를 통해 정책 정보를 제공하며, 정보의 정확성을 위해 노력합니다. 단, 실제 정책 내용은 해당 기관의 공식 안내를 반드시 확인하시기 바랍니다. 서비스는 정보의 오류로 인한 손해에 대해 책임을 지지 않습니다.</p>
        </section>

        <section className="legal-section">
          <h2>제7조 (광고)</h2>
          <p>서비스는 Google AdSense를 통한 광고를 게재할 수 있습니다. 광고 내용에 대한 책임은 광고주에게 있으며, 서비스는 광고 내용으로 인한 손해에 대해 책임을 지지 않습니다.</p>
        </section>

        <section className="legal-section">
          <h2>제8조 (회원 탈퇴)</h2>
          <p>이용자는 마이페이지에서 언제든지 회원 탈퇴를 요청할 수 있으며, 탈퇴 즉시 개인정보가 삭제됩니다.</p>
        </section>

        <section className="legal-section">
          <h2>제9조 (준거법 및 관할법원)</h2>
          <p>본 약관은 대한민국 법령에 의해 규정되며, 서비스 이용으로 발생한 분쟁에 대해서는 대한민국 법원을 관할법원으로 합니다.</p>
        </section>

        <section className="legal-section">
          <h2>문의</h2>
          <p>이용약관에 관한 문의사항은 아래로 연락 주시기 바랍니다.</p>
          <ul>
            <li>이메일: support@youthbridge.com</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default TermsPage;
