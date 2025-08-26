import React from "react";
import "../../../assets/styles/AppLayout.css";
import "./NewsDetail.css";
import ActionBar from "./components/ActionBar";
import RelatedList from "./components/RelatedList";

const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return "";
  }
};

/** 원문 HTML에 <p>가 없으면 문단 자동 래핑 */
function normalizeArticleHtml(raw) {
  if (!raw) return "";
  const hasP = /<p[\s>]/i.test(raw);
  if (hasP) return raw;
  const text = String(raw).replace(/\r\n/g, "\n").trim();
  const blocks = text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `<p>${s.replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return blocks || `<p>${text}</p>`;
}

/** 문장 하이라이트 */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildSentenceRegex(s) {
  const trimmed = s.trim();
  if (!trimmed) return null;
  const escaped = escapeRegExp(trimmed).replace(/\s+/g, "\\s*");
  return new RegExp(escaped, "gi");
}
function injectHighlights(html, sentences) {
  if (!html || !Array.isArray(sentences) || !sentences.length) return html;
  let out = html;
  for (const s of sentences) {
    const rx = buildSentenceRegex(String(s || ""));
    if (!rx) continue;
    out = out.replace(rx, (m) => `<mark class="nd-mark">${m}</mark>`);
  }
  return out;
}

/** keywords: 배열 or "['A','B']" 같은 문자열 모두 허용 */
function parseKeywords(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return [...new Set(raw.filter(Boolean))];

  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return [];
    // 1) JSON 시도
    try {
      const j = JSON.parse(s.replace(/'/g, '"'));
      if (Array.isArray(j)) return [...new Set(j.filter(Boolean))];
    } catch {}
    // 2) 대괄호 제거 + 쉼표 split
    const inner = s.replace(/^\s*\[|\]\s*$/g, "");
    const parts = inner
      .split(",")
      .map((v) => v.replace(/^['"\s]+|['"\s]+$/g, ""))
      .filter(Boolean);
    return [...new Set(parts)];
  }
  return [];
}

/** 감정 라벨 색상 클래스 매핑 */
const toSentClass = (label) => {
  if (!label) return "neu";
  const s = String(label);
  if (s.includes("우호") || s.includes("긍정")) return "pos";
  if (s.includes("비판") || s.includes("부정")) return "neg";
  return "neu";
};

export default function NewsDetailPresenter({
  article,
  bundle = [],
  nickname = "독자",
  recoSimilar = [],
  recoTopics = [],
  recoState = { loading: false, error: "" },
  loading,
  error,
  onOpenOriginal,
  onCleanse,
  highlightOn = false,
  evidenceSentences = [],
}) {
  if (loading)
    return (
      <div className="app-layout news-layout">
        <div className="news-detail-container news-flush">
          <div className="nd-center-abs">
            <div className="news-skel">불러오는 중…</div>
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="app-layout news-layout">
        <div className="news-detail-container news-flush">
          <div className="nd-center-abs">
            <div className="news-error">오류: {error}</div>
          </div>
        </div>
      </div>
    );
  if (!article)
    return (
      <div className="app-layout news-layout">
        <div className="news-detail-container news-flush">
          <div className="nd-center-abs">
            <div className="news-empty">기사를 찾을 수 없어요.</div>
          </div>
        </div>
      </div>
    );

  const {
    title,
    press,
    category,
    published_at,
    thumbnail_url,
    content,
    summary,        // 문자열 요약(있으면 표시)
    summary_items,  // 리스트 요약(클렌징 ON일 때 표시)
    keywords,       // 키워드: 배열 혹은 문자열
    attitude,       // '우호적' | '중립적' | '비판적'
    attitude_confidence, // 숫자(%) 또는 null
  } = article;

  const normalizedContent = normalizeArticleHtml(content);
  const displayHtml = highlightOn
    ? injectHighlights(normalizedContent, evidenceSentences)
    : normalizedContent;

  const hasSummaryItems =
    Array.isArray(summary_items) && summary_items.length > 0;
  const showTopSummary = Boolean(summary) || (highlightOn && hasSummaryItems);
  const keywordList = parseKeywords(keywords);

  return (
    <div className="app-layout news-layout">
      <div className="news-detail-container news-flush">
        <div className="nd-wrap">
          {/* 헤더 */}
          <header className="nd-head">
            <h1 className="nd-title">{title}</h1>
            <div className="nd-meta">
              <span className="nd-press">{press}</span>
              <span className="nd-dot">·</span>
              <span className="nd-cat">{category}</span>
              <span className="nd-dot">·</span>
              <time className="nd-time" dateTime={published_at}>
                {fmtDate(published_at)}
              </time>

              {/* 감정 라벨 (날짜 오른쪽) */}
              {attitude && (
                <span className={`nd-sent ${toSentClass(attitude)}`}>
                  {attitude}
                  {typeof attitude_confidence === "number" && (
                    <span className="nd-sent-conf">{` ${attitude_confidence}%`}</span>
                  )}
                </span>
              )}
            </div>
          </header>

          {/* 썸네일 */}
          {thumbnail_url && (
            <figure className="nd-hero">
              <img src={thumbnail_url} alt="" />
            </figure>
          )}

          {/* 액션 */}
          <div className="nd-actions">
            <ActionBar
              onOpenOriginal={onOpenOriginal}
              onCleanse={onCleanse}
              highlightOn={highlightOn}
            />
          </div>

          {/* 본문 위에 요약 카드 + 키워드 */}
          <section className="nd-body">
            {showTopSummary && (
              <section className="nd-summary-card" aria-label="요약">
                <div className="nd-summary-title">요약</div>
                {summary && <p className="nd-summary-text">{summary}</p>}
                {highlightOn && hasSummaryItems && (
                  <ul className="nd-summary-list">
                    {summary_items.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}

                {keywordList.length > 0 && (
                  <div className="nd-keywords" aria-label="키워드">
                    <div className="nd-key-title">키워드</div>
                    <div className="nd-chips">
                      {keywordList.map((k, i) => (
                        <span key={`${k}-${i}`} className="nd-chip">
                          #{k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            <div className="nd-section-title">본문</div>
            {displayHtml ? (
              <article
                className="nd-content"
                dangerouslySetInnerHTML={{ __html: displayHtml }}
              />
            ) : (
              <p className="nd-paragraph nd-muted">
                원문에 상세 본문이 있어요. 상단의 <b>원문 보기</b> 버튼으로 바로 이동할 수 있습니다.
              </p>
            )}
          </section>

          {/* ===== 추천 섹션 A ===== */}
          <section className="nd-related">
            <div className="nd-section-title">{nickname}님이 읽으신 기사와 비슷해요!</div>
            {recoState.loading && (
              <div className="nd-center-block">
                <div className="news-skel">추천 불러오는 중…</div>
              </div>
            )}
            {!recoState.loading && recoState.error && (
              <div className="nd-center-block">
                <div className="news-error">추천 오류: {recoState.error}</div>
              </div>
            )}
            {!recoState.loading && !recoState.error && recoSimilar.length > 0 ? (
              <RelatedList items={recoSimilar} />
            ) : !recoState.loading && !recoState.error ? (
              <div className="nd-center-block">
                <div className="news-empty">비슷한 기사가 많지 않네요.</div>
              </div>
            ) : null}
          </section>

          {/* ===== 추천 섹션 B ===== */}
          <section className="nd-related">
            <div className="nd-section-title">{nickname}님, 이런 기사는 어떠세요?</div>
            {!recoState.loading && !recoState.error && recoTopics.length > 0 ? (
              <RelatedList items={recoTopics} />
            ) : !recoState.loading &&
              !recoState.error &&
              recoSimilar.length === 0 ? (
              <div className="nd-center-block">
                <div className="news-empty">추천 결과가 아직 없어요.</div>
              </div>
            ) : null}
          </section>

          {/* (선택) 기존 번들 섹션 */}
          {Array.isArray(bundle) && bundle.length > 0 && (
            <section className="nd-related">
              <div className="nd-section-title">관련 기사</div>
              <RelatedList items={bundle} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
