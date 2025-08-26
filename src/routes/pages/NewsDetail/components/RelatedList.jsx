import React from "react";
import ArticleCard from "../../CategoryList/components/ArticleCard/ArticleCard";

export default function RelatedList({ items = [] }) {
  return (
    <div className="nd-related-grid">
      {items.map((it) => (
        <ArticleCard key={it.id} article={it} />
      ))}
      <style>{`
        .nd-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }
        @media (min-width: 1200px) { .nd-related-grid { gap: 16px; } }
      `}</style>
    </div>
  );
}
