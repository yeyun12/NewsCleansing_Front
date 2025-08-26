import React, { useMemo } from "react";
import "./DailyPersonaCard.css";

/**
 * usageTrend: 길이 24의 0~100 정규화 배열 (오늘 KST)
 * fieldStats: [{label, count, value(%)}, ...]
 */
export default function DailyPersonaCard({ usageTrend = [], fieldStats = [] }) {
  const persona = useMemo(() => getDailyPersona(usageTrend, fieldStats), [usageTrend, fieldStats]);

  return (
    <div className="persona-card" role="region" aria-label="오늘의 사용 분석 캐릭터">
      <div className="persona-head">
        <div className="persona-badges" aria-hidden="true">
          <span className="persona-badge">{persona.emojis[0]}</span>
          <span className="persona-badge">{persona.emojis[1]}</span>
        </div>
        <div className="persona-title">오늘의 캐릭터</div>
        <div className="persona-name">{persona.name}</div>
        <div className="persona-sub">{persona.subtitle}</div>
      </div>

      <div className="persona-desc">{persona.description}</div>
    </div>
  );
}

/* ===== 설정값(튜닝 포인트) ===== */
const LONG_IDLE_MIN = 90;
const SLOW_READ_MIN_PER_ARTICLE = 30;

const TIME_GROUPS = [
  { start: 0,  end: 5,  label: "새벽형", animal: "고양이", emoji: "🐈‍⬛" },
  { start: 5,  end: 10, label: "오전형", animal: "종달새", emoji: "🐦" },
  { start: 10, end: 16, label: "낮형",   animal: "수달",   emoji: "🦦" },
  { start: 16, end: 20, label: "오후형", animal: "여우",   emoji: "🦊" },
  { start: 20, end: 24, label: "밤형",   animal: "올빼미", emoji: "🦉" },
];

const CAT = {
  "경제": { adj: "실용적인",    one: "데이터·효율을 중시해요", emoji: "💹" },
  "정치": { adj: "참여적인",    one: "이슈 파악과 의견 표출에 적극적이에요", emoji: "🏛️" },
  "사회": { adj: "공감하는",    one: "사람과 변화를 주의 깊게 봐요", emoji: "🤝" },
  "문화": { adj: "감성적인",    one: "취향과 경험을 확장해요", emoji: "🎨" },
  "세계": { adj: "탐험적인",    one: "국제 이슈로 시야를 넓혀요", emoji: "🌍" },
  "과학": { adj: "호기심 많은", one: "원리 탐구와 팩트를 중시해요", emoji: "🔬" },
};

/** ⭐️ 메인에서도 쓸 수 있게 named export */
export function getDailyPersona(usageTrend, fieldStats) {
  const arr = Array.isArray(usageTrend) ? usageTrend : [];
  const stats = Array.isArray(fieldStats) ? fieldStats : [];

  const totalMinutes = arr.reduce((sum, v) => sum + (Math.max(0, Number(v) || 0) / 100) * 60, 0);
  const readsTotal = stats.reduce((s, x) => s + Number(x?.count || 0), 0);

  const hasUsage = totalMinutes > 0.5;
  const hasReads = readsTotal > 0;

  const firstH = arr.findIndex(v => Number(v) > 0);
  let lastH = -1;
  for (let h = 23; h >= 0; h--) { if (Number(arr[h]) > 0) { lastH = h; break; } }
  const rangeText = (hasUsage && firstH >= 0 && lastH >= 0)
    ? `주 활동대 ${pad2(firstH)}–${pad2(lastH)}시`
    : "";

  let tg = TIME_GROUPS[2];
  if (hasUsage) {
    const groupMins = TIME_GROUPS.map(g => {
      let m = 0;
      for (let h = g.start; h < g.end; h++) m += (Number(arr[h] || 0) / 100) * 60;
      return m;
    });
    let bestIdx = 0;
    for (let i = 1; i < groupMins.length; i++) {
      if (groupMins[i] > groupMins[bestIdx] || (groupMins[i] === groupMins[bestIdx] && i > bestIdx)) {
        bestIdx = i;
      }
    }
    tg = TIME_GROUPS[bestIdx];
  }

  const maxCount = Math.max(0, ...stats.map(s => Number(s?.count || 0)));
  const topLabels = stats
    .filter(s => Number(s?.count || 0) === maxCount && maxCount > 0)
    .map(s => s.label);

  let topLabel;
  let cat;

  if (!hasReads || maxCount === 0) {
    topLabel = null;
    cat = { adj: "여유로운", one: "기사 열람 기록은 아직 없어요", emoji: "🫖" };
  } else if (topLabels.length === 1) {
    topLabel = topLabels[0];
    cat = CAT[topLabel] || { adj: "균형잡힌", one: "여러 분야를 고르게 봤어요", emoji: "✨" };
  } else if (topLabels.length === 2) {
    topLabel = `${topLabels[0]}·${topLabels[1]}`;
    cat = { adj: "균형잡힌", one: "두 분야를 고르게 봤어요", emoji: "✨" };
  } else {
    topLabel = "여러 분야";
    cat = { adj: "균형잡힌", one: "여러 분야를 고르게 봤어요", emoji: "✨" };
  }

  if (!hasUsage && !hasReads) {
    return {
      name: "고요한 고양이",
      subtitle: "오늘 기준 (KST)",
      description: "오늘은 활동 기록이 거의 없었어요. 내일 더 풍성한 읽기를 기대해요.",
      emojis: ["😴", "🐈‍⬛"],
    };
  }

  if (hasUsage && !hasReads) {
    const longIdle = totalMinutes >= LONG_IDLE_MIN;
    const name = `${longIdle ? "대기 중" : "스쳐가는"} ${tg.animal}`;
    const subtitle = ["오늘 기준 (KST)", rangeText || undefined, `대표: ${tg.label}`]
      .filter(Boolean).join(" · ");
    const description = longIdle
      ? "오랜 시간 접속해 있었지만, 기사 열람 기록은 없었어요. 가볍게 훑거나 대기 상태였던 것 같아요."
      : "짧게 들러 확인만 했어요. 내일은 관심 뉴스를 찜해보는 건 어떨까요?";
    return { name, subtitle, description, emojis: ["🫖", tg.emoji] };
  }

  if (!hasUsage && hasReads) {
    const fallback = TIME_GROUPS[2];
    const name = `짧고 굵은 ${fallback.animal}`;
    const subtitle = ["오늘 기준 (KST)", topLabel ? `최다: ${topLabel}` : undefined]
      .filter(Boolean).join(" · ");
    const description = `짧은 시간에 ‘${topLabel || "여러 분야"}’ 뉴스를 집중해서 확인했어요. ${cat.one}`;
    return { name, subtitle, description, emojis: [cat.emoji, fallback.emoji] };
  }

  const minPerArticle = readsTotal > 0 ? totalMinutes / readsTotal : 0;
  const slowReader = minPerArticle >= SLOW_READ_MIN_PER_ARTICLE;

  const baseName = `${cat.adj} ${tg.animal}`;
  const name = slowReader ? `곱씹는 ${tg.animal}` : baseName;

  const subtitle = [
    "오늘 기준 (KST)",
    rangeText || undefined,
    `대표: ${tg.label}`,
    topLabel ? `최다: ${topLabel}` : undefined,
  ].filter(Boolean).join(" · ");

  const description = slowReader
    ? `한 편 한 편 곱씹었어요. ‘${topLabel || "여러 분야"}’ 중심으로 느긋하게 읽은 하루였네요.`
    : `오늘은 ${tg.label} 시간대에 주로 활동했고, ‘${topLabel || "여러 분야"}’ 뉴스를 많이 읽었어요. ${cat.one}`;

  return { name, subtitle, description, emojis: [cat.emoji, tg.emoji] };
}

/* utils */
function pad2(n) { return String(n).padStart(2, "0"); }
