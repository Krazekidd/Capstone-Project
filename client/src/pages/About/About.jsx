import { useState, useEffect, useRef } from "react";
import "./About.css";

/* ═══════════════════════════════════════
   SHARED ICONS
═══════════════════════════════════════ */
const Logo = () => (
  <div className="nav-logo">
    <div className="nav-logo-hex">
      <div className="nav-logo-hex-bg" />
      <div className="nav-logo-hex-inner" />
      <span className="nav-logo-letter">G</span>
    </div>
    <span className="nav-logo-name">GYMVAULT</span>
  </div>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const WhatsappIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const MailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const TrophyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 9a6 6 0 0 0 12 0" />
    <line x1="12" y1="15" x2="12" y2="19" />
    <line x1="8" y1="19" x2="16" y2="19" />
    <path d="M18 2a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4" />
    <path d="M6 2a4 4 0 0 0-4 4v1a4 4 0 0 0 4 4" />
  </svg>
);

const UsersIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TargetIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ZapIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const HeartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const AwardIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

/* ═══════════════════════════════════════
   NAV DATA
═══════════════════════════════════════ */
const NAV_ITEMS = [
  {
    label: "Programs", children: [
      { label: "Strength & Conditioning", desc: "Build raw power and functional fitness" },
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
    label: "About", children: [
      { label: "Our Story",    desc: "15 years of forging champions" },
      { label: "Our Trainers", desc: "Meet the world-class coaching team" },
      { label: "Locations",    desc: "200+ gyms worldwide" },
      { label: "Press",        desc: "News, features and media coverage" },
    ],
  },
  { label: "Schedule", children: null },
  { label: "Contact",  children: null },
];

/* ═══════════════════════════════════════
   PAGE DATA
═══════════════════════════════════════ */
const MILESTONES = [
  { year: "1960", title: "A DREAM BEGINS", desc: " Leslie Roy 'Jack' Pedler begins weightlifting as a youth, driven by self-discipline and excellence." },
  { year: "1970", title: "Founded inGreenwich Town ", desc: "Jack transforms his Greenwich Town backyard into a training ground, earning national recognition." },
  { year: "1976", title: "Grand Opening of the Hughenden Avenue facility", desc: "Establishment of the Hughenden Avenue facility, an open-access gym supporting upcoming athletes." },
  { year: "2015", title: "Jamaica Weightlifing Partnership", desc: "Officially became one of only two training facilities in Jamaica for upcoming and Olympic weightlifting athletes." },
  { year: "2015-2020", title: "Investment", desc: "The Jamaica Weightlifting Federation and the International Weightlifting Federation (IWF) invested in specialized equipment to enhance athlete training, providing resources designed to foster development and success." },
  { year: "2020-2021", title: "ReBrand", desc: "Official rebrand to B.A.D People Fitness, modernizing identity while preserving legacy." },
  { year: "2021-2024", title: "Continuous Development", desc: "The facility continued to be developed and maintained to support athlete growth and excellence." },
  { year: "2025-Present", title: "The Next Chapter", desc: "GymVault AI Coach launches — a first-of-its-kind personalised coaching system powered by movement intelligence." },
];

const TRAINERS = [
  { name: "Kenneth 'Robin' Daley",    role: "Head of Facility & Operating Manager", certs: "NSCA-CSCS · Olympic Lifting Coach", exp: "18 yrs", img: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&q=80&fit=crop", athletes: "4 Olympians" },
  { name: "Sasha Volkov",   role: "Senior Trainer", certs: "WBC Certified · Muay Thai Level 3", exp: "14 yrs", img: "https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=500&q=80&fit=crop", athletes: "12 Pro Fighters" },
  { name: "Deandre",     role: "Senior Trainer",       certs: "RYT-500 · FRC Specialist · SFMA", exp: "11 yrs", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&q=80&fit=crop", athletes: "Pro Dance Teams" },
  { name: "Arturo Gordon",   role: "Trainer",    certs: "ACSM-CPT · Precision Nutrition L2",exp: "9 yrs",  img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&q=80&fit=crop", athletes: "3 NCAA Teams" },
  { name: "Keemo",  role: "Trainer",     certs: "IRONMAN Coach · USA Triathlon",   exp: "13 yrs", img: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&q=80&fit=crop", athletes: "6 IRONMAN Finishers" },
  { name: "Darius Okafor",  role: "Strength & Sports Performance",  certs: "NASM-CPT · FMS Level 2",         exp: "10 yrs", img: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=500&q=80&fit=crop", athletes: "NFL Draft Prospects" },
];

const ATHLETES = [
  { name: "Kwame Asante",    sport: "Olympic Weightlifting",   result: "2024 Paris Olympics — Bronze", img: "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=400&q=80&fit=crop" },
  { name: "Leila Moreau",    sport: "Pro MMA — UFC",           result: "UFC Flyweight Contender #4",   img: "https://images.unsplash.com/photo-1550259979-ed79b48d2a30?w=400&q=80&fit=crop" },
  { name: "Devon Clarke",    sport: "Sprint — 100m",           result: "Commonwealth Games Silver",    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80&fit=crop" },
   
];

const PROGRAMS = [
  { icon: "⚡", name: "VAULT ELITE",        tag: "Flagship",    desc: "Our signature 12-week total-body transformation program. Strength, cardio and nutrition — completely integrated." },
  { icon: "🥊", name: "COMBAT CONDITIONING", tag: "Fight Ready", desc: "Developed with professional fighters. Eight weeks of boxing, Muay Thai conditioning and explosive power training." },
  { icon: "🧘", name: "RESTORE & PERFORM",  tag: "Recovery",    desc: "Science-backed mobility, breathwork and soft-tissue protocols to keep you training at 100%, injury-free." },
  { icon: "🏋️", name: "POWERHOUSE 365",     tag: "Strength",    desc: "Progressive overload, periodisation and nutrition coaching for raw strength gains — coached by NSCA-certified staff." },
  { icon: "🔥", name: "SHRED PROTOCOL",     tag: "Fat Loss",    desc: "High-intensity interval training and metabolic conditioning. Maximum calorie burn, minimum time investment." },
  { icon: "🌍", name: "GLOBAL ATHLETE",     tag: "Elite",       desc: "Designed for competitive athletes. Sport-specific programming, video analysis and biometric performance tracking." },
];

const OBJECTIVES = [
  { icon: <TargetIcon />, title: "Measurable Results",     desc: "Every program is backed by performance data. We set baselines, track progress and iterate — no guesswork, ever." },
  { icon: <UsersIcon />,  title: "Inclusive Community",    desc: "GymVault is for everyone — first-timers, elite athletes, and every level in between. Our culture is welcoming by design." },
  { icon: <ZapIcon />,    title: "Elite Standards",         desc: "World-class equipment, expert coaches and premium facilities across every one of our 200+ global locations." },
  { icon: <HeartIcon />,  title: "Long-Term Wellbeing",    desc: "We don't chase shortcuts. We build sustainable habits, healthy movement patterns and lifelong fitness behaviours." },
  { icon: <GlobeIcon />,  title: "Global Accessibility",   desc: "One membership. Unlimited access to every GymVault location worldwide. Train in New York, London or Tokyo." },
  { icon: <AwardIcon />,  title: "Excellence in Coaching", desc: "Our trainers hold the highest international certifications. Continuing education is mandatory — not optional." },
];

const EXPERTISE = [
  { label: "Strength & Power",     pct: 95 },
  { label: "Sports Performance",   pct: 92 },
  { label: "Functional Fitness",   pct: 90 },
  { label: "Nutrition Coaching",   pct: 85 },
  { label: "Injury Rehabilitation",pct: 80 },
  { label: "Mental Conditioning",  pct: 78 },
];

/* ═══════════════════════════════════════
   HOOK — intersection observer
═══════════════════════════════════════ */
function useVisible(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ═══════════════════════════════════════
   NAVBAR (shared with site)
═══════════════════════════════════════ */
function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const enter = (label) => { clearTimeout(closeTimer.current); setActiveMenu(label); };
  const leave = ()       => { closeTimer.current = setTimeout(() => setActiveMenu(null), 180); };

  return (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar-inner">
        <Logo />
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.label} className="nav-item"
              onMouseEnter={() => item.children && enter(item.label)}
              onMouseLeave={leave}>
              <span className={`nav-link${activeMenu === item.label ? " nav-link--active" : ""}`}>
                {item.label}{item.children && <ChevronDown />}
              </span>
              {item.children && activeMenu === item.label && (
                <div className="nav-dropdown"
                  onMouseEnter={() => clearTimeout(closeTimer.current)}
                  onMouseLeave={leave}>
                  <div className="nav-dropdown-inner">
                    {item.children.map((c) => (
                      <a key={c.label} href="#" className="nav-dropdown-item" onClick={e => e.preventDefault()}>
                        <span className="nav-dropdown-label">{c.label}</span>
                        <span className="nav-dropdown-desc">{c.desc}</span>
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
        <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)}>
          <span className={mobileOpen ? "ham-open" : ""} />
          <span className={mobileOpen ? "ham-open" : ""} />
          <span className={mobileOpen ? "ham-open" : ""} />
        </button>
      </div>
      {mobileOpen && (
        <div className="nav-mobile">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="nav-mobile-item">
              <span className="nav-mobile-label">{item.label}</span>
              {item.children && (
                <div className="nav-mobile-children">
                  {item.children.map(c => (
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

/* ═══════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════ */
function Counter({ target, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, visible]    = useVisible(0.3);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const num  = parseInt(target.replace(/\D/g, ""), 10);
    const step = Math.ceil(num / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, num);
      setCount(current);
      if (current >= num) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target, duration]);

  const display = target.includes("+")  ? `${count}+`
                : target.includes("%")  ? `${count}%`
                : `${count}`;

  return <span ref={ref} className="counter-val">{display}{suffix}</span>;
}

/* ═══════════════════════════════════════
   EXPERTISE BAR
═══════════════════════════════════════ */
function ExpertiseBar({ label, pct, delay }) {
  const [ref, visible] = useVisible(0.2);
  return (
    <div ref={ref} className="exp-bar-item">
      <div className="exp-bar-header">
        <span className="exp-bar-label">{label}</span>
        <span className="exp-bar-pct">{pct}%</span>
      </div>
      <div className="exp-bar-track">
        <div
          className="exp-bar-fill"
          style={{
            width: visible ? `${pct}%` : "0%",
            transitionDelay: `${delay}s`,
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   CONTACT SECTION
═══════════════════════════════════════ */
function ContactSection() {
  const [form, setForm]     = useState({ name: "", email: "", phone: "", subject: "", msg: "" });
  const [sent, setSent]     = useState(false);
  const [errors, setErrors] = useState({});

  const fc = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                               e.name    = "Name required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email   = "Valid email required";
    if (!form.msg.trim())                                e.msg     = "Message required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = () => { if (validate()) setSent(true); };

  return (
    <section className="contact-section" id="contact">
      {/* Quick contact cards */}
      <div className="contact-cards">
        <a
          href="https://wa.me/18764598128"
          target="_blank" rel="noopener noreferrer"
          className="contact-card contact-card--whatsapp">
          <div className="contact-card-icon"><WhatsappIcon /></div>
          <div className="contact-card-body">
            <p className="contact-card-label">WhatsApp</p>
            <p className="contact-card-val">+1 (876) 459-8128</p>
            <p className="contact-card-hint">Chat with us now</p>
          </div>
        </a>
        <a
          href="tel:+18764598128"
          className="contact-card contact-card--phone">
          <div className="contact-card-icon"><PhoneIcon /></div>
          <div className="contact-card-body">
            <p className="contact-card-label">Phone</p>
            <p className="contact-card-val">+1 (876) 459-8128</p>
            <p className="contact-card-hint">Mon–Fri 7am–9pm EST</p>
          </div>
        </a>
        <a
          href="https://www.instagram.com/b.a.dpplfitness/"
          target="_blank" rel="noopener noreferrer"
          className="contact-card contact-card--instagram">
          <div className="contact-card-icon"><InstagramIcon /></div>
          <div className="contact-card-body">
            <p className="contact-card-label">Instagram</p>
            <p className="contact-card-val">@b.a.dpplfitness</p>
            <p className="contact-card-hint">Follow for daily inspiration</p>
          </div>
        </a>
        <a
          href="mailto:B.a.dpplfitness@gmail.com"
          className="contact-card contact-card--email">
          <div className="contact-card-icon"><MailIcon /></div>
          <div className="contact-card-body">
            <p className="contact-card-label">Email</p>
            <p className="contact-card-val">B.a.dpplfitness@gmail.com</p>
            <p className="contact-card-hint">Reply within 24 hours</p>
          </div>
        </a>
      </div>

      {/* Map + Form */}
      <div className="contact-grid">
        {/* Map */}
        <div className="map-wrap">
          <div className="map-header">
            <MapPinIcon />
            <div>
              <p className="map-title">GymPro Flagship — Jamaica</p>
              <p className="map-addr">107 Hughenden Avenue, Kingston 20 </p>
            </div>
          </div>
          <div className="map-frame-wrap">
            <iframe
              className="map-frame"
              title="GymPro: B.a.dpplfitness Location"
              src="https://www.google.com/maps?q=107+Hughenden+Avenue+Kingston+Jamaica&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="map-pin-overlay">
              <div className="map-pin-dot" />
              <div className="map-pin-label">GymPro JA</div>
            </div>
          </div>
          <div className="map-locations-strip">
            <p className="map-locations-title">Other Key Locations</p>
            <div className="map-locations-list">
              {["London, UK", "Dubai, UAE", "Toronto, CA", "Sydney, AU", "Tokyo, JP", "Paris, FR"].map(loc => (
                <span key={loc} className="map-location-tag">{loc}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="contact-form-wrap">
          <div className="section-eyebrow" style={{ marginBottom: "12px" }}>
            <span className="section-eyebrow-line" />Get In Touch
          </div>
          <h3 className="contact-form-title">SEND US A MESSAGE</h3>
          <p className="contact-form-sub">Have a question about membership, programmes or locations? We're here to help.</p>

          {!sent ? (
            <div className="contact-form">
              <div className="cf-row">
                <div className="cf-field">
                  <label>Full Name</label>
                  <input name="name" placeholder="John Doe" value={form.name} onChange={fc} />
                  {errors.name && <span className="cf-err">{errors.name}</span>}
                </div>
                <div className="cf-field">
                  <label>Email Address</label>
                  <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={fc} />
                  {errors.email && <span className="cf-err">{errors.email}</span>}
                </div>
              </div>
              <div className="cf-row">
                <div className="cf-field">
                  <label>Phone <span className="cf-opt">(optional)</span></label>
                  <input name="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={fc} />
                </div>
                <div className="cf-field">
                  <label>Subject</label>
                  <select name="subject" value={form.subject} onChange={fc}>
                    <option value="">Select a topic</option>
                    <option>Membership Enquiry</option>
                    <option>Programme Information</option>
                    <option>Personal Training</option>
                    <option>Corporate Partnership</option>
                    <option>Media & Press</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="cf-field">
                <label>Message</label>
                <textarea name="msg" rows={5} placeholder="Tell us how we can help…" value={form.msg} onChange={fc} />
                {errors.msg && <span className="cf-err">{errors.msg}</span>}
              </div>
              <button className="cf-submit" onClick={submit}>
                Send Message <ArrowRight />
              </button>
            </div>
          ) : (
            <div className="cf-success">
              <div className="cf-success-icon">✓</div>
              <h4>Message Sent!</h4>
              <p>Thank you — a member of our team will be in touch within 24 hours.</p>
              <button className="cf-again" onClick={() => { setSent(false); setForm({ name:"",email:"",phone:"",subject:"",msg:"" }); }}>
                Send another message
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   MAIN ABOUT PAGE
═══════════════════════════════════════ */
export default function AboutPage() {
  const [statsRef, statsVisible] = useVisible(0.2);
  const [expRef,   expVisible]   = useVisible(0.2);

  return (
    <div className="about-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-hero-bg" />
        <div className="about-hero-overlay" />
        <div className="about-hero-grid" />
        <div className="about-hero-content">
          <div className="section-eyebrow" style={{ justifyContent: "center", marginBottom: "20px" }}>
            <span className="section-eyebrow-line" />Est. 1976 · Jamaica<span className="section-eyebrow-line" />
          </div>
          <h1 className="about-hero-title">WE DON'T BUILD<br /><span className="about-hero-accent">GYMS.</span><br />WE BUILD CHAMPIONS.</h1>
          <p className="about-hero-sub"> Built on Legacy.  Driven by Discipline.  Powered by Community </p>
          <div className="about-hero-cta">
            <a href="#who-we-are" className="btn-primary">Our Story <ArrowRight /></a>
            <a href="#contact"    className="btn-ghost">Contact Us</a>
          </div>
        </div>
        <div className="about-hero-scroll">
          <div className="about-hero-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className="section who-section" id="who-we-are">
        <div className="who-grid">
          <div className="who-media">
            <div className="who-img-main" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&fit=crop)" }} />
            <div className="who-img-accent" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80&fit=crop)" }} />
            <div className="who-years-badge">
              <span className="who-years-num">50</span>
              <span className="who-years-label">Years of<br />Excellence</span>
            </div>
          </div>
          <div className="who-copy">
            <div className="section-eyebrow"><span className="section-eyebrow-line" />Who We Are</div>
            <h2 className="section-title" style={{ textAlign: "left", fontSize: "clamp(36px,4vw,56px)" }}>
              MORE THAN A GYM.<br />A COMMUNITY. <br />A MOVEMENT.
            </h2>
            <p className="who-text">
              B.A.D. People Fitness grew from a simple training space into a dedicated gym built for people who take their health, strength, and performance seriously. What began as a place for training has evolved into a facility where both athletes and everyday individuals can pursue a stronger and healthier lifestyle.
            </p>
            <p className="who-text">
              Today, the gym provides an environment designed for progress. With specialized equipment, open training spaces, and a culture built around discipline and consistency, members have the freedom to train at their own pace while pushing their limits.
            </p>
            <p className="who-text">
             Whether someone is stepping into the gym for the first time or preparing for high-level competition, B.A.D. People Fitness exists to support the journey toward better performance, improved health, and lasting results.
            </p>
            <div className="who-values">
              {["Results-Driven Culture", "Science-Backed Methods", "Elite Global Standards", "Community First Approach"].map(v => (
                <div key={v} className="who-value">
                  <span className="who-value-check"><CheckIcon /></span>
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS COUNTER ── */}
      <section className="stats-band" ref={statsRef}>
        {[
          { val: "100", label: "Gym Programmes",    suffix: "" },
          { val: "300", label: "Active Members",       suffix: "+" },
          { val: "55",      label: "Years of Excellence",  suffix: "" },
          { val: "8",      label: "Weekly Sessions",       suffix: "+" },
          { val: "98",      label: "Member Satisfaction",  suffix: "%" },
          { val: "5+",      label: "Yearly Excursions",            suffix: "+" },
        ].map((s, i) => (
          <div key={i} className={`stats-band-item${statsVisible ? " stats-band-item--on" : ""}`} style={{ animationDelay: `${i * 0.1}s` }}>
            {statsVisible
              ? <Counter target={s.val} suffix={s.suffix} />
              : <span className="counter-val">0</span>
            }
            <span className="stats-band-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── OBJECTIVES ── */}
      <section className="section objectives-section">
        <div className="section-header">
          <div className="section-eyebrow"><span className="section-eyebrow-line" />Our Mission</div>
          <h2 className="section-title">WHAT WE STAND FOR</h2>
          <p className="section-sub">Six core commitments that guide every decision we make — from equipment choices to coaching standards.</p>
        </div>
        <div className="objectives-grid">
          {OBJECTIVES.map((o, i) => (
            <div key={i} className="objective-card">
              <div className="objective-icon">{o.icon}</div>
              <h4 className="objective-title">{o.title}</h4>
              <p className="objective-desc">{o.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXPERTISE ── */}
      <section className="expertise-section">
        <div className="expertise-inner">
          <div className="expertise-copy">
            <div className="section-eyebrow"><span className="section-eyebrow-line" />Our Expertise</div>
            <h2 className="section-title" style={{ textAlign: "left", fontSize: "clamp(34px,4vw,52px)" }}>
              BUILT ON DEPTH,<br />NOT BREADTH.
            </h2>
            <p className="expertise-text">
              GymVault doesn't try to be everything to everyone. We have mastered a focused set of disciplines and we execute each one at the highest level. Our coaches go deeper, not wider.
            </p>
            <p className="expertise-text">
              Our strength lies in the intersection of sports science, elite coaching and cutting-edge programming. Every methodology is peer-reviewed, periodically updated and rigorously tested.
            </p>
            <div className="expertise-cert-row">
              {["NSCA", "ACSM", "WBC", "RYT-500", "NASM", "USA-T"].map(c => (
                <span key={c} className="expertise-cert">{c}</span>
              ))}
            </div>
          </div>
          <div className="expertise-bars" ref={expRef}>
            {EXPERTISE.map((e, i) => (
              <ExpertiseBar key={i} label={e.label} pct={e.pct} delay={i * 0.12} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE / MILESTONES ── */}
      <section className="section milestones-section">
        <div className="section-header">
          <div className="section-eyebrow"><span className="section-eyebrow-line" />Our Journey</div>
          <h2 className="section-title">PEDLAR LEGACY</h2>
          <p className="section-sub"> Leslie Roy "Jack" Pedler begins weightlifting as a youth, driven by self-discipline and excellence.</p>
        </div>
        <div className="timeline">
          {MILESTONES.map((m, i) => (
            <div key={i} className={`timeline-item${i % 2 === 0 ? " timeline-item--left" : " timeline-item--right"}`}>
              <div className="timeline-year">
                <span>{m.year}</span>
              </div>
              <div className="timeline-connector">
                <div className="timeline-dot" />
                <div className="timeline-line" />
              </div>
              <div className="timeline-card">
                <h4 className="timeline-title">{m.title}</h4>
                <p className="timeline-desc">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRAINERS ── */}
      <section className="section trainers-section">
        <div className="section-header">
          <div className="section-eyebrow"><span className="section-eyebrow-line" />The Coaching Team</div>
          <h2 className="section-title">EXPERT TRAINERS</h2>
          <p className="section-sub">Our trainers are the best in the business — internationally certified, results-obsessed, and genuinely passionate about your progress.</p>
        </div>
        <div className="trainers-grid">
          {TRAINERS.map((t, i) => (
            <div key={i} className="trainer-card">
              <div className="trainer-img-wrap">
                <div className="trainer-img" style={{ backgroundImage: `url(${t.img})` }} />
                <div className="trainer-img-overlay" />
                <div className="trainer-athletes-badge">
                  <StarIcon /> {t.athletes}
                </div>
              </div>
              <div className="trainer-body">
                <div className="trainer-exp-tag">{t.exp} exp</div>
                <h4 className="trainer-name">{t.name}</h4>
                <p className="trainer-role">{t.role}</p>
                <p className="trainer-certs">{t.certs}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ATHLETES TRAINED ── */}
      <section className="section athletes-section">
        <div className="section-header">
          <div className="section-eyebrow"><span className="section-eyebrow-line" />Elite Athletes</div>
          <h2 className="section-title">ATHLETES WE'VE TRAINED</h2>
          <p className="section-sub">From Olympic podiums to UFC octagon and beyond — GymVault has been the training ground for some of the world's most elite competitors.</p>
        </div>
        <div className="athletes-grid">
          {ATHLETES.map((a, i) => (
            <div key={i} className="athlete-card">
              <div className="athlete-img-wrap">
                <div className="athlete-img" style={{ backgroundImage: `url(${a.img})` }} />
                <div className="athlete-img-overlay" />
              </div>
              <div className="athlete-body">
                <div className="athlete-trophy"><TrophyIcon /></div>
                <h4 className="athlete-name">{a.name}</h4>
                <p className="athlete-sport">{a.sport}</p>
                <p className="athlete-result">{a.result}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ELITE PROGRAMS ── */}
      <section className="programs-band">
        <div className="programs-band-inner">
          <div className="section-header" style={{ marginBottom: "56px" }}>
            <div className="section-eyebrow"><span className="section-eyebrow-line" />Elite Programming</div>
            <h2 className="section-title">OUR SIGNATURE PROGRAMS</h2>
            <p className="section-sub">Every GymVault programme is built on evidence, engineered for results and delivered by the best coaches in the world.</p>
          </div>
          <div className="programs-grid">
            {PROGRAMS.map((p, i) => (
              <div key={i} className="program-card">
                <div className="program-card-top">
                  <span className="program-emoji">{p.icon}</span>
                  <span className="program-tag">{p.tag}</span>
                </div>
                <h4 className="program-name">{p.name}</h4>
                <p className="program-desc">{p.desc}</p>
                <a href="#" className="program-link" onClick={e => e.preventDefault()}>
                  Learn More <ArrowRight />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL BANNER ── */}
      <section className="quote-banner">
        <div className="quote-banner-bg" />
        <div className="quote-banner-overlay" />
        <div className="quote-banner-content">
          <div className="quote-marks">"</div>
          <blockquote className="quote-text">
           If it came back around I wouldn’t think of doing anything differently. I wouldn’t choose any other sport over the one I did for so many years,
          </blockquote>
          <div className="quote-author">
            <div className="quote-author-img" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=100&q=80&fit=crop)" }} />
            <div>
              <p className="quote-author-name">Leslie Roy 'Jack' Pedlar</p>
              <p className="quote-author-title">Founder, Former president of the local weightlifting body, Jamaican Olympic Weightlifter, Coach and an athlete</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <div className="contact-wrapper">
        <div className="section-header" style={{ paddingTop: "100px" }}>
          <div className="section-eyebrow"><span className="section-eyebrow-line" />Reach Us</div>
          <h2 className="section-title">GET IN TOUCH</h2>
          <p className="section-sub">Whether you're looking to join, partner or just say hello — we'd love to hear from you.</p>
        </div>
        <ContactSection />
      </div>

      {/* ── FOOTER ── */}
      <footer className="about-footer">
        <div className="about-footer-motive">
          <div className="about-footer-motive-inner">
            {["FORGE YOUR LEGACY", "✦", "200+ LOCATIONS", "✦", "1M+ MEMBERS", "✦", "WORLD-CLASS COACHING", "✦", "FORGE YOUR LEGACY", "✦", "200+ LOCATIONS", "✦", "1M+ MEMBERS", "✦", "WORLD-CLASS COACHING", "✦"].map((t, i) => (
              <span key={i} className={t === "✦" ? "footer-div" : "footer-motive-text"}>{t}</span>
            ))}
          </div>
        </div>
        <div className="about-footer-bottom">
          <div className="about-footer-logo">
            <div className="footer-logo-hex">
              <div className="footer-logo-hex-bg" />
              <div className="footer-logo-hex-inner" />
              <span className="footer-logo-letter">G</span>
            </div>
            <span className="footer-logo-name">GYMPRO</span>
          </div>
          <p className="footer-copy">© 2026 GymVault Global Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
              <a key={l} href="#" onClick={e => e.preventDefault()}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}