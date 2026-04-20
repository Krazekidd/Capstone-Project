import { useState, useEffect, useRef } from "react";
import "./Home.css";

/* ─────────────────────────────────────────
   ICONS (only those still used in this file)
───────────────────────────────────────── */
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
   PROGRAMS DATA
───────────────────────────────────────── */
const PROGRAMS = [
  {
    title: "Strength & Power Training",
    tag: "Foundation",
    img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80&fit=crop",
    desc: "Structured strength programs focused on progressive overload to build muscle, increase power, and improve overall physical performance.",
  },
  {
    title: "HIT & Burn",
    tag: "Fat Loss",
    img: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&q=80&fit=crop",
    desc: "Torch calories and shred body fat with our science-backed high-intensity interval protocols.",
  },
  {
    title: "Boot Camp",
    tag: "Fight Ready",
    img: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&q=80&fit=crop",
    desc: "High-intensity boot camp sessions combining strength drills, cardio bursts, and endurance challenges. Push your limits, build resilience, and train like a team.",
  },
  {
    title: "AEROBICS :Mind & Body",
    tag: "Recovery",
    img: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80&fit=crop",
    desc: "High-energy aerobic sessions designed to improve cardiovascular health, boost endurance, and keep your body active and energized.",
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
    name: "GROUP TRAINING",
    price: "5000",
    period: "/mo",
    highlight: false,
    perks: ["Full equipment access", "2-4 individuals in group", "Up to 4 group classes/week"],
  },
  {
    name: "SINGLE TRAINING",
    price: "12,000",
    period: "/mo",
    highlight: true,
    perks: ["Personalized training plan", "Dedicated trainer", "Unlimited group classes and training sessions", "One-on-one sessions", "Nutrition tracking", "Priority booking"],
  },
  {
    name: "KIDS PROGRAMME",
    price: "3000",
    period: "/mo",
    highlight: false,
    perks: ["Personalized training plan", "Up to 4 weekly kid sessions", "Body composition scans", "Recovery suite access", "Dedicated coach"],
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
  hours: "Opening Hours: Morning Session Monday – Saturday: 5:00 AM – 11:00 AM and Evening Session Monday – Thursday: 4:00 PM – 9:00 PM",
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
      <button className={`chat-fab${open ? " chat-fab--open" : ""}`} onClick={() => setOpen(o => !o)} aria-label="Live chat">
        {open ? <CloseIcon /> : <ChatIcon />}
        {!open && <span className="chat-fab-badge">1</span>}
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-avatar"><span>GV</span><span className="chat-online-dot" /></div>
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
                <div className="chat-bubble-wrap"><div className="chat-bubble chat-typing"><span /><span /><span /></div></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-quick-replies">
            {["Membership plans", "Class schedule", "Find a gym"].map(q => (
              <button key={q} className="chat-quick-btn" onClick={() => setInput(q)}>{q}</button>
            ))}
          </div>

          <div className="chat-input-row">
            <input className="chat-input" placeholder="Type your message…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} />
            <button className="chat-send-btn" onClick={sendMsg} disabled={!input.trim()}><SendIcon /></button>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   MAIN HOME PAGE (no Navbar or Footer here)
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
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-img" />
        <div className="hero-overlay" />
        <div className="hero-grid-lines" />
        <div className="hero-content">
          <div className="hero-eyebrow"><span className="hero-eyebrow-line" /><span>Est. 1976 · 100+ Programmes · 300+ Members</span></div>
          <h1 className="hero-title">FORGE YOUR<br /><span className="hero-title-accent">LEGACY.</span></h1>
          <p className="hero-subtitle">World-class training. Elite coaching. A global community.<br />Your strongest self starts at B.A.D People Fitness.</p>
          <div className="hero-actions">
            <a href="/login" className="hero-btn-primary">Join Now <ArrowRight /></a>
            <a href="#programs" className="hero-btn-ghost">Explore Programs</a>
          </div>
        </div>
        <div className="hero-scroll-hint"><div className="hero-scroll-line" /><span>Scroll</span></div>
      </section>

      {/* STATS STRIP */}
      <section className="stats-strip" ref={statsRef}>
        {[
          { val: "100+", label: "Gym Programmes" },
          { val: "200+", label: "Active Members" },
          { val: "5+",   label: "Weekly Sessions" },
          { val: "55",   label: "Years of Excellence" },
          { val: "98%",  label: "Member Satisfaction" },
        ].map((s, i) => (
          <div key={i} className={`stat-item${statsCounted ? " stat-item--visible" : ""}`} style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="stat-val">{s.val}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* PROGRAMS */}
      <section className="section programs-section" id="programs">
        <div className="section-header"><div className="section-eyebrow"><span className="section-eyebrow-line" />Our Programs</div><h2 className="section-title">TRAIN WITH PURPOSE</h2><p className="section-sub">Every program is engineered by elite coaches to deliver measurable results — whether you're starting out or competing at the top.</p></div>
        <div className="programs-grid">
          {PROGRAMS.map((p, i) => (
            <div key={i} className="program-card">
              <div className="program-img-wrap"><div className="program-img" style={{ backgroundImage: `url(${p.img})` }} /><div className="program-img-overlay" /><span className="program-tag">{p.tag}</span></div>
              <div className="program-body"><h3 className="program-title">{p.title}</h3><p className="program-desc">{p.desc}</p><a href="#" className="program-link" onClick={e => e.preventDefault()}>Learn more <ArrowRight /></a></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-banner-bg" /><div className="cta-banner-overlay" />
        <div className="cta-banner-content"><h2 className="cta-banner-title">READY TO START?</h2><p className="cta-banner-sub">Join over 500+ members.</p><a href="/login" className="hero-btn-primary">Claim Your Fitness Journey <ArrowRight /></a></div>
      </section>

      {/* TRAINERS */}
      <section className="section trainers-section">
        <div className="section-header"><div className="section-eyebrow"><span className="section-eyebrow-line" />Our Team</div><h2 className="section-title">WORLD-CLASS COACHES</h2><p className="section-sub">Train under coaches who've shaped Olympians, professional athletes, and everyday champions.</p></div>
        <div className="trainers-grid">
          {TRAINERS.map((t, i) => (
            <div key={i} className="trainer-card">
              <div className="trainer-img-wrap"><div className="trainer-img" style={{ backgroundImage: `url(${t.img})` }} /><div className="trainer-img-overlay" /></div>
              <div className="trainer-info"><h4 className="trainer-name">{t.name}</h4><p className="trainer-role">{t.role}</p><p className="trainer-certs">{t.certs}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section className="section membership-section" id="membership">
        <div className="section-header"><div className="section-eyebrow"><span className="section-eyebrow-line" />Pricing</div><h2 className="section-title">CHOOSE YOUR PLAN</h2><p className="section-sub">Simple, transparent pricing. No hidden fees. Cancel anytime.</p></div>
        <div className="plans-grid">
          {PLANS.map((plan, i) => (
            <div key={i} className={`plan-card${plan.highlight ? " plan-card--featured" : ""}`}>
              {plan.highlight && <div className="plan-featured-badge">Most Popular</div>}
              <div className="plan-header"><h3 className="plan-name">{plan.name}</h3><div className="plan-price"><span className="plan-currency">$</span><span className="plan-amount">{plan.price}</span><span className="plan-period">{plan.period}</span></div></div>
              <ul className="plan-perks">{plan.perks.map((perk, j) => (<li key={j} className="plan-perk"><span className="plan-check"><CheckIcon /></span>{perk}</li>))}</ul>
              <a href="/login" className={`plan-btn${plan.highlight ? " plan-btn--featured" : ""}`}>Get Started <ArrowRight /></a>
            </div>
          ))}
        </div>
      </section>

      <LiveChat />
    </div>
  );
}