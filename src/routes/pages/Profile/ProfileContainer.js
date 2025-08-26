// src/routes/pages/Profile/ProfileContainer.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfilePresenter from "./ProfilePresenter";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||         // 우리가 Vercel에 넣은 키
  process.env.REACT_APP_API_BASE ||             // 기존 키가 쓰인 곳 대비
  (process.env.NODE_ENV === 'production'
    ? 'https://newscleansing-back.onrender.com' // 배포 기본
    : 'http://127.0.0.1:8000')                  // 로컬 기본
).replace(/\/$/, '');

function formatJoinDate(value) {
  if (!value) return "-";
  try {
    // 숫자 타임스탬프 등도 허용
    if (typeof value === "number") {
      const dNum = new Date(value);
      if (isNaN(dNum.getTime())) return "-";
      return dNum.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
    }

    let s = String(value).trim();
    if (!s) return "-";

    // 'YYYY-MM-DD HH:mm:ss' 형태 → 'T'로 치환
    if (s.includes(" ") && !s.includes("T")) {
      s = s.replace(" ", "T");
    }
    // 타임존 표기가 없으면 UTC로 가정하여 'Z' 부여
    // (예: '2025-08-13T07:41:00.101240' → '...101240Z')
    const hasTz = /[zZ]$|[+-]\d{2}:\d{2}$/.test(s);
    if (!hasTz && s.includes("T")) {
      s += "Z";
    }

    const d = new Date(s);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
  } catch {
    return "-";
  }
}

export default function ProfileContainer() {
  const navigate = useNavigate();

  // 로그인 시 localStorage('user')에 저장된 정보 사용
  const baseUser = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  // 초기 상태: localStorage 값으로 채우고, created_at 후보 필드들도 확인
  const [user, setUser] = useState(() => {
    const name = baseUser?.name || "";
    const email = baseUser?.email || "";
    const joinRaw =
      baseUser?.created_at || baseUser?.joined_at || baseUser?.createdAt || null;

    return {
      id: baseUser?.id,
      name,
      email,
      joinDate: formatJoinDate(joinRaw),
    };
  });

  // 비로그인 → 로그인 화면으로
  useEffect(() => {
    if (!baseUser) navigate("/signin", { replace: true });
  }, [baseUser, navigate]);

  // joinDate가 비어있다면(“-”) 백엔드에서 보강 조회
  useEffect(() => {
    let ignore = false;

    async function fetchMore() {
      if (!baseUser?.id) return;
      if (user.joinDate !== "-") return;

      const url = `${API_BASE}/api/user/${baseUser.id}`;
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        const created =
          data?.created_at || data?.joined_at || data?.createdAt || null;

        if (!ignore && created) {
          setUser((prev) => ({
            ...prev,
            name: data?.name ?? prev.name,
            email: data?.email ?? prev.email,
            joinDate: formatJoinDate(created),
          }));

          // localStorage의 user에도 created_at 보강 저장(다음부터는 바로 표시되도록)
          try {
            const savedRaw = localStorage.getItem("user");
            const saved = savedRaw ? JSON.parse(savedRaw) : {};
            localStorage.setItem(
              "user",
              JSON.stringify({ ...saved, created_at: created })
            );
          } catch {}
        }
      } catch {
        // 무시
      }
    }

    fetchMore();
    return () => {
      ignore = true;
    };
  }, [API_BASE, baseUser, user.joinDate]);

  return <ProfilePresenter user={user} />;
}
