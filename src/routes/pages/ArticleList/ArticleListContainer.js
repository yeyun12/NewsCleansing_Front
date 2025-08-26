// 홈 피드 → ArticleCard 형태로 변환 + 카테고리 필터링
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArticleListPresenter from "./ArticleListPresenter";

const RAW_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
const API_BASE = RAW_BASE.replace(/\/$/, "") + "/api";

// 로그인 저장소 → user.id 꺼냄
function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}
function getUserId(u) {
  return u?.id ?? u?.user_id ?? u?.pk ?? u?.uid ?? null;
}

const FILTERS = ["전체", "경제", "정치", "사회", "세계", "과학", "문화"];

// 백 카테고리 → 우리 라벨 정규화
function normalizeCategory(id, rawCategory) {
  const sid = String(id || "");
  if (sid.startsWith("eco")) return "경제";
  if (sid.startsWith("pol")) return "정치";
  if (sid.startsWith("soc")) return "사회";
  if (sid.startsWith("lif")) return "문화";
  if (sid.startsWith("sci")) return "과학";
  if (sid.startsWith("int")) return "세계";

  switch (rawCategory) {
    case "경제": return "경제";
    case "정치": return "정치";
    case "사회": return "사회";
    case "세계":
    case "국제": return "세계";
    case "과학":
    case "IT/과학":
    case "IT": return "과학";
    case "문화":
    case "생활/문화": return "문화";
    default: return "사회";
  }
}

// 홈피드 응답 → ArticleCard가 바로 쓰는 배열로 변환
function feedToItems(feed) {
  const sections = feed?.sections || [];
  const order = feed?.order_for_all || FILTERS.slice(1);

  const out = [];
  for (const cat of order) {
    const sec = sections.find((s) => s.category === cat);
    if (!sec) continue;

    for (const a of sec.articles || []) {
      out.push({
        id: a.id,
        title: a.title,
        press: a.press,
        category: normalizeCategory(a.id, a.category),
        published_at: a.published_at,
        thumbnail_url: a.thumbnail_url,
        url: a.url,
        // 감정/신뢰도 (ArticleCard에서 배지로 표시)
        attitude: a.attitude ?? a.sentiment ?? null, // '우호적'|'중립적'|'비판적'
        attitude_confidence:
          a.attitude_confidence ?? a.sentimentConfidence ?? null,
      });
    }
  }
  return out;
}

export default function ArticleListContainer() {
  const navigate = useNavigate();
  const user = useMemo(readUser, []);
  const userId = getUserId(user) ?? "1"; // 로그인 없으면 1로 폴백

  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(
          `${API_BASE}/news/user/${userId}/feed/home?exclude_read=true`,
          { credentials: "include" }
        );
        const ct = res.headers.get("content-type") || "";
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!ct.includes("application/json")) {
          const t = await res.text();
          throw new Error(`Non-JSON: ${t.slice(0, 160)}`);
        }
        const data = await res.json();
        const list = feedToItems(data);
        if (alive) setItems(list);
      } catch (e) {
        if (alive) setErr(e?.message || "불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  const filtered = useMemo(() => {
    if (selectedFilter === "전체") return items;
    return items.filter((x) => x.category === selectedFilter);
  }, [items, selectedFilter]);

  const handleClickItem = (id) => {
    if (!id) return;
    navigate(`/news/${encodeURIComponent(String(id))}`);
  };

  return (
    <ArticleListPresenter
      loading={loading}
      error={err}
      filterList={FILTERS}
      selectedFilter={selectedFilter}
      onFilterChange={setSelectedFilter}
      articles={filtered}
      onClickItem={handleClickItem}
    />
  );
}
