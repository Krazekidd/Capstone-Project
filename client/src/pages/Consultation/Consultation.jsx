import React, { useState } from "react";
import "./Consultations.css";

const Consultation = () => {
  const [selectedType, setSelectedType] = useState("");
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const goToStep = (nextStep) => {
    if (nextStep === 2 && !selectedType) {
      alert("Please select a consultation type.");
      return;
    }
    setStep(nextStep);
  };

  const confirmBooking = () => {
    if (!date || !time) {
      alert("Please select a date and time.");
      return;
    }
    setStep(3);
  };

  return (
    <div className="consultation-container-wrapper">
      <div className="consultation-background-accent consultation-accent-top"></div>
      <div className="consultation-background-accent consultation-accent-bottom"></div>

      <section className="consultation-hero">
        <div className="consultation-overlay">
          <h1>Schedule Your Consultation</h1>
          <p>Begin your fitness journey with professional guidance</p>
        </div>
      </section>

      <div className="consultation-progress-bar">
        <div className={`consultation-step ${step >= 1 ? "active" : ""}`}><span>1</span> Type</div>
        <div className={`consultation-step ${step >= 2 ? "active" : ""}`}><span>2</span> Date & Time</div>
        <div className={`consultation-step ${step >= 3 ? "active" : ""}`}><span>3</span> Confirmation</div>
      </div>

      <section className="consultation-wrapper">
        {step === 1 && (
          <div className="consultation-card">
            <h2>Select Consultation Type</h2>
            <div className="consultation-type-grid">
              <div
                className={`consultation-type-card ${selectedType === "Starter Consultation" ? "selected" : ""}`}
                onClick={() => handleTypeSelect("Starter Consultation")}
              >
                <i className="fas fa-dumbbell fa-2x"></i>
                <h3>Starter Consultation</h3>
                <p>Perfect for beginners ready to start training.</p>
              </div>
              <div
                className={`consultation-type-card ${selectedType === "Nutritional Consultation" ? "selected" : ""}`}
                onClick={() => handleTypeSelect("Nutritional Consultation")}
              >
                <i className="fas fa-apple-alt fa-2x"></i>
                <h3>Nutritional Consultation</h3>
                <p>Personalized food and supplement guidance.</p>
              </div>
            </div>
            <button className="consultation-primary-btn" onClick={() => goToStep(2)}>Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="consultation-card">
            <h2>Select Date & Time</h2>
            <div className="consultation-date-time">
              <div className="consultation-input-group">
                <label htmlFor="date">Date</label>
                <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="consultation-input-group">
                <label htmlFor="time">Time</label>
                <input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <button className="consultation-primary-btn" onClick={confirmBooking}>Confirm Consultation</button>
          </div>
        )}

        {step === 3 && (
          <div className="consultation-card">
            <h2>Confirmation</h2>
            <div className="consultation-summary">
              <p><strong>Consultation:</strong> {selectedType}</p>
              <p><strong>Date:</strong> {date}</p>
              <p><strong>Time:</strong> {time}</p>
            </div>
            <button className="consultation-primary-btn">Proceed to Login</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Consultation;