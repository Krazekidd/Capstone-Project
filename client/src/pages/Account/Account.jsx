import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendNutriMessage } from "../../api/nutriAI";
import "./Account.css";

const Account = () => {
  // Goal & gender selection
  const [selectedGoal, setSelectedGoal] = useState("Bulk Up");
  const [gender, setGender] = useState("male");

  // Measurements state
  const [measurements, setMeasurements] = useState({
    weight: "",
    height: "",
    bodyFat: "",
    chest: "",
    waist: "",
    shoulders: "",
    armL: "",
    armR: "",
    neck: "",
    hips: "",
    thighL: "",
    thighR: "",
    calfL: "",
    calfR: "",
    glutes: "",
  });

  const goalTypes = [
    { icon: "💪", name: "Bulk Up" },
    { icon: "✂️", name: "Cut Down" },
    { icon: "⚡", name: "Athletic Build" },
    { icon: "🔥", name: "Lean & Shredded" },
    { icon: "⚖️", name: "Maintain" },
    { icon: "🌊", name: "Tone & Define" },
  ];

  const handleGoalClick = (goal) => setSelectedGoal(goal);
  const handleGenderChange = (e) => setGender(e.target.value);

  const handleMeasurementChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace("m-", "").replace(/-/g, "");
    setMeasurements((prev) => ({ ...prev, [key]: value }));
  };

  const saveGoals = () => {
    alert(`Saved goals!\nGender: ${gender}\nGoal: ${selectedGoal}`);
  };

  const saveMeasurements = () => {
    console.log("Measurements saved:", measurements);
    alert("Monthly measurements saved!");
  };

  const clearForm = () => {
    setMeasurements({
      weight: "",
      height: "",
      bodyFat: "",
      chest: "",
      waist: "",
      shoulders: "",
      armL: "",
      armR: "",
      neck: "",
      hips: "",
      thighL: "",
      thighR: "",
      calfL: "",
      calfR: "",
      glutes: "",
    });
  };

const [aiQuery, setAiQuery] = useState("");
const [chatMessages, setChatMessages] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const chatBoxRef = useRef(null);

useEffect(() => {
  if (chatBoxRef.current) {
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }
}, [chatMessages]);

const handleAskAI = async () => {
  if (!aiQuery.trim() || isLoading) return;

  const userMessage = aiQuery.trim();
  setAiQuery('');
  
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
    handleAskAI();
  }
};

  return (
    <div className="member-profile">
      {/* Banner */}
      <div className="banner">
        <div className="banner-bg"></div>
        <div className="banner-text">IRONFORGE</div>
        <div className="banner-badge">
          <div className="logo-dot"></div>
          <div className="logo-text">IRONFORGE</div>
        </div>
        <div className="profile-avatar-wrap">
          <div className="avatar-ring">
            <img
              src="https://api.dicebear.com/8.x/adventurer/svg?seed=Marcus&backgroundColor=1a1a2e"
              alt="Profile"
            />
            <div className="avatar-status"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-info">
            <h1>Marcus Powell</h1>
            <div className="handle">@marcus.lifts · Member since 2022</div>
            <div className="profile-tags">
              <span className="tag tag-red">⚡ Elite Member</span>
              <span className="tag tag-orange">🔥 12-Week Streak</span>
              <span className="tag tag-green">✓ Verified Athlete</span>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <div className="stat-num">218</div>
              <div className="stat-label">Sessions</div>
            </div>
            <div className="stat">
              <div className="stat-num">
                84<small style={{ fontSize: "18px" }}>kg</small>
              </div>
              <div className="stat-label">Current</div>
            </div>
            <div className="stat">
              <div className="stat-num">12</div>
              <div className="stat-label">Wk Streak</div>
            </div>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="mini-stats">
          <div className="mini-stat">
            <div className="ms-val">2,840</div>
            <div className="ms-label">Calories Burned</div>
          </div>
          <div className="mini-stat">
            <div className="ms-val">5h 40m</div>
            <div className="ms-label">Active This Week</div>
          </div>
          <div className="mini-stat">
            <div className="ms-val">127</div>
            <div className="ms-label">Avg BPM</div>
          </div>
          <div className="mini-stat">
            <div className="ms-val">94%</div>
            <div className="ms-label">Goal Progress</div>
          </div>
        </div>

        {/* Body Goals */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-label">Setup</div>
          <div className="section-title">🎯 Body Goal & Target Proportions</div>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "22px" }}>
            Set your primary goal, target weight, and ideal body proportions. This drives your AI recommendations and progress tracking.
          </p>

          <div className="form-row">
            <div className="field">
              <label>Gender</label>
              <select value={gender} onChange={handleGenderChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="field">
              <label>Primary Goal</label>
              <select>
                <option value="muscle">Build Muscle & Size</option>
                <option value="cut">Lose Fat & Cut</option>
                <option value="recomp">Body Recomposition</option>
                <option value="strength">Pure Strength</option>
                <option value="endurance">Endurance & Cardio</option>
                <option value="tone">Tone & Define</option>
              </select>
            </div>
          </div>

          <div className="goal-body-select">
            {goalTypes.map((goal) => (
              <div
                key={goal.name}
                className={`goal-type-btn ${selectedGoal === goal.name ? "active" : ""}`}
                onClick={() => handleGoalClick(goal.name)}
              >
                <div className="g-icon">{goal.icon}</div>
                <div className="g-name">{goal.name}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "12px", color: "var(--muted)", margin: "16px 0 14px" }}>
            Target proportions (cm)
          </p>

          <div className="form-row-3">
            <div className="field">
              <label>Target Weight (kg)</label>
              <input type="number" defaultValue="80" placeholder="80" />
            </div>
            <div className="field">
              <label>Target Chest (cm)</label>
              <input type="number" defaultValue="100" placeholder="100" />
            </div>
            <div className="field">
              <label>Target Waist (cm)</label>
              <input type="number" defaultValue="80" placeholder="80" />
            </div>
          </div>

          <div className="form-row-3">
            <div className="field">
              <label>Target Hips (cm)</label>
              <input type="number" defaultValue="98" placeholder="98" />
            </div>
            <div className="field">
              <label>Target Thigh (cm)</label>
              <input type="number" defaultValue="58" placeholder="58" />
            </div>
            <div className="field">
              <label>Target Arm (cm)</label>
              <input type="number" defaultValue="38" placeholder="38" />
            </div>
          </div>

          <button className="btn-primary" onClick={saveGoals}>
            Save Goals →
          </button>
        </div>

        {/* Track Your Progress */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-label">Monthly Entry</div>
          <div className="section-title">📏 Track Your Progress</div>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "22px" }}>
            Log your measurements monthly. Your body silhouette updates live as you type — reflecting your real proportions.
          </p>

          <div className="tracker-layout">
            {/* Body Avatar */}
            <div className="body-avatar-panel">
              <div className="body-avatar-title" id="avatarTitle">
                Body Shape — {gender === "male" ? "Male" : "Female"}
              </div>
              <div className="avatar-svg-wrap">
                <svg id="bodySvg" viewBox="0 0 160 310" xmlns="http://www.w3.org/2000/svg">
                  {/* MALE AVATAR */}
                  <g id="maleAv">
                    <ellipse cx="80" cy="32" rx="22" ry="24" fill="#b8926a" stroke="rgba(232,25,60,0.6)" strokeWidth="1.5"/>
                    <circle cx="73" cy="28" r="3" fill="#2a1a0a" opacity=".55"/>
                    <circle cx="87" cy="28" r="3" fill="#2a1a0a" opacity=".55"/>
                    <path d="M74 41 Q80 46 86 41" stroke="#2a1a0a" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".5"/>
                  </g>
                  {/* FEMALE AVATAR */}
                  <g id="femaleAv" style={{ display: gender === "female" ? "block" : "none" }}>
                    <ellipse cx="80" cy="30" rx="20" ry="22" fill="#c89070" stroke="rgba(232,25,60,0.6)" strokeWidth="1.5"/>
                  </g>
                </svg>

                {/* Avatar Labels */}
                <div className="avatar-labels">
                  <div className="aml-row"><span className="aml-label">Chest</span><span className="aml-val">{measurements.chest || "—"}</span></div>
                  <div className="aml-row"><span className="aml-label">Waist</span><span className="aml-val">{measurements.waist || "—"}</span></div>
                  <div className="aml-row"><span className="aml-label">Hips</span><span className="aml-val">{measurements.hips || "—"}</span></div>
                  <div className="aml-row"><span className="aml-label">Thigh</span><span className="aml-val">{measurements.thighL || "—"}</span></div>
                  <div className="aml-row"><span className="aml-label">Arm</span><span className="aml-val">{measurements.armL || "—"}</span></div>
                </div>
              </div>
            </div>

            {/* MEASUREMENTS FORM */}
            <div className="measure-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "20px", letterSpacing: "2px" }}>March 2026 Entry</span>
                <span style={{
                  fontSize: "10px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  background: "rgba(255,107,26,.15)",
                  color: "var(--orange)",
                  border: "1px solid rgba(255,107,26,.3)",
                  borderRadius: "20px"
                }}>Monthly Log</span>
              </div>

              {/* Body Basics */}
              <div className="measure-group">
                <div className="measure-group-title">📦 Body Basics</div>
                <div className="measure-inputs">
                  <div className="field"><label>Weight (kg)</label><input type="number" id="m-weight" placeholder="84" step="0.1" value={measurements.weight} onChange={handleMeasurementChange}/></div>
                  <div className="field"><label>Height (cm)</label><input type="number" id="m-height" placeholder="178" value={measurements.height} onChange={handleMeasurementChange}/></div>
                  <div className="field"><label>Body Fat %</label><input type="number" id="m-bf" placeholder="18" step="0.1" value={measurements.bodyFat} onChange={handleMeasurementChange}/></div>
                </div>
              </div>

              {/* Upper Body */}
              <div className="measure-group">
                <div className="measure-group-title">📐 Upper Body (cm)</div>
                <div className="measure-inputs">
                  <div className="field"><label>Chest (cm)</label><input type="number" id="m-chest" placeholder="96" step="0.5" value={measurements.chest} onChange={handleMeasurementChange}/></div>
                  <div className="field"><label>Waist (cm)</label><input type="number" id="m-waist" placeholder="84" step="0.5" value={measurements.waist} onChange={handleMeasurementChange}/></div>
                  <div className="field"><label>Shoulders (cm)</label><input type="number" id="m-shoulders" placeholder="118" step="0.5" value={measurements.shoulders} onChange={handleMeasurementChange}/></div>
                </div>
                <div className="measure-inputs" style={{ marginTop: "12px" }}>
                  <div className="field"><label>Left Arm (cm)</label><input type="number" id="m-arm-l" placeholder="36" step="0.5" value={measurements.armL} onChange={handleMeasurementChange}/></div>
                  <div className="field"><label>Right Arm (cm)</label><input type="number" id="m-arm-r" placeholder="36" step="0.5" value={measurements.armR} onChange={handleMeasurementChange}/></div>
                  <div className="field"><label>Neck (cm)</label><input type="number" id="m-neck" placeholder="38" step="0.5" value={measurements.neck} onChange={handleMeasurementChange}/></div>
                </div>
              </div>

              {/* Lower Body */}
              <div className="measure-group">
                <div className="measure-group-title">📐 Lower Body (cm)</div>
                <div className="measure-inputs">
                  <div className="field"><label>Hips (cm)</label><input type="number" id="m-hips" placeholder="96" step="0.5" value={measurements.hips} onChange={handleMeasurementChange}/></div>
                  <div className="field"><label>Left Thigh (cm)</label><input type="number" id="m-thigh-l" placeholder="56" step="0.5" value={measurements.thighL} onChange={handleMeasurementChange}/></div>
                  <div className="field"><label>Right Thigh (cm)</label><input type="number" id="m-thigh-r" placeholder="56" step="0.5" value={measurements.thighR} onChange={handleMeasurementChange}/></div>
                </div>
                <div className="measure-inputs" style={{ marginTop: "12px" }}>
                  <div className="field"><label>Left Calf (cm)</label><input type="number" id="m-calf-l" placeholder="36" step="0.5" value={measurements.calfL} onChange={handleMeasurementChange}/></div>
                  <div className="field"><label>Right Calf (cm)</label><input type="number" id="m-calf-r" placeholder="36" step="0.5" value={measurements.calfR} onChange={handleMeasurementChange}/></div>
                  <div className="field"><label>Glutes (cm)</label><input type="number" id="m-glutes" placeholder="100" step="0.5" value={measurements.glutes} onChange={handleMeasurementChange}/></div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button className="btn-primary" onClick={saveMeasurements}>💾 Save This Month</button>
                <button className="btn-outline" onClick={clearForm}>Clear</button>
              </div>
            </div>
          </div>
        </div>
              <div className="grid">
        <div className="card ai-area grid-full">
          <div className="card-label">AI Powered</div>
          <div className="section-title">🤖 AI Coach — Ask Anything</div>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "14px" }}>
            Get personalized advice based on your measurements, goals, and training history.
          </p>

          <div className="ai-chat-box" ref={chatBoxRef}>
            {chatMessages.length === 0 ? (
              <div style={{ color: '#999', textAlign: 'center', padding: '20px', fontSize: '13px' }}>
                Ask me anything about fitness, nutrition, or training advice!
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`ai-chat-message ${msg.role}`}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="ai-input-row">
            <input
              className="ai-input"
              type="text"
              placeholder="e.g. Based on my measurements, what should I focus on this month?"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button className="btn-primary" onClick={handleAskAI} disabled={isLoading}>
              {isLoading ? 'Asking...' : 'Ask Coach'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
    
  );
};

export default Account;