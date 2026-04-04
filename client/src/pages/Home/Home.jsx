import { useState, useEffect, useRef } from "react";
import "./Home.css";

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const Logo = () => (
  <div className="nav-logo">
    <div className="nav-logo-hex">
      <div className="nav-logo-hex-bg" />
      <div className="nav-logo-hex-inner" />
      <span className="nav-logo-letter">G</span>
    </div>
    <span className="nav-logo-name">GymPro</span>
  </div>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

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

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─────────────────────────────────────────
   NAV DATA
───────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: "Services", children: [
      { label: "Membership", desc: "Build raw power and functional fitness" },
      { label: "HIIT & Cardio",           desc: "High-intensity fat-burning workouts" },
      { label: "Yoga & Flexibility",       desc: "Restore balance and mobility" },
      { label: "Boxing & Combat",          desc: "Train like a fighter, perform like a champion" },
      { label: "Personal Training",        desc: "1-on-1 sessions with elite coaches" },
    ],
  },
  {
    label: "Membership", children: [
      { label: "Starter Plan",   desc: "Access to all main floor equipment" },
      { label: "Pro Plan",       desc: "Unlimited classes + guest passes" },
      { label: "Elite Plan",     desc: "Full access + personal trainer sessions" },
      { label: "Corporate",      desc: "Discounted group memberships for teams" },
    ],
  },
  {
    label: "About Us", href: "/about" ,children: [
      { label: "Our Story",    desc: "15 years of forging champions" },
      { label: "Our Trainers", desc: "Meet the world-class coaching team" },
      { label: "Locations",    desc: "200+ gyms worldwide" },
      { label: "Press",        desc: "News, features and media coverage" },
    ],
  },
  { label: "Consultation", href: "/consultation" },
 { label: "Account", href: "/Account" }
];

/* ─────────────────────────────────────────
   PROGRAMS DATA
───────────────────────────────────────── */
const PROGRAMS = [
  {
    title: "Strength & Power",
    tag: "Foundation",
    img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80&fit=crop",
    desc: "Progressive overload programs designed by elite powerlifters. Build a physique that performs.",
  },
  {
    title: "HIIT & Burn",
    tag: "Fat Loss",
    img: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&q=80&fit=crop",
    desc: "Torch calories and shred body fat with our science-backed high-intensity interval protocols.",
  },
  {
    title: "Combat Training",
    tag: "Fight Ready",
    img: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&q=80&fit=crop",
    desc: "Boxing, Muay Thai and MMA conditioning classes. Develop discipline, power and agility.",
  },
  {
    title: "Mind & Body",
    tag: "Recovery",
    img: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80&fit=crop",
    desc: "Yoga, mobility and breathwork sessions to restore, recover and perform at your peak.",
  },
];

/* ─────────────────────────────────────────
   TRAINERS DATA
───────────────────────────────────────── */
const TRAINERS = [
  {
    name: "Marcus Reid",
    role: "Head of Strength",
    certs: "NSCA-CSCS · Olympic Lifting",
    img: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80&fit=crop",
  },
  {
    name: "Sasha Volkov",
    role: "Combat Coach",
    certs: "WBC Certified · Muay Thai",
    img: "https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=400&q=80&fit=crop",
  },
  {
    name: "Priya Nair",
    role: "Yoga & Mobility",
    certs: "RYT-500 · FRC Specialist",
    img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80&fit=crop",
  },
  {
    name: "Jordan Wells",
    role: "HIIT Specialist",
    certs: "ACSM-CPT · Precision Nutrition",
    img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80&fit=crop",
  },
];

/* ─────────────────────────────────────────
   MEMBERSHIP PLANS
───────────────────────────────────────── */
const PLANS = [
  {
    name: "Starter",
    price: "49",
    period: "/mo",
    highlight: false,
    perks: ["Full equipment access", "Locker room & showers", "2 group classes/week", "Mobile app access"],
  },
  {
    name: "Pro",
    price: "89",
    period: "/mo",
    highlight: true,
    perks: ["Everything in Starter", "Unlimited group classes", "2 guest passes/month", "Nutrition tracking", "Priority booking"],
  },
  {
    name: "Elite",
    price: "149",
    period: "/mo",
    highlight: false,
    perks: ["Everything in Pro", "4 PT sessions/month", "Body composition scans", "Recovery suite access", "Dedicated coach"],
  },
];

/* ─────────────────────────────────────────
   LIVE CHAT BOT RESPONSES
───────────────────────────────────────── */
const BOT_RESPONSES = {
  default: "Thanks for reaching out! A GymPro coach will be with you shortly. In the meantime, feel free to ask about membership, classes, or our locations.",
  membership: "We have 3 plans starting at $49/mo — Starter, Pro, and Elite. Each includes full equipment access. Would you like details on a specific plan?",
  class: "We offer Strength, HIIT, Boxing, Combat, Yoga and more — over 50 classes weekly! You can book through our app or ask our front desk team.",
  location: "GymPro has 100+ programmes. Our flagship is at 1 Champions Avenue, New York, NY. Want help finding your nearest gym?",
  Hours: "Opening Hours: Morning Session Monday – Saturday: 5:00 AM – 11:00 AM and Evening Session Monday – Thursday: 4:00 PM – 9:00 PM",
  price: "Memberships start at $49/month. We also offer corporate discounts and student rates. Want to book a free tour?",
  trainer: "Our trainers are world-class — certified by NSCA, ACSM, WBC and more. Personal training sessions can be booked starting from $60/session.",
  hello: "Hey there! 💪 Welcome to GymPro. How can I help you today? Ask me about memberships, classes, trainers, or locations!",
};

function getBotReply(msg) {
  const m = msg.toLowerCase();
  if (/hello|hi|hey|sup|yo/.test(m))                          return BOT_RESPONSES.hello;
  if (/member|plan|join|sign up|enroll/.test(m))              return BOT_RESPONSES.membership;
  if (/class|program|schedule|yoga|hiit|boxing|strength/.test(m)) return BOT_RESPONSES.class;
  if (/location|where|address|find|near/.test(m))             return BOT_RESPONSES.location;
  if (/hour|open|close|time|when/.test(m))                    return BOT_RESPONSES.hours;
  if (/price|cost|how much|fee|payment/.test(m))              return BOT_RESPONSES.price;
  if (/trainer|coach|pt|personal/.test(m))                    return BOT_RESPONSES.trainer;
  return BOT_RESPONSES.default;
}

/* ═══════════════════════════════════════════
   NAVBAR COMPONENT
═══════════════════════════════════════════ */
function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [activeMenu,  setActiveMenu]  = useState(null);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseEnter = (label) => {
    clearTimeout(closeTimer.current);
    setActiveMenu(label);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 180);
  };

  return (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar-inner">
        <Logo />

        {/* Desktop nav */}
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.label}
              className="nav-item"
              onMouseEnter={() => item.children && handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <a href={item.href} className={`nav-link${activeMenu === item.label ? " nav-link--active" : ""}`}>
                {item.label}
                {item.children && <ChevronDown />}
              </a>

              {item.children && activeMenu === item.label && (
                <div className="nav-dropdown" onMouseEnter={() => clearTimeout(closeTimer.current)} onMouseLeave={handleMouseLeave}>
                  <div className="nav-dropdown-inner">
                    {item.children.map((child) => (
                      <a key={child.label} href={child.href} className="nav-dropdown-item" onClick={e => e.preventDefault()}>
                        <span className="nav-dropdown-label">{child.label}</span>
                        <span className="nav-dropdown-desc">{child.desc}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <a href="/login" className="nav-btn-ghost">Sign In</a>
          <a href="/login" className="nav-btn-solid">Join Now</a>
        </div>

        {/* Hamburger */}
        <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
          <span className={mobileOpen ? "ham-open" : ""} />
          <span className={mobileOpen ? "ham-open" : ""} />
          <span className={mobileOpen ? "ham-open" : ""} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="nav-mobile">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="nav-mobile-item">
              <span className="nav-mobile-label">{item.label}</span>
              {item.children && (
                <div className="nav-mobile-children">
                  {item.children.map((c) => (
                    <a key={c.label} href="#" className="nav-mobile-child" onClick={e => e.preventDefault()}>{c.label}</a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="nav-mobile-actions">
            <a href="/login" className="nav-btn-ghost">Sign In</a>
            <a href="/login" className="nav-btn-solid">Join Now</a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════
   LIVE CHAT COMPONENT
═══════════════════════════════════════════ */
function LiveChat() {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState("");
  const [typing,  setTyping]  = useState(false);
  const [msgs,    setMsgs]    = useState([
    { from: "bot", text: "👋 Hi! I'm the GymPro assistant. Ask me anything about memberships, classes, or locations.", time: "Now" },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const sendMsg = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMsgs(m => [...m, { from: "user", text, time: now }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { from: "bot", text: getBotReply(text), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1200 + Math.random() * 600);
  };

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } };

  return (
    <>
      {/* Floating trigger */}
      <button className={`chat-fab${open ? " chat-fab--open" : ""}`} onClick={() => setOpen(o => !o)} aria-label="Live chat">
        {open ? <CloseIcon /> : <ChatIcon />}
        {!open && <span className="chat-fab-badge">1</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-avatar">
              <span>GV</span>
              <span className="chat-online-dot" />
            </div>
            <div className="chat-header-info">
              <p className="chat-header-name">GymPro Support</p>
              <p className="chat-header-status">● Online — reply in seconds</p>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)}><CloseIcon /></button>
          </div>

          <div className="chat-messages">
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg--${m.from}`}>
                {m.from === "bot" && <div className="chat-bot-avatar">GV</div>}
                <div className="chat-bubble-wrap">
                  <div className="chat-bubble">{m.text}</div>
                  <span className="chat-time">{m.time}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className="chat-msg chat-msg--bot">
                <div className="chat-bot-avatar">GV</div>
                <div className="chat-bubble-wrap">
                  <div className="chat-bubble chat-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-quick-replies">
            {["Membership plans", "Class schedule", "Find a gym"].map(q => (
              <button key={q} className="chat-quick-btn" onClick={() => { setInput(q); }}>
                {q}
              </button>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Type your message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chat-send-btn" onClick={sendMsg} disabled={!input.trim()}>
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   FOOTER COMPONENT
═══════════════════════════════════════════ */
function Footer() {
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
          <p className="footer-motive-text">
            ANY WORKOUT IS BETTER THAN NO WORKOUT
          </p>
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
            <a href="#" className="footer-social" aria-label="Facebook"  onClick={e => e.preventDefault()}><FacebookIcon /></a>
            <a href="#" className="footer-social" aria-label="Twitter"   onClick={e => e.preventDefault()}><TwitterIcon /></a>
            <a href="#" className="footer-social" aria-label="YouTube"   onClick={e => e.preventDefault()}><YoutubeIcon /></a>
          </div>
        </div>

        {/* Links column */}
        <div className="footer-col">
          <h5 className="footer-col-title">Programs</h5>
          <ul className="footer-links">
            {["Strength & Conditioning", "HIIT & Cardio", "Yoga & Flexibility", "Boxing & Combat", "Personal Training"].map(l => (
              <li key={l}><a href="#" onClick={e => e.preventDefault()}>{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h5 className="footer-col-title">Company</h5>
          <ul className="footer-links">
            {["About Us", "Our Trainers", "Careers", "Press & Media", "Partnerships", "Blog"].map(l => (
              <li key={l}><a href="#" onClick={e => e.preventDefault()}>{l}</a></li>
            ))}
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
              <span>+1 (876) 459-8128 </span>
            </li>
            <li>
              <MailIcon />
              <span>b.a.dpplfitness@gmail.com</span>
            </li>
          </ul>
          <div className="footer-hours">
            <p className="footer-hours-title"> Opening Hours</p>
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
          {["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"].map(l => (
            <a key={l} href="#" onClick={e => e.preventDefault()}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   MAIN HOME PAGE
═══════════════════════════════════════════ */
export default function HomePage() {
  const [statsCounted, setStatsCounted] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsCounted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-img" />
        <div className="hero-overlay" />
        <div className="hero-grid-lines" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-line" />
            <span>Est. 2010 · 100+ Programmes · 300+ Members</span>
          </div>
          <h1 className="hero-title">
            FORGE YOUR<br />
            <span className="hero-title-accent">LEGACY.</span>
          </h1>
          <p className="hero-subtitle">
            World-class training. Elite coaching. A global community.<br />
            Your strongest self starts at GymPro.
          </p>
          <div className="hero-actions">
            <a href="/login" className="hero-btn-primary">Join Now <ArrowRight /></a>
            <a href="#programs" className="hero-btn-ghost">Explore Programs</a>
          </div>
        </div>

        <div className="hero-scroll-hint">
          <div className="hero-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="stats-strip" ref={statsRef}>
        {[
          { val: "200+", label: "Locations Worldwide" },
          { val: "1M+",  label: "Active Members" },
          { val: "50+",  label: "Weekly Classes" },
          { val: "15",   label: "Years of Excellence" },
          { val: "98%",  label: "Member Satisfaction" },
        ].map((s, i) => (
          <div key={i} className={`stat-item${statsCounted ? " stat-item--visible" : ""}`} style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="stat-val">{s.val}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── PROGRAMS ── */}
      <section className="section programs-section" id="programs">
        <div className="section-header">
          <div className="section-eyebrow"><span className="section-eyebrow-line" />Our Programs</div>
          <h2 className="section-title">TRAIN WITH PURPOSE</h2>
          <p className="section-sub">Every program is engineered by elite coaches to deliver measurable results — whether you're starting out or competing at the top.</p>
        </div>

        <div className="programs-grid">
          {PROGRAMS.map((p, i) => (
            <div key={i} className="program-card">
              <div className="program-img-wrap">
                <div className="program-img" style={{ backgroundImage: `url(${p.img})` }} />
                <div className="program-img-overlay" />
                <span className="program-tag">{p.tag}</span>
              </div>
              <div className="program-body">
                <h3 className="program-title">{p.title}</h3>
                <p className="program-desc">{p.desc}</p>
                <a href="#" className="program-link" onClick={e => e.preventDefault()}>
                  Learn more <ArrowRight />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FULL-WIDTH CTA BANNER ── */}
      <section className="cta-banner">
        <div className="cta-banner-bg" />
        <div className="cta-banner-overlay" />
        <div className="cta-banner-content">
          <h2 className="cta-banner-title">READY TO START?</h2>
          <p className="cta-banner-sub">Join over 1 million members. First 7 days free — no commitment.</p>
          <a href="/login" className="hero-btn-primary">Claim Your Free Trial <ArrowRight /></a>
        </div>
      </section>

      {/* ── TRAINERS ── */}
      <section className="section trainers-section">
        <div className="section-header">
          <div className="section-eyebrow"><span className="section-eyebrow-line" />Our Team</div>
          <h2 className="section-title">WORLD-CLASS COACHES</h2>
          <p className="section-sub">Train under coaches who've shaped Olympians, professional athletes, and everyday champions.</p>
        </div>

        <div className="trainers-grid">
          {TRAINERS.map((t, i) => (
            <div key={i} className="trainer-card">
              <div className="trainer-img-wrap">
                <div className="trainer-img" style={{ backgroundImage: `url(${t.img})` }} />
                <div className="trainer-img-overlay" />
              </div>
              <div className="trainer-info">
                <h4 className="trainer-name">{t.name}</h4>
                <p className="trainer-role">{t.role}</p>
                <p className="trainer-certs">{t.certs}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MEMBERSHIP ── */}
      <section className="section membership-section" id="membership">
        <div className="section-header">
          <div className="section-eyebrow"><span className="section-eyebrow-line" />Pricing</div>
          <h2 className="section-title">CHOOSE YOUR PLAN</h2>
          <p className="section-sub">Simple, transparent pricing. No hidden fees. Cancel anytime.</p>
        </div>

        <div className="plans-grid">
          {PLANS.map((plan, i) => (
            <div key={i} className={`plan-card${plan.highlight ? " plan-card--featured" : ""}`}>
              {plan.highlight && <div className="plan-featured-badge">Most Popular</div>}
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="plan-currency">$</span>
                  <span className="plan-amount">{plan.price}</span>
                  <span className="plan-period">{plan.period}</span>
                </div>
              </div>
              <ul className="plan-perks">
                {plan.perks.map((perk, j) => (
                  <li key={j} className="plan-perk">
                    <span className="plan-check"><CheckIcon /></span>
                    {perk}
                  </li>
                ))}
              </ul>
              <a href="/login" className={`plan-btn${plan.highlight ? " plan-btn--featured" : ""}`}>
                Get Started <ArrowRight />
              </a>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <LiveChat />
    </div>
  );
}