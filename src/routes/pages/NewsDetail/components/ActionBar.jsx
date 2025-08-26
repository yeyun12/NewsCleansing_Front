import React from "react";

export default function ActionBar({
  onOpenOriginal,
  onCleanse,
  highlightOn = false
}) {
  return (
    <div className="nd-actionbar" role="group" aria-label="기사 액션">
      <button type="button" className="nd-btn ghost" onClick={onOpenOriginal}>
        원문 보기
      </button>

      <button
        type="button"
        className={`nd-btn primary ${highlightOn ? "active" : ""}`}
        onClick={onCleanse}
        aria-pressed={highlightOn}
        title={highlightOn ? "클릭하면 하이라이트를 끕니다" : "클릭하면 하이라이트를 켭니다"}
      >
        {highlightOn ? "클렌징 해제" : "클렌징"}
      </button>

      <style>{`
        .nd-actionbar {
          display:flex; gap:10px; align-items:center;
          margin: 10px 0 12px;
        }
        .nd-btn {
          --nd-radius: 12px;
          --nd-bg: #efe9df;
          --nd-border: #e4ddd3;
          --nd-text: #3a3025;

          cursor:pointer;
          padding: 10px 14px;
          border-radius: var(--nd-radius);
          border:1px solid var(--nd-border);
          background: linear-gradient(180deg, var(--nd-bg), #eae3d8);
          color: var(--nd-text);
          transition: transform .04s ease, box-shadow .15s ease, filter .15s ease;
          box-shadow: 0 1px 0 rgba(34,25,21,.04);
        }
        .nd-btn:hover { filter: brightness(.98); }
        .nd-btn:active { transform: translateY(1px); }
        .nd-btn:focus-visible {
          outline: 2px solid rgba(160,140,110,.35);
          outline-offset: 2px;
        }

        .nd-btn.ghost {
          background: #f4efe7;
          border-color: #e6dccb;
        }

        .nd-btn.primary {
          --nd-bg: #d9cfc2;
          --nd-border: #cfbfa9;
        }
        .nd-btn.primary.active {
          background: linear-gradient(180deg, #cdbfa9, #c8b79e);
          border-color: #bba684;
          box-shadow: 0 0 0 2px rgba(187,166,132,.32) inset, 0 2px 6px rgba(0,0,0,.05);
        }

        /* 상태 안내(텍스트 필요 시 사용)
        .nd-hint { font-size:12px; opacity:.7; margin-left:6px; } 
        */
      `}</style>
    </div>
  );
}
