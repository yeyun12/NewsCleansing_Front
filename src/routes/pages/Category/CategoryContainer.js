import React from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryPresenter from './CategoryPresenter';

// 카테고리 목록 데이터 (예시)
const categories = [
  { key: '정치', icon: '🏛️', label: '정치' },
  { key: '사회', icon: '🌐', label: '사회' },
  { key: '문화', icon: '🎭', label: '문화' },
  { key: '세계', icon: '🌎', label: '세계' },
  { key: '과학', icon: '🔬', label: '과학' },
  { key: '경제', icon: '💰', label: '경제' },
];

const CategoryContainer = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    // /category/:key 로 이동
    navigate(`/category/${encodeURIComponent(category.key)}`);
  };

  return (
    <CategoryPresenter
      categories={categories}
      onCategoryClick={handleCategoryClick}
    />
  );
};

export default CategoryContainer;
