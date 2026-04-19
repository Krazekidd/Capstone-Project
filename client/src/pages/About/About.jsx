import { useState, useEffect } from 'react';
import './About.css';

export default function About() {
  const [stats, setStats] = useState({
    years: 0,
    athletes: 0,
    programs: 0
  });

  useEffect(() => {
    // Animate stats counter
    const animateCounter = () => {
      let yearsCount = 0;
      let athletesCount = 0;
      let programsCount = 0;

      const interval = setInterval(() => {
        if (yearsCount < 45) yearsCount += 3;
        if (athletesCount < 1000) athletesCount += 50;
        if (programsCount < 20) programsCount += 1;

        setStats({
          years: Math.min(yearsCount, 45),
          athletes: Math.min(athletesCount, 1000),
          programs: Math.min(programsCount, 20)
        });

        if (yearsCount >= 45 && athletesCount >= 1000 && programsCount >= 20) {
          clearInterval(interval);
        }
      }, 30);
    };

    animateCounter();
  }, []);

  const services = [
    {
      icon: '🏋️',
      title: 'Personal & Athletic Training',
      description: 'Elite strength development, sport-specific conditioning, and performance optimization.',
      link: 'services/personal-training.html',
      cta: 'Learn More →'
    },
    {
      icon: '🔥',
      title: 'Bootcamps & Group Fitness',
      description: 'High-energy, structured sessions designed to push limits and build community.',
      link: 'services/bootcamps.html',
      cta: 'View Programs →'
    },
    {
      icon: '🌿',
      title: 'Outdoor Excursions',
      description: 'Functional training experiences that combine endurance, strength, and mental resilience.',
      link: 'services/outdoor.html',
      cta: 'Explore Events →'
    },
    {
      icon: '👶',
      title: 'Kids Fitness Programs',
      description: 'Age-appropriate training that builds coordination, confidence, and discipline.',
      link: 'services/kids.html',
      cta: 'See Programs →'
    },
    {
      icon: '🥗',
      title: 'Nutrition & Food Coaching',
      description: 'Personalized nutritional guidance for performance, recovery, and long-term health.',
      link: 'services/nutrition.html',
      cta: 'Get Guidance →'
    },
    {
      icon: '💊',
      title: 'Supplement Advisory',
      description: 'Evidence-based recommendations to safely support strength and recovery.',
      link: 'services/supplements.html',
      cta: 'Learn More →'
    }
  ];

  const objectives = [
    'Expand corporate wellness and sports performance programs',
    'Develop certified training & instructor programs',
    'Launch branded wellness and nutrition products',
    'Create employment opportunities in fitness & wellness'
  ];

  const mottos = [
    'Any workout is better than no workout.',
    'You are what you eat.',
    'One more set. Finish your reps.'
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-hero-overlay">
          <h1>B.A.D People Fitness</h1>
          <p>Built on Legacy. Driven by Discipline. Powered by Community.</p>
        </div>
      </section>

      {/* QUICK STATS SECTION */}
      <section className="stats">
        <div className="stat-box">
          <h2>{stats.years}</h2>
          <p>Years of Impact</p>
        </div>
        <div className="stat-box">
          <h2>{stats.athletes}</h2>
          <p>Athletes Trained</p>
        </div>
        <div className="stat-box">
          <h2>{stats.programs}</h2>
          <p>Elite Programs</p>
        </div>
      </section>

      {/* WHO WE ARE SECTION */}
      <section className="section light">
        <div className="content">
          <h2>Who We Are</h2>
          <p className="lead">
            B.A.D People Fitness <strong>Body. Aesthetic. Development</strong> is a proudly family-owned Jamaican fitness institution rooted in elite athletic development.
          </p>
          <p>
            What began as a backyard training space evolved into a respected fitness powerhouse, built on discipline, resilience, and generational leadership.
          </p>
        </div>
      </section>

      {/* THE PEDLER LEGACY SECTION */}
      <section className="section dark">
        <h2>The Pedler Legacy</h2>
        <div className="timeline">
          <div className="timeline-item">
            <span>1960s</span>
            <p>
              Leslie Roy "Jack" Pedler begins weightlifting as a youth, driven by self-discipline and excellence.
            </p>
          </div>

          <div className="timeline-item">
            <span>1970s</span>
            <p>
              Jack transforms his Greenwich Town backyard into a training ground, earning national recognition.
            </p>
          </div>

          <div className="timeline-item">
            <span>1976</span>
            <p>
              Establishment of the Hughenden Avenue facility — an open-access gym supporting upcoming athletes.
            </p>
          </div>

          <div className="timeline-item">
            <span>2020</span>
            <p>
              Official rebrand to <strong>B.A.D People Fitness</strong>, modernizing identity while preserving legacy.
            </p>
          </div>
        </div>
      </section>

      {/* LEADERSHIP CARDS SECTION */}
      <section className="section light">
        <div className="grid">
          <div className="card">
            <h3>Second-Generation Leadership</h3>
            <p>
              Following Jack Pedler's passing, ownership transitioned to his five children, ensuring continuity of vision, discipline, and authenticity.
            </p>
          </div>

          <div className="card">
            <h3>Operational Excellence</h3>
            <p>
              Day-to-day operations are led by <strong>Mr. Kenneth Daley</strong>, a seasoned fitness professional overseeing strategy, performance, and growth.
            </p>
          </div>
        </div>
      </section>

      {/* EXPERTISE SERVICES SECTION */}
      <section className="section dark">
        <h2 className="section-title">Our Expertise</h2>
        <p className="section-subtitle">
          Professionally structured programs designed to build strength, performance, and lifelong wellness.
        </p>

        <div className="expertise-grid">
          {services.map((service, index) => (
            <a key={index} href={service.link} className="expertise-card">
              <div className="icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="cta">{service.cta}</span>
            </a>
          ))}
        </div>
      </section>

      {/* OBJECTIVES SECTION */}
      <section className="section dark">
        <h2>Strategic Objectives</h2>
        <ul className="objectives">
          {objectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </section>

      {/* LOCATION SECTION */}
      <section className="section light">
        <h2>Our Location</h2>
        <p>107 Hughenden Avenue, Kingston, Jamaica</p>

        <div className="map">
          <iframe
            src="https://www.google.com/maps?q=107+Hughenden+Avenue+Kingston+Jamaica&output=embed"
            loading="lazy"
            title="B.A.D People Fitness Location"
          >
          </iframe>
        </div>
      </section>

      {/* CONTACT STRIP SECTION */}
      <section className="contact-strip">
        <div className="contact-item">
          <i className="fa fa-phone"></i>
          <a href="tel:+18764598128">+1 876-459-8128</a>
        </div>

        <div className="divider"></div>

        <div className="contact-item">
          <i className="fab fa-instagram"></i>
          <a href="https://instagram.com/b.a.dpplfitness" target="_blank" rel="noopener noreferrer">@b.a.dpplfitness</a>
        </div>

        <div className="divider"></div>

        <div className="contact-item">
          <i className="fab fa-whatsapp"></i>
          <a href="https://wa.me/18764598128" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
        </div>

        <div className="divider"></div>

        <div className="contact-item">
          <i className="fa fa-envelope"></i>
          <a href="mailto:info@badpeoplefitness.com">info@badpeoplefitness.com</a>
        </div>
      </section>

      {/* MOTTOS SECTION */}
      <section className="section dark motto">
        {mottos.map((motto, index) => (
          <p key={index}>{motto}</p>
        ))}
      </section>
    </div>
  );
}
