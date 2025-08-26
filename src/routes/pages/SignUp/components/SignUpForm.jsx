// SignUpForm.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const SignUpForm = ({ onSubmit, loading, error }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [localErr, setLocalErr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ 프론트에서 즉시 검증: 비밀번호 일치 여부
    if (password !== confirmPassword) {
      setLocalErr("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLocalErr("");

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    });
  };

  const displayError = localErr || error;

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="name">이름</label>
        <input
          id="name"
          type="text"
          className="input"
          placeholder="홍길동"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>

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
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setShowPw((s) => !s)}
            style={{ marginTop: "4px", alignSelf: "flex-end" }}
          >
            {showPw ? "숨기기" : "보기"}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirm">비밀번호 확인</label>
        <input
          id="confirm"
          type={showPw ? "text" : "password"}
          className="input"
          placeholder="비밀번호 다시 입력"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      {displayError && <p className="error-text">{displayError}</p>}

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? "가입 중…" : "가입하기"}
      </button>

      <div className="link-row">
        <span>이미 계정이 있으신가요?</span>
        <Link to="/" className="link">
          로그인
        </Link>
      </div>
    </form>
  );
};

export default SignUpForm;
