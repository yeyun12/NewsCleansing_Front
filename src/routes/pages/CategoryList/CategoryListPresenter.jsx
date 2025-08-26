import React from "react";
import "../../../assets/styles/AppLayout.css";
import "./CategoryList.css";

import ListHeader from "./components/ListHeader/ListHeader";
import ArticleGrid from "./components/ArticleGrid/ArticleGrid";
import EmptyState from "./components/EmptyState/EmptyState";

export default function CategoryListPresenter({
  categoryKey,
  items,
  loading,
  error,
  hasMore,
  onLoadMore,
  onSearch,
}) {
  return (
    <div className="app-layout category-layout">
      <div className="category-page-container category-flush">
        <ListHeader
          title={`${categoryKey} 뉴스`}
          placeholder={`${categoryKey}에서 검색…`}
          onSearch={onSearch}
        />

        {items.length === 0 && !loading && !error ? (
          <EmptyState text="표시할 기사가 없어요." />
        ) : (
          <ArticleGrid items={items} />
        )}

        {error && <div className="catlist-msg error">오류: {error}</div>}

        <div className="catlist-more">
          {hasMore ? (
            <button
              className="catlist-loadmore"
              onClick={onLoadMore}
              disabled={loading}
            >
              {loading ? "불러오는 중…" : "더 보기"}
            </button>
          ) : (
            items.length > 0 && (
              <div className="catlist-msg">더 이상 기사가 없어요.</div>
            )
          )}
        </div>
      </div>
    </div>
  );
}