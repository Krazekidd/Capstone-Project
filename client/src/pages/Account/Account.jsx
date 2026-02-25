import React from "react";
import "./Account.css";

const Account = () => {
  return (
    <div className="account-container-wrapper">
      <div className="account-header-banner">
        <div className="account-settings-dropdown">
          <button className="account-settings-btn">⋮</button>
          <div className="account-settings-menu">
            <div className="account-settings-item" onClick={() => toggleTheme()}>
              Toggle Light/Dark
            </div>
            <div className="account-settings-item">Profile Settings</div>
            <div className="account-settings-item">Log Out</div>
          </div>
        </div>
      </div>

      <div className="account-container">
        {/* LEFT PANEL */}
        <div className="account-profile-panel">
          <label className="account-profile-pic">
            <img
              id="profileImage"
              src="https://via.placeholder.com/150"
              alt="Profile"
            />
            <input type="file" id="imageUpload" />
          </label>

          <h3 id="displayName">John Doe</h3>
          <div className="account-profile-info">
            Status: Active
            <br />
            Gym Start: Jan 2024
            <br />
            Birthday: May 15, 1998
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="account-content">
          {/* PERSONAL INFO */}
          <div className="account-section">
            <h2>Personal Information</h2>
            <div className="account-grid-2">
              <input type="text" placeholder="Full Name" />
              <input type="date" />
              <input type="email" placeholder="Email" />
              <input type="tel" placeholder="Phone Number" />
              <select>
                <option>Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* TRACK PROGRESS */}
          <div className="account-section">
            <h2>Track Your Progress</h2>
            <div className="account-progress-container">
              <div className="account-progress-left">
                <div className="account-grid-2">
                  <input
                    type="number"
                    id="weight"
                    placeholder="Weight (kg)"
                  />
                  <input
                    type="number"
                    id="height"
                    placeholder="Height (cm)"
                  />
                  <input type="number" placeholder="Bust (cm)" />
                  <input type="number" placeholder="Shoulder (cm)" />
                  <input type="number" placeholder="Waist (cm)" />
                  <input type="number" placeholder="Hip (cm)" />
                  <input type="number" placeholder="Thigh (cm)" />
                </div>

                <button onClick={() => calculateBMI()}>Calculate BMI</button>
                <div className="account-bmi-display" id="bmiResult">
                  BMI: --
                </div>
              </div>

              <div className="account-body-visual" id="bodyVisual"></div>
            </div>
          </div>

          {/* MONTHLY REPORT */}
          <div className="account-section">
            <h2>Monthly Report</h2>
            <canvas id="progressChart"></canvas>
          </div>

          {/* NUTRI-AI */}
          <div className="account-section">
            <h2>Nutri-AI</h2>
            <div className="account-chat-box" id="chatBox"></div>
            <div className="account-chat-input">
              <input
                type="text"
                id="chatInput"
                placeholder="Ask for nutrition advice..."
              />
              <button onClick={() => sendMessage()}>Send</button>
            </div>
          </div>

          {/* BADGES */}
          <div className="account-section">
            <h2>Achievements</h2>
            <div className="account-badges">
              <div className="account-badge">🔥 7 Day Streak</div>
              <div className="account-badge">💪 30 Workouts</div>
              <div className="account-badge">🏆 3 Month Consistency</div>
              <div className="account-badge">🥗 Clean Eating Week</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;