import { useState } from 'react'
import './Account.css'

const Account = () => {
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150')
  const [displayName, setDisplayName] = useState('John Doe')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.body.classList.toggle('dark-theme')
  }

  const workoutData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Workout Duration (minutes)',
      data: [45, 60, 30, 75, 45, 90, 60],
      backgroundColor: 'orangered',
      borderColor: 'orangered',
      borderWidth: 1
    }]
  }

  return (
    <>
      <div className="header-banner">
        <div className="settings-dropdown">
          <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>⋮</button>
          {showSettings && (
            <div className="settings-menu">
              <div className="settings-item" onClick={toggleTheme}>Toggle Light/Dark</div>
              <div className="settings-item">Profile Settings</div>
              <div className="settings-item">Log Out</div>
            </div>
          )}
        </div>
      </div>

      <div className="container">
        <div className="profile-panel">
          <label className="profile-pic">
            <img src={profileImage} alt="Profile" />
            <input type="file" onChange={handleImageUpload} />
          </label>

          <h3>{displayName}</h3>
          <div className="profile-info">
            Status: Active<br />
            Gym Start: Jan 2024<br />
            Birthday: May 15, 1998
          </div>
        </div>

        <div className="content">
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Workouts</h4>
              <p className="stat-number">127</p>
            </div>
            <div className="stat-card">
              <h4>Current Streak</h4>
              <p className="stat-number">12 days</p>
            </div>
            <div className="stat-card">
              <h4>Calories Burned</h4>
              <p className="stat-number">24,580</p>
            </div>
          </div>

          <div className="progress-section">
            <h3>Weekly Progress</h3>
            <div className="progress-chart">
              <canvas id="workoutChart"></canvas>
            </div>
          </div>

          <div className="upcoming-section">
            <h3>Upcoming Sessions</h3>
            <div className="session-list">
              <div className="session-item">
                <div className="session-info">
                  <h4>Strength Training</h4>
                  <p>Tomorrow, 6:00 AM</p>
                </div>
                <button className="session-btn">View Details</button>
              </div>
              <div className="session-item">
                <div className="session-info">
                  <h4>Cardio Bootcamp</h4>
                  <p>Friday, 5:30 PM</p>
                </div>
                <button className="session-btn">View Details</button>
              </div>
            </div>
          </div>

          <div className="achievements-section">
            <h3>Achievements</h3>
            <div className="achievement-grid">
              <div className="achievement-badge">
                <span className="badge-icon">🏆</span>
                <p>First Month</p>
              </div>
              <div className="achievement-badge">
                <span className="badge-icon">💪</span>
                <p>100 Workouts</p>
              </div>
              <div className="achievement-badge">
                <span className="badge-icon">🔥</span>
                <p>30 Day Streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Account
