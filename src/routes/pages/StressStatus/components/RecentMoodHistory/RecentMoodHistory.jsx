import React from "react";
import "./RecentMoodHistory.css";

/**
 * props:
 *  - items: [{ emoji, dateLabel, word, key? }]
 */
export default function RecentMoodHistory({ items = [] }) {

    console.log('RecentMoodHistory items', items);
  return (
    <section aria-label="최근 감정 기록">
      <h3 className="history-title">최근 감정 기록</h3>

      {/* 가로 슬라이드 영역 */}
      <div className="status-history-scroll" role="list">
        <div className="status-history-grid">
          {items.map((it, idx) => (
            <div className="mood-cell" role="listitem" key={it.key ?? idx}>
              <div className="mood-emoji" role="img" aria-label={it.word}>
                {it.emoji}
              </div>
              <div className="mood-desc">{it.dateLabel}</div>
              <div className="mood-desc">{it.word}</div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="mood-desc" style={{ padding: "8px 16px" }}>
              기록이 없습니다.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
