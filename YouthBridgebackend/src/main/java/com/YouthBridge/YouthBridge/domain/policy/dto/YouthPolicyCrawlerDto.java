package com.YouthBridge.YouthBridge.domain.policy.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 온통청년 OpenAPI 실제 응답 구조 (JSON)
 * GET https://www.youthcenter.go.kr/go/ythip/getPlcy
 *     ?apiKeyNm={key}&pageNum={page}&pageSize={size}&rtnType=json
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class YouthPolicyCrawlerDto {

    @JsonProperty("resultCode")
    private int resultCode;

    @JsonProperty("resultMessage")
    private String resultMessage;

    @JsonProperty("result")
    private Result result;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Result {

        @JsonProperty("pagging")
        private Pagging pagging;

        @JsonProperty("youthPolicyList")
        private List<PolicyItem> youthPolicyList;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Pagging {

        @JsonProperty("totCount")
        private int totCount;   // 전체 건수

        @JsonProperty("pageNum")
        private int pageNum;    // 현재 페이지

        @JsonProperty("pageSize")
        private int pageSize;   // 페이지당 건수
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PolicyItem {

        @JsonProperty("plcyNo")
        private String plcyNo;           // 정책번호 (externalId)

        @JsonProperty("plcyNm")
        private String plcyNm;           // 정책명

        @JsonProperty("plcyExplnCn")
        private String plcyExplnCn;      // 정책 설명 (description)

        @JsonProperty("plcySprtCn")
        private String plcySprtCn;       // 지원 내용

        @JsonProperty("plcyAplyMthdCn")
        private String plcyAplyMthdCn;   // 신청 방법

        // 카테고리 분류
        @JsonProperty("lclsfNm")
        private String lclsfNm;          // 대분류 (일자리, 주거, 교육·직업훈련 등)

        @JsonProperty("mclsfNm")
        private String mclsfNm;          // 중분류 (취업, 창업, 교육비지원 등)

        @JsonProperty("plcyKywdNm")
        private String plcyKywdNm;       // 키워드 (교육지원, 인턴, 바우처 등)

        // 지역 정보
        @JsonProperty("rgtrHghrkInstCdNm")
        private String rgtrHghrkInstCdNm; // 광역자치단체명 (서울특별시, 경기도 등) ← 지역 매핑에 사용

        @JsonProperty("sprvsnInstCdNm")
        private String sprvsnInstCdNm;    // 시행기관명

        // 신청 기간
        @JsonProperty("aplyYmd")
        private String aplyYmd;           // "20260701 ~ 20260814" 형태

        @JsonProperty("bizPrdBgngYmd")
        private String bizPrdBgngYmd;     // 사업 시작일 YYYYMMDD

        @JsonProperty("bizPrdEndYmd")
        private String bizPrdEndYmd;      // 사업 종료일 YYYYMMDD

        // 나이 조건
        @JsonProperty("sprtTrgtMinAge")
        private String sprtTrgtMinAge;    // 최소 나이

        @JsonProperty("sprtTrgtMaxAge")
        private String sprtTrgtMaxAge;    // 최대 나이

        @JsonProperty("sprtTrgtAgeLmtYn")
        private String sprtTrgtAgeLmtYn; // 나이 제한 여부 (Y/N)

        // 신청 URL
        @JsonProperty("aplyUrlAddr")
        private String aplyUrlAddr;       // 신청 URL

        @JsonProperty("refUrlAddr1")
        private String refUrlAddr1;       // 참고 URL 1
    }
}
