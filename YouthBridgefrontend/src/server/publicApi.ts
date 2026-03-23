// src/server/publicApi.ts
// 공공데이터포털 청년정책 API 호출
// API 키 발급: https://www.data.go.kr → "청년정책" 검색 후 활용 신청

import axios from "axios";

const API_KEY = process.env.PUBLIC_API_KEY ?? "";
const BASE_URL = "https://api.odcloud.kr/api";

export interface PolicyFilters {
  region?: string;
  age?: number;
  category?: string;
  keyword?: string;
}

export interface RawPolicy {
  id: string;
  title: string;
  description: string;
  category: string;
  region: string;
  minAge?: number;
  maxAge?: number;
}

export async function fetchFromPublicApi(filters: PolicyFilters): Promise<RawPolicy[]> {
  const params: Record<string, string> = {
    serviceKey: API_KEY,
    returnType: "JSON",
    page: "1",
    perPage: "100",
  };

  if (filters.keyword) {
    params["cond[polyBizSjnm::LIKE]"] = filters.keyword;
  }

  try {
    const { data } = await axios.get(
      `${BASE_URL}/15060782/v1/uddi:8c89ab8f-4491-4e98-9abe-ad21b4ad4bb2`,
      { params }
    );

    return (data.data ?? []).map(mapRawToPolicy);
  } catch (err) {
    console.error("[publicApi] 공공 API 호출 실패:", err);
    return []; // 실패 시 빈 배열 반환 — 크롤링 데이터만이라도 서비스
  }
}

function mapRawToPolicy(raw: Record<string, string>): RawPolicy {
  return {
    id: raw.bizId ?? String(Math.random()),
    title: raw.polyBizSjnm ?? "",
    description: raw.polyItcnCn ?? "",
    category: raw.largeCategory ?? "기타",
    region: normalizeRegion(raw.operInstitutionName ?? ""),
    minAge: raw.ageInfo ? parseInt(raw.ageInfo.split("~")[0]) : undefined,
    maxAge: raw.ageInfo ? parseInt(raw.ageInfo.split("~")[1]) : undefined,
  };
}

function normalizeRegion(name: string): string {
  const map: Record<string, string> = {
    서울: "seoul", 부산: "busan", 대구: "daegu", 인천: "incheon",
    광주: "gwangju", 대전: "daejeon", 울산: "ulsan", 세종: "sejong",
    경기: "gyeonggi", 강원: "gangwon", 충북: "chungbuk", 충남: "chungnam",
    전북: "jeonbuk", 전남: "jeonnam", 경북: "gyeongbuk", 경남: "gyeongnam",
    제주: "jeju",
  };
  if (name.includes("전국")) return "all";
  const match = Object.keys(map).find((k) => name.includes(k));
  return match ? map[match] : "all";
}
