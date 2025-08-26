import React, { useEffect, useMemo, useState } from "react";
import StressStatusPresenter from "./StressStatusPresenter";

// const RAW_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
export const RAW_BASE = (
  process.env.REACT_APP_API_BASE_URL ||         // 우리가 Vercel에 넣은 키
  process.env.REACT_APP_API_BASE ||             // 기존 키가 쓰인 곳 대비
  (process.env.NODE_ENV === 'production'
    ? 'https://newscleansing-back.onrender.com' // 배포 기본
    : 'http://127.0.0.1:8000')                  // 로컬 기본
).replace(/\/$/, '');

const API_BASE = RAW_BASE.replace(/\/$/, "") + "/api";
const DAYS = 7; // 주 단위 고정

// 로그인 사용자 id 가져오기 (localStorage('user') 기준)
function getCurrentUserId() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.id != null ? String(u.id) : null;
  } catch {
    return null;
  }
}

// 점수 → 이모지/라벨 (요청한 규칙)
function scoreToMood(s) {
  const n = Number(s);
  if (!Number.isFinite(n)) return { emoji: "🙂", word: "평온" };
  if (n <= 20) return { emoji: "😌", word: "매우 안정" };
  if (n <= 40) return { emoji: "😊", word: "안정" };
  if (n <= 60) return { emoji: "🙂", word: "평온" };
  if (n <= 80) return { emoji: "😟", word: "긴장" };
  return { emoji: "😣", word: "불안" };
}

function fmtMD(iso) {
  try {
    const d = new Date(iso);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${m}/${day}`;
  } catch {
    return iso || "";
  }
}

export default function StressStatusContainer() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [snapshot, setSnapshot] = useState(null);

  const userId = useMemo(() => getCurrentUserId(), []);

  const reload = async () => {
    setLoading(true);
    setErr("");
    try {
      if (!userId) {
        setErr("로그인이 필요합니다.");
        setSnapshot(null);
        return;
      }
      const res = await fetch(
        `${API_BASE}/news/mood/user/${encodeURIComponent(userId)}/snapshot?days=${DAYS}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSnapshot(data);
    } catch (e) {
      setErr(e?.message || "불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const { status, items, summary } = useMemo(() => {
    const result = { status: null, items: [], summary: "" };
    if (!snapshot) return result;

    // 상단 현재 상태(숫자 지수 포함)
    const topMood = scoreToMood(snapshot.score);
    result.status = {
      emoji: topMood.emoji,
      word: topMood.word,
      score: Number(snapshot.score),     // ⬅️ 숫자 지수 추가
      dateText: snapshot.date || "",
    };

    // 최근 감정 기록 (서버 7일, 혹시 대비해 7개 제한)
    const days = (Array.isArray(snapshot.days) ? [...snapshot.days] : [])
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .slice(-DAYS);

    result.items = days.map((d) => {
      const mood = scoreToMood(d.score);
      return {
        key: d.date,
        emoji: mood.emoji,
        dateLabel: fmtMD(d.date),
        word: mood.word,
      };
    });

    // 이번 주 최빈 감정
    if (result.items.length > 0) {
      const counts = new Map(); // word -> {emoji, word, cnt}
      for (const it of result.items) {
        const prev = counts.get(it.word) || { emoji: it.emoji, word: it.word, cnt: 0 };
        prev.cnt += 1;
        counts.set(it.word, prev);
      }
      const top = [...counts.values()].sort((a, b) => b.cnt - a.cnt)[0];
      if (top) result.summary = `이번 주 가장 많은 기분: ${top.emoji} ${top.word} (${top.cnt}일)`;
    }

    return result;
  }, [snapshot]);

  return (
    <StressStatusPresenter
      loading={loading}
      error={err}
      status={status}
      items={items}
      summary={summary}
      // onReload는 더 이상 버튼에서 쓰지 않지만, 자동 갱신/개발용으로 남겨둠
      onReload={reload}
    />
  );
}
