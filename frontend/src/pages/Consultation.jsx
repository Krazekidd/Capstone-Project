import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Consultation.css'

const Consultation = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedType, setSelectedType] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const goToStep = (step) => {
    setCurrentStep(step)
  }

  const confirmBooking = () => {
    if (selectedType && selectedDate && selectedTime) {
      setCurrentStep(3)
    }
  }

  const getProgressClass = (step) => {
    return currentStep >= step ? 'active' : ''
  }

  return (
    <>
      <div className="background-accent accent-top"></div>
      <div className="background-accent accent-bottom"></div>

      <section className="consultation-hero">
        <div className="overlay">
          <h1>Schedule Your Consultation</h1>
          <p>Begin your fitness journey with professional guidance</p>
        </div>
      </section>

      <div className="progress-bar">
        <div className={`step ${getProgressClass(1)}`} id="progStep1">
          <span>1</span> Type
        </div>
        <div className={`step ${getProgressClass(2)}`} id="progStep2">
          <span>2</span> Date & Time
        </div>
        <div className={`step ${getProgressClass(3)}`} id="progStep3">
          <span>3</span> Confirmation
        </div>
      </div>

      <section className="consultation-wrapper">
        <div className={`consult-card ${currentStep === 1 ? 'active' : ''}`} id="step1">
          <h2>Select Consultation Type</h2>
          <div className="type-grid">
            <div 
              className={`type-card ${selectedType === 'Starter Consultation' ? 'selected' : ''}`}
              onClick={() => setSelectedType('Starter Consultation')}
            >
              <i className="fas fa-dumbbell fa-2x"></i>
              <h3>Starter Consultation</h3>
              <p>Perfect for beginners ready to start training.</p>
            </div>
            <div 
              className={`type-card ${selectedType === 'Nutritional Consultation' ? 'selected' : ''}`}
              onClick={() => setSelectedType('Nutritional Consultation')}
            >
              <i className="fas fa-apple-alt fa-2x"></i>
              <h3>Nutritional Consultation</h3>
              <p>Personalized food and supplement guidance.</p>
            </div>
          </div>
          <button 
            className="primary-btn" 
            onClick={() => goToStep(2)}
            disabled={!selectedType}
          >
            Continue
          </button>
        </div>

        <div className={`consult-card ${currentStep === 2 ? 'active' : ''}`} id="step2">
          <h2>Select Date & Time</h2>
          <div className="date-time">
            <div className="input-group">
              <label htmlFor="date">Date</label>
              <input 
                type="date" 
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="time">Time</label>
              <input 
                type="time" 
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>
          <button 
            className="primary-btn" 
            onClick={confirmBooking}
            disabled={!selectedDate || !selectedTime}
          >
            Confirm Consultation
          </button>
        </div>

        <div className={`consult-card ${currentStep === 3 ? 'active' : ''}`} id="step3">
          <h2>Confirmation</h2>
          <div className="summary">
            <p><strong>Consultation:</strong> <span id="summaryType">{selectedType}</span></p>
            <p><strong>Date:</strong> <span id="summaryDate">{selectedDate}</span></p>
            <p><strong>Time:</strong> <span id="summaryTime">{selectedTime}</span></p>
          </div>
          <Link to="/login" className="primary-btn">Proceed to Login</Link>
        </div>
      </section>
    </>
  )
}

export default Consultation
