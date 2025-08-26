// src/routes/pages/CategoryList/CategoryListContainer.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import CategoryListPresenter from "./CategoryListPresenter";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

// 백엔드 Article.category 스펠링 보정(동의어)
const CATEGORY_SYNONYMS = {
  "정치": ["정치"],
  "사회": ["사회"],
  "문화": ["문화", "생활/문화"],
  "세계": ["세계", "국제"],
  "과학": ["과학", "IT/과학", "IT"],
  "경제": ["경제"],
};

const PAGE_SIZE = 20;

export default function CategoryListContainer() {
  const { key: rawKey } = useParams();
  const categoryKey = decodeURIComponent(rawKey || "");

  const synonyms = useMemo(
    () => CATEGORY_SYNONYMS[categoryKey] || [categoryKey],
    [categoryKey]
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [q, setQ] = useState("");

  // 카테고리/검색 변경 시 초기화
  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    setError("");
  }, [categoryKey, q]);

  const fetchOnce = async (cat, limit, off, query) => {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(off),
    });
    if (cat) params.set("category", cat);
    if (query) params.set("q", query);

    const res = await fetch(`${API_BASE}/api/news?${params.toString()}`);
    if (!res.ok) throw new Error(`list fetch failed: ${res.status}`);

    const json = await res.json(); // { items, total, ... }
    const items = Array.isArray(json.items) ? json.items : [];

    // ✅ 백엔드의 attitude/attitude_confidence를 프론트 필드로 매핑
    return items.map((it) => ({
      ...it,
      sentiment: it.attitude ?? null,
      sentimentConfidence: it.attitude_confidence ?? null,
    }));
  };

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError("");

    try {
      let merged = [];
      let anyFullPage = false;

      // 동의어들 순차 조회 후 중복 제거 병합
      for (const cat of synonyms) {
        const got = await fetchOnce(cat, PAGE_SIZE, offset, q);

        const exist = new Set(merged.map((x) => x.id));
        const deduped = got.filter((x) => !exist.has(x.id));
        merged = merged.concat(deduped);

        if (got.length >= PAGE_SIZE) anyFullPage = true;
        if (merged.length >= PAGE_SIZE) break;
      }

      setItems((prev) => prev.concat(merged));
      setOffset((prev) => prev + PAGE_SIZE);

      const stillMore = anyFullPage || merged.length >= PAGE_SIZE;
      setHasMore(stillMore);
    } catch (e) {
      setError(e.message || "fetch error");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, synonyms, offset, q]);

  // 최초/변경 시 자동 로드
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey, q]);

  return (
    <CategoryListPresenter
      categoryKey={categoryKey}
      items={items}
      loading={loading}
      error={error}
      hasMore={hasMore}
      onLoadMore={loadMore}
      onSearch={setQ}
    />
  );
}
