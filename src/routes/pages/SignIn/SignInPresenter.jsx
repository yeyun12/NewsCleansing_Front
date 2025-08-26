import React from "react";
import "../../../assets/styles/AppLayout.css"; // ← 공통 먼저
import "./SignIn.css";                         // ← 페이지 CSS 나중
import LoginForm from "./components/LoginForm";

const SignInPresenter = ({ onSubmit, loading, error }) => {
  return (
    <div className="app-layout">
      <div className="auth-card">
        <div style={{textAlign: 'center', marginBottom: '10px'}}>
          <h2 style={{fontFamily: 'Nunito, GowunBatang, serif', fontSize: '32px', fontWeight: 700, color: '#49a7ff', margin: 0, letterSpacing: '2px'}}>News Cleansing</h2>
        </div>
        <h1 className="auth-title">로그인</h1>
        <LoginForm onSubmit={onSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default SignInPresenter;
