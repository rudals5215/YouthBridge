package com.YouthBridge.YouthBridge.global.config;

import com.YouthBridge.YouthBridge.domain.notice.entity.Notice;
import com.YouthBridge.YouthBridge.domain.notice.repository.NoticeRepository;
import com.YouthBridge.YouthBridge.domain.notification.entity.Notification;
import com.YouthBridge.YouthBridge.domain.notification.repository.NotificationRepository;
import com.YouthBridge.YouthBridge.domain.policy.entity.Policy;
import com.YouthBridge.YouthBridge.domain.policy.entity.PolicyStatus;
import com.YouthBridge.YouthBridge.domain.policy.repository.PolicyRepository;
import com.YouthBridge.YouthBridge.domain.user.entity.User;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NoticeRepository noticeRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void run(ApplicationArguments args) {
        User admin = initAdmin();
//        initPolicies();
        initNotices(admin);
        initNotifications(admin);
    }

    // ── 관리자 계정 생성 ──────────────────────────────────
    private User initAdmin() {
        if (userRepository.existsByEmail("admin@youthbridge.com")) {
            return userRepository.findByEmail("admin@youthbridge.com").orElseThrow();
        }
        User admin = User.createLocal(
                "admin@youthbridge.com",
                passwordEncoder.encode("admin1234!"),
                "관리자"
        );
        admin.promoteToAdmin();
        userRepository.save(admin);
        log.info("관리자 계정 생성 완료! (admin@youthbridge.com / admin1234!)");
        return admin;
    }

    // ── 테스트 정책 데이터 ────────────────────────────────
//    private void initPolicies() {
//        if (policyRepository.count() > 0) {
//            log.info("정책 데이터가 이미 있어서 건너뜁니다.");
//            return;
//        }
//        log.info("테스트용 정책 데이터를 삽입합니다...");
//
//        Policy p1 = Policy.create("EXT001", "서울 청년 월세 한시 특별지원",
//                "서울 거주 청년 1인 가구 월 최대 20만원 지원", "주거지원", "seoul");
//        p1.update("서울 청년 월세 한시 특별지원",
//                "서울 거주 청년 1인 가구를 대상으로 월 최대 20만원씩 최대 12개월 월세를 지원합니다.",
//                "지원 대상: 만 19~34세 무주택 청년 1인 가구\n지원 내용: 월 최대 20만원, 12개월",
//                19, 34, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
//                "https://youth.seoul.go.kr", "서울특별시");
//        p1.updateStatus(PolicyStatus.ACTIVE);
//
//        Policy p2 = Policy.create("EXT002", "청년도약계좌",
//                "매월 70만원 한도 납입 시 정부 기여금 지원, 5년 후 최대 5천만원", "금융지원", "all");
//        p2.update("청년도약계좌",
//                "매월 70만원 한도 내 자유 납입 시 정부에서 기여금을 지원합니다.",
//                "가입 대상: 만 19~34세 청년\n지원 내용: 정부기여금 월 최대 2.4만원 + 이자소득 비과세",
//                19, 34, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
//                "https://www.kinfa.or.kr", "금융위원회");
//        p2.updateStatus(PolicyStatus.ACTIVE);
//
//        Policy p3 = Policy.create("EXT003", "경기도 청년 기본소득",
//                "경기도 3년 이상 거주 만 24세 청년에게 분기당 25만원 지급", "생활지원", "gyeonggi");
//        p3.update("경기도 청년 기본소득",
//                "경기도에 3년 이상 거주한 만 24세 청년에게 분기당 25만원을 지역화폐로 지급합니다.",
//                "지원 대상: 경기도 거주 만 24세 청년\n지원 내용: 연 100만원 (분기별 25만원) 지역화폐 지급",
//                24, 24, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
//                "https://www.gg.go.kr", "경기도");
//        p3.updateStatus(PolicyStatus.ACTIVE);
//
//        Policy p4 = Policy.create("EXT004", "청년 내일채움공제",
//                "중소기업 취업 청년이 2년간 400만원 저축 시 최대 1,200만원 마련", "취업지원", "all");
//        p4.update("청년 내일채움공제",
//                "중소기업에 취업한 청년이 2년간 400만원을 저축하면 기업과 정부가 각각 적립합니다.",
//                "지원 대상: 만 15~34세 중소기업 취업 청년\n지원 내용: 2년 만기 시 최대 1,200만원",
//                15, 34, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
//                "https://www.work.go.kr", "고용노동부");
//        p4.updateStatus(PolicyStatus.ACTIVE);
//
//        Policy p5 = Policy.create("EXT005", "부산 청년 창업 지원금",
//                "부산 청년 창업자에게 사업화 자금 최대 5,000만원 지원", "창업지원", "busan");
//        p5.update("부산 청년 창업 지원금",
//                "부산 청년 창업자에게 사업화 자금 최대 5,000만원과 창업 공간, 멘토링을 지원합니다.",
//                "지원 대상: 만 19~39세 부산 거주 예비창업자\n지원 내용: 사업화 자금 최대 5,000만원 + 창업 공간 6개월",
//                19, 39, LocalDate.of(2024, 3, 1), LocalDate.of(2024, 9, 30),
//                "https://www.busan.go.kr", "부산광역시");
//        p5.updateStatus(PolicyStatus.ACTIVE);
//
//        policyRepository.save(p1);
//        policyRepository.save(p2);
//        policyRepository.save(p3);
//        policyRepository.save(p4);
//        policyRepository.save(p5);
//        log.info("테스트 정책 {}건 삽입 완료!", policyRepository.count());
//    }

    // ── 공지사항 더미 데이터 ──────────────────────────────
    private void initNotices(User admin) {
        if (noticeRepository.count() > 0) return;
        noticeRepository.save(Notice.create(
                "YouthBridge 서비스 오픈 안내",
                "안녕하세요! YouthBridge 서비스가 오픈했습니다.\n청년 정책 정보를 한눈에 확인하고 맞춤 추천까지 받아보세요.",
                admin.getName()
        ));
        noticeRepository.save(Notice.create(
                "2026년 청년 정책 데이터 업데이트 완료",
                "2026년 상반기 청년 지원 정책 데이터가 업데이트 되었습니다.\n새로운 정책을 확인해보세요!",
                admin.getName()
        ));
        log.info("공지사항 더미 데이터 생성 완료!");
    }

    // ── 알림 더미 데이터 ──────────────────────────────────
    private void initNotifications(User admin) {
        if (notificationRepository.count() > 0) return;
        notificationRepository.save(Notification.create(
                admin, "새 정책이 등록됐어요: 서울 청년 월세 한시 특별지원", 1L));
        notificationRepository.save(Notification.create(
                admin, "새 정책이 등록됐어요: 청년도약계좌", 2L));
        log.info("테스트 알림 생성 완료!");
    }
}