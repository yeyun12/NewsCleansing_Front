// src/routes/index.js
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ScrollToTop } from "../components/ScrollToTop";

// 페이지 모음
import {
  Main,
  SignIn,
  SignUp,
  ArticleList,
  NewsDetail,
  StressStatus,
  ReadingAnalysis,
  Category,      // 카테고리 선택
  CategoryList,  // 카테고리별 기사 목록
  Profile,
} from "./pages";

/** 안전하게 user 파싱 + 최소 필드(id) 존재 여부 체크 */
function isAuthed() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return false;
    const u = JSON.parse(raw);
    // id(숫자/문자) 중 하나만 있어도 로그인으로 간주
    return Boolean(u && (u.id ?? u.user_id));
  } catch {
    // 저장이 깨졌다면 로그인 아님으로 간주
    return false;
  }
}

/** 보호 라우트: 비로그인 시 /signin으로 */
function RequireAuth({ children }) {
  return isAuthed() ? children : <Navigate to="/signin" replace />;
}

/** 로그인 상태에서 접근 금지 라우트: /signin, /signup → /main */
function RedirectIfAuthed({ children }) {
  return isAuthed() ? <Navigate to="/main" replace /> : children;
}

/** 루트 진입시 로그인 여부에 따라 분기 */
function RootRedirect() {
  return <Navigate to={isAuthed() ? "/main" : "/signin"} replace />;
}

const Router = () => {
  return (
    <div className="app">
        <Routes>
          {/* 루트는 로그인 여부에 따라 자동 분기 */}
          <Route path="/" element={<RootRedirect />} />

          {/* 공개 라우트(단, 로그인 상태면 메인으로 튕김) */}
          <Route
            path="/signin"
            element={
              <RedirectIfAuthed>
                <SignIn />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectIfAuthed>
                <SignUp />
              </RedirectIfAuthed>
            }
          />

          {/* 보호(인증 필요) 라우트 */}
          <Route
            path="/main"
            element={
              <RequireAuth>
                <Main />
              </RequireAuth>
            }
          />
          <Route
            path="/article-list"
            element={
              <RequireAuth>
                <ArticleList />
              </RequireAuth>
            }
          />
          <Route
            path="/news/:id"
            element={
              <RequireAuth>
                <NewsDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/stress-status"
            element={
              <RequireAuth>
                <StressStatus />
              </RequireAuth>
            }
          />
          <Route
            path="/reading-analysis"
            element={
              <RequireAuth>
                <ReadingAnalysis />
              </RequireAuth>
            }
          />

          {/* 카테고리 선택 페이지 */}
          <Route
            path="/category"
            element={
              <RequireAuth>
                <Category />
              </RequireAuth>
            }
          />

          {/*  카테고리별 기사 목록 페이지 */}
          <Route
            path="/category/:key"
            element={
              <RequireAuth>
                <CategoryList />
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          {/* 나머지는 루트로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </div>
  );
};

export default Router;
