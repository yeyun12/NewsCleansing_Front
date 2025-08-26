// src/routes/pages/CategoryList/components/ArticleCard/ArticleCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./ArticleCard.css";

const fmtRelative = (iso) => {
  if (!iso) return "최근";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "최근";
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
};

const toSentClass = (label) => {
  if (!label) return "neu";
  const s = String(label).toLowerCase();
  if (s.includes("우호") || s.includes("긍정") || s.startsWith("pos") || s.includes("positive"))
    return "pos";
  if (s.includes("비판") || s.includes("부정") || s.startsWith("neg") || s.includes("negative"))
    return "neg";
  return "neu";
};

export default function ArticleCard({ article, onClick }) {
  const navigate = useNavigate();

  // id | article_id 호환 + 항상 문자열화
  const rawId = article && (article.id ?? article.article_id);
  const id = rawId != null ? String(rawId) : null;

  const {
    title,
    press,
    category,
    published_at,
    thumbnail_url,
    url, // 폴백(정말 id 없을 때만)
  } = article || {};

  // 감정/신뢰도(백엔드 키 다양성 흡수)
  const sentiment = article?.sentiment ?? article?.attitude ?? null;
  const rawConf = article?.sentimentConfidence ?? article?.attitude_confidence ?? null;
  const confNum =
    typeof rawConf === "number"
      ? Math.round(rawConf)
      : Number.isFinite(parseFloat(rawConf))
      ? Math.round(parseFloat(rawConf))
      : null;

  const goDetail = () => {
    if (id && typeof onClick === "function") {
      onClick(id);
      return;
    }
    if (id) {
      // 🔒 id를 안전하게 인코딩해서 SPA 라우팅
      navigate(`/news/${encodeURIComponent(id)}`);
    } else if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      console.warn("ArticleCard: no id/url", article);
    }
  };

  const handleClick = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    goDetail();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goDetail();
    }
  };

  return (
    <article
      className="acard"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKey}
      aria-label={title || "기사 카드"}
      data-article-id={id || ""}
    >
      <div className="acard-thumb" aria-hidden="true">
        {thumbnail_url ? <img src={thumbnail_url} alt="" /> : <div className="acard-thumb-placeholder" />}
      </div>

      <div className="acard-body">
        <h3 className="acard-title">{title}</h3>

        {/* 메타 라인: 언론사 · 카테고리 · 최근 + (오른쪽 끝) 감정 라벨 */}
        <div className="acard-meta">
          <span className="acard-press">{press || "언론사"}</span>
          <span className="acard-dot">·</span>
          <span className="acard-cat">{category || "카테고리"}</span>
          <span className="acard-dot">·</span>
          <time className="acard-time" dateTime={published_at || ""}>
            {article?.relative_time || fmtRelative(published_at)}
          </time>

          {sentiment && (
            <span className={`acard-sent inmeta ${toSentClass(sentiment)}`} title="기사 전반의 어조">
              {sentiment}
              {confNum != null && <span className="acard-sent-conf">{` ${confNum}%`}</span>}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
