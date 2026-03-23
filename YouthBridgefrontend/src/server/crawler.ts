// src/server/crawler.ts
// 정적 페이지 크롤링 (cheerio)
// 동적 페이지가 필요하면 puppeteer로 교체
// npm install axios cheerio
// npm install -D @types/cheerio

import axios from "axios";
import * as cheerio from "cheerio";
import type { RawPolicy } from "./publicApi";

interface CrawlFilters {
  region?: string;
}

// ─────────────────────────────────────────────
// 크롤링 대상 사이트 설정
// 실제 타겟 사이트에 맞게 selector 수정 필요
// ─────────────────────────────────────────────
const CRAWL_TARGETS = [
  {
    name: "온통청년",
    url: "https://www.youthcenter.go.kr/youngPlcyUnif/youngPlcyUnifList.do",
    // TODO: 실제 셀렉터로 교체
    selectors: {
      list: ".policy-list li",
      title: ".policy-title",
      desc: ".policy-desc",
      category: ".policy-category",
      region: ".policy-region",
    },
  },
];

export async function crawlPolicies(filters: CrawlFilters): Promise<RawPolicy[]> {
  const results: RawPolicy[] = [];

  for (const target of CRAWL_TARGETS) {
    try {
      const policies = await crawlTarget(target, filters);
      results.push(...policies);
      console.log(`[crawler] ${target.name}: ${policies.length}건 수집`);
    } catch (err) {
      // 크롤링 실패 시 해당 사이트만 스킵 — 전체 서비스는 유지
      console.error(`[crawler] ${target.name} 크롤링 실패:`, err);
    }
  }

  return results;
}

async function crawlTarget(
  target: (typeof CRAWL_TARGETS)[number],
  filters: CrawlFilters
): Promise<RawPolicy[]> {
  const { data: html } = await axios.get(target.url, {
    headers: {
      // 봇 차단 우회 — 실제 브라우저 UA 사용
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    },
    timeout: 10_000,
  });

  const $ = cheerio.load(html);
  const policies: RawPolicy[] = [];
  let idCounter = 1;

  $(target.selectors.list).each((_, el) => {
    const title = $(el).find(target.selectors.title).text().trim();
    const desc = $(el).find(target.selectors.desc).text().trim();
    const category = $(el).find(target.selectors.category).text().trim();
    const regionText = $(el).find(target.selectors.region).text().trim();

    if (!title) return; // 빈 항목 스킵

    policies.push({
      id: `crawl-${target.name}-${idCounter++}`,
      title,
      description: desc,
      category: category || "기타",
      region: normalizeRegionText(regionText),
    });
  });

  return policies;
}

function normalizeRegionText(text: string): string {
  if (!text || text.includes("전국")) return "all";
  const map: Record<string, string> = {
    서울: "seoul", 부산: "busan", 대구: "daegu", 인천: "incheon",
    광주: "gwangju", 대전: "daejeon", 울산: "ulsan", 세종: "sejong",
    경기: "gyeonggi", 강원: "gangwon", 충북: "chungbuk", 충남: "chungnam",
    전북: "jeonbuk", 전남: "jeonnam", 경북: "gyeongbuk", 경남: "gyeongnam",
    제주: "jeju",
  };
  const match = Object.keys(map).find((k) => text.includes(k));
  return match ? map[match] : "all";
}
