import React from "react";
import "./Membership.css";

function goToLogin() {
  window.location.href = "login.html";
}

const Membership = () => {
  return (
    <div className="membership-container-wrapper">
      <section className="membership-hero">
        <div className="hero-content">
          <h1>Membership Plans</h1>
          <p>Choose the training style that fits your goals and lifestyle.</p>
        </div>
      </section>

      <section className="membership-section">
        <div className="membership-grid">
          <div className="membership-card">
            <h2>Single Training</h2>
            <p className="price">Personalized Focus</p>

            <ul>
              <li>
                <i className="fa-solid fa-check"></i> One-on-one coaching
              </li>
              <li>
                <i className="fa-solid fa-check"></i> Custom workout plans
              </li>
              <li>
                <i className="fa-solid fa-check"></i> Progress tracking
              </li>
              <li>
                <i className="fa-solid fa-check"></i> Flexible scheduling
              </li>
            </ul>

            <label>Preferred Start Date</label>
            <input type="date"></input>

            <button onClick={goToLogin}>Get Started</button>
          </div>

          <div className="membership-card highlight">
            <span className="badge">Most Popular</span>
            <h2>Group Training</h2>
            <p className="price">Motivation & Community</p>

            <ul>
              <li>
                <i className="fa-solid fa-check"></i> Small group sessions
              </li>
              <li>
                <i className="fa-solid fa-check"></i> Bootcamps & circuits
              </li>
              <li>
                <i className="fa-solid fa-check"></i> Accountability support
              </li>
              <li>
                <i className="fa-solid fa-check"></i> Lower cost per session
              </li>
            </ul>

            <label>Preferred Start Date</label>
            <input type="date"></input>

            <button onClick={goToLogin}>Get Started</button>
          </div>
        </div>
      </section>

      <section className="why-join">
        <h2>Why Join B.A.D People Fitness?</h2>

        <div className="why-grid">
          <div>
            <i className="fa-solid fa-dumbbell"></i>
            <h4>Expert Coaching</h4>
            <p>Certified trainers committed to real, measurable results.</p>
          </div>

          <div>
            <i className="fa-solid fa-heart-pulse"></i>
            <h4>Results Driven</h4>
            <p>
              Programs designed to transform strength, endurance, and mindset.
            </p>
          </div>

          <div>
            <i className="fa-solid fa-people-group"></i>
            <h4>Strong Community</h4>
            <p>Train with people who push you to be better every session.</p>
          </div>
        </div>
      </section>

      {/* <!-- WHAT HAPPENS NEXT --> */}
      <section className="after-join">
        <h2 className="after-title">What Happens After You Join</h2>
        <p className="after-subtitle">
          A simple, guided process designed to get you training fast and
          effectively.
        </p>

        <div className="after-steps">
          <div className="after-step">
            <div className="step-icon">
              <i className="fa-solid fa-user"></i>
            </div>
            <h3>Create Your Account</h3>
            <p>
              Sign up or log in securely to access your membership dashboard and
              training details.
            </p>
          </div>

          <div className="after-step">
            <div className="step-icon">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <h3>Select Your Start Date</h3>
            <p>
              Choose the training start date that works best with your schedule.
            </p>
          </div>

          <div className="after-step">
            <div className="step-icon">
              <i className="fa-solid fa-dumbbell"></i>
            </div>
            <h3>Trainer Assignment</h3>
            <p>
              You’ll be matched with a qualified trainer aligned with your
              fitness goals.
            </p>
          </div>

          <div className="after-step">
            <div className="after-step">
              <div className="step-icon">
                <i className="fa-solid fa-fire"></i>
              </div>
              <h3>Begin Your Program</h3>
              <p>
                Start your workouts with structure, support, and accountability
                from day one.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Membership;
