import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainPresenter from "./MainPresenter";
/** ✅ ReadingAnalysis에서 쓰는 동일 로직 재사용 */
import { getDailyPersona } from "../ReadingAnalysis/components/DailyPersonaCard/DailyPersonaCard";

const RAW = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
const API = RAW.replace(/\/$/, "") + "/api";

/* ------ user helpers ------ */
const readUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
};
const getUserId = (u) => (u?.id ?? u?.user_id ?? u?.pk ?? u?.uid ?? null);
const getNickname = (u) =>
  u?.name || u?.nickname || u?.username ||
  (typeof u?.email === "string" ? u.email.split("@")[0] : "독자");

/* ------ 점수 → 이모지 ------ */
function scoreToMood(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return { emoji: "🙂", word: "평온" };
  if (n <= 20) return { emoji: "😌", word: "매우 안정" };
  if (n <= 40) return { emoji: "😊", word: "안정" };
  if (n <= 60) return { emoji: "🙂", word: "평온" };
  if (n <= 80) return { emoji: "😟", word: "긴장" };
  return { emoji: "😣", word: "불안" };
}

/* ------ API helpers ------ */
// 오늘 KST 24칸(0~23시) 사용 트렌드 → [0..100] %
async function fetchHoursToday(userId) {
  const qs = new URLSearchParams({ user_id: String(userId), mode: "day", days: "1" }).toString();
  const res = await fetch(`${API}/user/sessions/hours?${qs}`, { credentials: "include" });
  if (!res.ok) throw new Error("hours");
  const data = await res.json();

  const mins = Array(24).fill(0);
  if (Array.isArray(data?.bins)) {
    const labels = Array.isArray(data?.labels) ? data.labels : [...Array(data.bins.length).keys()];
    for (let i = 0; i < Math.min(labels.length, data.bins.length); i++) {
      const h = Number(labels[i]);
      const v = Math.max(0, Number(data.bins[i] ?? 0));
      if (h >= 0 && h < 24) mins[h] = v;
    }
  } else {
    const rows = data?.hours || data?.buckets || data?.items || [];
    for (const r of rows) {
      const h = Number(r.hour ?? r.label ?? r.h);
      const v = Number(r.seconds ?? r.value ?? r.count ?? 0);
      if (h >= 0 && h < 24) mins[h] += Math.max(0, v);
    }
  }
  const avg = mins.reduce((a,b)=>a+b,0) / Math.max(1, mins.length);
  const minutesArray = avg > 120 ? mins.map(v => Math.round(v/60)) : mins;
  return minutesArray.map(v => {
    const clamped = Math.min(Math.max(Number(v) || 0, 0), 60);
    return Math.round((clamped / 60) * 100);
  });
}

// 오늘 분야별 읽은 기사 수
async function fetchFieldStatsToday(userId) {
  const qs = new URLSearchParams({ metric: "reads", mode: "day", days: "1" }).toString();
  const res = await fetch(`${API}/news/user/${userId}/field-stats?${qs}`, { credentials: "include" });
  if (!res.ok) throw new Error("field-stats");
  const data = await res.json();
  const list = Array.isArray(data?.field_stats) ? data.field_stats : [];
  const DEFAULTS = ["경제","정치","사회","문화","세계","과학"];
  return DEFAULTS.map(label => {
    const found = list.find(x => x.label === label);
    return { label, count: Number(found?.count || 0) };
  });
}

// 오늘의 기분 스냅샷
async function fetchMoodSnapshot(userId) {
  const res = await fetch(`${API}/news/mood/user/${userId}/snapshot?days=7`, { credentials: "include" });
  if (!res.ok) throw new Error("mood");
  return res.json();
}

/* ------ Component ------ */
export default function MainContainer() {
  const navigate = useNavigate();

  // 로그인 유저
  const user = useMemo(readUser, []);
  const userId = getUserId(user);
  const nickname = getNickname(user);

  // 메인 요약 데이터
  const [readsToday, setReadsToday] = useState(0);
  const [todayEmoji, setTodayEmoji] = useState("🙂");
  const [personaEmojis, setPersonaEmojis] = useState(["🦊","💹"]);

  // 네비게이션 핸들러 (예전 로직 복구)
  const handleClick = (page) => {
    switch (page) {
      case "오늘의 기사":
        navigate("/article-list");
        break;
      case "독서 분석":
        navigate("/reading-analysis");
        break;
      case "마음 챙김":
        navigate("/stress-status");
        break;
      case "카테고리":
        navigate("/category");
        break;
      default:
        break;
    }
  };

  // 데이터 fetch
  useEffect(() => {
    if (!userId) return;
    let ignore = false;

    (async () => {
      try {
        // 1) 분야별 → 오늘 읽은 기사 합계
        const fieldStats = await fetchFieldStatsToday(userId);
        if (!ignore) setReadsToday(fieldStats.reduce((s, x) => s + (x.count || 0), 0));

        // 2) 오늘의 기분 이모지
        const snap = await fetchMoodSnapshot(userId);
        const mood = scoreToMood(snap?.score);
        if (!ignore) setTodayEmoji(mood.emoji);

        // 3) 오늘의 캐릭터
        const trend = await fetchHoursToday(userId);
        const persona = getDailyPersona(trend, fieldStats);
        if (!ignore) setPersonaEmojis(persona.emojis);
      } catch (e) {
        console.warn("[Main] fetch fail:", e);
      }
    })();

    return () => { ignore = true; };
  }, [userId]);

  return (
    <MainPresenter
      nickname={nickname}
      readsToday={readsToday}
      moodEmoji={todayEmoji}
      personaEmojis={personaEmojis}
      onButtonClick={handleClick}   
    />
  );
}
