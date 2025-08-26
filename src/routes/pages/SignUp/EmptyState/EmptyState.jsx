import React from "react";

export default function EmptyState({ text }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div style={{ fontSize: 28, marginBottom: 6 }}>📰</div>
      <div style={{ color: "#a89a7a" }}>{text || "결과가 없어요."}</div>
      <style>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 8px;
          border: 1px dashed #e4ddd3;
          border-radius: 14px;
          background: #fbf9f6;
        }
      `}</style>
    </div>
  );
}
