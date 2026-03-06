import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { SendHorizontal } from 'lucide-react';
import "./Account.css";

const Account = () => {

  return (
    <div className="member-profile">

      {/* Banner */}
      <div className="banner">
        <div className="banner-bg"></div>


        <div className="banner-badge">
          <div className="logo-text">GYM PRO</div>
          <div className="logo-dot"></div>
        </div>

        <div className="profile-avatar-wrap">
          <div className="avatar-ring">
            <img src="/avatar.jpg" alt="Profile Avatar" />
          </div>
          <div className="avatar-status"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main">

        {/* Profile Header */}
        <div className="profile-header">

          <div className="profile-info">
            <h1>John Carter</h1>
            <div className="handle">@ironmember</div>

            <div className="profile-tags">
              <span className="tag tag-red">Athlete</span>
              <span className="tag tag-orange">Strength</span>
              <span className="tag tag-green">Active</span>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <div className="stat-num">128</div>
              <div className="stat-label">Workouts</div>
            </div>

            <div className="stat">
              <div className="stat-num">52</div>
              <div className="stat-label">Weeks</div>
            </div>

            <div className="stat">
              <div className="stat-num">9</div>
              <div className="stat-label">Goals</div>
            </div>
          </div>

        </div>

        {/* Dashboard Grid */}
        <div className="grid">

          {/* Progress Card */}
          <div className="card">
            <div className="card-label">Progress</div>

            <div className="mini-stats">
              <div className="mini-stat">
                <div className="ms-val">72kg</div>
                <div className="ms-label">Weight</div>
              </div>

              <div className="mini-stat">
                <div className="ms-val">18%</div>
                <div className="ms-label">Body Fat</div>
              </div>

              <div className="mini-stat">
                <div className="ms-val">44cm</div>
                <div className="ms-label">Arms</div>
              </div>

              <div className="mini-stat">
                <div className="ms-val">110cm</div>
                <div className="ms-label">Chest</div>
              </div>
            </div>

          </div>

          {/* Workout Target */}
          <div className="card">
            <div className="card-label">Target Workout</div>

            <div className="target-grid">

              <button className="target-btn">
                <div className="icon">🏋️</div>
                <div className="name">Strength</div>
                <div className="desc">Muscle growth</div>
              </button>

              <button className="target-btn">
                <div className="icon">🔥</div>
                <div className="name">Fat Burn</div>
                <div className="desc">Weight loss</div>
              </button>

              <button className="target-btn">
                <div className="icon">⚡</div>
                <div className="name">Endurance</div>
                <div className="desc">Stamina</div>
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* AI Chat Button */}
      <div className="chat-fab">
        <button className="chat-btn">💬</button>
        <div className="chat-label">AI Coach</div>
      </div>

    </div>
  );
}

export default Account;