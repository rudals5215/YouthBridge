// src/server/index.ts
// Node.js + Express 크롤러 백엔드
// 실행: ts-node src/server/index.ts
// 의존성: npm install express axios cheerio cors dotenv
//         npm install -D @types/express @types/cheerio ts-node typescript

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { crawlPolicies } from "./crawler";
import { fetchFromPublicApi } from "./publicApi";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
app.use(express.json());

// ─────────────────────────────────────────────
// 라우트
// ─────────────────────────────────────────────

// 정책 목록 — 공공 API + 크롤링 데이터 합산 반환
app.get("/api/policies", async (req, res) => {
  try {
    const { region, age, category, keyword, page = "1" } = req.query as Record<string, string>;

    const [apiData, crawledData] = await Promise.allSettled([
      fetchFromPublicApi({ region, age: age ? parseInt(age) : undefined, category, keyword }),
      crawlPolicies({ region }),
    ]);

    const policies = [
      ...(apiData.status === "fulfilled" ? apiData.value : []),
      ...(crawledData.status === "fulfilled" ? crawledData.value : []),
    ];

    // 중복 제거 (id 기준)
    const unique = Array.from(new Map(policies.map((p) => [p.id, p])).values());

    // 페이지네이션
    const pageNum = parseInt(page);
    const pageSize = 20;
    const start = (pageNum - 1) * pageSize;
    const paginated = unique.slice(start, start + pageSize);

    res.json({
      data: paginated,
      total: unique.length,
      page: pageNum,
      pageSize,
    });
  } catch (err) {
    console.error("[GET /api/policies]", err);
    res.status(500).json({ error: "정책 데이터를 불러오지 못했습니다." });
  }
});

// 정책 단건 조회
app.get("/api/policies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const allPolicies = await fetchFromPublicApi({});
    const policy = allPolicies.find((p) => p.id === id);

    if (!policy) {
      return res.status(404).json({ error: "정책을 찾을 수 없습니다." });
    }

    res.json(policy);
  } catch (err) {
    console.error("[GET /api/policies/:id]", err);
    res.status(500).json({ error: "정책 데이터를 불러오지 못했습니다." });
  }
});

// 헬스체크
app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`🚀 YouthBridge API 서버 실행 중 → http://localhost:${PORT}`);
});
