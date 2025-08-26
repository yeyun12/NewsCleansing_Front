// src/routes/pages/CategoryList/components/ArticleGrid/ArticleGrid.jsx
import React from "react";
import "./ArticleGrid.css";
import ArticleCard from "../ArticleCard/ArticleCard";

export default function ArticleGrid({ items }) {
  return (
    <div className="clist-grid">
      {items.map((it) => (
        <ArticleCard key={it.id} article={it} />
      ))}
    </div>
  );
}
