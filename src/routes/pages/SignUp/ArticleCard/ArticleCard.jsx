import React from "react";
import { useNavigate } from "react-router-dom";
import "./ArticleCard.css";

const fmtRelative = (iso) => {
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "방금";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  } catch {
    return "";
  }
};

export default function ArticleCard({ article }) {
  const navigate = useNavigate();

  // 백엔드 키 다양성 대응(id | article_id)
  const id =
    (article && (article.id ?? article.article_id)) != null
      ? String(article.id ?? article.article_id)
      : null;

  const {
    title,
    press,
    category,
    published_at,
    thumbnail_url,
    url, // 폴백용(내부 id 없을 때만 사용)
  } = article || {};

  const handleOpen = (e) => {
    // 카드 내부에 a 태그가 있어도 외부로 튀지 않게 방지
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (id) {
      navigate(`/news/${encodeURIComponent(id)}`);
    } else if (url) {
      // 정말로 id가 없을 때만 원문으로 폴백
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    // a 대신 article/div로 클릭 처리 (외부 이동 방지)
    <article className="acard" role="button" onClick={handleOpen}>
      <div className="acard-thumb" aria-hidden="true">
        {thumbnail_url ? (
          <img src={thumbnail_url} alt="" />
        ) : (
          <div className="acard-thumb-placeholder" />
        )}
      </div>

      <div className="acard-body">
        <h3 className="acard-title">{title}</h3>
        <div className="acard-meta">
          <span className="acard-press">{press || "언론사"}</span>
          <span className="acard-dot">·</span>
          <span className="acard-cat">{category || "카테고리"}</span>
          <span className="acard-dot">·</span>
          <time className="acard-time" dateTime={published_at}>
            {fmtRelative(published_at)}
          </time>
        </div>
      </div>
    </article>
  );
}
