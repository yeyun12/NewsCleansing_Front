import React from "react";
import "./WeeklyPattern.css";

/**
 * props:
 *  - summary: string (예: "이번 주 가장 많은 기분: 😊 평온 (5일)")
 */
export default function WeeklyPattern({ summary = "" }) {
  return (
    <section aria-label="주간 기분 패턴">
      <h3 className="pattern-title">주간 기분 패턴</h3>

      <div className="status-pattern-card">
        <p className="pattern-desc">독서를 통한 감정 예측</p>
        {summary ? (
          <p className="pattern-most">{summary}</p>
        ) : (
          <p className="pattern-most">데이터가 충분하지 않습니다.</p>
        )}
      </div>
    </section>
  );
}
