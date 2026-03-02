import { useState } from "react";
import "./trainer.css";

export default function TrainerPage() {
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerAssessments, setTrainerAssessments] = useState({});

  const trainer = {
    name: "Marcus Steele",
    role: "Senior Trainer",
    cert: "NASM, Strength & Conditioning",
    yearsExperience: 8,
    rating: 4.7,
    otherTrainers: ["Jessica Hale", "Leon Cruz", "Alicia Chen"],
    clientsAlerts: [
      { name: "Client A", issue: "Not reaching weight target" },
      { name: "Client B", issue: "Low workout compliance" },
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
    monthlyScore: 87
  };

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

  return (
    <div className="trainer-page">

      {/* TOP PROFILE */}
      <div className="profile-card">
        <img src="https://via.placeholder.com/150" alt="Trainer" className="trainer-photo" />
        <h1>{trainer.name}</h1>
        <span className="trainer-role">{trainer.role}</span>
        <div className="trainer-rating">
          {[1,2,3,4,5].map(star => (
            <span key={star} className={star <= Math.round(trainer.rating) ? "filled" : ""}>★</span>
          ))}
          <span className="rating-number">{trainer.rating.toFixed(1)}/5.0</span>
        </div>
        <p><strong>Experience:</strong> {trainer.yearsExperience} years</p>
        <p><strong>Certifications:</strong> {trainer.cert}</p>
      </div>

      {/* TRAINER ASSESSMENTS */}
      <div className="card">
        <h2>Trainer Assessments</h2>
        <div className="other-trainers">
          {trainer.otherTrainers.map(t => (
            <div
              key={t}
              className="trainer-card"
              onClick={() => openTrainerModal(t)}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* CLIENT ALERTS */}
      <div className="card">
        <h2>Client Alerts</h2>
        {trainer.clientsAlerts.length === 0 ? (
          <p>No alerts at this time.</p>
        ) : (
          <ul className="clients-alerts">
            {trainer.clientsAlerts.map((c, idx) => (
              <li key={idx}>⚠ {c.name} - {c.issue}</li>
            ))}
          </ul>
        )}
      </div>

      {/* PERFORMANCE METRIC */}
      <div className="card performance-card">
        <h2>Monthly Performance</h2>
        <div className="circular-progress">
          <svg viewBox="0 0 36 36">
            <path
              className="circle-bg"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="circle"
              strokeDasharray={`${trainer.monthlyScore}, 100`}
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="percentage">{trainer.monthlyScore}%</text>
          </svg>
        </div>
      </div>

      {/* PUBLIC REVIEWS */}
      <div className="card">
        <h2>Public Reviews</h2>
        {trainer.publicReviews.map((r, idx) => (
          <div key={idx} className="review">
            <strong>{r.user}</strong>
            <span className="review-stars">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={s <= r.rating ? "filled" : ""}>★</span>
              ))}
            </span>
            <p>{r.comment}</p>
          </div>
        ))}
      </div>

      {/* ASSESSMENT MODAL */}
      {showTrainerModal && (
        <div className="modal-overlay" onClick={() => setShowTrainerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Assess {selectedTrainer}</h3>
            {trainer.assessmentCriteria.map(c => (
              <div key={c} className="criteria-row">
                <span>{c}:</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={trainerAssessments[selectedTrainer][c]}
                  onChange={(e) => handleAssessmentChange(c, parseInt(e.target.value))}
                />
              </div>
            ))}
            <div className="remarks">
              <label>Remarks:</label>
              <textarea placeholder="Write remarks..."></textarea>
            </div>
            <button onClick={() => setShowTrainerModal(false)}>Save & Close</button>
          </div>
        </div>
      )}

    </div>
  );
}