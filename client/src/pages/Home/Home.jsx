import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', message: '' });
    alert('Message sent! We\'ll get back to you soon.');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMotivation = () => {
    const motivations = [
      '💪 You\'ve got this! Every rep counts!',
      '🔥 No excuses, just results!',
      '🌟 Push harder than yesterday!',
      '⚡ Your body can stand almost anything. It\'s your mind that you need to convince!'
    ];
    alert(motivations[Math.floor(Math.random() * motivations.length)]);
  };

  const offers = [
    {
      icon: '💪',
      title: 'Strength Training',
      description: 'Build power, endurance, and confidence with guided strength programs.'
    },
    {
      icon: '🔥',
      title: 'Bootcamps',
      description: 'High-intensity group workouts designed to push limits and burn fat.'
    },
    {
      icon: '🌿',
      title: 'Outdoor Excursions',
      description: 'Train beyond the gym with hikes, runs, and outdoor fitness challenges.'
    }
  ];

  const featured = [
    {
      link: 'https://www.jamaicaobserver.com/2020/07/04/iron-man/',
      image: 'https://www.jamaicaobserver.com/jamaicaobserver/news/wp-content/uploads/sites/4/2020/07/863f62386d5e313e25b5387dd0a23fcc.jpg.webp',
      title: 'IRON MAN',
      description: '"Desire, burning desire\' pushes 89-year-old weightlifting pioneer to keep going..."',
      source: '— The Gleaner'
    },
    {
      link: 'https://jamaica-gleaner.com',
      image: 'images/gleaner-logo.png',
      title: 'Title of the Article',
      description: 'A short snippet or summary of the article goes here...',
      source: '— The Gleaner'
    }
  ];

  return (
    <div>
      {/* Navigation */}
      <nav>
        <img src="images/triallogo.png" alt="B.A.D People Fitness Logo" width="150" height="175" />
        <div className="heading">
          <h4>B.A.D People Fitness</h4>
        </div>
        <ul className="nav-links">
          <li><Link className="active" to="/">Home</Link></li>
          <li className="dropdown">
            <a href="#services">Services ▾</a>
            <ul className="dropdown-content">
              <li><Link to="/consultation">Consultation</Link></li>
              <li><Link to="/membership">Membership</Link></li>
              <li><a href="#excursions">Excursions</a></li>
            </ul>
          </li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/account">My Account</Link></li>
          <li><Link to="/shop" className="cart active">🛒</Link></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <img src="images/BACKGROUND.png" alt="People working out in a gym" />
        <div className="hero-overlay">
          <h1>WELCOME TO</h1>
          <h2>B.A.D People Fitness</h2>
          <p>BODY . AESTHETIC . DEVELOPMENT</p>
          <Link to="/login" className="hero-btn">Start Your Journey</Link>
        </div>
      </section>

      {/* Offers Section */}
      <section className="offers">
        <h2 className="offers-title">What We Offer</h2>
        <div className="offer-cards">
          {offers.map((offer, index) => (
            <a key={index} href="#services" className="offer-card">
              <div className="offer-icon">{offer.icon}</div>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="featured">
        <h2 className="featured-title">Featured In</h2>
        <div className="featured-grid">
          {featured.map((item, index) => (
            <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="featured-card">
              <img src={item.image} alt={item.title} />
              <div className="article-info">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <span>{item.source}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">

          {/* Brand Section */}
          <div className="footer-section brand">
            <h3>B.A.D People Fitness</h3>
            <p className="motivation">ANY WORKOUT IS BETTER THAN NO WORKOUT.</p>
            <button className="motivate-btn" onClick={handleMotivation}>🔥 Get Motivation</button>
          </div>

          {/* Contact Section */}
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>📍 107 Hughenden Ave, Kingston, Jamaica</p>
            <p>📞 (876) 459-8128</p>
            <p>📧 info@badpeoplefitness.com</p>
          </div>

          {/* Social Section */}
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="https://instagram.com/b.a.dpplfitness" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://wa.me/18764598128" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i>
              </a>
              <a href="tel:+18764598128">
                <i style={{ fontSize: '21px' }} className="fa">&#xf095;</i>
              </a>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="footer-section">
            <h4>Leave a Message</h4>
            <form className="footer-form" onSubmit={handleFormSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleFormChange}
                required
              ></textarea>
              <button type="submit">Send 💥</button>
            </form>
          </div>

        </div>

        {/* Gym Bar Animation */}
        <div className="gym-bar">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© 2026 B.A.D People Fitness. All rights reserved.</p>
          <button className="top-btn" onClick={scrollToTop}>⬆ Back to Top</button>
        </div>
      </footer>
    </div>
  );
}
