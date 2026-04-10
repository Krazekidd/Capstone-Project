// src/components/Footer.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────
   ICONS (same as in Home.jsx)
───────────────────────────────────────── */
const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);

export default function Footer() {
  const [msgSent, setMsgSent] = useState(false);
  const [footMsg, setFootMsg] = useState("");
  const [footEmail, setFootEmail] = useState("");

  const handleFootSend = () => {
    if (!footMsg.trim() || !footEmail.trim()) return;
    setMsgSent(true);
    setFootMsg(""); setFootEmail("");
  };

  return (
    <footer className="footer">
      {/* Motivational banner */}
      <div className="footer-motive">
        <div className="footer-motive-inner">
          <p className="footer-motive-text">ANY WORKOUT IS BETTER THAN NO WORKOUT</p>
          <span className="footer-motive-divider">✦</span>
          <p className="footer-motive-text">FORGE YOUR LEGACY TODAY</p>
          <span className="footer-motive-divider">✦</span>
          <p className="footer-motive-text">100+ COMPLETED PROGRAMMES </p>
          <span className="footer-motive-divider">✦</span>
          <p className="footer-motive-text">One more set. Finish your reps</p>
          <span className="footer-motive-divider">✦</span>
          {/* Duplicate for seamless loop */}
          <p className="footer-motive-text">ANY WORKOUT IS BETTER THAN NO WORKOUT</p>
          <span className="footer-motive-divider">✦</span>
          <p className="footer-motive-text">FORGE YOUR LEGACY TODAY</p>
          <span className="footer-motive-divider">✦</span>
          <p className="footer-motive-text">100+ COMPLETED PROGRAMMES</p>
          <span className="footer-motive-divider">✦</span>
          <p className="footer-motive-text">One more set. Finish your reps</p>
          <span className="footer-motive-divider">✦</span>
        </div>
      </div>

      {/* Gym info cards row */}
      <div className="footer-cards-row">
        <div className="footer-card">
          <div className="footer-card-icon">🏋️</div>
          <h4>World-Class Equipment</h4>
          <p>Over $2M invested in premium machines, free weights, and recovery tech at every location.</p>
        </div>
        <div className="footer-card">
          <div className="footer-card-icon">🥇</div>
          <h4>Award-Winning Coaches</h4>
          <p>Our trainers hold elite certifications from NSCA, ACSM, WBC and international bodies.</p>
        </div>
        <div className="footer-card">
          <div className="footer-card-icon">🌍</div>
          <h4>Global Community</h4>
          <p>1 million+ members across 30 countries. One membership, unlimited access worldwide.</p>
        </div>
        <div className="footer-card">
          <div className="footer-card-icon">📱</div>
          <h4>GymPro App</h4>
          <p>Book classes, track workouts, scan in at any location and connect with coaches — all in one app.</p>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="footer-main">
        {/* Brand column */}
        <div className="footer-col footer-col--brand">
          <div className="footer-logo">
            <div className="footer-logo-hex">
              <div className="footer-logo-hex-bg" />
              <div className="footer-logo-hex-inner" />
              <span className="footer-logo-letter">G</span>
            </div>
            <span className="footer-logo-name">GYMPRO</span>
          </div>
          <p className="footer-tagline">Forge Your Legacy.</p>
          <p className="footer-brand-desc">
            GymPro has been the training ground for champions, everyday athletes and anyone who refuses to settle — since 2010.
          </p>
          <div className="footer-socials">
            <a href="https://www.instagram.com/b.a.dpplfitness/" className="footer-social" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <InstagramIcon />
            </a>
            <a href="#" className="footer-social" aria-label="Facebook" onClick={e => e.preventDefault()}><FacebookIcon /></a>
            <a href="#" className="footer-social" aria-label="Twitter" onClick={e => e.preventDefault()}><TwitterIcon /></a>
            <a href="#" className="footer-social" aria-label="YouTube" onClick={e => e.preventDefault()}><YoutubeIcon /></a>
          </div>
        </div>

        {/* Links column */}
        <div className="footer-col">
          <h5 className="footer-col-title">Programs</h5>
          <ul className="footer-links">
            {["Strength & Conditioning", "HIIT & Cardio", "Yoga & Flexibility", "Boxing & Combat", "Personal Training"].map(l => (
              <li key={l}><Link to={`/services/${l.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h5 className="footer-col-title">Company</h5>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/trainers">Our Trainers</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/press">Press & Media</Link></li>
            <li><Link to="/partnerships">Partnerships</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        {/* Location column */}
        <div className="footer-col">
          <h5 className="footer-col-title">Flagship Location</h5>
          <ul className="footer-contact-list">
            <li>
              <MapPinIcon />
              <span>107 Hughenden Ave<br />Kingston 20<br />Jamaica</span>
            </li>
            <li>
              <PhoneIcon />
              <span>+1 (876) 459-8128</span>
            </li>
            <li>
              <MailIcon />
              <span>b.a.dpplfitness@gmail.com</span>
            </li>
          </ul>
          <div className="footer-hours">
            <p className="footer-hours-title">Opening Hours</p>
            <p>Morning Session: Monday – Saturday: 5:00 AM – 11:00 AM</p>
            <p>Evening Session: Monday – Thursday: 4:00 PM – 9:00 PM</p>
            <p className="footer-hours-elite">Elite members: ✔ Priority trainer support during all operating hours</p>
          </div>
        </div>

        {/* Message column */}
        <div className="footer-col">
          <h5 className="footer-col-title">Send Us a Message</h5>
          {!msgSent ? (
            <div className="footer-msg-form">
              <input
                className="footer-input"
                type="email"
                placeholder="Your email"
                value={footEmail}
                onChange={e => setFootEmail(e.target.value)}
              />
              <textarea
                className="footer-textarea"
                placeholder="How can we help?"
                rows={4}
                value={footMsg}
                onChange={e => setFootMsg(e.target.value)}
              />
              <button className="footer-send-btn" onClick={handleFootSend}>
                <SendIcon /> Send Message
              </button>
            </div>
          ) : (
            <div className="footer-msg-success">
              <div className="footer-msg-check"><CheckIcon /></div>
              <p>Message sent! We'll get back to you within 24 hours.</p>
              <button className="footer-msg-again" onClick={() => setMsgSent(false)}>Send another</button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p className="footer-copy">© 2026 GymPro Global Inc. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/cookies">Cookie Policy</Link>
          <Link to="/accessibility">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}