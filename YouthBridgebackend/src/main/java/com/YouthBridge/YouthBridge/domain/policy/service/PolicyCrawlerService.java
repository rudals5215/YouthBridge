package com.YouthBridge.YouthBridge.domain.policy.service;

import com.YouthBridge.YouthBridge.domain.notification.entity.Notification;
import com.YouthBridge.YouthBridge.domain.notification.repository.NotificationRepository;
import com.YouthBridge.YouthBridge.domain.policy.dto.YouthPolicyCrawlerDto;
import com.YouthBridge.YouthBridge.domain.policy.entity.Policy;
import com.YouthBridge.YouthBridge.domain.policy.entity.PolicyStatus;
import com.YouthBridge.YouthBridge.domain.policy.repository.PolicyRepository;
import com.YouthBridge.YouthBridge.domain.user.entity.User;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PolicyCrawlerService {

    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final RestTemplate restTemplate;

    @Value("${youth.api.key}")
    private String apiKey;

    // 실제 온통청년 API 엔드포인트
    private static final String API_URL =
        "https://www.youthcenter.go.kr/go/ythip/getPlcy";

    private static final int PAGE_SIZE = 100;

    // ── 카테고리 매핑 ─────────────────────────────────────
    // lclsfNm(대분류) + mclsfNm(중분류) → 우리 카테고리
    private String resolveCategory(String lclsfNm, String mclsfNm) {
        if (lclsfNm == null) return "생활지원";

        return switch (lclsfNm.trim()) {
            case "일자리" -> {
                if (mclsfNm != null && mclsfNm.contains("창업")) yield "창업지원";
                yield "취업지원";
            }
            case "주거" -> "주거지원";
            case "교육·직업훈련", "교육･직업훈련" -> "교육지원";
            case "금융·복지·문화", "금융･복지･문화" -> {
                if (mclsfNm != null && mclsfNm.contains("금융")) yield "금융지원";
                yield "생활지원";
            }
            case "참여·기반", "참여･기반" -> "생활지원";
            default -> "생활지원";
        };
    }

    // ── 지역 매핑 ─────────────────────────────────────────
    // rgtrHghrkInstCdNm(광역 지자체명) → region 코드
    private static final Map<String, String> REGION_NAME_MAP = Map.ofEntries(
        Map.entry("서울특별시",     "seoul"),
        Map.entry("서울",          "seoul"),
        Map.entry("부산광역시",     "busan"),
        Map.entry("부산",          "busan"),
        Map.entry("대구광역시",     "daegu"),
        Map.entry("대구",          "daegu"),
        Map.entry("인천광역시",     "incheon"),
        Map.entry("인천",          "incheon"),
        Map.entry("광주광역시",     "gwangju"),
        Map.entry("광주",          "gwangju"),
        Map.entry("대전광역시",     "daejeon"),
        Map.entry("대전",          "daejeon"),
        Map.entry("울산광역시",     "ulsan"),
        Map.entry("울산",          "ulsan"),
        Map.entry("세종특별자치시", "sejong"),
        Map.entry("세종",          "sejong"),
        Map.entry("경기도",         "gyeonggi"),
        Map.entry("강원도",         "gangwon"),
        Map.entry("강원특별자치도", "gangwon"),
        Map.entry("충청북도",       "chungbuk"),
        Map.entry("충청남도",       "chungnam"),
        Map.entry("전라북도",       "jeonbuk"),
        Map.entry("전북특별자치도", "jeonbuk"),
        Map.entry("전라남도",       "jeonnam"),
        Map.entry("경상북도",       "gyeongbuk"),
        Map.entry("경상남도",       "gyeongnam"),
        Map.entry("제주특별자치도", "jeju"),
        Map.entry("제주",          "jeju")
    );

    private String resolveRegion(String rgtrHghrkInstCdNm) {
        if (rgtrHghrkInstCdNm == null || rgtrHghrkInstCdNm.isBlank()) return "all";
        for (Map.Entry<String, String> entry : REGION_NAME_MAP.entrySet()) {
            if (rgtrHghrkInstCdNm.contains(entry.getKey())) return entry.getValue();
        }
        return "all";
    }

    // ── 자동 스케줄러 — 매일 오전 6시, 오후 6시 ──────────
    @Scheduled(cron = "0 0 6,18 * * *")
    public void scheduledCrawl() {
        log.info("[Crawler] 스케줄 크롤링 시작");
        crawlAndSave();
    }

    // ── 크롤링 메인 로직 ──────────────────────────────────
    @Transactional
    public void crawlAndSave() {
        log.info("[Crawler] 온통청년 API 크롤링 시작");
        int page = 1;
        int savedCount = 0;
        int updatedCount = 0;

        try {
            while (true) {
                String url = API_URL
                    + "?apiKeyNm=" + apiKey
                    + "&pageNum=" + page
                    + "&pageSize=" + PAGE_SIZE
                    + "&rtnType=json";

                log.info("[Crawler] 요청 URL: {}", url);

                YouthPolicyCrawlerDto response =
                    restTemplate.getForObject(url, YouthPolicyCrawlerDto.class);

                if (response == null || response.getResult() == null) {
                    log.info("[Crawler] 응답 없음. 종료");
                    break;
                }

                if (response.getResultCode() != 200) {
                    log.error("[Crawler] API 오류: {} - {}",
                        response.getResultCode(), response.getResultMessage());
                    break;
                }

                List<YouthPolicyCrawlerDto.PolicyItem> items =
                    response.getResult().getYouthPolicyList();

                if (items == null || items.isEmpty()) {
                    log.info("[Crawler] 데이터 없음. 종료");
                    break;
                }

                for (YouthPolicyCrawlerDto.PolicyItem item : items) {
                    if (item.getPlcyNo() == null) continue;

                    boolean isNew = !policyRepository.existsByExternalId(item.getPlcyNo());

                    if (isNew) {
                        Policy policy = convertToPolicy(item);
                        Policy saved = policyRepository.save(policy);
                        savedCount++;
                        sendNotificationsToInterestedUsers(saved);
                    } else {
                        policyRepository.findByExternalId(item.getPlcyNo())
                            .ifPresent(p -> p.updateStatus(resolveStatus(item)));
                        updatedCount++;
                    }
                }

                // 마지막 페이지 확인
                int totalCnt = response.getResult().getPagging().getTotCount();
                log.info("[Crawler] 페이지 {}, 전체 {}건 중 {}건 처리",
                    page, totalCnt, Math.min(page * PAGE_SIZE, totalCnt));

                if ((long) page * PAGE_SIZE >= totalCnt) break;
                page++;
            }

        } catch (Exception e) {
            log.error("[Crawler] 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("크롤링 중 오류가 발생했어요: " + e.getMessage());
        }

        log.info("[Crawler] 완료 — 신규: {}건, 업데이트: {}건", savedCount, updatedCount);
    }

    // ── API 응답 → Policy 엔티티 변환 ────────────────────
    private Policy convertToPolicy(YouthPolicyCrawlerDto.PolicyItem item) {
        String category = resolveCategory(item.getLclsfNm(), item.getMclsfNm());
        String region   = resolveRegion(item.getRgtrHghrkInstCdNm());
        String orgName  = item.getSprvsnInstCdNm();

        // 신청 URL — aplyUrlAddr 우선, 없으면 refUrlAddr1
        String applyUrl = (item.getAplyUrlAddr() != null && !item.getAplyUrlAddr().isBlank())
            ? item.getAplyUrlAddr() : item.getRefUrlAddr1();

        Policy policy = Policy.create(
            item.getPlcyNo(),
            trim(item.getPlcyNm()),
            trim(item.getPlcyExplnCn()),
            category,
            region
        );

        // aplyYmd가 "20260701 ~ 20260814" 형태로 옴
        LocalDate[] dates = parseAplyYmd(item.getAplyYmd());
        LocalDate startDate = dates[0];
        LocalDate endDate   = dates[1];

        // bizPrdEndYmd가 있으면 우선 사용
        if (item.getBizPrdEndYmd() != null && !item.getBizPrdEndYmd().isBlank()) {
            endDate = parseSingleDate(item.getBizPrdEndYmd());
        }

        // 나이 제한 없음(Y)이면 null 처리
        boolean noAgeLmt = "Y".equals(item.getSprtTrgtAgeLmtYn());
        Integer minAge = noAgeLmt ? null : parseAge(item.getSprtTrgtMinAge());
        Integer maxAge = noAgeLmt ? null : parseAge(item.getSprtTrgtMaxAge());

        policy.update(
            trim(item.getPlcyNm()),
            trim(item.getPlcyExplnCn()),
            buildContent(item),
            minAge,
            maxAge,
            startDate,
            endDate,
            applyUrl,
            orgName
        );
        policy.updateStatus(resolveStatus(item));
        return policy;
    }

    private String buildContent(YouthPolicyCrawlerDto.PolicyItem item) {
        StringBuilder sb = new StringBuilder();
        if (item.getPlcySprtCn() != null && !item.getPlcySprtCn().isBlank())
            sb.append("지원내용: ").append(trim(item.getPlcySprtCn())).append("\n");
        if (item.getPlcyAplyMthdCn() != null && !item.getPlcyAplyMthdCn().isBlank())
            sb.append("신청방법: ").append(trim(item.getPlcyAplyMthdCn()));
        return sb.toString().trim();
    }

    // ── "20260701 ~ 20260814" → [시작일, 종료일] ─────────
    private LocalDate[] parseAplyYmd(String aplyYmd) {
        if (aplyYmd == null || aplyYmd.isBlank())
            return new LocalDate[]{null, null};
        String[] parts = aplyYmd.split("~");
        LocalDate start = parts.length > 0 ? parseSingleDate(parts[0].trim()) : null;
        LocalDate end   = parts.length > 1 ? parseSingleDate(parts[1].trim()) : null;
        return new LocalDate[]{start, end};
    }

    private LocalDate parseSingleDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        String cleaned = dateStr.replaceAll("[^0-9]", "");
        if (cleaned.length() < 8) return null;
        try {
            return LocalDate.parse(cleaned.substring(0, 8),
                DateTimeFormatter.ofPattern("yyyyMMdd"));
        } catch (Exception e) { return null; }
    }

    private Integer parseAge(String ageStr) {
        if (ageStr == null || ageStr.isBlank()) return null;
        try {
            int age = Integer.parseInt(ageStr.trim());
            return age == 0 ? null : age;
        } catch (NumberFormatException e) { return null; }
    }

    // ── 마감일 기준 상태 결정 ─────────────────────────────
    private PolicyStatus resolveStatus(YouthPolicyCrawlerDto.PolicyItem item) {
        // bizPrdEndYmd 우선, 없으면 aplyYmd에서 종료일 추출
        String endDateStr = item.getBizPrdEndYmd();
        if (endDateStr == null || endDateStr.isBlank()) {
            LocalDate[] dates = parseAplyYmd(item.getAplyYmd());
            if (dates[1] != null) {
                return dates[1].isBefore(LocalDate.now())
                    ? PolicyStatus.CLOSED : PolicyStatus.ACTIVE;
            }
            return PolicyStatus.ACTIVE; // 마감일 없으면 활성
        }
        LocalDate endDate = parseSingleDate(endDateStr);
        if (endDate == null) return PolicyStatus.ACTIVE;
        return endDate.isBefore(LocalDate.now()) ? PolicyStatus.CLOSED : PolicyStatus.ACTIVE;
    }

    // ── 새 정책 알림 발송 ─────────────────────────────────
    private void sendNotificationsToInterestedUsers(Policy policy) {
        List<User> users = userRepository.findByInterestsContaining(policy.getCategory());
        for (User user : users) {
            notificationRepository.save(
                Notification.create(user, "새 정책이 등록됐어요: " + policy.getTitle(), policy.getId())
            );
        }
        if (!users.isEmpty()) {
            log.info("[Crawler] 알림 발송: {} → {}명", policy.getTitle(), users.size());
        }
    }

    private String trim(String s) {
        return s != null ? s.trim() : null;
    }
}
