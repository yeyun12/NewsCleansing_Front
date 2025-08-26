import React from "react";
import "../../../assets/styles/AppLayout.css";
import "./Profile.css";

const ProfilePresenter = ({ user }) => (
  <div className="app-layout">
    <div className="profile-container profile-flush">
      <header className="profile-header">
        <h2 className="profile-title">회원 정보</h2>
        <span className="profile-desc">계정 정보</span>
      </header>

      <div className="profile-avatar-section">
        <div className="profile-avatar" />
      </div>

      <div className="profile-info-list">
        <div className="profile-info-row">
          <span className="profile-info-label">이름</span>
          <span className="profile-info-value">{user.name || "-"}</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-label">이메일</span>
          <span className="profile-info-value">{user.email || "-"}</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-label">가입일</span>
          <span className="profile-info-value">{user.joinDate || "-"}</span>
        </div>
      </div>
    </div>
  </div>
);

export default ProfilePresenter;
