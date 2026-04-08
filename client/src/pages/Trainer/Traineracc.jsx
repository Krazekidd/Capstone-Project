import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../api/api";
import "./trainer.css";
  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };
export default function TrainerPage() {
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerAssessments, setTrainerAssessments] = useState({});
  const [assessedTrainers, setAssessedTrainers] = useState({});
  const [bgColor, setBgColor] = useState("#ff6b00");
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [isEditingCert, setIsEditingCert] = useState(false);
  const [certification, setCertification] = useState("NASM, ACE, CSCS");
  const [coachingMessage, setCoachingMessage] = useState({
    client: "",
    date: "",
    time: "",
    message: ""
  });

  const trainer = {
    name: "Marcus Steele",
    age: 34,
    rank: "Senior Trainer",
    specialisation: "Strength & Conditioning, Functional Training",
    certification: certification,
    yearsExperience: 8,
    rating: 4.7,
    otherTrainers: ["Jessica Hale", "Leon Cruz", "Alicia Chen", "Derek Wong", "Sofia Martinez", "James Lee"],
    clientsAlerts: [
      { name: "Robert Johnson", progress: 32, goal: "Lose 15kg" },
      { name: "Emily Davis", progress: 28, goal: "Run 5k" },
      { name: "Michael Brown", progress: 45, goal: "Gain 5kg muscle" },
    ],
    publicReviews: [
      { user: "Alice", rating: 5, comment: "Amazing trainer!" },
      { user: "Bob", rating: 4, comment: "Very helpful sessions." },
    ],
    assessmentCriteria: [
      "Knowledge",
      "Communication",
      "Professionalism",
      "Session Planning",
      "Motivation"
    ],
    monthlyScore: 87,
    sessionsAttended: 92,
    sessionsCompleted: 18,
    clientsAssigned: 12,
    attendanceRate: 94,
    lastAssessmentDate: "15/02/26",
    averageAssessmentScore: 8.3,
  };

  const standing = trainer.monthlyScore > 80 ? "Good" : trainer.monthlyScore > 60 ? "Decent" : "Bad";
  const avgProgress = Math.round((trainer.monthlyScore + trainer.sessionsAttended) / 2);

  const openTrainerModal = (trainerName) => {
    setSelectedTrainer(trainerName);
    setShowTrainerModal(true);
    if (!trainerAssessments[trainerName]) {
      setTrainerAssessments(prev => ({
        ...prev,
        [trainerName]: trainer.assessmentCriteria.reduce(
          (obj, c) => ({ ...obj, [c]: 0 }),
          {}
        )
      }));
    }
  };

  const handleAssessmentChange = (criteria, value) => {
    setTrainerAssessments(prev => ({
      ...prev,
      [selectedTrainer]: {
        ...prev[selectedTrainer],
        [criteria]: value
      }
    }));
  };

  const submitAssessment = () => {
    const scores = Object.values(trainerAssessments[selectedTrainer] || {});
    const avg = scores.length ? (scores.reduce((a,b) => a + Number(b), 0) / scores.length).toFixed(1) : 0;
    setAssessedTrainers(prev => ({
      ...prev,
      [selectedTrainer]: { assessed: true, rating: avg }
    }));
    setShowTrainerModal(false);
  };

  const redoAssessment = (trainerName) => {
    setAssessedTrainers(prev => ({
      ...prev,
      [trainerName]: { assessed: false }
    }));
    openTrainerModal(trainerName);
  };

  const handleEditToggle = () => {
    setIsEditingCert(!isEditingCert);
  };

  const handleCertChange = (e) => {
    setCertification(e.target.value);
  };

  const handleBlur = () => {
    setIsEditingCert(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditingCert(false);
    }
  };

  const handleCoachingChange = (e) => {
    const { name, value } = e.target;
    setCoachingMessage(prev => ({ ...prev, [name]: value }));
  };

  const sendCoachingMessage = () => {
    alert(`Message sent to ${coachingMessage.client || "client"}`);
    setCoachingMessage({ client: "", date: "", time: "", message: "" });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const colors = ["#ff6b00", "#e63946", "#1e88e5"];

  return (
    <div className="trainer-page" style={{ "--accent": bgColor }}>
      {/* Floating Home Button */}
      <Link to="/" className="floating-home">← Home</Link>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
      {/* Floating Color Picker */}
      <div className="floating-color-menu">
        <button className="color-dots" onClick={() => setShowColorMenu(!showColorMenu)}>⋮</button>
        {showColorMenu && (
          <div className="color-options">
            {colors.map(c => (
              <div
                key={c}
                className="color-option"
                style={{ background: c }}
                onClick={() => { setBgColor(c); setShowColorMenu(false); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Header with gym background */}
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
          <p className="profile-rank-age">{trainer.rank} | Age: {trainer.age}</p>
          <div className="profile-rating">
            <span className="stars">
              {"★".repeat(Math.floor(trainer.rating))}
              {"☆".repeat(5 - Math.floor(trainer.rating))}
            </span>
            <span className="rating-value">{trainer.rating}</span>
          </div>
          <div className="profile-spec-cert">
            <p className="spec"><strong>Specialisation:</strong> {trainer.specialisation}</p>
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
              <p className="cert"><strong>Certification:</strong> {trainer.certification}</p>
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
              <div className="rating-large">{trainer.rating}</div>
              <div className="stars-large">
                {"★".repeat(Math.floor(trainer.rating))}
                {"☆".repeat(5 - Math.floor(trainer.rating))}
              </div>
            </div>
            <div className="assessment-info">
              <p><strong>Average Assessment Score:</strong> {trainer.averageAssessmentScore}/10</p>
              <p className="assessment-date">Based on assessment done {trainer.lastAssessmentDate}</p>
              <button className="btn small">View All Assessments</button>
            </div>
          </div>
          <div className="divider-vertical"></div>
          <div className="card-right">
            <h3>Monthly Performance</h3>
            <div className="monthly-performance">
              <div className="progress-circle-container">
                <div className="progress-circle" style={{ background: `conic-gradient(var(--accent) ${avgProgress * 3.6}deg, #eee 0deg)` }}>
                  <span>{avgProgress}%</span>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Sessions Completed</span>
                  <span className="stat-value">{trainer.sessionsCompleted}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Clients Assigned</span>
                  <span className="stat-value">{trainer.clientsAssigned}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Attendance %</span>
                  <span className="stat-value">{trainer.attendanceRate}%</span>
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
              {trainer.otherTrainers.map((t) => {
                const assessed = assessedTrainers[t]?.assessed;
                const avgRating = assessedTrainers[t]?.rating;
                return (
                  <div
                    key={t}
                    className={`trainer-name-btn ${assessed ? 'assessed' : ''}`}
                    onClick={() => assessed ? redoAssessment(t) : openTrainerModal(t)}
                  >
                    {t}
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
                name="client"
                placeholder="Client Name"
                value={coachingMessage.client}
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
              <button className="btn" onClick={sendCoachingMessage}>Send Message</button>
            </div>
          </div>
        </div>

        {/* Clients at Risk */}
        <div className="card">
          <h3>Clients at Risk</h3>
          {trainer.clientsAlerts.map((c, i) => (
            <div key={i} className="client-risk-row">
              <div className="client-risk-info">
                <span className="client-initials" title={c.name}>{getInitials(c.name)}</span>
                <div className="progress-bar-container small">
                  <div className="progress-bar-fill" style={{ width: `${c.progress}%`, background: "var(--accent)" }}></div>
                </div>
                <span className="client-progress">{c.progress}%</span>
              </div>
              <button className="btn small warn-btn">Warn & Assist</button>
            </div>
          ))}
        </div>

        {/* Public Reviews */}
        <div className="card">
          <h3>Public Reviews</h3>
          {trainer.publicReviews.map((r, i) => (
            <div key={i} className="review">
              <strong>{r.user}</strong>
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
      {showTrainerModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowTrainerModal(false)}>✕</button>
            <h3>Assessing {selectedTrainer}</h3>
            {trainer.assessmentCriteria.map((c) => (
              <div key={c} className="slider">
                <label>{c}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={trainerAssessments[selectedTrainer]?.[c] || 0}
                  onChange={(e) => handleAssessmentChange(c, e.target.value)}
                />
                <span>{trainerAssessments[selectedTrainer]?.[c] || 0}</span>
              </div>
            ))}
            <textarea placeholder="Add remarks..." className="remarks" />
            <button className="btn" onClick={submitAssessment}>Submit Assessment</button>
          </div>
        </div>
      )}
    </div>
  );
}