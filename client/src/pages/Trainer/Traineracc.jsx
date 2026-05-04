import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Trainer.css";

// Helper to get auth token from localStorage
const getAuthToken = () => localStorage.getItem("access_token");

// API request helper with authentication
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(`http://localhost:8000${endpoint}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed with status ${response.status}`);
  }
  return response.json();
};

export default function TrainerPage() {
  const navigate = useNavigate();

  // State for trainer profile and UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trainer, setTrainer] = useState(null);
  const [otherTrainers, setOtherTrainers] = useState([]);
  const [clientsAtRisk, setClientsAtRisk] = useState([]);
  const [trainerReviews, setTrainerReviews] = useState([]);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerAssessments, setTrainerAssessments] = useState({});
  const [assessedTrainers, setAssessedTrainers] = useState({});
  const [bgColor, setBgColor] = useState("#ff6b00");
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [isEditingCert, setIsEditingCert] = useState(false);
  const [certification, setCertification] = useState("");
  const [coachingMessage, setCoachingMessage] = useState({
    clientName: "",
    clientEmail: "",
    date: "",
    time: "",
    message: "",
  });

  // Assessment criteria (same as before)
  const assessmentCriteria = [
    "Knowledge",
    "Communication",
    "Professionalism",
    "Session Planning",
    "Motivation",
  ];

  // Helper to map criteria names to backend keys
  const criteriaToBackend = {
    Knowledge: "knowledge",
    Communication: "interact",
    Professionalism: "punct",
    "Session Planning": "perf",
    Motivation: "motiv",
  };

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch profile
        const profile = await apiRequest("/account/senior/profile");
        setTrainer(profile);
        setCertification(profile.certification || "");

        // Fetch other trainers for assessment
        const trainersList = await apiRequest("/account/senior/other-trainers");
        setOtherTrainers(trainersList);

        // Fetch clients at risk
        const riskClients = await apiRequest("/account/senior/clients-at-risk");
        setClientsAtRisk(riskClients);

        // Fetch trainer reviews (optional)
        const reviews = await apiRequest("/account/senior/trainer-reviews");
        setTrainerReviews(reviews);
      } catch (err) {
        console.error("Error loading trainer data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handler for editing certification
  const handleEditToggle = () => {
    setIsEditingCert(!isEditingCert);
  };
  const handleCertChange = (e) => {
    setCertification(e.target.value);
  };
  const handleBlur = async () => {
    if (isEditingCert) {
      setIsEditingCert(false);
      try {
        await apiRequest("/account/me", {
          method: "PUT",
          body: JSON.stringify({ certification }),
        });
        setTrainer((prev) => ({ ...prev, certification }));
      } catch (err) {
        console.error("Failed to update certification:", err);
      }
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  // Open assessment modal for a trainer
  const openTrainerModal = (trainerItem) => {
    setSelectedTrainer(trainerItem);
    setShowTrainerModal(true);
    if (!trainerAssessments[trainerItem.name]) {
      const initialScores = {};
      assessmentCriteria.forEach((c) => {
        initialScores[c] = 0;
      });
      setTrainerAssessments((prev) => ({
        ...prev,
        [trainerItem.name]: initialScores,
      }));
    }
  };

  const handleAssessmentChange = (criteria, value) => {
    setTrainerAssessments((prev) => ({
      ...prev,
      [selectedTrainer.name]: {
        ...prev[selectedTrainer.name],
        [criteria]: value,
      },
    }));
  };

  const submitAssessment = async () => {
    const scoresObj = trainerAssessments[selectedTrainer.name] || {};
    const backendScores = {
      perf: parseFloat(scoresObj["Session Planning"] || 0),
      motiv: parseFloat(scoresObj["Motivation"] || 0),
      interact: parseFloat(scoresObj["Communication"] || 0),
      knowledge: parseFloat(scoresObj["Knowledge"] || 0),
      punct: parseFloat(scoresObj["Professionalism"] || 0),
    };
    const avg =
      Object.values(backendScores).reduce((a, b) => a + b, 0) / 5;
    const standing =
      avg >= 8.5 ? "Excellent" : avg >= 7 ? "Good" : avg >= 5 ? "Warning" : "Critical";

    try {
      await apiRequest("/account/senior/assessments", {
        method: "POST",
        body: JSON.stringify({
          trainer_id: selectedTrainer.id,
          trainer_name: selectedTrainer.name,
          scores: backendScores,
          average: avg,
          standing: standing,
          notes: "",
        }),
      });
      // Update local assessedTrainers state
      setAssessedTrainers((prev) => ({
        ...prev,
        [selectedTrainer.name]: { assessed: true, rating: avg.toFixed(1) },
      }));
      setShowTrainerModal(false);
    } catch (err) {
      console.error("Failed to submit assessment:", err);
      alert("Failed to submit assessment. Please try again.");
    }
  };

  const redoAssessment = (trainerName) => {
    setAssessedTrainers((prev) => ({
      ...prev,
      [trainerName]: { assessed: false },
    }));
    const trainerObj = otherTrainers.find((t) => t.name === trainerName);
    if (trainerObj) openTrainerModal(trainerObj);
  };

  // Coaching message handlers
  const handleCoachingChange = (e) => {
    const { name, value } = e.target;
    setCoachingMessage((prev) => ({ ...prev, [name]: value }));
  };
  const sendCoachingMessage = async () => {
    const { clientName, clientEmail, date, time, message } = coachingMessage;
    if (!clientName || !clientEmail || !message) {
      alert("Please fill in client name, email, and message.");
      return;
    }
    try {
      await apiRequest("/account/senior/send-coaching-message", {
        method: "POST",
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail,
          session_date: date,
          session_time: time,
          message: message,
        }),
      });
      alert(`Coaching message sent to ${clientName}`);
      setCoachingMessage({ clientName: "", clientEmail: "", date: "", time: "", message: "" });
    } catch (err) {
      console.error("Failed to send coaching message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("gympro_user");
    navigate("/login");
  };

  // Loading state
  if (loading) {
    return (
      <div className="trainer-page" style={{ "--accent": bgColor }}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading senior trainer dashboard...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="trainer-page" style={{ "--accent": bgColor }}>
        <div className="error-container">
          <p>Error loading data: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }
  if (!trainer) return null;

  // Compute derived values for the UI
  const avgProgress = trainer.monthly_score
    ? Math.round(trainer.monthly_score)
    : trainer.average_assessment_score
    ? Math.round(trainer.average_assessment_score)
    : 70;
  const standingText =
    trainer.monthly_score >= 80
      ? "Good"
      : trainer.monthly_score >= 60
      ? "Decent"
      : "Bad";

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const colors = ["#ff6b00", "#e63946", "#1e88e5"];

  return (
    <div className="trainer-page" style={{ "--accent": bgColor }}>
      {/* Floating Home Button */}
      <button onClick={() => navigate("/")} className="floating-home">
        ← Home
      </button>
      <button className="logout-btn" onClick={handleLogout}>
        Sign Out
      </button>
      {/* Floating Color Picker */}
      <div className="floating-color-menu">
        <button className="color-dots" onClick={() => setShowColorMenu(!showColorMenu)}>
          ⋮
        </button>
        {showColorMenu && (
          <div className="color-options">
            {colors.map((c) => (
              <div
                key={c}
                className="color-option"
                style={{ background: c }}
                onClick={() => {
                  setBgColor(c);
                  setShowColorMenu(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <header className="trainer-header">
        <div className="header-background">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
            alt="gym"
            className="header-bg-img"
          />
        </div>
        <div className="header-content">
          <div className="profile-circle">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="trainer"
              className="profile-image"
            />
          </div>
          <h1 className="profile-name">{trainer.name}</h1>
          <p className="profile-rank-age">
            {trainer.rank} | Age: {trainer.age || "—"}
          </p>
          <div className="profile-rating">
            <span className="stars">
              {"★".repeat(Math.floor(trainer.rating || 0))}
              {"☆".repeat(5 - Math.floor(trainer.rating || 0))}
            </span>
            <span className="rating-value">{trainer.rating || "—"}</span>
          </div>
          <div className="profile-spec-cert">
            <p className="spec">
              <strong>Specialisation:</strong> {trainer.specialisation || "General"}
            </p>
            {isEditingCert ? (
              <div className="cert-edit">
                <strong>Certification:</strong>
                <input
                  type="text"
                  value={certification}
                  onChange={handleCertChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
            ) : (
              <p className="cert">
                <strong>Certification:</strong> {trainer.certification || "Not set"}
              </p>
            )}
            <button className="edit-cert-btn" onClick={handleEditToggle}>
              {isEditingCert ? "Save" : "Edit"}
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Split 1: Overall Ratings & Monthly Performance */}
        <div className="card split-card">
          <div className="card-left">
            <h3>Overall Ratings</h3>
            <div className="ratings-summary">
              <div className="rating-large">{trainer.rating || "—"}</div>
              <div className="stars-large">
                {"★".repeat(Math.floor(trainer.rating || 0))}
                {"☆".repeat(5 - Math.floor(trainer.rating || 0))}
              </div>
            </div>
            <div className="assessment-info">
              <p>
                <strong>Average Assessment Score:</strong>{" "}
                {trainer.average_assessment_score || "—"}/10
              </p>
              <p className="assessment-date">
                Based on assessment done{" "}
                {trainer.last_assessment_date || "N/A"}
              </p>
              <button className="btn small">View All Assessments</button>
            </div>
          </div>
          <div className="divider-vertical"></div>
          <div className="card-right">
            <h3>Monthly Performance</h3>
            <div className="monthly-performance">
              <div className="progress-circle-container">
                <div
                  className="progress-circle"
                  style={{
                    background: `conic-gradient(var(--accent) ${
                      avgProgress * 3.6
                    }deg, #eee 0deg)`,
                  }}
                >
                  <span>{avgProgress}%</span>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Sessions Completed</span>
                  <span className="stat-value">
                    {trainer.sessions_completed || 0}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Clients Assigned</span>
                  <span className="stat-value">{trainer.clients_assigned || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Attendance %</span>
                  <span className="stat-value">{trainer.attendance_rate || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Split 2: Trainer Assessment & Coaching Session */}
        <div className="card split-card">
          <div className="card-left">
            <h3>Trainer Assessment</h3>
            <div className="trainer-grid">
              {otherTrainers.map((t) => {
                const assessed = assessedTrainers[t.name]?.assessed;
                const avgRating = assessedTrainers[t.name]?.rating;
                return (
                  <div
                    key={t.id}
                    className={`trainer-name-btn ${assessed ? "assessed" : ""}`}
                    onClick={() =>
                      assessed ? redoAssessment(t.name) : openTrainerModal(t)
                    }
                  >
                    {t.name}
                    {assessed && <span className="avg-rating-small">{avgRating}</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="divider-vertical"></div>
          <div className="card-right">
            <h3>Coaching Session</h3>
            <div className="coaching-form">
              <input
                type="text"
                name="clientName"
                placeholder="Client Name"
                value={coachingMessage.clientName}
                onChange={handleCoachingChange}
              />
              <input
                type="email"
                name="clientEmail"
                placeholder="Client Email"
                value={coachingMessage.clientEmail}
                onChange={handleCoachingChange}
              />
              <div className="row">
                <input
                  type="date"
                  name="date"
                  value={coachingMessage.date}
                  onChange={handleCoachingChange}
                />
                <input
                  type="time"
                  name="time"
                  value={coachingMessage.time}
                  onChange={handleCoachingChange}
                />
              </div>
              <textarea
                name="message"
                placeholder="Session message..."
                rows="3"
                value={coachingMessage.message}
                onChange={handleCoachingChange}
              ></textarea>
              <button className="btn" onClick={sendCoachingMessage}>
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Clients at Risk */}
        <div className="card">
          <h3>Clients at Risk</h3>
          {clientsAtRisk.length === 0 && (
            <p>No clients at risk.</p>
          )}
          {clientsAtRisk.map((c) => (
            <div key={c.id} className="client-risk-row">
              <div className="client-risk-info">
                <span className="client-initials" title={c.name}>
                  {getInitials(c.name)}
                </span>
                <div className="progress-bar-container small">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${c.progress_percentage}%`, background: "var(--accent)" }}
                  ></div>
                </div>
                <span className="client-progress">{c.progress_percentage}%</span>
              </div>
              <button className="btn small warn-btn">Warn & Assist</button>
            </div>
          ))}
        </div>

        {/* Public Reviews */}
        <div className="card">
          <h3>Public Reviews</h3>
          {trainerReviews.length === 0 && (
            <p>No reviews yet.</p>
          )}
          {trainerReviews.map((r) => (
            <div key={r.id} className="review">
              <strong>{r.reviewer_name}</strong>
              <div className="stars-small">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>
              <span className="rating-text">{r.rating}/5</span>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Modal */}
      {showTrainerModal && selectedTrainer && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setShowTrainerModal(false)}
            >
              ✕
            </button>
            <h3>Assessing {selectedTrainer.name}</h3>
            {assessmentCriteria.map((c) => (
              <div key={c} className="slider">
                <label>{c}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={trainerAssessments[selectedTrainer.name]?.[c] || 0}
                  onChange={(e) => handleAssessmentChange(c, parseFloat(e.target.value))}
                />
                <span>{trainerAssessments[selectedTrainer.name]?.[c] || 0}</span>
              </div>
            ))}
            <textarea placeholder="Add remarks..." className="remarks" />
            <button className="btn" onClick={submitAssessment}>
              Submit Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}