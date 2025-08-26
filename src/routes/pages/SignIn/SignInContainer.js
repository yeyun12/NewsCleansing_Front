// src/routes/pages/SignIn/SignInContainer.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignInPresenter from "./SignInPresenter";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export default function SignInContainer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    setErr("");

    try {
      // 1) 로그인
      const loginQs = new URLSearchParams({ email: email.trim(), password }).toString();
      const loginRes = await fetch(`${API_BASE}/api/user/login?${loginQs}`, { method: "POST" });
      if (!loginRes.ok) {
        const body = await loginRes.json().catch(() => ({}));
        throw new Error(body?.detail || "로그인에 실패했습니다.");
      }
      const user = await loginRes.json(); // { id, name, email, created_at }
      localStorage.setItem("user", JSON.stringify(user));

      // 2) 세션 시작
      const startQs = new URLSearchParams({ user_id: String(user.id) }).toString();
      const startRes = await fetch(`${API_BASE}/api/user/session/start?${startQs}`, { method: "POST" });
      if (startRes.ok) {
        const { session_id } = await startRes.json();
        localStorage.setItem("session_id", String(session_id));
      } else {
        // 세션 시작 실패하더라도 로그인은 진행
        localStorage.removeItem("session_id");
      }

      navigate("/main", { replace: true });
    } catch (e) {
      setErr(e.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return <SignInPresenter onSubmit={onSubmit} loading={loading} error={err} />;
}
