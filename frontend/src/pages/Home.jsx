import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <>
      <section className="hero">
        <img src="/images/BACKGROUND.png" alt="People working out in a gym" />
        <div className="hero-overlay">
          <h1>WELCOME TO</h1>
          <h2>B.A.D People Fitness</h2>
          <p>BODY . AESTHETIC . DEVELOPMENT</p>
          <Link to="/login" className="hero-btn">Start Your Journey</Link>
        </div>
      </section>

      <section className="offers">
        <h2 className="offers-title">What We Offer</h2>
        <div className="offer-cards">
          <Link to="/services" className="offer-card">
            <div className="offer-icon">💪</div>
            <h3>Strength Training</h3>
            <p>Build power, endurance, and confidence with guided strength programs.</p>
          </Link>

          <Link to="/services" className="offer-card">
            <div className="offer-icon">🔥</div>
            <h3>Bootcamps</h3>
            <p>High-intensity group workouts designed to push limits and burn fat.</p>
          </Link>

          <Link to="/services" className="offer-card">
            <div className="offer-icon">🌿</div>
            <h3>Outdoor Excursions</h3>
            <p>Train beyond the gym with hikes, runs, and outdoor fitness challenges.</p>
          </Link>
        </div>
      </section>

      <section className="featured">
        <h2 className="featured-title">Featured In</h2>
        <div className="featured-grid">
          <a 
            href="https://www.jamaicaobserver.com/2020/07/04/iron-man/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="featured-card"
          >
            <img 
              src="https://www.jamaicaobserver.com/jamaicaobserver/news/wp-content/uploads/sites/4/2020/07/863f62386d5e313e25b5387dd0a23fcc.jpg.webp"
              alt="The Gleaner Logo" 
            />
            <div className="article-info">
              <h3>IRON MAN</h3>
              <p>"Desire, burning desire' pushes 89-year-old weightlifting pioneer to keep going..."</p>
            </div>
            <span>— The Gleaner</span>
          </a>
          <a 
            href="https://jamaica-gleaner.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="featured-card"
          >
            <img src="/images/gleaner-logo.png" alt="The Gleaner Logo" />
            <div className="article-info">
              <h3>Title of the Article</h3>
              <p>A short snippet or summary of the article goes here...</p>
            </div>
            <span>— The Gleaner</span>
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section brand">
            <h3>B.A.D People Fitness</h3>
            <p className="motivation">ANY WORKOUT IS BETTER THAN NO WORKOUT.</p>
            <button className="motivate-btn">🔥 Get Motivation</button>
          </div>

          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>📍 107 Hughenden Ave, Kingston, Jamaica</p>
            <p>📞 (876) 459-8128</p>
            <p>📧 info@badpeoplefitness.com</p>
          </div>

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
                <i style={{fontSize: '21px'}} className="fa">&#xf095;</i>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Leave a Message</h4>
            <form className="footer-form">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Email" required />
              <textarea placeholder="Your Message"></textarea>
              <button type="submit">Send 💥</button>
            </form>
          </div>
        </div>

        <div className="gym-bar">
          <span></span><span></span><span></span><span></span>
        </div>

        <div className="footer-bottom">
          <p>© 2026 B.A.D People Fitness. All rights reserved.</p>
          <button className="top-btn">⬆ Back to Top</button>
        </div>
      </footer>
    </>
  )
}

export default Home
