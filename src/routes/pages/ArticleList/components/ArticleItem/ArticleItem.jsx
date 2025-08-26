// src/pages/ArticleList/components/ArticleItem.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArticleItem = ({ id, title, category, time }) => {
  const navigate = useNavigate();
  const handleClick = () => navigate(`/news/${id}`);

  return (
    <div className="article-item" onClick={handleClick}>
      <div className="article-icon" />
      <div className="article-info">
        <div className="article-title">{title}</div>
        <div className="article-meta">
          <span className="article-category">{category}</span>
          {/* time 필드엔 언론사(press)를 넣어둠 */}
          {time ? <span className="article-time">{time}</span> : null}
        </div>
      </div>
    </div>
  );
};

export default ArticleItem;
