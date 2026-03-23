import { useState, useEffect, useRef, useCallback } from "react";
import "./Admin.css";

// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
const TRAINERS_DATA = [
  { id: 1, name: "Marcus Steel",  title: "Senior Performance Trainer", img: "https://randomuser.me/api/portraits/men/32.jpg",  scores: { perf: 8.5, motiv: 9,   interact: 8   } },
  { id: 2, name: "Jordan Park",   title: "Senior Trainer",             img: "https://randomuser.me/api/portraits/men/45.jpg",  scores: { perf: 7,   motiv: 6.5, interact: 7   } },
  { id: 3, name: "Aisha Brown",   title: "Head Coach",                 img: "https://randomuser.me/api/portraits/women/44.jpg",scores: { perf: 9,   motiv: 9.5, interact: 9   } },
  { id: 4, name: "Leo Vasquez",   title: "Trainer",                    img: "https://randomuser.me/api/portraits/men/67.jpg",  scores: { perf: 5,   motiv: 5.5, interact: 6   } },
];

const REVIEWS_DATA = [
  { client: "Jennifer K.", trainer: "Marcus Steel", stars: 5, type: "public",  date: "Mar 2 2026",  text: "Marcus completely transformed my approach. Energy is unmatched!" },
  { client: "David R.",    trainer: "Marcus Steel", stars: 4, type: "private", date: "Mar 1 2026",  text: "Great trainer but sometimes sessions overrun by 15 minutes." },
  { client: "Alicia M.",   trainer: "Aisha Brown",  stars: 5, type: "public",  date: "Feb 28 2026", text: "Best coach I have ever had. Truly changed my life." },
  { client: "Tom H.",      trainer: "Jordan Park",  stars: 3, type: "private", date: "Feb 27 2026", text: "Needs to show more enthusiasm during sessions. Feels disengaged sometimes." },
  { client: "Priya N.",    trainer: "Aisha Brown",  stars: 5, type: "public",  date: "Feb 25 2026", text: "I lost 18 pounds in 2 months following Aisha's nutrition advice!" },
  { client: "Kevin M.",    trainer: "Marcus Steel", stars: 4, type: "public",  date: "Feb 20 2026", text: "Great technique coaching. My deadlift is at an all-time high." },
  { client: "Nina L.",     trainer: "Leo Vasquez",  stars: 2, type: "private", date: "Feb 18 2026", text: "Often late to sessions and doesn't seem prepared. Disappointed." },
  { client: "Chris P.",    trainer: "Jordan Park",  stars: 3, type: "public",  date: "Feb 15 2026", text: "Decent trainer, but not very responsive to messages between sessions." },
];

const INIT_PURCHASES = [
  { id: 1, date: "2026-03-01", client: "Jennifer K.", item: "Monthly Membership",    cat: "Membership", qty: 1,  price: 120, status: "Paid"    },
  { id: 2, date: "2026-03-02", client: "David R.",    item: "Personal Training x10", cat: "PT Package", qty: 10, price: 55,  status: "Paid"    },
  { id: 3, date: "2026-03-03", client: "Alicia M.",   item: "Protein Powder",         cat: "Supplement", qty: 2,  price: 45,  status: "Paid"    },
  { id: 4, date: "2026-03-04", client: "Tom H.",      item: "Monthly Membership",    cat: "Membership", qty: 1,  price: 120, status: "Pending" },
  { id: 5, date: "2026-03-04", client: "Kevin M.",    item: "Nutrition Plan (3mo)",   cat: "Nutrition",  qty: 1,  price: 180, status: "Paid"    },
  { id: 6, date: "2026-03-05", client: "Priya N.",    item: "Gym Gloves",             cat: "Equipment",  qty: 1,  price: 28,  status: "Pending" },
  { id: 7, date: "2026-03-05", client: "Leo M.",      item: "Monthly Membership",    cat: "Membership", qty: 1,  price: 120, status: "Paid"    },
];

const INIT_EQUIPMENT = [
  { id: 1,  name: "Treadmill #1",       cat: "Cardio",       rating: 5 },
  { id: 2,  name: "Treadmill #2",       cat: "Cardio",       rating: 2 },
  { id: 3,  name: "Rowing Machine",     cat: "Cardio",       rating: 4 },
  { id: 4,  name: "Bench Press Rack A", cat: "Strength",     rating: 5 },
  { id: 5,  name: "Bench Press Rack B", cat: "Strength",     rating: 3 },
  { id: 6,  name: "Cable Machine",      cat: "Machines",     rating: 2 },
  { id: 7,  name: "Dumbbells 5–50kg",   cat: "Free Weights", rating: 4 },
  { id: 8,  name: "Squat Rack",         cat: "Strength",     rating: 5 },
  { id: 9,  name: "Yoga Mats",          cat: "Flexibility",  rating: 3 },
  { id: 10, name: "Spin Bikes",         cat: "Cardio",       rating: 1 },
];

const CLIENTS_DATA = [
  { name: "Jennifer K.", status: "Active",   joined: "Jan 2025", trainer: "Marcus Steel", plan: "Premium",  last: "Mar 3 2026",  progress: 82 },
  { name: "David R.",    status: "Active",   joined: "Mar 2025", trainer: "Marcus Steel", plan: "Standard", last: "Mar 2 2026",  progress: 65 },
  { name: "Alicia M.",   status: "New",      joined: "Mar 2026", trainer: "Aisha Brown",  plan: "Premium",  last: "Mar 4 2026",  progress: 20 },
  { name: "Tom H.",      status: "Inactive", joined: "Jun 2024", trainer: "Jordan Park",  plan: "Standard", last: "Jan 10 2026", progress: 31 },
  { name: "Kevin M.",    status: "Active",   joined: "Sep 2024", trainer: "Marcus Steel", plan: "Premium",  last: "Mar 1 2026",  progress: 75 },
  { name: "Priya N.",    status: "Active",   joined: "Nov 2024", trainer: "Aisha Brown",  plan: "Standard", last: "Feb 28 2026", progress: 58 },
  { name: "Omar J.",     status: "Inactive", joined: "Feb 2024", trainer: "Leo Vasquez",  plan: "Basic",    last: "Dec 5 2025",  progress: 18 },
  { name: "Nina L.",     status: "New",      joined: "Mar 2026", trainer: "Leo Vasquez",  plan: "Basic",    last: "Mar 3 2026",  progress: 10 },
];

const INIT_EXCURSIONS = [
  { icon: "🏔️", title: "Mountain Hike Challenge", date: "Mar 22 2026", location: "Blue Mountains",    cap: 20, enrolled: 14, price: 45,  desc: "A full-day guided hike with nutrition breaks and team challenges." },
  { icon: "🏖️", title: "Beach Workout & Swim",    date: "Apr 5 2026",  location: "Sunset Bay",         cap: 30, enrolled: 22, price: 25,  desc: "Outdoor bootcamp on the beach followed by a group swim session." },
  { icon: "🚴", title: "Cycling Tour",             date: "Apr 19 2026", location: "National Park Trail",cap: 15, enrolled: 8,  price: 60,  desc: "30km scenic cycling route with rest stops. All levels welcome." },
];

const BIRTHDAYS_DATA = [
  { name: "Jennifer K.", bday: "Mar 4",  daysLeft: 0  },
  { name: "Kevin M.",    bday: "Mar 9",  daysLeft: 5  },
  { name: "Nina L.",     bday: "Mar 12", daysLeft: 8  },
  { name: "David R.",    bday: "Mar 18", daysLeft: 14 },
  { name: "Chris P.",    bday: "Mar 22", daysLeft: 18 },
  { name: "Alicia M.",   bday: "Mar 29", daysLeft: 25 },
];

const INIT_SCHEDULE = [
  { type: "Nutrition",     date: "Mar 4 2026", time: "09:00", dur: "60 min", client: "Jennifer K.", trainer: "Dr. Nadia Cole",  notes: "Post-competition meal plan review" },
  { type: "Consultation",  date: "Mar 4 2026", time: "10:30", dur: "45 min", client: "Tom H.",       trainer: "Marcus Steel",    notes: "Re-engagement session" },
  { type: "Training",      date: "Mar 4 2026", time: "12:00", dur: "60 min", client: "Kevin M.",     trainer: "Marcus Steel",    notes: "Strength assessment" },
  { type: "Nutrition",     date: "Mar 5 2026", time: "09:00", dur: "30 min", client: "Omar J.",      trainer: "Dr. Nadia Cole",  notes: "Initial diet consult" },
  { type: "Consultation",  date: "Mar 5 2026", time: "11:00", dur: "60 min", client: "Nina L.",      trainer: "Aisha Brown",     notes: "Goal setting — new member" },
  { type: "Training",      date: "Mar 6 2026", time: "07:00", dur: "90 min", client: "Priya N.",     trainer: "Aisha Brown",     notes: "HIIT + core session" },
];

const INIT_ORDERS = [
  { id: "ORD-1042", client: "David R.", phone: "876-555-1234", items: "Protein Powder x2, Shaker",        amount: 98,  date: "Mar 3 2026", note: "Call ahead — client works mornings" },
  { id: "ORD-1044", client: "Priya N.", phone: "876-555-5678", items: "Gym Gloves, Resistance Band Set",   amount: 56,  date: "Mar 4 2026", note: "Preferred pickup: after 5pm" },
  { id: "ORD-1046", client: "Omar J.",  phone: "876-555-9012", items: "Monthly Supplement Pack",           amount: 145, date: "Mar 4 2026", note: "" },
];

const INIT_ORDER_HISTORY = [
  { id: "ORD-1039", client: "Jennifer K.", items: "Gym Bag",                 amount: 75,  status: "Collected", date: "Feb 28 2026" },
  { id: "ORD-1040", client: "Alicia M.",   items: "Yoga Mat, Water Bottle",  amount: 48,  status: "Collected", date: "Mar 1 2026"  },
  { id: "ORD-1041", client: "Kevin M.",    items: "Creatine, Pre-workout",   amount: 110, status: "Collected", date: "Mar 2 2026"  },
];

const INIT_ASSESS_HISTORY = [
  { trainer: "Marcus Steel", perf: 8.5, motiv: 9,   interact: 8, avg: 8.5, standing: "EXCELLENT", date: "Feb 28 2026" },
  { trainer: "Jordan Park",  perf: 7,   motiv: 6.5, interact: 7, avg: 6.8, standing: "GOOD",      date: "Feb 25 2026" },
  { trainer: "Aisha Brown",  perf: 9,   motiv: 9.5, interact: 9, avg: 9.2, standing: "EXCELLENT", date: "Feb 20 2026" },
  { trainer: "Leo Vasquez",  perf: 5,   motiv: 5.5, interact: 6, avg: 5.5, standing: "WARNING",   date: "Feb 18 2026" },
];

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════
const calcAvg = (...vals) => (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);

const getStanding = (a) => {
  const n = parseFloat(a);
  if (n >= 8.5) return { cls: "badge-green",  label: "EXCELLENT" };
  if (n >= 7)   return { cls: "badge-white",   label: "GOOD"      };
  if (n >= 5)   return { cls: "badge-orange", label: "WARNING"   };
  return               { cls: "badge-red",    label: "CRITICAL"  };
};

const stars = (n, max = 5) => "★".repeat(n) + "☆".repeat(max - n);

const seTypeBadge = (t) =>
  t === "Nutrition" ? "badge-green" : t === "Consultation" ? "badge-white" : "badge-purple";

// ═══════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════
function Toast({ msg }) {
  return <div className="toast">✓ {msg}</div>;
}

function Modal({ id, open, onClose, title, children }) {
  return (
    <div className={`modal-overlay${open ? " open" : ""}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

function CardTitle({ children }) {
  return <div className="card-title">{children}</div>;
}

// ═══════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════
const NAV_ITEMS = [
  { section: "Overview" },
  { id: "dashboard",  icon: "🏠", label: "Dashboard" },
  { section: "Staff" },
  { id: "trainers",   icon: "👤", label: "Trainer Assessments" },
  { id: "reviews",    icon: "💬", label: "All Reviews", badge: 8 },
  { section: "Finance" },
  { id: "purchases",  icon: "💳", label: "Purchases & Sales" },
  { section: "Facility" },
  { id: "equipment",  icon: "🏋️", label: "Equipment Ratings" },
  { section: "Clients" },
  { id: "clients",    icon: "👥", label: "Client Overview" },
  { id: "excursions", icon: "🏖️", label: "Excursions" },
  { id: "birthdays",  icon: "🎂", label: "Birthdays" },
  { section: "Operations" },
  { id: "schedule",   icon: "📅", label: "Sessions Schedule" },
  { id: "orders",     icon: "📦", label: "Order Pickups", badge: 3 },
];

function Sidebar({ active, onNav }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">⚡ GYMPRO</div>
      {NAV_ITEMS.map((item, i) => {
        if (item.section) {
          return <div key={i} className="nav-section">{item.section}</div>;
        }
        return (
          <div
            key={item.id}
            className={`nav-item${active === item.id ? " active" : ""}`}
            onClick={() => onNav(item.id)}
          >
            <span className="icon">{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        );
      })}
    </nav>
  );
}

// ═══════════════════════════════════════════
// TOPBAR
// ═══════════════════════════════════════════
const PAGE_TITLES = {
  dashboard:  "DASHBOARD",
  trainers:   "TRAINER ASSESSMENTS",
  reviews:    "CLIENT REVIEWS",
  purchases:  "PURCHASES & SALES",
  equipment:  "EQUIPMENT RATINGS",
  clients:    "CLIENT OVERVIEW",
  excursions: "EXCURSIONS",
  birthdays:  "BIRTHDAYS",
  schedule:   "SESSIONS SCHEDULE",
  orders:     "ORDER PICKUPS",
};

function Topbar({ page }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(
        n.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
        "  " +
        n.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-title">{PAGE_TITLES[page] || page.toUpperCase()}</div>
      <div className="topbar-right">
        <div className="topbar-time">{time}</div>
        <div className="admin-tag">ADMIN ACCESS</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════
function Dashboard({ onNav, schedule, reviews }) {
  return (
    <div className="page-content">
      <div className="section-label">Command <span>Center</span></div>

      <div className="g4">
        {[
          { num: "47",      label: "New Clients",      sub: "↑ 12 this week",      up: true,  c: "c-orange", a: "accent-orange" },
          { num: "312",     label: "Active Clients",   sub: "↑ 5% vs last month",  up: true,  c: "c-white",  a: "accent-white"  },
          { num: "68",      label: "Inactive Clients", sub: "↑ 3 since last week", up: false, c: "c-red",    a: "accent-red"    },
          { num: "$48,320", label: "Revenue (MTD)",    sub: "↑ 8.4% vs Mar '25",   up: true,  c: "c-orange", a: "accent-orange" },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.a}`}>
            <div className={`stat-num ${s.c}`}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-sub ${s.up ? "stat-up" : "stat-down"}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="g3">
        <div className="card">
          <CardTitle>🚨 Pending Orders</CardTitle>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 38, color: "#ff6b00", fontWeight: 600 }}>3</div>
          <div style={{ fontSize: 12, color: "#6b6560", marginTop: 4 }}>Ready for pickup</div>
          <button className="btn btn-orange" style={{ marginTop: 12 }} onClick={() => onNav("orders")}>View Orders →</button>
        </div>
        <div className="card">
          <CardTitle>⭐ Equipment Alerts</CardTitle>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 38, color: "#e03030", fontWeight: 600 }}>4</div>
          <div style={{ fontSize: 12, color: "#6b6560", marginTop: 4 }}>Items rated below 4 — replace</div>
          <button className="btn btn-red" style={{ marginTop: 12 }} onClick={() => onNav("equipment")}>View Priority →</button>
        </div>
        <div className="card">
          <CardTitle>🎂 Birthdays This Month</CardTitle>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 38, color: "#ffb800", fontWeight: 600 }}>6</div>
          <div style={{ fontSize: 12, color: "#6b6560", marginTop: 4 }}>Clients celebrating in March</div>
          <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => onNav("birthdays")}>Send Wishes →</button>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <CardTitle>📅 Today's Sessions</CardTitle>
          {schedule.slice(0, 4).map((s, i) => (
            <div key={i} className="schedule-item">
              <div className="sched-time">{s.time}<br /><span style={{ fontSize: 10, color: "#4a4540" }}>{s.date.substring(0, 6)}</span></div>
              <div>
                <div className="sched-title">{s.client}</div>
                <div className="sched-meta">{s.trainer} <span className={`badge ${seTypeBadge(s.type)}`} style={{ marginLeft: 6 }}>{s.type}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <CardTitle>💬 Latest Reviews</CardTitle>
          {reviews.slice(0, 3).map((r, i) => (
            <div key={i} className="review-item">
              <div className="review-header">
                <span className="reviewer-name">{r.client}</span>
                <span className="rev-stars">{stars(r.stars)}</span>
              </div>
              <div className="review-text">{r.text.substring(0, 80)}…</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// TRAINERS PAGE
// ═══════════════════════════════════════════
const ASSESS_CATS = [
  { k: "perf",        l: "Performance & Results"  },
  { k: "motiv",       l: "Motivation & Energy"     },
  { k: "interact",    l: "Client Interaction"      },
  { k: "knowledge",   l: "Technical Knowledge"     },
  { k: "punctuality", l: "Punctuality"             },
];

function TrainersPage({ showToast }) {
  const [trainers, setTrainers]             = useState(TRAINERS_DATA);
  const [assessHistory, setAssessHistory]   = useState(INIT_ASSESS_HISTORY);
  const [modalOpen, setModalOpen]           = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState(null);
  const [assessScores, setAssessScores]     = useState({ perf: 8, motiv: 8, interact: 8, knowledge: 8, punctuality: 8 });

  const openAssess = (t) => {
    setCurrentTrainer(t);
    setAssessScores({ perf: t.scores.perf, motiv: t.scores.motiv, interact: t.scores.interact, knowledge: 8, punctuality: 8 });
    setModalOpen(true);
  };

  const avgScore = () => {
    const vals = ASSESS_CATS.map((c) => assessScores[c.k]);
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const submitAssess = () => {
    const a = avgScore();
    const s = getStanding(a);
    setTrainers((prev) =>
      prev.map((t) =>
        t.id === currentTrainer.id
          ? { ...t, scores: { perf: assessScores.perf, motiv: assessScores.motiv, interact: assessScores.interact } }
          : t
      )
    );
    setAssessHistory((prev) => [
      { trainer: currentTrainer.name, perf: assessScores.perf, motiv: assessScores.motiv, interact: assessScores.interact, avg: a, standing: s.label, date: new Date().toDateString() },
      ...prev,
    ]);
    setModalOpen(false);
    showToast(`Assessment for ${currentTrainer.name} saved — Avg: ${a}`);
  };

  const a = avgScore();
  const standing = getStanding(a);

  return (
    <div className="page-content">
      <div className="section-label">Trainer <span>Assessments</span></div>
      <div className="g12">
        {/* Left: Trainer Cards */}
        <div>
          <div className="card-title" style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "2.5px", color: "#ff6b00", textTransform: "uppercase", marginBottom: 14 }}>
            Click Trainer to Assess
          </div>
          {trainers.map((t) => {
            const avg = calcAvg(t.scores.perf, t.scores.motiv, t.scores.interact);
            const s = getStanding(avg);
            const scoreColor = parseFloat(avg) >= 7 ? "#00c96e" : parseFloat(avg) >= 5 ? "#ff6b00" : "#e03030";
            return (
              <div key={t.id} className="trainer-card" onClick={() => openAssess(t)}>
                <img src={t.img} alt={t.name} className="trainer-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="trainer-card-name">{t.name}</div>
                  <div className="trainer-card-sub">{t.title}</div>
                </div>
                <div>
                  <div className="trainer-score" style={{ color: scoreColor }}>{avg}</div>
                  <span className={`badge ${s.cls}`} style={{ marginTop: 4, display: "inline-flex" }}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Assessment History */}
        <div className="card">
          <CardTitle>📋 All Assessment History</CardTitle>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  {["Trainer", "Perf", "Motiv", "Interact", "Avg", "Standing", "Date"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assessHistory.map((a, i) => {
                  const s = getStanding(a.avg);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{a.trainer}</td>
                      <td>{a.perf}</td>
                      <td>{a.motiv}</td>
                      <td>{a.interact}</td>
                      <td style={{ fontWeight: 700, color: "#ff6b00", fontFamily: "'DM Mono',monospace" }}>{a.avg}</td>
                      <td><span className={`badge ${s.cls}`}>{a.standing}</span></td>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#6b6560" }}>{a.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={currentTrainer ? `Assess: ${currentTrainer.name}` : ""}>
        {ASSESS_CATS.map((cat) => {
          const val = assessScores[cat.k];
          const pct = ((val - 1) / 9) * 100;
          return (
            <div key={cat.k} className="assess-slider-wrap">
              <div className="assess-slider-header">
                <span className="assess-slider-label">{cat.l}</span>
                <span className="assess-slider-val">{val}</span>
              </div>
              <input
                type="range" min={1} max={10} step={0.5} value={val}
                style={{ background: `linear-gradient(to right,#ff6b00 ${pct}%,#2a2a2a ${pct}%)` }}
                onChange={(e) => setAssessScores((prev) => ({ ...prev, [cat.k]: parseFloat(e.target.value) }))}
              />
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,107,0,0.1)", paddingTop: 14, marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 9, color: "#4a4540", fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, marginBottom: 4 }}>AVERAGE SCORE</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 40, color: "#ff6b00", fontWeight: 900 }}>{a}</div>
          </div>
          <span className={`badge ${standing.cls}`}>{standing.label}</span>
        </div>
        <button className="btn btn-orange btn-full" style={{ marginTop: 14 }} onClick={submitAssess}>
          Submit Assessment
        </button>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════
// REVIEWS PAGE
// ═══════════════════════════════════════════
function ReviewsPage() {
  const [filter, setFilter]         = useState("all");
  const [trainerFilter, setTrainer] = useState("");

  let list = [...REVIEWS_DATA].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (filter !== "all")   list = list.filter((r) => r.type === filter);
  if (trainerFilter)      list = list.filter((r) => r.trainer === trainerFilter);

  return (
    <div className="page-content">
      <div className="section-label">Client <span>Reviews</span></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {[["all","All Reviews","btn-ghost"], ["public","🌍 Public","btn-green"], ["private","🔒 Private","btn-orange"]].map(([f, label, cls]) => (
          <button key={f} className={`btn ${filter === f ? "btn-orange" : cls}`} onClick={() => setFilter(f)}>{label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <select
          value={trainerFilter}
          onChange={(e) => setTrainer(e.target.value)}
          style={{ background: "#1a1a1a", border: "1px solid rgba(255,107,0,0.12)", color: "#f0ebe3", padding: "7px 12px", borderRadius: 7, fontFamily: "'DM Mono',monospace", fontSize: 11, outline: "none" }}
        >
          <option value="">All Trainers</option>
          {["Marcus Steel","Jordan Park","Aisha Brown","Leo Vasquez"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="card">
        {list.map((r, i) => (
          <div key={i} className={`review-item ${r.type === "private" ? "review-private" : "review-public"}`}>
            <div className="review-header">
              <div>
                <div className="reviewer-name">{r.client}</div>
                <div className="reviewer-meta">→ {r.trainer} · {r.date}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div className="rev-stars">{stars(r.stars)}</div>
                <span className={`badge ${r.type === "public" ? "badge-green" : "badge-orange"}`}>
                  {r.type === "public" ? "🌍 Public" : "🔒 Private"}
                </span>
              </div>
            </div>
            <div className="review-text">{r.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PURCHASES PAGE
// ═══════════════════════════════════════════
function PurchasesPage({ showToast }) {
  const [purchases, setPurchases] = useState(INIT_PURCHASES);

  const total   = purchases.reduce((s, p) => s + p.qty * p.price, 0);
  const pending = purchases.filter((p) => p.status === "Pending").reduce((s, p) => s + p.qty * p.price, 0);

  const updateField = (idx, key, val) => {
    setPurchases((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: (key === "qty" || key === "price") ? parseFloat(val) || next[idx][key] : val };
      return next;
    });
  };

  const deleteRow = (idx) => {
    setPurchases((prev) => prev.filter((_, i) => i !== idx));
    showToast("Row deleted");
  };

  const addRow = () => {
    setPurchases((prev) => [...prev, {
      id: Date.now(), date: new Date().toISOString().slice(0, 10),
      client: "New Client", item: "Item", cat: "Misc", qty: 1, price: 0, status: "Pending",
    }]);
    showToast("Row added — click cells to edit");
  };

  const exportCSV = () => {
    const rows = [
      ["Date","Client","Item","Category","Qty","Price","Total","Status"],
      ...purchases.map((p) => [p.date, p.client, p.item, p.cat, p.qty, `$${p.price}`, `$${(p.qty * p.price).toFixed(2)}`, p.status]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv," + encodeURIComponent(csv);
    a.download = "purchases.csv";
    a.click();
    showToast("CSV exported!");
  };

  return (
    <div className="page-content">
      <div className="section-label">Purchases <span>&amp; Sales</span></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "#6b6560" }}>Edit cells directly. Add rows with the button below.</div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-green" onClick={exportCSV}>⬇ Export CSV</button>
        <button className="btn btn-orange" onClick={addRow}>+ Add Row</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tbl-wrap" style={{ border: "none" }}>
          <table>
            <thead>
              <tr>{["#","Date","Client","Item / Service","Category","Qty","Unit Price ($)","Total ($)","Status",""].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {purchases.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#4a4540" }}>{p.id}</td>
                  {["date","client","item","cat"].map((k) => (
                    <td key={k}>
                      <span className="editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateField(i, k, e.target.textContent)}>{p[k]}</span>
                    </td>
                  ))}
                  <td>
                    <span className="editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateField(i, "qty", e.target.textContent)}>{p.qty}</span>
                  </td>
                  <td>
                    <span className="editable" contentEditable suppressContentEditableWarning onBlur={(e) => updateField(i, "price", e.target.textContent.replace("$",""))}>${p.price}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: "#00c96e", fontFamily: "'DM Mono',monospace" }}>${(p.qty * p.price).toFixed(2)}</td>
                  <td><span className={`badge ${p.status === "Paid" ? "badge-green" : "badge-orange"}`}>{p.status}</span></td>
                  <td><button className="btn btn-red" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => deleteRow(i)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="g3" style={{ marginTop: 16 }}>
        {[
          { title: "💰 Total Revenue",       val: `$${total.toFixed(2)}`,   c: "#00c96e" },
          { title: "📦 Total Transactions",  val: purchases.length,          c: "#f0ebe3" },
          { title: "⏳ Pending Payments",    val: `$${pending.toFixed(2)}`,  c: "#ff6b00" },
        ].map((s) => (
          <div key={s.title} className="card">
            <CardTitle>{s.title}</CardTitle>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, color: s.c }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// EQUIPMENT PAGE
// ═══════════════════════════════════════════
function EquipmentPage({ showToast }) {
  const [equipment, setEquipment]     = useState(INIT_EQUIPMENT);
  const [manualPriority, setManual]   = useState([{ name: "Resistance Bands (new set)", note: "Old ones snapping — safety hazard" }]);
  const [addEquipOpen, setAddEquip]   = useState(false);
  const [addPriorOpen, setAddPrior]   = useState(false);
  const [newEquip, setNewEquip]       = useState({ name: "", cat: "Cardio", rating: 3 });
  const [newPrior, setNewPrior]       = useState({ name: "", note: "" });

  const rateEquip = (id, rating) => {
    setEquipment((prev) => prev.map((e) => e.id === id ? { ...e, rating } : e));
    const e = equipment.find((x) => x.id === id);
    if (rating < 4) showToast(`${e.name} flagged for replacement`);
  };

  const addEquipItem = () => {
    if (!newEquip.name.trim()) return;
    setEquipment((prev) => [...prev, { id: Date.now(), ...newEquip, rating: parseInt(newEquip.rating) || 3 }]);
    setAddEquip(false);
    setNewEquip({ name: "", cat: "Cardio", rating: 3 });
    showToast("Equipment added");
  };

  const addPriorItem = () => {
    if (!newPrior.name.trim()) return;
    setManual((prev) => [...prev, { ...newPrior }]);
    setAddPrior(false);
    setNewPrior({ name: "", note: "" });
    showToast("Added to priority list");
  };

  const priorityEquip = equipment.filter((e) => e.rating < 4);
  const allPriority   = [...priorityEquip.map((e) => ({ name: e.name, note: `Rated ${e.rating}/5`, manual: false })), ...manualPriority.map((p) => ({ ...p, manual: true }))];

  return (
    <div className="page-content">
      <div className="section-label">Equipment <span>Ratings</span></div>
      <div className="g2">
        {/* Rating Panel */}
        <div className="card">
          <CardTitle>⭐ Rate Equipment (1–5 Stars)</CardTitle>
          {equipment.map((e) => (
            <div key={e.id} className="equip-row">
              <div style={{ flex: 1 }}>
                <div className="equip-name">{e.name}</div>
                <div className="equip-cat">{e.cat}</div>
              </div>
              <div className="equip-stars-row">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} className={`star-btn${e.rating >= s ? " lit" : ""}`} onClick={() => rateEquip(e.id, s)}>★</button>
                ))}
              </div>
              <div className="equip-score" style={{ margin: "0 8px" }}>{e.rating}</div>
              <div className="equip-status">
                <span className={`badge ${e.rating < 4 ? "badge-red" : "badge-green"}`}>{e.rating < 4 ? "REPLACE" : "OK"}</span>
              </div>
            </div>
          ))}
          <button className="add-row-btn" onClick={() => setAddEquip(true)}>+ Add Equipment Item</button>
        </div>

        {/* Priority Panel */}
        <div className="card" style={{ borderColor: "rgba(224,48,48,0.25)" }}>
          <CardTitle style={{ color: "#e03030" }}>🚨 Priority Replacement List</CardTitle>
          <p style={{ fontSize: 12, color: "#6b6560", marginBottom: 14 }}>Items rated below 4 stars automatically appear here.</p>
          {allPriority.length === 0 ? (
            <div style={{ color: "#6b6560", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No items flagged</div>
          ) : allPriority.map((p, i) => (
            <div key={i} className="priority-item">
              <span className="p-icon">{p.manual ? "📋" : "⚠️"}</span>
              <div style={{ flex: 1 }}>
                <div className="p-name">{p.name}</div>
                <div className="p-action">{p.note}</div>
              </div>
              {p.manual && (
                <button className="btn btn-red" style={{ fontSize: 10, padding: "3px 10px" }} onClick={() => setManual((prev) => prev.filter((_, j) => j !== (i - priorityEquip.length)))}>✕</button>
              )}
            </div>
          ))}
          <button className="add-row-btn" style={{ borderColor: "rgba(224,48,48,0.2)" }} onClick={() => setAddPrior(true)}>+ Add Manual Item</button>
        </div>
      </div>

      {/* Add Equipment Modal */}
      <Modal open={addEquipOpen} onClose={() => setAddEquip(false)} title="Add Equipment Item">
        <div className="form-row">
          <div className="form-group"><label>Equipment Name</label>
            <input placeholder="e.g. Treadmill #3" value={newEquip.name} onChange={(e) => setNewEquip((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group"><label>Category</label>
            <select value={newEquip.cat} onChange={(e) => setNewEquip((p) => ({ ...p, cat: e.target.value }))}>
              {["Cardio","Strength","Flexibility","Free Weights","Machines"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group"><label>Initial Rating (1–5)</label>
          <input type="number" min={1} max={5} value={newEquip.rating} onChange={(e) => setNewEquip((p) => ({ ...p, rating: e.target.value }))} />
        </div>
        <button className="btn btn-orange btn-full" onClick={addEquipItem}>Add to List</button>
      </Modal>

      {/* Add Priority Modal */}
      <Modal open={addPriorOpen} onClose={() => setAddPrior(false)} title="Add to Priority List">
        <div className="form-group"><label>Item Name</label>
          <input placeholder="e.g. Yoga Mats (10x)" value={newPrior.name} onChange={(e) => setNewPrior((p) => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="form-group"><label>Reason / Notes</label>
          <textarea placeholder="Why is this needed?" value={newPrior.note} onChange={(e) => setNewPrior((p) => ({ ...p, note: e.target.value }))} />
        </div>
        <button className="btn btn-red btn-full" onClick={addPriorItem}>Add to Priority</button>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════
// CLIENTS PAGE
// ═══════════════════════════════════════════
function ClientsPage() {
  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("");

  const list = CLIENTS_DATA.filter((c) => {
    const matchQ = c.name.toLowerCase().includes(search.toLowerCase());
    const matchS = !statusF || c.status === statusF;
    return matchQ && matchS;
  });

  const progressColor = (p) => p > 60 ? "#00c96e" : p > 30 ? "#ff6b00" : "#e03030";

  return (
    <div className="page-content">
      <div className="section-label">Client <span>Overview</span></div>
      <div className="g4" style={{ marginBottom: 20 }}>
        {[
          { num: "47",  label: "New (This Month)", c: "c-orange", a: "accent-orange" },
          { num: "312", label: "Active",            c: "c-white",  a: "accent-white"  },
          { num: "68",  label: "Inactive",          c: "c-red",    a: "accent-red"    },
          { num: "427", label: "Total Enrolled",    c: "c-orange", a: "accent-orange" },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.a}`}>
            <div className={`stat-num ${s.c}`}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <CardTitle>All Clients</CardTitle>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            placeholder="🔍 Search client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "#1a1a1a", border: "1px solid rgba(255,107,0,0.12)", color: "#f0ebe3", padding: "8px 14px", borderRadius: 7, fontFamily: "'Outfit',sans-serif", fontSize: 13, outline: "none", width: 220 }}
          />
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            style={{ background: "#1a1a1a", border: "1px solid rgba(255,107,0,0.12)", color: "#f0ebe3", padding: "8px 12px", borderRadius: 7, fontFamily: "'DM Mono',monospace", fontSize: 11, outline: "none" }}
          >
            <option value="">All Status</option>
            {["Active","Inactive","New"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>{["Name","Status","Joined","Trainer","Plan","Last Visit","Goal Progress"].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><span className={`badge ${c.status === "Active" ? "badge-green" : c.status === "New" ? "badge-orange" : "badge-red"}`}>{c.status}</span></td>
                  <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#6b6560" }}>{c.joined}</td>
                  <td>{c.trainer}</td>
                  <td><span className="badge badge-purple">{c.plan}</span></td>
                  <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#6b6560" }}>{c.last}</td>
                  <td>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${c.progress}%`, background: progressColor(c.progress) }} />
                    </div>
                    <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#6b6560", marginLeft: 6 }}>{c.progress}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// EXCURSIONS PAGE
// ═══════════════════════════════════════════
function ExcursionsPage({ showToast }) {
  const [excursions, setExcursions] = useState(INIT_EXCURSIONS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [form, setForm] = useState({ icon: "🏔️", title: "", date: "", location: "", cap: 20, enrolled: 0, price: 0, desc: "" });

  const addExcursion = () => {
    if (!form.title.trim()) return;
    setExcursions((prev) => [{ ...form, cap: parseInt(form.cap) || 20, enrolled: 0, price: parseFloat(form.price) || 0 }, ...prev]);
    setModalOpen(false);
    setForm({ icon: "🏔️", title: "", date: "", location: "", cap: 20, enrolled: 0, price: 0, desc: "" });
    showToast("Excursion published!");
  };

  return (
    <div className="page-content">
      <div className="section-label">Gym <span>Excursions</span></div>
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-orange" onClick={() => setModalOpen(true)}>+ Add Excursion</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {excursions.map((e, i) => (
          <div key={i} className="excursion-card">
            <div className="exc-img">{e.icon}</div>
            <div className="exc-body">
              <div className="exc-title">{e.title}</div>
              <div className="exc-meta">📅 {e.date} · 📍 {e.location}</div>
              <div className="exc-desc">{e.desc}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="badge badge-white">{e.enrolled}/{e.cap} enrolled</span>
                <span className="badge badge-gold">${e.price}</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-ghost" style={{ fontSize: 10, padding: "5px 10px" }} onClick={() => { setExcursions((prev) => prev.filter((_, j) => j !== i)); showToast("Excursion removed"); }}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Excursion">
        <div className="form-row">
          <div className="form-group"><label>Title</label><input placeholder="Hike & Trail Day" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
          <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Location</label><input placeholder="Blue Mountains" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} /></div>
          <div className="form-group"><label>Max Capacity</label><input type="number" value={form.cap} onChange={(e) => setForm((p) => ({ ...p, cap: e.target.value }))} /></div>
        </div>
        <div className="form-group"><label>Description</label><textarea placeholder="What's included…" value={form.desc} onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))} /></div>
        <div className="form-row">
          <div className="form-group"><label>Price ($)</label><input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} /></div>
          <div className="form-group"><label>Icon / Emoji</label><input value={form.icon} maxLength={4} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} /></div>
        </div>
        <button className="btn btn-orange btn-full" style={{ marginTop: 6 }} onClick={addExcursion}>Publish Excursion</button>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════
// BIRTHDAYS PAGE
// ═══════════════════════════════════════════
function BirthdaysPage({ showToast }) {
  const [selectedClient, setSelectedClient] = useState(BIRTHDAYS_DATA[0].name);
  const [msg, setMsg] = useState("Happy Birthday! 🎉 We're so glad you're part of the GymPro family. Enjoy a complimentary session on us this month!");
  const [sent, setSent] = useState(false);

  const sendMsg = () => {
    setSent(true);
    showToast(`Birthday message sent to ${selectedClient}!`);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="page-content">
      <div className="section-label">March <span>Birthdays 🎂</span></div>
      <div className="g2">
        <div className="card">
          <CardTitle>🎉 Celebrating This Month</CardTitle>
          {BIRTHDAYS_DATA.map((b, i) => (
            <div key={i} className="bday-item">
              <div className="bday-avatar">{b.name.split(" ").map((x) => x[0]).join("")}</div>
              <div style={{ flex: 1 }}>
                <div className="bday-name">{b.name}</div>
                <div className="bday-date">
                  🎂 {b.bday} ·{" "}
                  {b.daysLeft === 0 ? <span style={{ color: "#ffb800" }}>TODAY!</span> : `${b.daysLeft} days away`}
                </div>
              </div>
              <div style={{ fontSize: 20 }}>{b.daysLeft === 0 ? "🎉" : "🎁"}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <CardTitle>📨 Send Birthday Message</CardTitle>
          <div className="form-group">
            <label>Select Client</label>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
              {BIRTHDAYS_DATA.map((b) => <option key={b.name} value={b.name}>{b.name} ({b.bday})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} style={{ minHeight: 110 }} />
          </div>
          <button className="btn btn-orange" onClick={sendMsg}>🎁 Send Wishes</button>
          {sent && <div style={{ marginTop: 10, fontSize: 12, color: "#00c96e", fontFamily: "'DM Mono',monospace" }}>✓ Birthday message sent!</div>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SCHEDULE PAGE
// ═══════════════════════════════════════════
function SchedulePage({ showToast }) {
  const [sessions, setSessions] = useState(INIT_SCHEDULE);
  const [filter, setFilter]     = useState("all");
  const [modalOpen, setModal]   = useState(false);
  const [form, setForm] = useState({ type: "Nutrition", date: "", time: "09:00", dur: "60 min", client: "", trainer: "", notes: "" });

  const list = filter === "all" ? sessions : sessions.filter((s) => s.type === filter);

  const addSession = () => {
    if (!form.client.trim()) return;
    setSessions((prev) => [form, ...prev]);
    setModal(false);
    setForm({ type: "Nutrition", date: "", time: "09:00", dur: "60 min", client: "", trainer: "", notes: "" });
    showToast("Session scheduled!");
  };

  return (
    <div className="page-content">
      <div className="section-label">Sessions <span>Schedule</span></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button className="btn btn-orange" onClick={() => setModal(true)}>+ Add Session</button>
        {["all","Nutrition","Consultation","Training"].map((f) => (
          <button key={f} className={`btn ${filter === f ? "btn-orange" : "btn-ghost"}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "Nutrition" ? "🥗 Nutrition" : f === "Consultation" ? "💬 Consultation" : "🏋️ Training"}
          </button>
        ))}
      </div>

      <div className="card">
        {list.map((s, i) => (
          <div key={i} className="schedule-item">
            <div className="sched-time">{s.time}<br /><span style={{ fontSize: 10, color: "#4a4540" }}>{s.date}</span></div>
            <div style={{ flex: 1 }}>
              <div className="sched-title">
                {s.client}
                <span className={`badge ${seTypeBadge(s.type)}`} style={{ marginLeft: 8 }}>{s.type}</span>
              </div>
              <div className="sched-meta">👤 {s.trainer} · ⏱ {s.dur}</div>
              {s.notes && <div style={{ fontSize: 11, color: "#6b6560", marginTop: 3 }}>📝 {s.notes}</div>}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModal(false)} title="Add Session">
        <div className="form-row">
          <div className="form-group"><label>Session Type</label>
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              {["Nutrition","Consultation","Training","Group Class"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Time</label><input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} /></div>
          <div className="form-group"><label>Duration</label>
            <select value={form.dur} onChange={(e) => setForm((p) => ({ ...p, dur: e.target.value }))}>
              {["30 min","45 min","60 min","90 min"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Client Name</label><input placeholder="Client name" value={form.client} onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))} /></div>
          <div className="form-group"><label>Trainer / Nutritionist</label><input placeholder="Staff name" value={form.trainer} onChange={(e) => setForm((p) => ({ ...p, trainer: e.target.value }))} /></div>
        </div>
        <div className="form-group"><label>Notes</label><textarea placeholder="Optional notes…" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
        <button className="btn btn-orange btn-full" onClick={addSession}>Schedule Session</button>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════
// ORDERS PAGE
// ═══════════════════════════════════════════
function OrdersPage({ showToast }) {
  const [pendingOrders, setPending] = useState(INIT_ORDERS);
  const [orderHistory, setHistory]  = useState([
    ...INIT_ORDER_HISTORY,
    ...INIT_ORDERS.map((o) => ({ id: o.id, client: o.client, items: o.items, amount: o.amount, status: "Pending", date: o.date })),
  ]);

  const markCollected = (i) => {
    const o = pendingOrders[i];
    setHistory((prev) => prev.map((h) => h.id === o.id ? { ...h, status: "Collected" } : h));
    setPending((prev) => prev.filter((_, j) => j !== i));
    showToast(`Order ${o.id} marked as collected`);
  };

  return (
    <div className="page-content">
      <div className="section-label">Order <span>Pickups</span></div>
      <div className="g2">
        <div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "2.5px", color: "#ff6b00", textTransform: "uppercase", marginBottom: 14 }}>
            ⚠ Ready for Pickup
          </div>
          {pendingOrders.length === 0 ? (
            <div className="second-card" style={{ textAlign: "center", padding: 40, color: "#6b6560" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: 2 }}>ALL ORDERS CLEARED</div>
            </div>
          ) : pendingOrders.map((o, i) => (
            <div key={o.id} className="order-alert">
              <div className="order-icon">📦</div>
              <div className="order-info">
                <div className="order-title">{o.id} — {o.client}</div>
                <div className="order-detail">
                  📱 {o.phone}<br />
                  🛍 {o.items}<br />
                  💰 ${o.amount} · 📅 {o.date}<br />
                  {o.note && `📝 ${o.note}`}
                </div>
              </div>
              <div className="order-actions">
                <button className="btn btn-green" style={{ fontSize: 10, padding: "6px 10px" }} onClick={() => markCollected(i)}>✓ Collected</button>
                <button className="btn btn-ghost" style={{ fontSize: 10, padding: "6px 10px" }} onClick={() => showToast(`Pickup notification sent to ${o.client}`)}>📨 Notify</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <CardTitle>📋 Order History</CardTitle>
          <div className="tbl-wrap">
            <table>
              <thead><tr>{["Order #","Client","Items","Amount","Status","Date"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {orderHistory.map((o, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{o.id}</td>
                    <td>{o.client}</td>
                    <td style={{ fontSize: 12, color: "#6b6560" }}>{o.items}</td>
                    <td style={{ color: "#00c96e", fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>${o.amount}</td>
                    <td><span className={`badge ${o.status === "Collected" ? "badge-green" : "badge-orange"}`}>{o.status}</span></td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#6b6560" }}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════
export default function Admin() {
  const [page, setPage]     = useState("dashboard");
  const [toast, setToast]   = useState(null);
  const toastTimer          = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "dashboard":  return <Dashboard  onNav={setPage} schedule={INIT_SCHEDULE} reviews={REVIEWS_DATA} />;
      case "trainers":   return <TrainersPage  showToast={showToast} />;
      case "reviews":    return <ReviewsPage />;
      case "purchases":  return <PurchasesPage showToast={showToast} />;
      case "equipment":  return <EquipmentPage showToast={showToast} />;
      case "clients":    return <ClientsPage />;
      case "excursions": return <ExcursionsPage showToast={showToast} />;
      case "birthdays":  return <BirthdaysPage  showToast={showToast} />;
      case "schedule":   return <SchedulePage   showToast={showToast} />;
      case "orders":     return <OrdersPage     showToast={showToast} />;
      default:           return null;
    }
  };

  return (
    <>
      <Sidebar active={page} onNav={setPage} />
      <div className="main">
        <Topbar page={page} />
        {renderPage()}
      </div>
      {toast && <Toast msg={toast} />}
    </>
  );
}