// src/routes/pages/SignUp/SignUpContainer.js
import React, { useState } from "react";
import SignUpPresenter from "./SignUpPresenter";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||         // 우리가 Vercel에 넣은 키
  process.env.REACT_APP_API_BASE ||             // 기존 키가 쓰인 곳 대비
  (process.env.NODE_ENV === 'production'
    ? 'https://newscleansing-back.onrender.com' // 배포 기본
    : 'http://127.0.0.1:8000')                  // 로컬 기본
).replace(/\/$/, '');

export default function SignUpContainer() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async ({ name, email, password /* confirmPassword는 프론트에서만 검증 */ }) => {
    setLoading(true);
    setErr("");
    try {
      // ⚠️ FastAPI가 쿼리스트링으로 받으므로 그대로 맞춰 전송
      const qs = new URLSearchParams({
        name: name.trim(),
        email: email.trim(),
        password,
      }).toString();

      const res = await fetch(`${API_BASE}/api/user?${qs}`, { method: "POST" });

      if (!res.ok) {
        let msg = "회원가입에 실패했습니다.";
        try {
          const data = await res.json();
          // detail이 문자열이면 그대로, 리스트면 첫 메시지 사용 (Pydantic 422 대응)
          if (typeof data?.detail === "string") msg = data.detail;
          else if (Array.isArray(data?.detail)) msg = data.detail[0]?.msg || msg;
        } catch {
          try { msg = await res.text(); } catch {}
        }
        throw new Error(msg);
      }

      // 성공 시
      await res.json(); // 필요하면 응답 데이터 사용
      alert("회원가입 성공! 로그인해 주세요.");
      window.location.href = "/signin";
    } catch (e) {
      setErr(e?.message ?? "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return <SignUpPresenter onSubmit={onSubmit} loading={loading} error={err} />;
}
