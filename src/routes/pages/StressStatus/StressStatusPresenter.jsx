import React from "react";
import "./StressStatus.css";

import CurrentStatus from "./components/CurrentStatus/CurrentStatus";
import RecentMoodHistory from "./components/RecentMoodHistory/RecentMoodHistory";
import WeeklyPattern from "./components/WeeklyPattern/WeeklyPattern";

/**
 * props:
 *  - loading, error
 *  - status: { emoji, word, score, dateText }
 *  - items: [{ emoji, dateLabel, word }]
 *  - summary: string
 *  - onReload: fn  (버튼은 제거했지만, 필요시 외부에서 호출 가능)
 */
export default function StressStatusPresenter({
  loading,
  error,
  status,
  items,
  summary,
}) {
  return (
    <div className="app-layout stress-layout">
      <div className="stress-card stress-flush">
        <header className="stress-header">
          <h2 className="stress-title">스트레스 지수</h2>
          <span className="stress-sub">독서를 통한 마음 웰니스 추적</span>

          {/* 새로고침 버튼 제거 */}
          {error && (
            <p className="error-text" role="alert" style={{ marginTop: 8 }}>
              {error}
            </p>
          )}
        </header>

        <main>
          {/* 숫자 지수(score) 표시를 위해 score prop 추가 전달 */}
          <CurrentStatus
            emoji={status?.emoji}
            word={status?.word}
            score={status?.score}
            dateText={status?.dateText}
            loading={loading}
          />

          {/* 가로 스크롤 유지 (컴포넌트 + CSS 그대로) */}
          <RecentMoodHistory items={items} />

          {/* 주간 카드 한 장으로 표시 */}
          <WeeklyPattern summary={summary} />
        </main>
      </div>
    </div>
  );
}
