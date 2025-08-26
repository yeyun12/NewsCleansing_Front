import React from "react";
import "./EmotionTrendGraph.css"; // etg- 스타일

export default function EmotionTrendGraph({ trend = [] }) {
  // trend: 길이 24의 0~100 정수 배열
  const arr = Array.isArray(trend) ? trend : [];
  const hasData = arr.some((v) => Number(v) > 0);

  const ticks = [0, 6, 12, 18, 23];

  return (
    <div className="etg-card">
      <div className="etg-head">
        <div className="etg-title">접속 시간대</div>
        <div className="etg-subtitle">오늘 기준 (KST)</div> {/* ⬅️ 문구 변경 */}
      </div>

      <div className="etg-bars-row">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="etg-bar-wrap">
            <div className="etg-bar-bg">
              <div
                className="etg-bar-fg"
                style={{ height: `${Math.max(0, Math.min(100, Number(arr[i] || 0)))}%` }}
              />
            </div>
            <div className={`etg-tick ${ticks.includes(i) ? "etg-tick-on" : ""}`}>{i}</div>
          </div>
        ))}
      </div>

      {!hasData && (
        <div style={{ color: "#a09489", fontSize: 14, marginTop: 8 }}>
          오늘 사용 기록이 없어요.
        </div>
      )}
    </div>
  );
}
