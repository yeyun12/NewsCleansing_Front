// src/routes/pages/Main/MainPresenter.jsx
import React from "react";
import "./Main.css";

/* 버튼들: Main/components 폴더 경로 */
import TodayArticleButton from "./components/TodayArticleButton";
import CategoryButton from "./components/CategoryButton";
import ReadingAnalysisButton from "./components/ReadingAnalysisButton";
import MindfulnessButton from "./components/MindfulnessButton";

/**
 * props
 * - nickname: string
 * - readsToday: number
 * - moodEmoji: string
 * - personaEmojis: [string, string]
 * - onButtonClick?: (label: string) => void
 */
export default function MainPresenter({
  nickname = "독자",
  readsToday = 0,
  moodEmoji = "🙂",
  personaEmojis = ["✨", "🦊"],
  onButtonClick,
}) {
  const go = (label) => () => onButtonClick && onButtonClick(label);

  return (
    <div className="app-layout main-layout">
      {/* CSS와 매칭: home-container + home-flush */}
      <div className="home-container home-flush">
        {/* 상단 인사 섹션 → .welcome-section */}
        <section className="welcome-section" aria-label="환영">
          {/* 필요시 인사말 추가 가능
          <h1>안녕하세요, {nickname}님</h1>
          <p>사려 깊은 저널리즘으로 더 나은 하루를</p>
          */}
        </section>

        {/* 오늘 요약 카드 */}
        <section className="stats-section" aria-label="오늘 요약">
          {/* 읽은 기사 수 */}
          <div className="stats-item">
            <div className="stats-number" aria-label="읽은 기사 수">
              {Number(readsToday) || 0}
            </div>
            <div className="stats-label">읽은 기사</div>
          </div>

          {/* 오늘의 기분 이모지 */}
          <div className="stats-item">
            <div className="stats-emoji" role="img" aria-label="오늘의 기분">
              {moodEmoji || "🙂"}
            </div>
            <div className="stats-label">오늘의 기분</div>
          </div>

          {/* 오늘의 캐릭터 (이모지 2개 표시) */}
          <div className="stats-item">
            <div
              className="stats-emoji"
              role="img"
              aria-label="오늘의 캐릭터"
              title="오늘의 캐릭터"
            >
              <span>{personaEmojis?.[0] ?? "✨"}</span>
              <span style={{ marginLeft: 6 }}>
                {personaEmojis?.[1] ?? "🦊"}
              </span>
            </div>
            <div className="stats-label">오늘의 캐릭터</div>
          </div>
        </section>

        {/* 타일 버튼 그리드 */}
        <nav className="button-grid" aria-label="바로가기">
          <TodayArticleButton onClick={go("오늘의 기사")} />
          <ReadingAnalysisButton onClick={go("독서 분석")} />
          <MindfulnessButton onClick={go("마음 챙김")} />
          <CategoryButton onClick={go("카테고리")} />
        </nav>
      </div>
    </div>
  );
}
