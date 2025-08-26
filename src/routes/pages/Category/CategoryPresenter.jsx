import React from 'react';
import '../../../assets/styles/AppLayout.css'; // 공통 먼저 (오버라이드가 잘 먹게)
import './Category.css';                      // 페이지 CSS 나중

import CategoryTile from './components/CategoryTitle/CategoryTitle';

const CategoryPresenter = ({ categories, onCategoryClick }) => (
  <div className="app-layout category-layout">
    {/* 풀블리드 컨테이너 */}
    <div className="category-page-container category-flush">
      <div className="category-title-box">
        <h2 className="category-title">뉴스 카테고리</h2>
        <p className="category-desc">관심사별로 탐색하는 뉴스</p>
        {/* <input
          className="category-search"
          type="text"
          placeholder="카테고리를 검색하세요..."
          disabled
        /> */}
      </div>

      <div className="category-grid">
        {categories.map((cat) => (
          <CategoryTile
            key={cat.key}
            icon={cat.icon}
            label={cat.label}
            onClick={() => onCategoryClick(cat)}
          />
        ))}
      </div>

      <div className="category-bottom-desc">
        사려 깊은 성찰과 의미 있는 대화를 이끄는 카테고리를 선택하세요.
      </div>
    </div>
  </div>
);

export default CategoryPresenter;
