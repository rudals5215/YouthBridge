package com.YouthBridge.YouthBridge.domain.policy.service;

import com.YouthBridge.YouthBridge.domain.admin.service.SyncStatusService;
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
    private final SyncStatusService syncStatusService;
    private final RestTemplate restTemplate;

    @Value("${youth.api.key}")
    private String apiKey;

    private static final String API_URL =
        "https://www.youthcenter.go.kr/go/ythip/getPlcy";
    private static final int PAGE_SIZE = 100;

    private static final Map<String, String> CATEGORY_MAP = Map.of(
        "일자리",           "취업지원",
        "주거",             "주거지원",
        "교육·직업훈련",    "교육지원",
        "교육･직업훈련",    "교육지원",
        "금융·복지·문화",   "생활지원",
        "금융･복지･문화",   "생활지원",
        "참여·기반",        "생활지원",
        "참여･기반",        "생활지원"
    );

    private static final Map<String, String> REGION_NAME_MAP = Map.ofEntries(
        Map.entry("서울특별시",     "seoul"),
        Map.entry("부산광역시",     "busan"),
        Map.entry("대구광역시",     "daegu"),
        Map.entry("인천광역시",     "incheon"),
        Map.entry("광주광역시",     "gwangju"),
        Map.entry("대전광역시",     "daejeon"),
        Map.entry("울산광역시",     "ulsan"),
        Map.entry("세종특별자치시", "sejong"),
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
        Map.entry("제주특별자치도", "jeju")
    );

    @Scheduled(cron = "0 0 6,18 * * *")
    public void scheduledCrawl() {
        log.info("[Crawler] 스케줄 크롤링 시작");
        crawlAndSave();
    }

//    @Transactional
@Transactional(readOnly = false)
    public void crawlAndSave() {
        syncStatusService.start();
        log.info("[Crawler] 온통청년 API 크롤링 시작");

        // ① 기존 CLOSED 정책 먼저 삭제 (이전 크롤러로 저장된 것 포함)
        long beforeCount = policyRepository.count();
        policyRepository.deleteByStatus(PolicyStatus.CLOSED);
        long deletedOld = beforeCount - policyRepository.count();
        if (deletedOld > 0) {
            log.info("[Crawler] 기존 CLOSED 정책 {}건 정리 완료", deletedOld);
        }

        int page = 1;
        int savedCount   = 0;
        int updatedCount = 0;
        int deletedCount = (int) deletedOld;

        try {
            while (true) {
                String url = API_URL
                    + "?apiKeyNm=" + apiKey
                    + "&pageNum=" + page
                    + "&pageSize=" + PAGE_SIZE
                    + "&rtnType=json";

                log.info("[Crawler] 페이지 {} 요청", page);

                YouthPolicyCrawlerDto response =
                    restTemplate.getForObject(url, YouthPolicyCrawlerDto.class);

//                if (response == null || response.getResult() == null
//                        || response.getResultCode() != 200) {
//                    log.warn("[Crawler] 응답 이상 종료");
//                    break;
//                }

                if (response == null || response.getResult() == null
                        || response.getResultCode() != 200) {
                    log.warn("[Crawler] {} 페이지 응답 이상으로 건너뜁니다.", page);
                    page++; // 다음 페이지로 기회를 줍니다.
                    continue;
                }

                List<YouthPolicyCrawlerDto.PolicyItem> items =
                    response.getResult().getYouthPolicyList();

                if (items == null || items.isEmpty()) break;

                for (YouthPolicyCrawlerDto.PolicyItem item : items) {
                    if (item.getPlcyNo() == null) continue;

                    PolicyStatus status = resolveStatus(item);
                    boolean isNew = !policyRepository.existsByExternalId(item.getPlcyNo());

                    if (isNew) {
                        if (status == PolicyStatus.CLOSED) {
                            // 이미 마감된 신규 정책은 저장하지 않음
                            continue;
                        }
                        Policy policy = convertToPolicy(item);
                        Policy saved = policyRepository.save(policy);
                        savedCount++;
                        sendNotifications(saved);
                    } else {
                        if (status == PolicyStatus.CLOSED) {
                            // 기존 정책이 마감됐으면 DB에서 삭제
                            policyRepository.findByExternalId(item.getPlcyNo())
                                .ifPresent(p -> {
                                    policyRepository.delete(p);
                                });
                            deletedCount++;
                        } else {
                            // 활성 정책 — 상태만 업데이트
                            policyRepository.findByExternalId(item.getPlcyNo())
                                .ifPresent(p -> p.updateStatus(status));
                            updatedCount++;
                        }
                    }
                }

                int totalCnt = response.getResult().getPagging().getTotCount();
                log.info("[Crawler] 페이지 {}, 전체 {}건", page, totalCnt);
                if ((long) page * PAGE_SIZE >= totalCnt) break;
                page++;
            }

            syncStatusService.finish(savedCount, updatedCount, deletedCount);
            log.info("[Crawler] 완료 — 신규: {}건, 업데이트: {}건, 삭제: {}건",
                savedCount, updatedCount, deletedCount);

        } catch (Exception e) {
            log.error("[Crawler] 오류: {}", e.getMessage(), e);
            syncStatusService.error(e.getMessage());
            throw new RuntimeException("크롤링 중 오류: " + e.getMessage());
        }
    }

    private Policy convertToPolicy(YouthPolicyCrawlerDto.PolicyItem item) {
        String category = resolveCategory(item.getLclsfNm(), item.getMclsfNm());
        String region   = resolveRegion(item.getRgtrHghrkInstCdNm());
        String applyUrl = resolveApplyUrl(item.getAplyUrlAddr(), item.getRefUrlAddr1());

        Policy policy = Policy.create(
            item.getPlcyNo(),
            trim(item.getPlcyNm()),
            trim(item.getPlcyExplnCn()),
            category, region
        );

        LocalDate[] dates = parseAplyYmd(item.getAplyYmd());
        LocalDate endDate = (item.getBizPrdEndYmd() != null && !item.getBizPrdEndYmd().isBlank())
            ? parseSingleDate(item.getBizPrdEndYmd()) : dates[1];

        boolean noAgeLmt = "Y".equals(item.getSprtTrgtAgeLmtYn());

        policy.update(
            trim(item.getPlcyNm()),
            trim(item.getPlcyExplnCn()),
            buildContent(item),
            noAgeLmt ? null : parseAge(item.getSprtTrgtMinAge()),
            noAgeLmt ? null : parseAge(item.getSprtTrgtMaxAge()),
            dates[0], endDate, applyUrl,
            item.getSprvsnInstCdNm()
        );
        policy.updateStatus(resolveStatus(item));
        return policy;
    }

    private String buildContent(YouthPolicyCrawlerDto.PolicyItem item) {
        StringBuilder sb = new StringBuilder();
        if (item.getPlcySprtCn()    != null) sb.append("지원내용: ").append(trim(item.getPlcySprtCn())).append("\n");
        if (item.getPlcyAplyMthdCn() != null) sb.append("신청방법: ").append(trim(item.getPlcyAplyMthdCn()));
        return sb.toString().trim();
    }

    private String resolveCategory(String lclsfNm, String mclsfNm) {
        if (lclsfNm == null) return "생활지원";
        if ("일자리".equals(lclsfNm.trim())) {
            return (mclsfNm != null && mclsfNm.contains("창업")) ? "창업지원" : "취업지원";
        }
        if ("금융·복지·문화".equals(lclsfNm.trim()) || "금융･복지･문화".equals(lclsfNm.trim())) {
            return (mclsfNm != null && mclsfNm.contains("금융")) ? "금융지원" : "생활지원";
        }
        return CATEGORY_MAP.getOrDefault(lclsfNm.trim(), "생활지원");
    }

    private String resolveRegion(String instNm) {
        if (instNm == null || instNm.isBlank()) return "all";
        for (Map.Entry<String, String> e : REGION_NAME_MAP.entrySet()) {
            if (instNm.contains(e.getKey())) return e.getValue();
        }
        return "all";
    }

    private LocalDate[] parseAplyYmd(String aplyYmd) {
        if (aplyYmd == null || aplyYmd.isBlank()) return new LocalDate[]{null, null};
        String[] parts = aplyYmd.split("~");
        return new LocalDate[]{
            parts.length > 0 ? parseSingleDate(parts[0].trim()) : null,
            parts.length > 1 ? parseSingleDate(parts[1].trim()) : null
        };
    }

    private LocalDate parseSingleDate(String s) {
        if (s == null || s.isBlank()) return null;
        String cleaned = s.replaceAll("[^0-9]", "");
        if (cleaned.length() < 8) return null;
        try { return LocalDate.parse(cleaned.substring(0, 8), DateTimeFormatter.ofPattern("yyyyMMdd")); }
        catch (Exception e) { return null; }
    }

    private Integer parseAge(String s) {
        if (s == null || s.isBlank()) return null;
        try { int v = Integer.parseInt(s.trim()); return v == 0 ? null : v; }
        catch (NumberFormatException e) { return null; }
    }

    private PolicyStatus resolveStatus(YouthPolicyCrawlerDto.PolicyItem item) {
        String endStr = item.getBizPrdEndYmd();
        LocalDate endDate = (endStr != null && !endStr.isBlank())
            ? parseSingleDate(endStr)
            : parseAplyYmd(item.getAplyYmd())[1];
        if (endDate == null) return PolicyStatus.ACTIVE;
        return endDate.isBefore(LocalDate.now()) ? PolicyStatus.CLOSED : PolicyStatus.ACTIVE;
    }

    private String resolveApplyUrl(String aplyUrl, String refUrl) {
        if (isValidUrl(aplyUrl)) return aplyUrl;
        if (isValidUrl(refUrl))  return refUrl;
        return null;
    }

    private boolean isValidUrl(String url) {
        if (url == null || url.isBlank()) return false;
        String lower = url.toLowerCase();
        if (lower.contains("instagram.com") || lower.contains("facebook.com") ||
            lower.contains("youtube.com")   || lower.contains("blog.naver") ||
            lower.contains("cafe.naver")    || lower.contains("twitter.com") ||
            lower.contains("x.com"))        return false;
        try {
            String path = new java.net.URI(url).getPath();
            return path != null && !path.equals("/") && !path.isEmpty();
        } catch (Exception e) { return false; }
    }

    private void sendNotifications(Policy policy) {
        List<User> users = userRepository.findByInterestsContaining(policy.getCategory());
        for (User user : users) {
            notificationRepository.save(
                Notification.create(user, "새 정책이 등록됐어요: " + policy.getTitle(), policy.getId())
            );
        }
    }

    private String trim(String s) { return s != null ? s.trim() : null; }
}
