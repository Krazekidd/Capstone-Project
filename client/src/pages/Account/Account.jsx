import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendNutriMessage } from "../../api/nutriAI";
import { SendHorizontal } from 'lucide-react';
import "./Account.css";

const Account = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let aiResponse = '';
      
      // Add empty AI message that will be updated with streaming content
      setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      await sendNutriMessage(userMessage, (chunk) => {
        aiResponse += chunk;
        // Update the last message (AI response) with new content
        setChatMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: aiResponse };
          return updated;
        });
      });
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
          <div className="account-section nutri-ai-section">

            {/* AI HEADER */}
            <div className="nutri-ai-header">
              <div className="nutri-ai-header-content">
                <img 
                  src="images/nutri.png"
                  alt="AI"
                  className="nutri-ai-avatar"
                />
                <div>
                  <h2>Nutri-AI</h2>
                  <p>Your Smart Nutrition Assistant</p>
                </div>
              </div>

              {/* SVG WAVE */}
              <svg className="nutri-ai-wave" viewBox="0 0 1440 120">
                <path
                  fill="#ffffff"
                  d="M0,64L80,80C160,96,320,128,480,128C640,128,800,96,960,85.3C1120,75,1280,85,1360,90.7L1440,96L1440,160L0,160Z"
                ></path>
              </svg>
            </div>

            {/* CHAT BOX */}
            <div className="account-chat-box" ref={chatBoxRef}>
              {chatMessages.length === 0 ? (
                <div className="chat-placeholder">
                  Ask me anything about nutrition, meal planning, or dietary advice!
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="account-chat-input">
              <input
                type="text"
                placeholder="Ask for nutrition advice..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button onClick={handleSendMessage} disabled={isLoading}>
                {isLoading ? 'Sending...' : <SendHorizontal />}
              </button>
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