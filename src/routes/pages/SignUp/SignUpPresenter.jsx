import React from "react";
import SignUpForm from "./components/SignUpForm";
import "./SignUp.css";
import "../../../assets/styles/AppLayout.css";


const SignUpPresenter = ({ onSubmit, loading, error }) => {
  return (
  <div className="app-layout">
      <div className="auth-card">
        <div style={{textAlign: 'center', marginBottom: '10px'}}>
          <h2 style={{fontFamily: 'Nunito, GowunBatang, serif', fontSize: '32px', fontWeight: 700, color: '#49a7ff', margin: 0, letterSpacing: '2px'}}>News Cleansing</h2>
        </div>
  <h1 className="auth-title">회원가입</h1>
        <SignUpForm onSubmit={onSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default SignUpPresenter;

