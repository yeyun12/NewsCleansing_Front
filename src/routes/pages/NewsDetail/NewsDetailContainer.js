import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import NewsDetailPresenter from "./NewsDetailPresenter";

/** FastAPI base */
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

/* ---------------- 스트레스 가중치 ---------------- */
const PENALTY_CLEANSE_ON = 1.5;
const DELTA_BY_ATTITUDE = { 비판적: 1, 중립적: -1, 우호적: -2 };

/* ---------------- 유틸 ---------------- */
const readUserFromStorage = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
};
const getDisplayName = (u) =>
  (u?.name || u?.nickname || u?.username || (typeof u?.email === "string" && u.email.split("@")[0])) || "독자";
const getUserId = (u) => (u?.id ?? u?.user_id ?? u?.pk ?? u?.uid ?? null);

// 추천 카드 정규화(ArticleCard 호환)
const normalizeRecoItem = (it) => {
  const pct = (v) => {
    if (v == null) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return n <= 1 ? Math.round(n * 100) : Math.round(n);
  };
  return {
    id: String(it.article_id || it.id || ""),
    article_id: it.article_id || it.id || "",
    title: it.title || "",
    press: it.press || it.source || "",
    category: it.category || "",
    published_at: it.published_at || it.date || null,
    thumbnail_url: it.thumbnail_url || it.thumbnail || it.image_url || "",
    url: it.url || "",
    // 감정(있으면 표시)
    attitude: it.attitude || it.sentiment || it.tone_label || null,
    attitude_confidence:
      typeof it?.attitude_confidence === "number"
        ? Math.round(it.attitude_confidence)
        : pct(it?.confidence ?? it?.sentiment_score),
  };
};

/* --------------- API --------------- */
// /complete만 호출
async function fetchComplete(articleId, { similar = 5, related = 6 } = {}) {
  const u = new URL(
    `${API_BASE}/api/news/${encodeURIComponent(articleId)}/complete`
  );
  u.searchParams.set("similar_limit", String(similar));
  u.searchParams.set("related_limit", String(related));
  const res = await fetch(u.toString(), { credentials: "include" });
  if (!res.ok) throw new Error(`complete ${res.status}`);
  return res.json();
}


async function openRead(articleId, userId) {
  if (!userId) return null;
  const r = await fetch(`${API_BASE}/api/news/${encodeURIComponent(articleId)}/open`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user_id: userId }),
  });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);
  return j?.read_id ?? null;
}
async function closeRead(articleId, userId, readId) {
  if (!userId || !readId) return;
  try {
    await fetch(`${API_BASE}/api/news/${encodeURIComponent(articleId)}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: userId, read_id: String(readId) }),
    });
  } catch { }
}
async function postEvents(events) {
  try {
    await fetch(`${API_BASE}/api/news/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ events }),
    });
  } catch (e) {
    console.warn("events post failed:", e);
  }
}

/* --------------- 중복 open 방지 --------------- */
const SESSION_TTL_MS = 60_000;
const sessionKey = (uid, aid) => `read:${uid || "guest"}:${aid}`;
const now = () => Date.now();

/* --------------- Component --------------- */
export default function NewsDetailContainer() {
  const { id: rawId } = useParams();
  const articleId = decodeURIComponent(rawId || "");

  const user = useMemo(readUserFromStorage, []);
  const userId = getUserId(user);
  const [displayName, setDisplayName] = useState(getDisplayName(user));

  const [article, setArticle] = useState(null);
  const [bundle, setBundle] = useState([]);
  const [recoSimilar, setRecoSimilar] = useState([]);
  const [recoTopics, setRecoTopics] = useState([]);
  const [recoState, setRecoState] = useState({ loading: false, error: "" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [highlightOn, setHighlightOn] = useState(false);
  const [evidenceSentences, setEvidenceSentences] = useState([]);

  const readIdRef = useRef(null);
  const lastArticleRef = useRef(null);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        try { setDisplayName(getDisplayName(JSON.parse(e.newValue || "null"))); } catch { }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 상세 + 추천
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError("");
      setRecoState({ loading: true, error: "" });
      try {
        const data = await fetchComplete(articleId, { similar: 5, related: 6 });
        if (ignore) return;

        const art = data?.article || null;
        setArticle(art);
        lastArticleRef.current = art;
        setEvidenceSentences(Array.isArray(art?.evidence_sentences) ? art.evidence_sentences : []);

        console.log('[NewsDetail] data: ', data);

        const sim = data?.recommendations?.similar?.recommendations || [];
        const topics = data?.recommendations?.topics?.related_topics || [];
        const simItems = sim.map(normalizeRecoItem).filter((x) => x.id);
        
        console.log('[NewsDetail] sim: ', sim);
        console.log('[NewsDetail] simItems: ', simItems);
        
        const topicItems = topics.map(normalizeRecoItem).filter((x) => x.id);

        const seen = new Set([String(articleId)]);
        const dedup = (arr) => arr.filter((x) => {
          const k = String(x.id);
          if (!k || seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        setRecoSimilar(dedup(simItems));
        setRecoTopics(dedup(topicItems));
        setBundle([]);
      } catch (e) {
        if (!ignore) setError(e?.message || "fetch error");
      } finally {
        if (!ignore) {
          setLoading(false);
          setRecoState({ loading: false, error: "" });
        }
      }
    })();
    return () => { ignore = true; };
  }, [articleId]);

  /** open/close + 읽기 종료시 스트레스 이벤트 */
  useEffect(() => {
    if (!articleId || !userId) return;

    const key = sessionKey(userId, articleId);
    let stopped = false;

    const cached = (() => {
      try { return JSON.parse(sessionStorage.getItem(key) || "null"); } catch { return null; }
    })();

    const tryOpen = async () => {
      if (stopped) return;
      if (cached?.readId && now() - (cached.ts || 0) < SESSION_TTL_MS) {
        readIdRef.current = cached.readId;
        return;
      }
      await new Promise((r) => setTimeout(r, 800));
      if (stopped) return;
      const rid = await openRead(articleId, userId);
      if (!stopped && rid) {
        readIdRef.current = rid;
        sessionStorage.setItem(key, JSON.stringify({ readId: rid, ts: now() }));
      }
    };

    const doClose = async () => {
      const rid = readIdRef.current;
      if (!rid) return;
      readIdRef.current = null;
      sessionStorage.removeItem(key);
      try { await closeRead(articleId, userId, rid); } finally {
        const art = lastArticleRef.current;
        if (art && userId) {
          const att = art.attitude || "중립적";
          const delta = DELTA_BY_ATTITUDE[att] ?? -1;
          const aid = art.id || art.article_id || articleId;
          if (aid) {
            void postEvents([{
              user_id: userId,
              event_type: "stress_delta",
              article_id: aid,
              metadata: { delta, reason: "read_close", attitude: att },
            }]);
          }
        }
      }
    };

    const onHide = () => { if (document.visibilityState === "hidden") void doClose(); };

    void tryOpen();
    window.addEventListener("beforeunload", doClose);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", doClose);
      void doClose();
    };
  }, [articleId, userId]);

  const handleOpenOriginal = () => {
    if (article?.url) window.open(article.url, "_blank", "noopener,noreferrer");
  };
  const handleCleanse = async () => {
    const next = !highlightOn;
    setHighlightOn(next);
    if (next && userId && lastArticleRef.current) {
      const aid = lastArticleRef.current.id || lastArticleRef.current.article_id || articleId;
      if (aid) {
        await postEvents([{
          user_id: userId,
          event_type: "stress_delta",
          article_id: aid,
          metadata: { delta: PENALTY_CLEANSE_ON, reason: "cleanse_on" },
        }]);
      }
    }
  };

  useEffect(() => {
    setHighlightOn(false);
  }, [articleId]);

  return (
    <NewsDetailPresenter
      article={article}
      bundle={bundle}
      nickname={displayName}
      recoSimilar={recoSimilar}
      recoTopics={recoTopics}
      recoState={recoState}
      loading={loading}
      error={error}
      onOpenOriginal={handleOpenOriginal}
      onCleanse={handleCleanse}
      highlightOn={highlightOn}
      evidenceSentences={evidenceSentences}
    />
  );
}