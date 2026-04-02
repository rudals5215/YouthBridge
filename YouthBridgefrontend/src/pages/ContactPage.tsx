import { useState } from "react";
import "./ContactPage.css";

function ContactPage() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);

  const handleSubmit = () => {
    if (!name || !email || !subject || !message) return;
    // mailto: 로 기본 메일 클라이언트 열기
    const mailto = `mailto:support@youthbridge.com`
      + `?subject=[YouthBridge 문의] ${encodeURIComponent(subject)}`
      + `&body=${encodeURIComponent(`이름: ${name}\n이메일: ${email}\n\n${message}`)}`;
    window.location.href = mailto;
    setSent(true);
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <div className="contact-header-inner">
          <h1>문의하기</h1>
          <p>궁금한 점이나 개선 의견을 남겨주세요</p>
        </div>
      </div>

      <div className="contact-body">
        <div className="contact-card">
          {sent ? (
            <div className="contact-sent">
              <i className="ri-checkbox-circle-line" />
              <h2>메일 앱이 열렸어요!</h2>
              <p>메일 앱에서 내용을 확인하고 전송해주세요.<br />빠른 시일 내 답변 드릴게요.</p>
              <button onClick={() => setSent(false)}>다시 작성하기</button>
            </div>
          ) : (
            <>
              <h2 className="contact-title">문의 내용 작성</h2>
              <div className="contact-form">
                <div className="contact-row">
                  <div className="contact-field">
                    <label>이름 <span>*</span></label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
                  </div>
                  <div className="contact-field">
                    <label>이메일 <span>*</span></label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
                  </div>
                </div>
                <div className="contact-field">
                  <label>문의 유형 <span>*</span></label>
                  <div className="contact-select-wrap">
                    <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                      <option value="">선택해주세요</option>
                      <option value="정책 정보 오류 신고">정책 정보 오류 신고</option>
                      <option value="서비스 이용 문의">서비스 이용 문의</option>
                      <option value="계정 관련 문의">계정 관련 문의</option>
                      <option value="기능 개선 제안">기능 개선 제안</option>
                      <option value="기타">기타</option>
                    </select>
                    <i className="ri-arrow-down-s-line" />
                  </div>
                </div>
                <div className="contact-field">
                  <label>문의 내용 <span>*</span></label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="문의 내용을 자세히 적어주세요"
                    rows={6}
                  />
                </div>
                <button
                  className="contact-submit"
                  onClick={handleSubmit}
                  disabled={!name || !email || !subject || !message}
                >
                  <i className="ri-send-plane-line" /> 문의하기
                </button>
              </div>
            </>
          )}
        </div>

        {/* 기타 문의 방법 */}
        <div className="contact-info">
          <div className="contact-info-item">
            <i className="ri-mail-line" />
            <div>
              <p className="ci-label">이메일</p>
              <p className="ci-value">support@youthbridge.com</p>
            </div>
          </div>
          <div className="contact-info-item">
            <i className="ri-time-line" />
            <div>
              <p className="ci-label">응답 시간</p>
              <p className="ci-value">평일 09:00 ~ 18:00 (영업일 기준 1~2일)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
