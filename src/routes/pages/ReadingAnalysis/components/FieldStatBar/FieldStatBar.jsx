import React from "react";
import "./FieldStatBar.css";

/** 카테고리별 기본 색상 */
const COLORS = {
  경제: "#7A6B5D",
  정치: "#796a5c",
  사회: "#756656",
  문화: "#715f50",
  세계: "#6e5b4c",
  과학: "#6a5647",
};

export default function FieldStatBar({ label, value, count }) {
  // value는 0~100 (%), count는 정수
  const safePercent = Math.min(100, Math.max(0, Number(value || 0)));
  const color = COLORS[label] || COLORS["경제"];

  // 값이 바뀔 때마다 애니메이션 재생을 위해 key 사용
  const barKey = `${label}-${safePercent}`;

  return (
    <div className="field-stat-bar-row" aria-label={`${label} ${count ?? 0}개`}>
      <span className="field-label">{label}</span>

      <div className="field-bar-wrap">
        <div className="field-bar-bg">
          <div
            key={barKey}
            className="field-bar-fg"
            style={{
              // CSS 변수로 목표 퍼센트 전달 → keyframes의 to { width: var(--target) }
              "--target": `${safePercent}%`,
              "--bar-color": color,
            }}
          />
        </div>

        <span className="field-count" aria-hidden="true">
          {Number(count || 0)}개
        </span>
      </div>
    </div>
  );
}
