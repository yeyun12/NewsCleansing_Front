import React from "react";
import "./CurrentStatus.css";

/**
 * props:
 *  - emoji: string (e.g. "😊")
 *  - word:  string (e.g. "안정")
 *  - dateText: string (YYYY-MM-DD 등)
 */
export default function CurrentStatus({ emoji = "🙂", word = "평온", dateText = "" }) {
  return (
    <section className="status-main" aria-label="오늘의 상태">
      <div className="status-emoji" role="img" aria-label={word}>
        {emoji}
      </div>
      <div className="status-word">{word}</div>
      {dateText && (
        <time className="status-date" dateTime={dateText}>
          {dateText}
        </time>
      )}
    </section>
  );
}
