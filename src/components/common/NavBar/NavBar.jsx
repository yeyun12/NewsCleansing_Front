// src/components/common/NavBar/NavBar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';

const NAV_ITEMS = [
    { key: 'home', icon: '🏠', label: '홈', route: '/main' },
    { key: 'mood', icon: '😊', label: '기분', route: '/stress-status' },
    { key: 'news', icon: '📰', label: '추천뉴스', route: '/article-list' },
    { key: 'analysis', icon: '📊', label: '독서분석', route: '/reading-analysis' },
    { key: 'profile', icon: '👤', label: '내정보', route: '/profile' },
];

export default function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="nav-bar" role="navigation" aria-label="하단 내비게이션">
            {NAV_ITEMS.map((item) => {
                const active = location.pathname === item.route;
                return (
                    <button
                        key={item.key}
                        type="button"
                        className={'nav-bar-item' + (active ? ' active' : '')}
                        onClick={() => navigate(item.route)}
                        aria-current={active ? 'page' : undefined}
                        aria-label={item.label}
                    >
                        <span className="nav-bar-icon" aria-hidden="true">{item.icon}</span>
                        <span className="nav-bar-label">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
