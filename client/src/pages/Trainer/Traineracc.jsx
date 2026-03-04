import React, { useState } from "react";
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

      {/* HERO */}
      <div className="hero">
        <div className="hero-background">
          <img
            src="https://images.unsplash.com/photo-1571019613911-ec6d0c1f31b3?auto=format&fit=crop&w=1350&q=80"
            alt="background"
            className="hero-bg-img"
          />
        </div>

        <div className="hero-content">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="trainer"
            className="avatar"
          />
          <h1>{trainer.name}</h1>
          <div className="role-badge">{trainer.role}</div>

          <div className="stars">
            {"★".repeat(Math.floor(trainer.rating))}
            {"☆".repeat(5 - Math.floor(trainer.rating))}
            <span className="rating-number">{trainer.rating}</span>
          </div>

          {/* Professional Overview */}
          <div className="professional-overview">
            <div className="info-box">
              <span>Years of Experience</span>
              <strong>{trainer.yearsExperience} Years</strong>
            </div>
            <div className="info-box">
              <span>Certifications</span>
              <strong>{trainer.cert}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="container">

        {/* KPI STATS */}
        <section className="kpi-row">
          <div className="kpi-card">
            <h4>Monthly Score</h4>
            <div className="circle"
              style={{
                background: `conic-gradient(#ff6b00 ${trainer.monthlyScore}%, #eee ${trainer.monthlyScore}% 100%)`
              }}>
              {trainer.monthlyScore}%
            </div>
          </div>

          <div className="kpi-card">
            <h4>Total Reviews</h4>
            <div className="big-number">{trainer.publicReviews.length}</div>
          </div>

          <div className="kpi-card">
            <h4>Active Alerts</h4>
            <div className="big-number alert">
              {trainer.clientsAlerts.length}
            </div>
          </div>
        </section>

        {/* TRAINER ASSESSMENT */}
        <section className="card">
          <h3>Trainer Assessment</h3>

          {trainer.otherTrainers.map((t) => (
            <div key={t} className="trainer-row">
              <span>{t}</span>
              <button className="btn" onClick={() => openTrainerModal(t)}>
                Assess
              </button>
            </div>
          ))}
        </section>

        {/* CLIENT ALERTS */}
        <section className="card">
          <h3>Clients Needing Attention</h3>
          {trainer.clientsAlerts.map((c, i) => (
            <div key={i} className="client-row">
              <div>
                <strong>{c.name}</strong>
                <p>{c.issue}</p>
              </div>
              <div className="risk-badge">⚠ Risk</div>
            </div>
          ))}
        </section>

        {/* PUBLIC REVIEWS */}
        <section className="card">
          <h3>Public Reviews</h3>
          {trainer.publicReviews.map((r, i) => (
            <div key={i} className="review">
              <strong>{r.user}</strong>
              <div className="stars small">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>
              <p>{r.comment}</p>
            </div>
          ))}
        </section>

        {/* ACTIVITY TIMELINE */}
        <section className="card">
          <h3>Recent Activity</h3>
          <ul className="timeline">
            <li>Completed 12 sessions this week</li>
            <li>3 new clients onboarded</li>
            <li>Monthly assessment updated</li>
          </ul>
        </section>

      </div>

      {/* MODAL */}
      {showTrainerModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Assessing {selectedTrainer}</h3>

            {trainer.assessmentCriteria.map((c) => (
              <div key={c} className="slider">
                <label>{c}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={trainerAssessments[selectedTrainer]?.[c] || 0}
                  onChange={(e) =>
                    handleAssessmentChange(c, e.target.value)
                  }
                />
                <span>
                  {trainerAssessments[selectedTrainer]?.[c] || 0}
                </span>
              </div>
            ))}

            <textarea
              placeholder="Add remarks..."
              className="remarks"
            />

            <button
              className="btn"
              onClick={() => setShowTrainerModal(false)}
            >
              Submit Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};