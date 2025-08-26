import React, { useState } from "react";
import { Link } from "react-router-dom";

const LoginForm = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email: email.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">비밀번호</label>
        <div className="input-with-action">
          <input
            id="password"
            type={showPw ? "text" : "password"}
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setShowPw((s) => !s)}
            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
            style={{marginTop: '4px', alignSelf: 'flex-end'}}
          >
            {showPw ? "숨기기" : "보기"}
          </button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? "로그인 중…" : "로그인"}
      </button>

      <div className="link-row">
        <span>계정이 없으신가요?</span>
        <Link to="/signup" className="link">회원가입</Link>
      </div>
    </form>
  );
};

export default LoginForm;
