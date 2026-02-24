import { useState, useEffect } from 'react'
import './About.css'

const About = () => {
  const [counts, setCounts] = useState({ years: 0, athletes: 0, programs: 0 })

  useEffect(() => {
    const targetCounts = { years: 45, athletes: 1000, programs: 20 }
    const duration = 2000
    const steps = 60
    const increment = {
      years: targetCounts.years / steps,
      athletes: targetCounts.athletes / steps,
      programs: targetCounts.programs / steps
    }

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      setCounts({
        years: Math.min(Math.floor(currentStep * increment.years), targetCounts.years),
        athletes: Math.min(Math.floor(currentStep * increment.athletes), targetCounts.athletes),
        programs: Math.min(Math.floor(currentStep * increment.programs), targetCounts.programs)
      })

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-overlay">
          <h1>B.A.D People Fitness</h1>
          <p>Built on Legacy. Driven by Discipline. Powered by Community.</p>
        </div>
      </section>

      <section className="stats">
        <div className="stat-box">
          <h2>{counts.years}</h2>
          <p>Years of Impact</p>
        </div>
        <div className="stat-box">
          <h2>{counts.athletes}</h2>
          <p>Athletes Trained</p>
        </div>
        <div className="stat-box">
          <h2>{counts.programs}</h2>
          <p>Elite Programs</p>
        </div>
      </section>

      <section className="section light">
        <div className="content">
          <h2>
            <c>Who We Are</c>
          </h2>
          <p className="lead">
            B.A.D People Fitness
            <strong>Body. Aesthetic. Development</strong>
            is a proudly family-owned Jamaican fitness institution rooted in elite athletic development.
          </p>
          <p>
            What began as a backyard training space evolved into a respected fitness powerhouse,
            built on discipline, resilience, and generational leadership.
          </p>
        </div>
      </section>

      <section className="section dark">
        <h2>The Pedler Legacy</h2>

        <div className="timeline">
          <div className="timeline-item">
            <span>1960s</span>
            <p>
              Leslie Roy "Jack" Pedler begins weightlifting as a youth, driven by self-discipline
              and excellence.
            </p>
          </div>

          <div className="timeline-item">
            <span>1970s</span>
            <p>
              Jack transforms his Greenwich Town backyard into a training ground,
              earning national recognition.
            </p>
          </div>

          <div className="timeline-item">
            <span>1976</span>
            <p>
              Establishment of the Hughenden Avenue facility — an open-access gym
              supporting upcoming athletes.
            </p>
          </div>

          <div className="timeline-item">
            <span>2020</span>
            <p>
              Official rebrand to <strong>B.A.D People Fitness</strong>, modernizing identity
              while preserving legacy.
            </p>
          </div>
        </div>
      </section>

      <section className="section light">
        <div className="grid">
          <div className="card">
            <h3>Second-Generation Leadership</h3>
            <p>
              Following Jack Pedler's passing, ownership transitioned to his five children,
              ensuring continuity of vision, discipline, and authenticity.
            </p>
          </div>

          <div className="card">
            <h3>Operational Excellence</h3>
            <p>
              Day-to-day operations are led by <strong>Mr. Kenneth Daley</strong>, a seasoned
              fitness professional overseeing strategy, performance, and growth.
            </p>
          </div>
        </div>
      </section>

      <section className="section dark">
        <h2 className="section-title">Our Expertise</h2>
        <p className="section-subtitle">
          Professionally structured programs designed to build strength,
          performance, and lifelong wellness.
        </p>

        <div className="expertise-grid">
          <a href="/services/personal-training" className="expertise-card">
            <div className="icon">🏋️</div>
            <h3>Personal & Athletic Training</h3>
            <p>
              Elite strength development, sport-specific conditioning,
              and performance optimization.
            </p>
            <span className="cta">Learn More →</span>
          </a>

          <a href="/services/bootcamps" className="expertise-card">
            <div className="icon">🔥</div>
            <h3>Bootcamps & Group Fitness</h3>
            <p>
              High-energy, structured sessions designed to push limits
              and build community.
            </p>
            <span className="cta">View Programs →</span>
          </a>

          <a href="/services/outdoor" className="expertise-card">
            <div className="icon">🌿</div>
            <h3>Outdoor Excursions</h3>
            <p>
              Functional training experiences that combine endurance,
              strength, and mental resilience.
            </p>
            <span className="cta">Explore Events →</span>
          </a>

          <a href="/services/kids" className="expertise-card">
            <div className="icon">👶</div>
            <h3>Kids Fitness Programs</h3>
            <p>
              Age-appropriate training that builds coordination,
              confidence, and discipline.
            </p>
            <span className="cta">See Programs →</span>
          </a>

          <a href="/services/nutrition" className="expertise-card">
            <div className="icon">🥗</div>
            <h3>Nutrition & Food Coaching</h3>
            <p>
              Personalized nutritional guidance for performance,
              recovery, and long-term health.
            </p>
            <span className="cta">Get Guidance →</span>
          </a>

          <a href="/services/supplements" className="expertise-card">
            <div className="icon">💊</div>
            <h3>Supplement Advisory</h3>
            <p>
              Evidence-based recommendations to safely support
              strength and recovery.
            </p>
            <span className="cta">Learn More →</span>
          </a>
        </div>
      </section>

      <section className="section dark">
        <h2>Strategic Objectives</h2>
        <ul className="objectives">
          <li>Expand corporate wellness and sports performance programs</li>
          <li>Develop certified training & instructor programs</li>
          <li>Launch branded wellness and nutrition products</li>
          <li>Create employment opportunities in fitness & wellness</li>
        </ul>
      </section>

      <section className="section light">
        <h2>Our Location</h2>
        <p>107 Hughenden Avenue, Kingston, Jamaica</p>

        <div className="map">
          <iframe 
            src="https://www.google.com/maps?q=107+Hughenden+Avenue+Kingston+Jamaica&output=embed"
            loading="lazy"
            title="B.A.D People Fitness Location"
          ></iframe>
        </div>
      </section>

      <section className="contact-strip">
        <div className="contact-item">
          <i className="fa fa-phone"></i>
          <a href="tel:+18764598128">+1 876-459-8128</a>
        </div>

        <div className="divider"></div>

        <div className="contact-item">
          <i className="fab fa-instagram"></i>
          <a href="https://instagram.com/b.a.dpplfitness" target="_blank" rel="noopener noreferrer">
            @b.a.dpplfitness
          </a>
        </div>

        <div className="divider"></div>

        <div className="contact-item">
          <i className="fab fa-whatsapp"></i>
          <a href="https://wa.me/18764598128" target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </a>
        </div>

        <div className="divider"></div>

        <div className="contact-item">
          <i className="fa fa-envelope"></i>
          <a href="mailto:info@badpeoplefitness.com">info@badpeoplefitness.com</a>
        </div>
      </section>

      <section className="section dark motto">
        <p>Any workout is better than no workout.</p>
        <p>You are what you eat.</p>
        <p>One more set. Finish your reps.</p>
      </section>
    </>
  )
}

export default About
