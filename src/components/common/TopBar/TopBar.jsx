import React, { useState } from 'react';
import './TopBar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

// 폴백 POST 유틸
async function postWithFallbacks(paths, jsonBody) {
  const bodyJSON = JSON.stringify(jsonBody);
  const query = new URLSearchParams(jsonBody).toString();

  for (const p of paths) {
    try {
      const r = await fetch(p, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyJSON,
      });
      if (r.ok) return r;
      console.debug('[session] JSON POST 실패', p, r.status);
    } catch (e) {
      console.debug('[session] JSON POST 에러', p, e);
    }
  }

  for (const p of paths) {
    try {
      const url = `${p}?${query}`;
      const r = await fetch(url, { method: 'POST' });
      if (r.ok) return r;
      console.debug('[session] Query POST 실패', url, r.status);
    } catch (e) {
      console.debug('[session] Query POST 에러', p, e);
    }
  }
  throw new Error('all fallbacks failed');
}

const TopBar = ({
  title = 'NewsCleansing',
  subtitle = '사려 깊은 저널리즘으로 더 나은 하루를',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);

  const showLogout = location.pathname === '/profile';

  // ✅ 뒤로가기 버튼: 기사목록(/article-list), 카테고리 선택(/category),
  //    기사 상세(/news/:id), 그리고 카테고리별 목록(/category/:key)에서 표시
  const showBackButton =
    location.pathname === '/article-list' ||
    location.pathname === '/category' ||
    location.pathname.startsWith('/category/') || // ← 추가
    location.pathname.startsWith('/news/');

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/main', { replace: true });
  };

  const handleLogoutClick = () => setShowConfirm(true);

  // 세션 종료
  const endSession = async (userId, sessionId) => {
    if (!userId || !sessionId) return;
    const paths = [
      `${API_BASE}/api/user/session/end`,
      `${API_BASE}/api/user/sessions/end`, // 복수 경로 폴백
    ];
    try {
      const res = await postWithFallbacks(paths, {
        user_id: userId,
        session_id: sessionId,
      });
      const data = await res.json().catch(() => ({}));
      console.debug('[session] end OK', data);
    } catch (e) {
      console.error('[session] end 실패', e);
    }
  };

  const handleConfirmLogout = async () => {
    const raw = localStorage.getItem('user');
    const user = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
    const sessionId = localStorage.getItem('session_id') || null;

    await endSession(user?.id, sessionId);

    try {
      localStorage.removeItem('session_id');
      localStorage.removeItem('user');
    } catch {}

    setShowConfirm(false);
    navigate('/signin', { replace: true });
  };

  const handleCancelLogout = () => setShowConfirm(false);

  return (
    <>
      <div className="top-bar">
        {showBackButton && (
          <button className="top-bar-back-btn" onClick={handleBack} aria-label="뒤로가기">
            &lt;
          </button>
        )}

        {showLogout && (
          <button className="top-bar-logout-btn" onClick={handleLogoutClick} aria-label="로그아웃">
            로그아웃
          </button>
        )}

        <div className="top-bar-main">
          <h1 className="top-bar-title">{title}</h1>
          <div className="top-bar-subtitle">{subtitle}</div>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  );
};

export default TopBar;
