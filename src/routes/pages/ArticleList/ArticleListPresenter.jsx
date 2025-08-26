import React from "react";
import "./ArticleList.css";

// 카테고리 페이지에서 쓰던 카드 재사용
import ArticleCard from "../CategoryList/components/ArticleCard/ArticleCard";

/**
 * props
 * - loading, error
 * - filterList: string[]
 * - selectedFilter: string
 * - onFilterChange(name: string)
 * - articles: Article[]
 * - onClickItem(id: string)
 */
export default function ArticleListPresenter({
  loading,
  error,
  filterList = [],
  selectedFilter = "전체",
  onFilterChange,
  articles = [],
  onClickItem,
}) {
  return (
    <div className="app-layout">
      {/* flush 옵션으로 카드 분리감 제거 (CSS에 정의됨) */}
      <div className="article-list-container article-flush">
        {/* 헤더 */}
        <header className="article-list-header">
          <h2>오늘의 추천 뉴스</h2>
          <p className="article-list-desc">신중하게 선별된 의미 있는 이야기들</p>
        </header>

        {/* 카테고리 필터 (CSS의 .filter-group / .filter-btn 사용) */}
        <div className="filter-group" role="tablist" aria-label="카테고리">
          {filterList.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              className={`filter-btn ${selectedFilter === name ? "active" : ""}`}
              onClick={() => onFilterChange?.(name)}
            >
              {name}
            </button>
          ))}
        </div>

        {/* 에러 / 로딩 */}
        {error && <div className="no-articles">불러오기에 실패했어요. {error}</div>}
        {loading && !error && <div className="no-articles">불러오는 중…</div>}

        {/* 리스트 섹션 (간격은 .article-list-section에서 관리) */}
        {!loading && !error && (
          <section className="article-list-section" role="list">
            {articles.length > 0 ? (
              articles.map((a) => (
                <div role="listitem" key={a.id || a.url || Math.random()}>
                  {/* ArticleCard 자체가 카드 레이아웃/스타일을 가짐 */}
                  <ArticleCard article={a} onClick={onClickItem} />
                </div>
              ))
            ) : (
              <div className="no-articles">표시할 기사가 없습니다.</div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
