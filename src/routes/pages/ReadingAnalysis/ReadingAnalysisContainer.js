import React, { useEffect, useMemo, useState } from "react";
import ReadingAnalysisPresenter from "./ReadingAnalysisPresenter";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||         // 우리가 Vercel에 넣은 키
  process.env.REACT_APP_API_BASE ||             // 기존 키가 쓰인 곳 대비
  (process.env.NODE_ENV === 'production'
    ? 'https://newscleansing-back.onrender.com' // 배포 기본
    : 'http://127.0.0.1:8000')                  // 로컬 기본
).replace(/\/$/, '');

// 고정 표시 순서(항상 이 순서로 보이고, 없으면 0으로 채움)
const DEFAULT_FIELDS = ["경제", "정치", "사회", "문화", "세계", "과학"];

// ⬇️ 분야별 통계: "일간"으로 집계 (백엔드가 day 미지원 시 rolling=1로 폴백)
const STATS_MODE_PRIMARY = "day";
const STATS_DAYS_PRIMARY = 1;
const STATS_MODE_FALLBACK = "rolling";
const STATS_DAYS_FALLBACK = 1;

// ⬇️ 시간대 그래프는 "하루(오늘)"로 집계
const HOURS_MODE = "day";
const HOURS_DAYS = 1;

const REFRESH_MS = 30_000;   // 30초

export default function ReadingAnalysisContainer() {
  const [fieldStats, setFieldStats] = useState([]);
  const [usageTrend, setUsageTrend] = useState(Array(24).fill(0)); // 0~100 %

  const baseUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  }, []);
  const userId = baseUser?.id;

  // --- 접속 시간대(오늘) 불러오기 ---
  useEffect(() => {
    if (!userId) return;

    let ignore = false;
    let t;

    const fetchHours = async () => {
      try {
        const qs = new URLSearchParams({
          user_id: String(userId),
          mode: HOURS_MODE,             // ← day (오늘 0~24시 KST)
          days: String(HOURS_DAYS),     // ← 1
        }).toString();

        // ✅ 복수형 세션 경로
        const res = await fetch(`${API_BASE}/api/user/sessions/hours?${qs}`);
        if (!res.ok) throw new Error(`hours fetch failed: ${res.status}`);
        const data = await res.json();

        // 24개 버퍼(분 단위 기대; 혹시 초라면 아래에서 보정)
        const mins = Array(24).fill(0);

        // ✅ 새 포맷: labels + bins (숫자 배열)
        if (Array.isArray(data?.bins)) {
          const labels = Array.isArray(data?.labels)
            ? data.labels
            : [...Array(data.bins.length).keys()];
          for (let i = 0; i < Math.min(labels.length, data.bins.length); i++) {
            const h = Number(labels[i]);
            const v = Math.max(0, Number(data.bins[i] ?? 0));
            if (h >= 0 && h < 24) mins[h] = v;
          }
        } else {
          // ⬅️ 구 포맷: 객체 배열 (hours | buckets | items)
          const rows = data?.hours || data?.buckets || data?.items || [];
          for (const r of rows) {
            const h = Number(r.hour ?? r.label ?? r.h);
            const v = Number(r.seconds ?? r.value ?? r.count ?? 0);
            if (h >= 0 && h < 24) mins[h] += Math.max(0, v);
          }
        }

        // ⚠️ 방어적 보정: 만약 값이 '초' 단위처럼 보이면 분으로 변환
        const avg = mins.reduce((a, b) => a + b, 0) / Math.max(1, mins.length);
        const minutesArray = avg > 120 ? mins.map(v => Math.round(v / 60)) : mins;

        // ✅ 오늘 모드는 "머문 시간 / 60분" 절대 정규화 (각 시간대 0~100%)
        const pct = minutesArray.map(v => {
          const clamped = Math.min(Math.max(Number(v) || 0, 0), 60); // 0~60분
          return Math.round((clamped / 60) * 100);
        });

        if (!ignore) setUsageTrend(pct);
      } catch (e) {
        if (!ignore) setUsageTrend(Array(24).fill(0));
      }
    };

    fetchHours();
    t = setInterval(fetchHours, REFRESH_MS);
    return () => { ignore = true; if (t) clearInterval(t); };
  }, [userId]);

  // --- 분야별 소비(일간) ---
  useEffect(() => {
    if (!userId) return;

    let ignore = false;
    let t;

    const fetchFieldStats = async (mode, days) => {
      const qs = new URLSearchParams({
        metric: "reads",
        mode,
        days: String(days),
      }).toString();

      const res = await fetch(`${API_BASE}/api/news/user/${userId}/field-stats?${qs}`);
      if (!res.ok) throw new Error(`field-stats ${mode} failed: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data.field_stats) ? data.field_stats : [];
    };

    const run = async () => {
      try {
        // 1차: day(오늘)
        let list = await fetchFieldStats(STATS_MODE_PRIMARY, STATS_DAYS_PRIMARY);

        // 백엔드가 day 미지원이거나 오류면 2차: rolling=1일로 폴백
        if (!Array.isArray(list) || list.length < 1) {
          try {
            list = await fetchFieldStats(STATS_MODE_FALLBACK, STATS_DAYS_FALLBACK);
          } catch {
            // 폴백도 실패 → 아래 catch로
            throw new Error("field-stats fallback failed");
          }
        }

        // 표시에 맞춰 DEFAULT_FIELDS로 병합
        const merged = DEFAULT_FIELDS.map((label) => {
          const found = list.find((x) => x.label === label);
          return { label, count: Number(found?.count || 0) };
        });

        // 카운트 기준 상대 퍼센트 (막대 폭)
        const max = Math.max(1, ...merged.map((x) => x.count));
        const withPercent = merged.map((x) => ({
          ...x,
          value: Math.round((x.count * 100) / max),
        }));

        if (!ignore) setFieldStats(withPercent);
      } catch {
        if (!ignore)
          setFieldStats(DEFAULT_FIELDS.map((label) => ({ label, count: 0, value: 0 })));
      }
    };

    run();
    t = setInterval(run, REFRESH_MS);
    return () => { ignore = true; if (t) clearInterval(t); };
  }, [userId]);

  const qualityScore = {
    score: 9.2,
    description: "긍정적 뉴스 비율 증가로 점수 상승",
    total: 10
  };

  return (
    <ReadingAnalysisPresenter
      usageTrend={usageTrend}     // ← 각 시간대 (머문분/60)*100
      fieldStats={fieldStats}     // ← 오늘(일간) 기준
      qualityScore={qualityScore}
    />
  );
}
