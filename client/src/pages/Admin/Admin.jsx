import { useState, useEffect, useRef, useCallback } from "react";
import "./Admin.css";
import { authAPI } from "../../api/api";

const handleLogout = () => {
  authAPI.logout();
  navigate('/');
};
// ═══════════════════════════════════════════════════════════
// INITIAL DATA
// ═══════════════════════════════════════════════════════════
const INITIAL_TRAINERS = [
  { id: 1, name: "Marcus Steel",  title: "Senior Performance Trainer", img: "https://randomuser.me/api/portraits/men/32.jpg",  scores: { perf: 8.5, motiv: 9,   interact: 8   }, spec: "Strength & Conditioning", age: 34, certs: ["NASM-CPT","ISSA","ACE"] },
  { id: 2, name: "Jordan Park",   title: "Senior Trainer",             img: "https://randomuser.me/api/portraits/men/45.jpg",  scores: { perf: 7,   motiv: 6.5, interact: 7   }, spec: "HIIT & Cardio",            age: 29, certs: ["ACE-CPT","TRX"] },
  { id: 3, name: "Aisha Brown",   title: "Head Coach",                 img: "https://randomuser.me/api/portraits/women/44.jpg",scores: { perf: 9,   motiv: 9.5, interact: 9   }, spec: "Nutrition & Wellness",     age: 37, certs: ["ISSA","Precision Nutrition"] },
  { id: 4, name: "Leo Vasquez",   title: "Trainer",                    img: "https://randomuser.me/api/portraits/men/67.jpg",  scores: { perf: 5,   motiv: 5.5, interact: 6   }, spec: "Flexibility & Yoga",       age: 26, certs: ["RYT-200"] },
];

const INITIAL_ASSESS_HISTORY = [
  { trainer: "Marcus Steel", perf: 8.5, motiv: 9,   interact: 8, knowledge: 9,   punct: 8,   avg: 8.5, standing: "Excellent", date: "Feb 28 2026" },
  { trainer: "Jordan Park",  perf: 7,   motiv: 6.5, interact: 7, knowledge: 7,   punct: 6.5, avg: 6.8, standing: "Good",      date: "Feb 25 2026" },
  { trainer: "Aisha Brown",  perf: 9,   motiv: 9.5, interact: 9, knowledge: 9.5, punct: 9,   avg: 9.2, standing: "Excellent", date: "Feb 20 2026" },
  { trainer: "Leo Vasquez",  perf: 5,   motiv: 5.5, interact: 6, knowledge: 5,   punct: 5.5, avg: 5.5, standing: "Warning",   date: "Feb 18 2026" },
];

const ALL_REVIEWS = [
  { id: 1, client: "Jennifer K.", trainer: "Marcus Steel", stars: 5, type: "public",  date: "Mar 2 2026",  text: "Marcus completely transformed my approach. Energy is unmatched!" },
  { id: 2, client: "David R.",    trainer: "Marcus Steel", stars: 4, type: "private", date: "Mar 1 2026",  text: "Great trainer but sometimes sessions overrun by 15 minutes." },
  { id: 3, client: "Alicia M.",   trainer: "Aisha Brown",  stars: 5, type: "public",  date: "Feb 28 2026", text: "Best coach I have ever had. Truly changed my life." },
  { id: 4, client: "Tom H.",      trainer: "Jordan Park",  stars: 3, type: "private", date: "Feb 27 2026", text: "Needs to show more enthusiasm during sessions." },
  { id: 5, client: "Priya N.",    trainer: "Aisha Brown",  stars: 5, type: "public",  date: "Feb 25 2026", text: "I lost 18 pounds in 2 months following Aisha's nutrition advice!" },
  { id: 6, client: "Kevin M.",    trainer: "Marcus Steel", stars: 4, type: "public",  date: "Feb 20 2026", text: "Great technique coaching. My deadlift is at an all-time high." },
  { id: 7, client: "Nina L.",     trainer: "Leo Vasquez",  stars: 2, type: "private", date: "Feb 18 2026", text: "Often late to sessions and doesn't seem prepared. Disappointed." },
  { id: 8, client: "Chris P.",    trainer: "Jordan Park",  stars: 3, type: "public",  date: "Feb 15 2026", text: "Decent trainer, but not very responsive between sessions." },
];

const INITIAL_PURCHASES = [
  { id: 1, date: "2026-03-01", client: "Jennifer K.", item: "Monthly Membership",    cat: "Membership",  qty: 1,  price: 120, status: "Paid"    },
  { id: 2, date: "2026-03-02", client: "David R.",    item: "Personal Training x10", cat: "PT Package",  qty: 10, price: 55,  status: "Paid"    },
  { id: 3, date: "2026-03-03", client: "Alicia M.",   item: "Protein Powder",        cat: "Supplement",  qty: 2,  price: 45,  status: "Paid"    },
  { id: 4, date: "2026-03-04", client: "Tom H.",      item: "Monthly Membership",    cat: "Membership",  qty: 1,  price: 120, status: "Pending" },
  { id: 5, date: "2026-03-04", client: "Kevin M.",    item: "Nutrition Plan (3mo)",  cat: "Nutrition",   qty: 1,  price: 180, status: "Paid"    },
  { id: 6, date: "2026-03-05", client: "Priya N.",    item: "Gym Gloves",            cat: "Equipment",   qty: 1,  price: 28,  status: "Pending" },
];

const INITIAL_EQUIPMENT = [
  { id: 1, name: "Treadmill #1",      cat: "Cardio",       rating: 5 },
  { id: 2, name: "Treadmill #2",      cat: "Cardio",       rating: 2 },
  { id: 3, name: "Rowing Machine",    cat: "Cardio",       rating: 4 },
  { id: 4, name: "Bench Press Rack A",cat: "Strength",     rating: 5 },
  { id: 5, name: "Bench Press Rack B",cat: "Strength",     rating: 3 },
  { id: 6, name: "Cable Machine",     cat: "Machines",     rating: 2 },
  { id: 7, name: "Dumbbells 5–50kg",  cat: "Free Weights", rating: 4 },
  { id: 8, name: "Spin Bikes",        cat: "Cardio",       rating: 1 },
  { id: 9, name: "Yoga Mats",         cat: "Flexibility",  rating: 3 },
];

const INITIAL_CLIENTS = [
  { id: 1,  name: "Jennifer K.", status: "Active",   joined: "Jan 2025", startDate: "2025-01-10", trainer: "Marcus Steel", plan: "Premium",  last: "Mar 3 2026",  progress: 82, goal: "Weight Loss",     email: "jen.k@email.com",   phone: "876-555-1111" },
  { id: 2,  name: "David R.",    status: "Active",   joined: "Mar 2025", startDate: "2025-03-05", trainer: "Marcus Steel", plan: "Standard", last: "Mar 2 2026",  progress: 65, goal: "Muscle Gain",     email: "david.r@email.com",  phone: "876-555-2222" },
  { id: 3,  name: "Alicia M.",   status: "New",      joined: "Mar 2026", startDate: "2026-03-01", trainer: "Aisha Brown",  plan: "Premium",  last: "Mar 4 2026",  progress: 20, goal: "Endurance",       email: "alicia@email.com",   phone: "876-555-3333" },
  { id: 4,  name: "Tom H.",      status: "Inactive", joined: "Jun 2024", startDate: "2024-06-15", trainer: "Jordan Park",  plan: "Standard", last: "Jan 10 2026", progress: 31, goal: "Flexibility",     email: "tom.h@email.com",    phone: "876-555-4444" },
  { id: 5,  name: "Kevin M.",    status: "Active",   joined: "Sep 2024", startDate: "2024-09-20", trainer: "Marcus Steel", plan: "Premium",  last: "Mar 1 2026",  progress: 75, goal: "Strength",        email: "kevin.m@email.com",  phone: "876-555-5555" },
  { id: 6,  name: "Priya N.",    status: "Active",   joined: "Nov 2024", startDate: "2024-11-03", trainer: "Aisha Brown",  plan: "Standard", last: "Feb 28 2026", progress: 58, goal: "Weight Loss",     email: "priya.n@email.com",  phone: "876-555-6666" },
  { id: 7,  name: "Omar J.",     status: "Inactive", joined: "Feb 2024", startDate: "2024-02-14", trainer: "Leo Vasquez",  plan: "Basic",    last: "Dec 5 2025",  progress: 18, goal: "General Fitness", email: "omar.j@email.com",   phone: "876-555-7777" },
  { id: 8,  name: "Nina L.",     status: "New",      joined: "Mar 2026", startDate: "2026-03-02", trainer: "Leo Vasquez",  plan: "Basic",    last: "Mar 3 2026",  progress: 10, goal: "Core Strength",   email: "nina.l@email.com",   phone: "876-555-8888" },
];

const INITIAL_EXCURSIONS = [
  { id: 1, icon: "🏔️", title: "Mountain Hike Challenge", date: "Mar 22 2026", location: "Blue Mountains",     cap: 20, enrolled: 14, price: 45, desc: "A full-day guided hike with nutrition breaks and team challenges." },
  { id: 2, icon: "🏖️", title: "Beach Workout & Swim",    date: "Apr 5 2026",  location: "Sunset Bay",         cap: 30, enrolled: 22, price: 25, desc: "Outdoor bootcamp on the beach followed by a group swim session." },
  { id: 3, icon: "🚴", title: "Cycling Tour",             date: "Apr 19 2026", location: "National Park Trail",cap: 15, enrolled: 8,  price: 60, desc: "30km scenic cycling route with rest stops. All levels welcome." },
];

const BIRTHDAYS = [
  { name: "Jennifer K.", bday: "Mar 4",  daysLeft: 0  },
  { name: "Kevin M.",    bday: "Mar 9",  daysLeft: 5  },
  { name: "Nina L.",     bday: "Mar 12", daysLeft: 8  },
  { name: "David R.",    bday: "Mar 18", daysLeft: 14 },
  { name: "Chris P.",    bday: "Mar 22", daysLeft: 18 },
  { name: "Alicia M.",   bday: "Mar 29", daysLeft: 25 },
];

const INITIAL_SCHEDULE = [
  { id: 1, type: "Nutrition",     date: "Mar 4 2026", time: "09:00", dur: "60 min", client: "Jennifer K.", trainer: "Dr. Nadia Cole", notes: "Post-competition meal plan review" },
  { id: 2, type: "Consultation",  date: "Mar 4 2026", time: "10:30", dur: "45 min", client: "Tom H.",       trainer: "Marcus Steel",   notes: "Re-engagement session"            },
  { id: 3, type: "Training",      date: "Mar 4 2026", time: "12:00", dur: "60 min", client: "Kevin M.",     trainer: "Marcus Steel",   notes: "Strength assessment"              },
  { id: 4, type: "Nutrition",     date: "Mar 5 2026", time: "09:00", dur: "30 min", client: "Omar J.",      trainer: "Dr. Nadia Cole", notes: "Initial diet consult"             },
  { id: 5, type: "Consultation",  date: "Mar 5 2026", time: "11:00", dur: "60 min", client: "Nina L.",      trainer: "Aisha Brown",    notes: "Goal setting — new member"        },
  { id: 6, type: "Training",      date: "Mar 6 2026", time: "07:00", dur: "90 min", client: "Priya N.",     trainer: "Aisha Brown",    notes: "HIIT + core session"              },
];

const INITIAL_ORDERS = [
  { id: "ORD-1042", client: "David R.", phone: "876-555-2222", items: "Protein Powder x2, Shaker",     amount: 98,  date: "Mar 3 2026", note: "Call ahead — client works mornings", status: "Pending" },
  { id: "ORD-1044", client: "Priya N.", phone: "876-555-6666", items: "Gym Gloves, Resistance Band Set",amount: 56,  date: "Mar 4 2026", note: "Preferred pickup: after 5pm",        status: "Pending" },
  { id: "ORD-1046", client: "Omar J.",  phone: "876-555-7777", items: "Monthly Supplement Pack",        amount: 145, date: "Mar 4 2026", note: "",                                   status: "Pending" },
];

const ORDER_HISTORY = [
  { id: "ORD-1039", client: "Jennifer K.", items: "Gym Bag",                 amount: 75,  status: "Collected", date: "Feb 28 2026" },
  { id: "ORD-1040", client: "Alicia M.",   items: "Yoga Mat, Water Bottle",  amount: 48,  status: "Collected", date: "Mar 1 2026"  },
  { id: "ORD-1041", client: "Kevin M.",    items: "Creatine, Pre-workout",   amount: 110, status: "Collected", date: "Mar 2 2026"  },
];

const INITIAL_CHAT_QUEUE = [
  { id: "c1", name: "Anon #4821", anon: true,  initials: "",   img: "",                                                       topic: "Membership pricing",    wait: "8m", preview: "Hi, how much is the monthly plan?",         msgs: [{ role: "user", text: "Hi, how much is the monthly plan?", time: "10:42" },{ role: "user", text: "Also do you have student discounts?", time: "10:43" }] },
  { id: "c2", name: "Omar J.",    anon: false, initials: "OJ", img: "",                                                       topic: "Session cancellation",  wait: "5m", preview: "I need to cancel my session tomorrow",       msgs: [{ role: "user", text: "Hey, I need to cancel my session tomorrow morning.", time: "10:46" }] },
  { id: "c3", name: "Anon #2293", anon: true,  initials: "",   img: "",                                                       topic: "Nutrition plan query",  wait: "3m", preview: "Does the nutrition plan include supplements?",msgs: [{ role: "user", text: "Does the nutrition plan include supplements?", time: "10:48" },{ role: "user", text: "And is there a trial period?", time: "10:49" }] },
  { id: "c4", name: "Priya N.",   anon: false, initials: "PN", img: "https://randomuser.me/api/portraits/women/68.jpg",       topic: "Excursion booking",     wait: "1m", preview: "I want to book the beach excursion",          msgs: [{ role: "user", text: "Hi! I want to book the Beach Workout & Swim excursion for April.", time: "10:52" }] },
];

const INITIAL_CHAT_ACTIVE = [
  { id: "a1", name: "Jennifer K.", anon: false, initials: "JK", img: "https://randomuser.me/api/portraits/women/32.jpg", topic: "Training schedule", time: "10:31", unread: 0, preview: "Thanks for the update!", msgs: [{ role: "user", text: "Hi, can you help me reschedule my Thursday session?", time: "10:22" },{ role: "admin", text: "Of course! What day works best for you instead?", time: "10:24" },{ role: "user", text: "Friday afternoon if possible.", time: "10:26" },{ role: "admin", text: "Done! I've moved you to Friday at 3:00 PM with Marcus.", time: "10:28" },{ role: "user", text: "Thanks for the update!", time: "10:31" }] },
  { id: "a2", name: "David R.",    anon: false, initials: "DR", img: "",                                                  topic: "Supplement order",  time: "10:38", unread: 2, preview: "Great, I'll come by at 5.",     msgs: [{ role: "user", text: "Hey, is my protein powder order ready for pickup?", time: "10:35" },{ role: "admin", text: "Yes! Order ORD-1042 is packed and ready at the front desk.", time: "10:37" },{ role: "user", text: "Great, I'll come by at 5.", time: "10:38" }] },
];

const ASSESS_CATS = [
  { k: "perf",     l: "Performance & Results" },
  { k: "motiv",    l: "Motivation & Energy"   },
  { k: "interact", l: "Client Interaction"    },
  { k: "knowledge",l: "Technical Knowledge"   },
  { k: "punct",    l: "Punctuality"           },
];

const NAV_ITEMS = [
  { section: "Overview" },
  { id: "dashboard",  icon: "🏠", label: "Dashboard"            },
  { section: "Staff" },
  { id: "trainers",   icon: "👤", label: "Trainer Assessments"  },
  { id: "reviews",    icon: "💬", label: "All Reviews",  badge: 8  },
  { section: "Finance" },
  { id: "purchases",  icon: "💳", label: "Purchases & Sales"    },
  { section: "Facility" },
  { id: "equipment",  icon: "🏋️", label: "Equipment Ratings"   },
  { section: "Clients" },
  { id: "clients",    icon: "👥", label: "Client Overview"      },
  { id: "excursions", icon: "🏖️", label: "Excursions"          },
  { id: "birthdays",  icon: "🎂", label: "Birthdays"            },
  { section: "Operations" },
  { id: "schedule",   icon: "📅", label: "Sessions Schedule"    },
  { id: "orders",     icon: "📦", label: "Order Pickups", badge: 3 },
  { id: "livechat",   icon: "⚡", label: "Live Chat",    badgeId: "chatBadge" },
];

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
const fmtAvg = (...v) => (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1);

const getStanding = (a) => {
  a = parseFloat(a);
  if (a >= 8.5) return { cls: "badge-green",  label: "EXCELLENT" };
  if (a >= 7)   return { cls: "badge-cyan",   label: "GOOD"      };
  if (a >= 5)   return { cls: "badge-orange", label: "WARNING"   };
  return               { cls: "badge-red",    label: "CRITICAL"  };
};

const Stars = ({ n, max = 5 }) => (
  <span className="rev-stars">
    {"★".repeat(n)}{"☆".repeat(max - n)}
  </span>
);

const Badge = ({ cls, children }) => <span className={`badge ${cls}`}>{children}</span>;

const schedTypeBadge = (t) =>
  t === "Nutrition" ? "badge-green" : t === "Consultation" ? "badge-cyan" : "badge-purple";

// ═══════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════
const Toast = ({ message }) =>
  message ? <div className="toast">✓ {message}</div> : null;

// ═══════════════════════════════════════════════════════════
// MODAL WRAPPER
// ═══════════════════════════════════════════════════════════
const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <button className="modal-close" onClick={onClose}>×</button>
      <div className="modal-title" dangerouslySetInnerHTML={{ __html: title }} />
      {children}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════
const ProgBar = ({ pct }) => (
  <div>
    <div className="prog-wrap">
      <div className="prog-fill" style={{
        width: `${pct}%`,
        background: pct > 60 ? "var(--green)" : pct > 30 ? "var(--orange)" : "var(--red)"
      }} />
    </div>
    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "var(--muted)" }}>{pct}%</span>
  </div>
);

// ═══════════════════════════════════════════════════════════
// SECTION: DASHBOARD
// ═══════════════════════════════════════════════════════════
const DashboardPage = ({ navigate, schedule, reviews, orders }) => (
  <div className="page-content">
    <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
    <div className="section-label">Command <span>Center</span></div>
    <div className="g4">
      {[
        { num: "47",     label: "New Clients",    sub: "↑ 12 this week",         cls: "cyan",   col: "var(--cyan)"   },
        { num: "312",    label: "Active Clients",  sub: "↑ 5% vs last month",     cls: "green",  col: "var(--green)"  },
        { num: "68",     label: "Inactive Clients",sub: "↑ 3 since last week",    cls: "red",    col: "var(--red)"    },
        { num: "$48,320",label: "Revenue (MTD)",   sub: "↑ 8.4% vs March '25",    cls: "orange", col: "var(--orange)" },
      ].map(s => (
        <div key={s.label} className={`stat-card ${s.cls}`}>
          <div className="stat-num" style={{ color: s.col }}>{s.num}</div>
          <div className="stat-label">{s.label}</div>
          <div className={`stat-sub ${s.cls === "red" ? "stat-down" : "stat-up"}`}>{s.sub}</div>
        </div>
      ))}
    </div>
    <div className="g3">
      <div className="card">
        <div className="card-title">🚨 Pending Orders</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:36, color:"var(--orange)", fontWeight:600 }}>{orders.filter(o=>o.status==="Pending").length}</div>
        <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>Ready for pickup</div>
        <button className="btn btn-orange" style={{ marginTop:12 }} onClick={() => navigate("orders")}>View Orders →</button>
      </div>
      <div className="card">
        <div className="card-title">⭐ Equipment Alerts</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:36, color:"var(--red)", fontWeight:600 }}>4</div>
        <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>Items rated below 4 — replace</div>
        <button className="btn btn-red" style={{ marginTop:12 }} onClick={() => navigate("equipment")}>View Priority →</button>
      </div>
      <div className="card">
        <div className="card-title">🎂 Birthdays This Month</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:36, color:"var(--gold)", fontWeight:600 }}>6</div>
        <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>Clients celebrating in March</div>
        <button className="btn btn-ghost" style={{ marginTop:12 }} onClick={() => navigate("birthdays")}>Send Wishes →</button>
      </div>
    </div>
    <div className="g2">
      <div className="card">
        <div className="card-title">📅 Today's Sessions</div>
        {schedule.slice(0, 4).map((s, i) => (
          <div key={i} className="schedule-item">
            <div className="sched-time">{s.time}<br /><span style={{ fontSize:10, color:"var(--muted)" }}>{s.date.slice(0,6)}</span></div>
            <div style={{ flex:1 }}>
              <div className="sched-title">{s.client}</div>
              <div className="sched-meta">{s.trainer} <Badge cls={schedTypeBadge(s.type)}>{s.type}</Badge></div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">💬 Latest Reviews</div>
        {reviews.slice(0, 3).map((r, i) => (
          <div key={i} className="review-item">
            <div className="review-header">
              <span className="reviewer-name">{r.client}</span>
              <Stars n={r.stars} />
            </div>
            <div className="review-text">{r.text.slice(0, 80)}…</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// SECTION: TRAINERS
// ═══════════════════════════════════════════════════════════
const TrainersPage = ({ trainers, setTrainers, assessHistory, setAssessHistory, toast }) => {
  const [assessTrainer, setAssessTrainer] = useState(null);
  const [scores, setScores] = useState({ perf: 8, motiv: 8, interact: 8, knowledge: 8, punct: 8 });
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ name:"", title:"Senior Performance Trainer", spec:"", age:"", img:"", certs:"" });

  const avg = Object.values(scores).reduce((a,b)=>a+b,0) / 5;
  const standing = getStanding(avg.toFixed(1));

  const openAssess = (t) => {
    setScores({ perf: t.scores.perf, motiv: t.scores.motiv, interact: t.scores.interact, knowledge: 8, punct: 8 });
    setAssessTrainer(t);
  };

  const submitAssess = () => {
    const a = parseFloat(avg.toFixed(1));
    const s = getStanding(a);
    setTrainers(prev => prev.map(t => t.id === assessTrainer.id
      ? { ...t, scores: { perf: scores.perf, motiv: scores.motiv, interact: scores.interact } }
      : t));
    setAssessHistory(prev => [{ trainer: assessTrainer.name, ...scores, avg: a, standing: s.label, date: new Date().toDateString() }, ...prev]);
    setAssessTrainer(null);
    toast(`Assessment for ${assessTrainer.name} saved — Avg: ${a}`);
  };

  const addTrainer = () => {
    if (!newTrainer.name.trim()) return;
    setTrainers(prev => [...prev, {
      id: Date.now(), ...newTrainer, age: parseInt(newTrainer.age) || 25,
      certs: newTrainer.certs.split(",").map(c=>c.trim()).filter(Boolean),
      img: newTrainer.img || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random()*80)+1}.jpg`,
      scores: { perf: 7, motiv: 7, interact: 7 }
    }]);
    setShowAddTrainer(false);
    setNewTrainer({ name:"", title:"Senior Performance Trainer", spec:"", age:"", img:"", certs:"" });
    toast("New trainer added!");
  };

  return (
    <div className="page-content">
      <div className="section-label">Trainer <span>Assessments</span></div>
      <div className="g2">
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:2, color:"var(--cyan)", textTransform:"uppercase" }}>Click Trainer to Assess</span>
            <button className="btn btn-green btn-sm" onClick={() => setShowAddTrainer(true)}>+ Add Trainer</button>
          </div>
          {trainers.map(t => {
            const a = fmtAvg(t.scores.perf, t.scores.motiv, t.scores.interact);
            const s = getStanding(a);
            return (
              <div key={t.id} className="trainer-assess-card" onClick={() => openAssess(t)}>
                <img src={t.img} alt={t.name} className="trainer-avatar" />
                <div style={{ flex:1 }}>
                  <div className="trainer-card-name">{t.name}</div>
                  <div className="trainer-card-sub">{t.title} · Age {t.age}</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{t.spec}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div className="trainer-score" style={{ color: parseFloat(a)>=7?"var(--green)":parseFloat(a)>=5?"var(--orange)":"var(--red)" }}>{a}</div>
                  <Badge cls={s.cls}>{s.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="card-title">📋 Assessment History</div>
          <div className="tbl-wrap" style={{ border:"none" }}>
            <table>
              <thead><tr><th>Trainer</th><th>Perf</th><th>Motiv</th><th>Interact</th><th>Avg</th><th>Standing</th><th>Date</th></tr></thead>
              <tbody>
                {assessHistory.map((a, i) => {
                  const s = getStanding(a.avg);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight:600 }}>{a.trainer}</td>
                      <td>{a.perf}</td><td>{a.motiv}</td><td>{a.interact}</td>
                      <td style={{ fontWeight:700, color:"var(--cyan)" }}>{a.avg}</td>
                      <td><Badge cls={s.cls}>{s.label}</Badge></td>
                      <td style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"var(--muted)" }}>{a.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ASSESS MODAL */}
      {assessTrainer && (
        <Modal title={`Assess: <span style="color:var(--cyan)">${assessTrainer.name}</span>`} onClose={() => setAssessTrainer(null)}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <img src={assessTrainer.img} alt="" style={{ width:52, height:52, borderRadius:"50%", border:"2px solid var(--cyan)" }} />
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700 }}>{assessTrainer.name}</div>
              <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"'JetBrains Mono',monospace" }}>{assessTrainer.title}</div>
            </div>
          </div>
          {ASSESS_CATS.map(cat => (
            <div key={cat.k} className="assess-slider-wrap">
              <div className="assess-slider-header">
                <span className="assess-slider-label">{cat.l}</span>
                <span className="assess-slider-val">{scores[cat.k]}</span>
              </div>
              <input type="range" className="range-slider" min="1" max="10" step="0.5"
                value={scores[cat.k]}
                style={{ background:`linear-gradient(to right,var(--cyan) ${(scores[cat.k]-1)/9*100}%,var(--bg4) ${(scores[cat.k]-1)/9*100}%)` }}
                onChange={e => setScores(prev => ({ ...prev, [cat.k]: parseFloat(e.target.value) }))} />
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid var(--border)", paddingTop:14, marginTop:8 }}>
            <div>
              <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, marginBottom:4 }}>AVERAGE SCORE</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:32, color:"var(--cyan)", fontWeight:700 }}>{avg.toFixed(1)}</div>
            </div>
            <Badge cls={standing.cls}>{standing.label}</Badge>
          </div>
          <button className="btn btn-cyan" style={{ width:"100%", justifyContent:"center", marginTop:14, padding:12 }} onClick={submitAssess}>Submit Assessment</button>
        </Modal>
      )}

      {/* ADD TRAINER MODAL */}
      {showAddTrainer && (
        <Modal title="Add <span>New Trainer</span>" onClose={() => setShowAddTrainer(false)}>
          <div className="form-row">
            <div className="form-group"><label>Full Name</label><input value={newTrainer.name} onChange={e=>setNewTrainer(p=>({...p,name:e.target.value}))} placeholder="e.g. Chris Volta" /></div>
            <div className="form-group"><label>Age</label><input type="number" value={newTrainer.age} onChange={e=>setNewTrainer(p=>({...p,age:e.target.value}))} placeholder="e.g. 31" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Title / Rank</label>
              <select value={newTrainer.title} onChange={e=>setNewTrainer(p=>({...p,title:e.target.value}))}>
                <option>Senior Performance Trainer</option>
                <option>Senior Trainer</option>
                <option>Trainer</option>
                <option>Head Coach</option>
                <option>Assistant Trainer</option>
              </select>
            </div>
            <div className="form-group"><label>Specialization</label><input value={newTrainer.spec} onChange={e=>setNewTrainer(p=>({...p,spec:e.target.value}))} placeholder="e.g. HIIT & Cardio" /></div>
          </div>
          <div className="form-group" style={{ marginBottom:12 }}>
            <label>Certifications (comma separated)</label>
            <input value={newTrainer.certs} onChange={e=>setNewTrainer(p=>({...p,certs:e.target.value}))} placeholder="NASM-CPT, ACE, ISSA" />
          </div>
          <div className="form-group" style={{ marginBottom:16 }}>
            <label>Profile Image URL (optional)</label>
            <input value={newTrainer.img} onChange={e=>setNewTrainer(p=>({...p,img:e.target.value}))} placeholder="https://… (leave blank for random)" />
          </div>
          <button className="btn btn-green" style={{ width:"100%", justifyContent:"center", padding:12 }} onClick={addTrainer}>✓ Add Trainer to Roster</button>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SECTION: REVIEWS
// ═══════════════════════════════════════════════════════════
const ReviewsPage = ({ reviews, trainers }) => {
  const [filter, setFilter] = useState("all");
  const [trainerFilter, setTrainerFilter] = useState("");

  const filtered = [...reviews]
    .sort((a,b) => new Date(b.date)-new Date(a.date))
    .filter(r => filter === "all" || r.type === filter)
    .filter(r => !trainerFilter || r.trainer === trainerFilter);

  return (
    <div className="page-content">
      <div className="section-label">Client <span>Reviews</span></div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        {[["all","All Reviews","btn-ghost"],["public","🌍 Public","btn-green"],["private","🔒 Private","btn-orange"]].map(([f,l,c])=>(
          <button key={f} className={`btn ${c}`} onClick={()=>setFilter(f)}>{l}</button>
        ))}
        <div style={{ flex:1 }} />
        <select value={trainerFilter} onChange={e=>setTrainerFilter(e.target.value)}
          style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", padding:"7px 12px", borderRadius:8, fontFamily:"'JetBrains Mono',monospace", fontSize:11, outline:"none" }}>
          <option value="">All Trainers</option>
          {trainers.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>
      <div className="card">
        {filtered.map(r => (
          <div key={r.id} className={`review-item ${r.type==="private"?"review-private":"review-public"}`}>
            <div className="review-header">
              <div>
                <div className="reviewer-name">{r.client}</div>
                <div className="reviewer-meta">→ {r.trainer} · {r.date}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <Stars n={r.stars} />
                <Badge cls={r.type==="public"?"badge-green":"badge-orange"}>{r.type==="public"?"🌍 Public":"🔒 Private"}</Badge>
              </div>
            </div>
            <div className="review-text">{r.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SECTION: PURCHASES
// ═══════════════════════════════════════════════════════════
const PurchasesPage = ({ purchases, setPurchases, toast }) => {
  const editCell = (i, k, val) => {
    setPurchases(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [k]: (k==="qty"||k==="price") ? (parseFloat(val.replace("$",""))||next[i][k]) : val };
      return next;
    });
  };
  const deleteRow = (i) => { setPurchases(prev => prev.filter((_,j)=>j!==i)); toast("Row deleted"); };
  const addRow = () => {
    setPurchases(prev => [...prev, { id: Date.now(), date: new Date().toISOString().slice(0,10), client:"New Client", item:"Item", cat:"Misc", qty:1, price:0, status:"Pending" }]);
    toast("Row added — click cells to edit");
  };
  const exportCSV = () => {
    const rows = [["Date","Client","Item","Category","Qty","Price","Total","Status"],
      ...purchases.map(p=>[p.date,p.client,p.item,p.cat,p.qty,`$${p.price}`,`$${(p.qty*p.price).toFixed(2)}`,p.status])];
    const csv = rows.map(r=>r.join(",")).join("\n");
    const a = document.createElement("a"); a.href="data:text/csv,"+encodeURIComponent(csv); a.download="purchases.csv"; a.click();
    toast("CSV exported!");
  };
  const total   = purchases.reduce((s,p)=>s+(p.qty*p.price),0);
  const pending = purchases.filter(p=>p.status==="Pending").reduce((s,p)=>s+(p.qty*p.price),0);

  return (
    <div className="page-content">
      <div className="section-label">Purchases <span>&amp; Sales</span></div>
      <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ fontSize:13, color:"var(--muted)" }}>Click any cell to edit inline.</div>
        <div style={{ flex:1 }} />
        <button className="btn btn-green" onClick={exportCSV}>⬇ Export CSV</button>
        <button className="btn btn-cyan"  onClick={addRow}>+ Add Row</button>
      </div>
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <div className="tbl-wrap" style={{ border:"none" }}>
          <table>
            <thead><tr><th>#</th><th>Date</th><th>Client</th><th>Item / Service</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Status</th><th /></tr></thead>
            <tbody>
              {purchases.map((p,i) => (
                <tr key={p.id}>
                  <td style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"var(--muted)" }}>{p.id}</td>
                  {["date","client","item","cat"].map(k=>(
                    <td key={k}><span className="editable" contentEditable suppressContentEditableWarning onBlur={e=>editCell(i,k,e.target.textContent)}>{p[k]}</span></td>
                  ))}
                  <td><span className="editable" contentEditable suppressContentEditableWarning onBlur={e=>editCell(i,"qty",e.target.textContent)}>{p.qty}</span></td>
                  <td><span className="editable" contentEditable suppressContentEditableWarning onBlur={e=>editCell(i,"price",e.target.textContent)}>${p.price}</span></td>
                  <td style={{ fontWeight:600, color:"var(--green)" }}>${(p.qty*p.price).toFixed(2)}</td>
                  <td><Badge cls={p.status==="Paid"?"badge-green":"badge-orange"}>{p.status}</Badge></td>
                  <td><button className="tbl-btn del" onClick={()=>deleteRow(i)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="g3" style={{ marginTop:16 }}>
        <div className="card"><div className="card-title">💰 Total Revenue</div><div className="stat-num" style={{ color:"var(--green)", fontSize:32 }}>${total.toFixed(2)}</div></div>
        <div className="card"><div className="card-title">📦 Transactions</div><div className="stat-num" style={{ color:"var(--cyan)", fontSize:32 }}>{purchases.length}</div></div>
        <div className="card"><div className="card-title">⏳ Pending</div><div className="stat-num" style={{ color:"var(--orange)", fontSize:32 }}>${pending.toFixed(2)}</div></div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SECTION: EQUIPMENT
// ═══════════════════════════════════════════════════════════
const EquipmentPage = ({ equipment, setEquipment, toast }) => {
  const [showAddEquip, setShowAddEquip]   = useState(false);
  const [showAddPri, setShowAddPri]       = useState(false);
  const [manualPriority, setManualPriority] = useState([{ name:"Resistance Bands (new set)", note:"Old ones snapping — safety hazard" }]);
  const [newEquip, setNewEquip] = useState({ name:"", cat:"Cardio", rating:3 });
  const [newPri, setNewPri]     = useState({ name:"", note:"" });

  const rateEquip = (id, rating) => {
    setEquipment(prev => prev.map(e => e.id===id ? {...e, rating} : e));
    const e = equipment.find(x=>x.id===id);
    if (rating < 4) toast(`${e?.name} flagged for replacement`);
  };

  const belowFour = equipment.filter(e => e.rating < 4);
  const allPriority = [
    ...belowFour.map(e => ({ name:e.name, note:`Rated ${e.rating}/5`, manual:false })),
    ...manualPriority.map(p => ({ ...p, manual:true })),
  ];

  return (
    <div className="page-content">
            
      <div className="section-label">Equipment <span>Ratings</span></div>
      <div className="g2">
        <div className="card">
          <div className="card-title">⭐ Rate Equipment (1–5 Stars)</div>
          {equipment.map(e => (
            <div key={e.id} className="equip-row">
              <div style={{ flex:1 }}>
                <div className="equip-name">{e.name}</div>
                <div className="equip-cat">{e.cat}</div>
              </div>
              <div style={{ display:"flex", gap:2 }}>
                {[1,2,3,4,5].map(i=>(
                  <button key={i} className={`star-btn ${i<=e.rating?"lit":""}`} onClick={()=>rateEquip(e.id,i)}>★</button>
                ))}
              </div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, width:20, marginLeft:6 }}>{e.rating}</span>
              <div style={{ width:90, textAlign:"right" }}>
                <Badge cls={e.rating<4?"badge-red":"badge-green"}>{e.rating<4?"REPLACE":"OK"}</Badge>
              </div>
            </div>
          ))}
          <button className="add-row-btn" onClick={()=>setShowAddEquip(true)}>+ Add Equipment Item</button>
        </div>
        <div className="card" style={{ borderColor:"rgba(255,51,85,0.3)" }}>
          <div className="card-title" style={{ color:"var(--red)" }}>🚨 Priority Replacement List</div>
          <p style={{ fontSize:12, color:"var(--muted)", marginBottom:14 }}>Items rated below 4 stars auto-appear here.</p>
          {allPriority.length === 0 && <div style={{ color:"var(--muted)", fontSize:13, textAlign:"center", padding:"20px 0" }}>No items flagged ✓</div>}
          {allPriority.map((p,i)=>(
            <div key={i} className="priority-item">
              <span style={{ fontSize:18 }}>{p.manual?"📋":"⚠️"}</span>
              <div style={{ flex:1 }}>
                <div className="p-name">{p.name}</div>
                <div className="p-note">{p.note}</div>
              </div>
              {p.manual && <button className="tbl-btn del" onClick={()=>setManualPriority(prev=>prev.filter((_,j)=>j!==(i-belowFour.length)))}>✕</button>}
            </div>
          ))}
          <button className="add-row-btn" style={{ borderColor:"rgba(255,51,85,0.2)", marginTop:12 }} onClick={()=>setShowAddPri(true)}>+ Add Manual Item</button>
        </div>
      </div>

      {showAddEquip && (
        <Modal title="Add <span>Equipment Item</span>" onClose={()=>setShowAddEquip(false)}>
          <div className="form-row">
            <div className="form-group"><label>Equipment Name</label><input value={newEquip.name} onChange={e=>setNewEquip(p=>({...p,name:e.target.value}))} placeholder="e.g. Treadmill #3" /></div>
            <div className="form-group"><label>Category</label>
              <select value={newEquip.cat} onChange={e=>setNewEquip(p=>({...p,cat:e.target.value}))}>
                {["Cardio","Strength","Flexibility","Free Weights","Machines"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom:14 }}><label>Initial Rating (1–5)</label>
            <input type="number" min="1" max="5" value={newEquip.rating} onChange={e=>setNewEquip(p=>({...p,rating:parseInt(e.target.value)||3}))} />
          </div>
          <button className="btn btn-cyan" style={{ width:"100%", justifyContent:"center", padding:11 }} onClick={()=>{
            if(!newEquip.name.trim()) return;
            setEquipment(prev=>[...prev,{id:Date.now(),...newEquip}]);
            setShowAddEquip(false); setNewEquip({name:"",cat:"Cardio",rating:3}); toast("Equipment added");
          }}>Add to List</button>
        </Modal>
      )}
      {showAddPri && (
        <Modal title="Add to <span>Priority List</span>" onClose={()=>setShowAddPri(false)}>
          <div className="form-group" style={{ marginBottom:12 }}><label>Item Name</label><input value={newPri.name} onChange={e=>setNewPri(p=>({...p,name:e.target.value}))} placeholder="e.g. Yoga Mats (10x)" /></div>
          <div className="form-group" style={{ marginBottom:14 }}><label>Reason / Notes</label><textarea value={newPri.note} onChange={e=>setNewPri(p=>({...p,note:e.target.value}))} placeholder="Why is this needed?" /></div>
          <button className="btn btn-red" style={{ width:"100%", justifyContent:"center", padding:11 }} onClick={()=>{
            if(!newPri.name.trim()) return;
            setManualPriority(prev=>[...prev,{name:newPri.name,note:newPri.note||"Manually added"}]);
            setShowAddPri(false); setNewPri({name:"",note:""}); toast("Added to priority list");
          }}>Add to Priority</button>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SECTION: CLIENTS
// ═══════════════════════════════════════════════════════════
const ClientsPage = ({ clients, setClients, trainers, toast }) => {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editClient, setEditClient]   = useState(null);
  const [editForm, setEditForm]       = useState({});

  const filtered = clients
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter(c => !statusFilter || c.status === statusFilter);

  const openEdit = (c) => { setEditClient(c); setEditForm({...c}); };
  const saveEdit = () => {
    setClients(prev => prev.map(c => c.id === editClient.id ? {...editForm} : c));
    setEditClient(null); toast(`${editForm.name} updated`);
  };

  return (
    <div className="page-content">
      <div className="section-label">Client <span>Overview</span></div>
      <div className="g4" style={{ marginBottom:20 }}>
        {[
          { num:47,  label:"New (This Month)", cls:"cyan",  col:"var(--cyan)"   },
          { num:312, label:"Active",           cls:"green", col:"var(--green)"  },
          { num:68,  label:"Inactive",         cls:"red",   col:"var(--red)"    },
          { num:427, label:"Total Enrolled",   cls:"orange",col:"var(--orange)" },
        ].map(s=>(
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-num" style={{ color:s.col }}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">All Clients</div>
        <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
          <input placeholder="🔍 Search client…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", padding:"8px 14px", borderRadius:8, fontFamily:"'Manrope',sans-serif", fontSize:13, outline:"none", width:220 }} />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
            style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", padding:"8px 12px", borderRadius:8, fontFamily:"'JetBrains Mono',monospace", fontSize:11, outline:"none" }}>
            <option value="">All Status</option>
            <option>Active</option><option>Inactive</option><option>New</option>
          </select>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Name</th><th>Status</th><th>Start Date</th><th>Trainer</th><th>Plan</th><th>Last Visit</th><th>Goal</th><th>Progress</th><th></th></tr></thead>
            <tbody>
              {filtered.map(c=>(
                <tr key={c.id}>
                  <td style={{ fontWeight:600 }}>{c.name}</td>
                  <td><Badge cls={c.status==="Active"?"badge-green":c.status==="New"?"badge-cyan":"badge-red"}>{c.status}</Badge></td>
                  <td style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"var(--muted)" }}>{c.startDate || c.joined}</td>
                  <td>{c.trainer}</td>
                  <td><Badge cls="badge-purple">{c.plan}</Badge></td>
                  <td style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"var(--muted)" }}>{c.last}</td>
                  <td style={{ fontSize:12, color:"var(--muted)" }}>{c.goal}</td>
                  <td><ProgBar pct={c.progress} /></td>
                  <td><button className="tbl-btn" onClick={()=>openEdit(c)}>✏️ Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editClient && (
        <Modal title={`Edit Client: <span>${editClient.name}</span>`} onClose={()=>setEditClient(null)}>
          <div className="form-row">
            <div className="form-group"><label>Full Name</label><input value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))} /></div>
            <div className="form-group"><label>Email</label><input value={editForm.email} onChange={e=>setEditForm(p=>({...p,email:e.target.value}))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Phone</label><input value={editForm.phone} onChange={e=>setEditForm(p=>({...p,phone:e.target.value}))} /></div>
            <div className="form-group"><label>Gym Start Date</label><input type="date" value={editForm.startDate} onChange={e=>setEditForm(p=>({...p,startDate:e.target.value}))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Status</label>
              <select value={editForm.status} onChange={e=>setEditForm(p=>({...p,status:e.target.value}))}>
                <option>Active</option><option>Inactive</option><option>New</option>
              </select>
            </div>
            <div className="form-group"><label>Membership Plan</label>
              <select value={editForm.plan} onChange={e=>setEditForm(p=>({...p,plan:e.target.value}))}>
                <option>Premium</option><option>Standard</option><option>Basic</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Assigned Trainer</label>
              <select value={editForm.trainer} onChange={e=>setEditForm(p=>({...p,trainer:e.target.value}))}>
                {trainers.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Fitness Goal</label>
              <select value={editForm.goal} onChange={e=>setEditForm(p=>({...p,goal:e.target.value}))}>
                {["Weight Loss","Muscle Gain","Endurance","Flexibility","Strength","Core Strength","General Fitness"].map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom:16 }}>
            <label>Goal Progress ({editForm.progress}%)</label>
            <input type="range" className="range-slider" min="0" max="100"
              value={editForm.progress}
              style={{ background:`linear-gradient(to right,var(--cyan) ${editForm.progress}%,var(--bg4) ${editForm.progress}%)` }}
              onChange={e=>setEditForm(p=>({...p,progress:parseInt(e.target.value)}))} />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn btn-cyan" style={{ flex:1, justifyContent:"center", padding:11 }} onClick={saveEdit}>Save Changes</button>
            <button className="btn btn-ghost" onClick={()=>setEditClient(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SECTION: EXCURSIONS
// ═══════════════════════════════════════════════════════════
const ExcursionsPage = ({ excursions, setExcursions, toast }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ icon:"🏔️", title:"", date:"", location:"", cap:20, price:0, desc:"" });
  const add = () => {
    if (!form.title.trim()) return;
    setExcursions(prev => [{ id:Date.now(), ...form, enrolled:0 }, ...prev]);
    setShowAdd(false); setForm({ icon:"🏔️", title:"", date:"", location:"", cap:20, price:0, desc:"" });
    toast("Excursion published!");
  };
  return (
    <div className="page-content">
      <div className="section-label">Gym <span>Excursions</span></div>
      <div style={{ marginBottom:16 }}><button className="btn btn-cyan" onClick={()=>setShowAdd(true)}>+ Add Excursion</button></div>
      <div className="excursion-grid">
        {excursions.map((e,i)=>(
          <div key={e.id} className="excursion-card">
            <div className="exc-img">{e.icon}</div>
            <div className="exc-body">
              <div className="exc-title">{e.title}</div>
              <div className="exc-meta">📅 {e.date} · 📍 {e.location}</div>
              <div className="exc-desc">{e.desc}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <Badge cls="badge-cyan">{e.enrolled}/{e.cap} enrolled</Badge>
                <Badge cls="badge-gold">${e.price}</Badge>
              </div>
              <div style={{ marginTop:10 }}>
                <button className="btn btn-ghost btn-sm" onClick={()=>{setExcursions(prev=>prev.filter((_,j)=>j!==i));toast("Excursion removed");}}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showAdd && (
        <Modal title="Add <span>New Excursion</span>" onClose={()=>setShowAdd(false)}>
          <div className="form-row">
            <div className="form-group"><label>Title</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Hike & Trail Day" /></div>
            <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Location</label><input value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} /></div>
            <div className="form-group"><label>Max Capacity</label><input type="number" value={form.cap} onChange={e=>setForm(p=>({...p,cap:parseInt(e.target.value)||20}))} /></div>
          </div>
          <div className="form-group" style={{ marginBottom:12 }}><label>Description</label><textarea value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} /></div>
          <div className="form-row">
            <div className="form-group"><label>Price ($)</label><input type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:parseFloat(e.target.value)||0}))} /></div>
            <div className="form-group"><label>Icon / Emoji</label><input value={form.icon} onChange={e=>setForm(p=>({...p,icon:e.target.value}))} maxLength={4} /></div>
          </div>
          <button className="btn btn-cyan" style={{ width:"100%", justifyContent:"center", padding:11, marginTop:6 }} onClick={add}>Publish Excursion</button>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SECTION: BIRTHDAYS
// ═══════════════════════════════════════════════════════════
const BirthdaysPage = ({ toast }) => {
  const [selectedClient, setSelectedClient] = useState(BIRTHDAYS[0].name);
  const [msg, setMsg] = useState("Happy Birthday! 🎉 We're so glad you're part of the GymPro family. Enjoy a complimentary session on us this month!");
  const [sent, setSent] = useState(false);
  const send = () => { setSent(true); toast(`Birthday message sent to ${selectedClient}!`); setTimeout(()=>setSent(false),3000); };
  return (
    <div className="page-content">
      <div className="section-label">March <span>Birthdays 🎂</span></div>
      <div className="g2">
        <div className="card">
          <div className="card-title">🎉 Celebrating This Month</div>
          {BIRTHDAYS.map((b,i)=>(
            <div key={i} className="bday-item">
              <div className="bday-avatar">{b.name.split(" ").map(x=>x[0]).join("")}</div>
              <div style={{ flex:1 }}>
                <div className="bday-name">{b.name}</div>
                <div className="bday-date">🎂 {b.bday} · {b.daysLeft===0?<span style={{ color:"var(--gold)" }}>TODAY!</span>:`${b.daysLeft} days away`}</div>
              </div>
              <div style={{ fontSize:18 }}>{b.daysLeft===0?"🎉":"🎁"}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">📨 Send Birthday Message</div>
          <div className="form-group" style={{ marginBottom:12 }}>
            <label>Select Client</label>
            <select value={selectedClient} onChange={e=>setSelectedClient(e.target.value)}>
              {BIRTHDAYS.map(b=><option key={b.name} value={b.name}>{b.name} ({b.bday})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:12 }}>
            <label>Message</label>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)} style={{ minHeight:100 }} />
          </div>
          <button className="btn btn-cyan" onClick={send}>🎁 Send Wishes</button>
          {sent && <div style={{ marginTop:10, fontSize:12, color:"var(--green)", fontFamily:"'JetBrains Mono',monospace" }}>✓ Birthday message sent!</div>}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SECTION: SCHEDULE
// ═══════════════════════════════════════════════════════════
const SchedulePage = ({ schedule, setSchedule, toast }) => {
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type:"Nutrition", date:"", time:"09:00", dur:"60 min", client:"", trainer:"", notes:"" });
  const filtered = filter === "all" ? schedule : schedule.filter(s=>s.type===filter);
  const add = () => {
    if (!form.client.trim()) return;
    setSchedule(prev => [{ id:Date.now(), ...form }, ...prev]);
    setShowAdd(false); setForm({ type:"Nutrition", date:"", time:"09:00", dur:"60 min", client:"", trainer:"", notes:"" });
    toast("Session scheduled!");
  };
  return (
    <div className="page-content">
      <div className="section-label">Sessions <span>Schedule</span></div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <button className="btn btn-cyan" onClick={()=>setShowAdd(true)}>+ Add Session</button>
        {["all","Nutrition","Consultation","Training"].map(f=>(
          <button key={f} className={`btn btn-ghost ${filter===f?"btn-cyan":""}`} onClick={()=>setFilter(f)}>
            {f==="all"?"All":f==="Nutrition"?"🥗 Nutrition":f==="Consultation"?"💬 Consultation":"🏋️ Training"}
          </button>
        ))}
      </div>
      <div className="card">
        {filtered.map((s,i)=>(
          <div key={i} className="schedule-item">
            <div className="sched-time">{s.time}<br /><span style={{ fontSize:10, color:"var(--muted)" }}>{s.date}</span></div>
            <div style={{ flex:1 }}>
              <div className="sched-title">{s.client} <Badge cls={schedTypeBadge(s.type)}>{s.type}</Badge></div>
              <div className="sched-meta">👤 {s.trainer} · ⏱ {s.dur}</div>
              {s.notes && <div style={{ fontSize:11, color:"var(--muted)", marginTop:3 }}>📝 {s.notes}</div>}
            </div>
          </div>
        ))}
      </div>
      {showAdd && (
        <Modal title="Schedule <span>Session</span>" onClose={()=>setShowAdd(false)}>
          <div className="form-row">
            <div className="form-group"><label>Session Type</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                {["Nutrition","Consultation","Training","Group Class"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Time</label><input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} /></div>
            <div className="form-group"><label>Duration</label>
              <select value={form.dur} onChange={e=>setForm(p=>({...p,dur:e.target.value}))}>
                {["30 min","45 min","60 min","90 min"].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Client Name</label><input value={form.client} onChange={e=>setForm(p=>({...p,client:e.target.value}))} /></div>
            <div className="form-group"><label>Trainer / Nutritionist</label><input value={form.trainer} onChange={e=>setForm(p=>({...p,trainer:e.target.value}))} /></div>
          </div>
          <div className="form-group" style={{ marginBottom:14 }}><label>Notes</label><textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} /></div>
          <button className="btn btn-cyan" style={{ width:"100%", justifyContent:"center", padding:11 }} onClick={add}>Schedule Session</button>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SECTION: ORDERS
// ═══════════════════════════════════════════════════════════
const OrdersPage = ({ orders, setOrders, toast }) => {
  const [history, setHistory] = useState(ORDER_HISTORY);
  const markCollected = (id) => {
    const order = orders.find(o=>o.id===id);
    setHistory(prev => [{ id:order.id, client:order.client, items:order.items, amount:order.amount, status:"Collected", date:order.date }, ...prev]);
    setOrders(prev => prev.filter(o=>o.id!==id));
    toast(`Order ${id} marked as collected`);
  };
  return (
    <div className="page-content">
      <div className="section-label">Order <span>Pickups</span></div>
      <div className="g2">
        <div>
          <div className="card-title" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:2, color:"var(--orange)", textTransform:"uppercase", marginBottom:14 }}>⚠ Ready for Pickup</div>
          {orders.filter(o=>o.status==="Pending").map(o=>(
            <div key={o.id} className="order-alert">
              <div className="order-icon">📦</div>
              <div className="order-info">
                <div className="order-title">{o.id} — {o.client}</div>
                <div className="order-detail">
                  📱 {o.phone}<br/>🛍 {o.items}<br/>💰 ${o.amount} · 📅 {o.date}{o.note && <><br/>📝 {o.note}</>}
                </div>
              </div>
              <div className="order-actions">
                <button className="btn btn-green btn-sm" onClick={()=>markCollected(o.id)}>✓ Collected</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>toast(`Notification sent to ${o.client}`)}>📨 Notify</button>
              </div>
            </div>
          ))}
          {orders.filter(o=>o.status==="Pending").length===0 && <div style={{ textAlign:"center", padding:"30px 0", color:"var(--muted)", fontSize:13 }}>No pending pickups ✓</div>}
        </div>
        <div className="card">
          <div className="card-title">📋 Order History</div>
          <div className="tbl-wrap" style={{ border:"none" }}>
            <table>
              <thead><tr><th>Order #</th><th>Client</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {history.map(o=>(
                  <tr key={o.id}>
                    <td style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11 }}>{o.id}</td>
                    <td>{o.client}</td>
                    <td style={{ fontSize:12, color:"var(--muted)" }}>{o.items}</td>
                    <td style={{ color:"var(--green)", fontWeight:600 }}>${o.amount}</td>
                    <td><Badge cls={o.status==="Collected"?"badge-green":"badge-orange"}>{o.status}</Badge></td>
                    <td style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"var(--muted)" }}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SECTION: LIVE CHAT
// ═══════════════════════════════════════════════════════════
const LiveChatPage = ({ toast }) => {
  const [online, setOnline]           = useState(false);
  const [queue, setQueue]             = useState(INITIAL_CHAT_QUEUE);
  const [active, setActive]           = useState(INITIAL_CHAT_ACTIVE);
  const [activeChatId, setActiveChatId] = useState(null);
  const [reply, setReply]             = useState("");
  const [resolved, setResolved]       = useState(11);
  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  const allChats  = [...queue, ...active];
  const activeChat = allChats.find(c => c.id === activeChatId);
  const isQueue    = queue.some(c => c.id === activeChatId);
  const chatBadge  = queue.length + active.filter(c=>c.unread>0).length;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [activeChat?.msgs?.length]);

  const openChat = (id) => {
    setActiveChatId(id);
    setActive(prev => prev.map(c => c.id===id ? {...c, unread:0} : c));
  };

  const acceptChat = (id) => {
    const chat = queue.find(c=>c.id===id);
    if (!chat) return;
    setQueue(prev => prev.filter(c=>c.id!==id));
    setActive(prev => [{ ...chat, time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}), unread:0 }, ...prev]);
    setActiveChatId(id);
    toast(`Chat with ${chat.name} accepted`);
  };

  const sendReply = () => {
    if (!activeChatId || !reply.trim()) return;
    const now = new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
    const newMsg = { role:"admin", text:reply.trim(), time:now };
    const updateMsgs = (chats) => chats.map(c => c.id===activeChatId
      ? { ...c, msgs:[...c.msgs, newMsg], preview:reply.trim().slice(0,40), time:now }
      : c);
    setActive(prev => updateMsgs(prev));
    setQueue(prev  => updateMsgs(prev));
    setReply("");
    if (textareaRef.current) { textareaRef.current.style.height="48px"; }
  };

  const resolveChat = () => {
    if (!activeChatId || isQueue) { toast("Can only resolve active chats"); return; }
    const name = active.find(c=>c.id===activeChatId)?.name;
    setActive(prev => prev.filter(c=>c.id!==activeChatId));
    setActiveChatId(null);
    setResolved(r=>r+1);
    toast(`Chat with ${name} resolved`);
  };

  const ChatAvatar = ({ chat, size=36, showDot=false }) => (
    <div className={`chat-user-ava ${chat.anon?"anon":"known"}`} style={{ width:size, height:size, flexShrink:0 }}>
      {chat.img ? <img src={chat.img} alt="" /> : chat.anon ? "👤" : chat.initials}
      {showDot && <div className="chat-online-dot" />}
    </div>
  );

  return (
    <div className="page-content">
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div className="section-label" style={{ marginBottom:0 }}>Live <span>Chat Support</span></div>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <span className="chat-status-label" style={{ color: online?"var(--green)":"var(--muted)" }}>STATUS: {online?"ONLINE":"OFFLINE"}</span>
          <div className="chat-toggle-wrap" onClick={()=>{ setOnline(p=>!p); toast(online?"You are now OFFLINE":"You are now ONLINE — chats will route to you"); }}>
            <div className={`chat-toggle-track ${online?"online":""}`}>
              <div className="chat-toggle-thumb" />
            </div>
            <span className="chat-toggle-text" style={{ color: online?"var(--green)":"var(--muted)" }}>{online?"Online":"Go Online"}</span>
          </div>
          <div className={`chat-status-dot ${online?"online":""}`} />
        </div>
      </div>

      {/* Stats */}
      <div className="g4" style={{ marginBottom:16 }}>
        {[
          { num:queue.length,   label:"In Queue",       col:"var(--cyan)",   cls:"cyan"   },
          { num:active.length,  label:"Active Chats",   col:"var(--green)",  cls:"green"  },
          { num:resolved,       label:"Resolved Today", col:"var(--orange)", cls:"orange" },
          { num:"3m",           label:"Avg Wait Time",  col:"var(--purple)", cls:"purple" },
        ].map(s=>(
          <div key={s.label} className={`stat-card ${s.cls}`} style={{ padding:"14px 18px" }}>
            <div className="stat-num" style={{ color:s.col, fontSize:32 }}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chat layout */}
      <div className="chat-layout">
        {/* Left panels */}
        <div className="chat-panels">
          {/* Queue */}
          <div className="chat-panel-card queue-panel">
            <div className="card-title" style={{ color:"var(--orange)" }}>⏳ Waiting in Queue</div>
            <div className="chat-panel-scroll" style={{ maxHeight:220 }}>
              {queue.length===0 && <div style={{ textAlign:"center", padding:"16px 0", color:"var(--muted)", fontSize:12 }}>No chats waiting ✓</div>}
              {queue.map(c=>(
                <div key={c.id} className={`chat-queue-item ${activeChatId===c.id?"selected":""}`} onClick={()=>openChat(c.id)}>
                  <ChatAvatar chat={c} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                      <span className="chat-item-name">{c.name}</span>
                      <Badge cls={c.anon?"badge-orange":"badge-cyan"}>{c.anon?"ANON":"MEMBER"}</Badge>
                    </div>
                    <div className="chat-item-preview">{c.preview}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                    <div className="chat-item-wait">⏱ {c.wait}</div>
                    <button className="btn btn-green" style={{ fontSize:9, padding:"3px 8px", lineHeight:1.4 }}
                      onClick={e=>{e.stopPropagation();acceptChat(c.id);}}>Accept</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active */}
          <div className="chat-panel-card active-panel">
            <div className="card-title" style={{ color:"var(--green)" }}>💬 Active Chats</div>
            <div className="chat-panel-scroll" style={{ flex:1, overflowY:"auto" }}>
              {active.length===0 && <div style={{ textAlign:"center", padding:"16px 0", color:"var(--muted)", fontSize:12 }}>No active chats</div>}
              {active.map(c=>(
                <div key={c.id} className={`chat-active-item ${activeChatId===c.id?"selected":""}`} onClick={()=>openChat(c.id)}>
                  <ChatAvatar chat={c} showDot={true} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="chat-item-name">{c.name}</div>
                    <div className="chat-item-preview">{c.preview}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                    <span className="chat-item-time">{c.time}</span>
                    {c.unread>0 && <span className="chat-unread">{c.unread}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat window */}
        <div className="chat-window">
          {/* Window header */}
          <div className="chat-window-header">
            <div className="chat-window-avatar" style={{ background: activeChat?(activeChat.anon?"var(--bg4)":"rgba(0,212,255,0.15)"):"var(--bg4)", color: activeChat&&!activeChat.anon?"var(--cyan)":"var(--muted)" }}>
              {activeChat ? (activeChat.img ? <img src={activeChat.img} alt="" style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }} /> : activeChat.anon?"👤":activeChat.initials) : "💬"}
            </div>
            <div style={{ flex:1 }}>
              <div className="chat-window-name">{activeChat?.name || "Select a chat"}</div>
              <div className="chat-window-meta">
                {activeChat ? `${activeChat.anon?"Anonymous User":"Member"} · ${activeChat.topic}` : "No conversation open"}
              </div>
            </div>
            {activeChat && (
              <div style={{ display:"flex", gap:8 }}>
                {isQueue
                  ? <button className="btn btn-green btn-sm" onClick={()=>acceptChat(activeChatId)}>✓ Accept</button>
                  : <button className="btn btn-ghost btn-sm" onClick={()=>toast("Transfer — connect to staff routing")}>↗ Transfer</button>
                }
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {!activeChat ? (
              <div className="chat-empty">
                <div style={{ fontSize:36, marginBottom:8 }}>💬</div>
                Select a chat from the queue or active list to start responding.
              </div>
            ) : (
              <>
                {activeChat.msgs.map((m,i)=>(
                  <div key={i} className={`chat-msg ${m.role}`}>
                    <div className="chat-bubble">{m.text}</div>
                    <div className="chat-msg-meta">{m.role==="admin"?"You":"Client"} · {m.time}</div>
                  </div>
                ))}
                {isQueue && (
                  <div className="chat-msg user">
                    <div className="chat-bubble">
                      <div className="chat-typing">
                        <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input area */}
          <div className="chat-input-area">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Type your reply… (Enter to send, Shift+Enter for new line)"
              value={reply}
              onChange={e=>{setReply(e.target.value);e.target.style.height="48px";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";}}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendReply();}}}
            />
            <div className="chat-send-col">
              <button className="btn btn-cyan" onClick={sendReply}>Send ↗</button>
              <button className="btn btn-ghost btn-sm" onClick={resolveChat}>✓ Resolve</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════
export default function Admin() {
  const [page, setPage]           = useState("dashboard");
  const [toastMsg, setToastMsg]   = useState("");
  const [clock, setClock]         = useState("");
  const [trainers, setTrainers]   = useState(INITIAL_TRAINERS);
  const [assessHistory, setAssessHistory] = useState(INITIAL_ASSESS_HISTORY);
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);
  const [clients, setClients]     = useState(INITIAL_CLIENTS);
  const [excursions, setExcursions] = useState(INITIAL_EXCURSIONS);
  const [schedule, setSchedule]   = useState(INITIAL_SCHEDULE);
  const [orders, setOrders]       = useState(INITIAL_ORDERS);

  const chatBadge = 4; // live chat badge

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleString("en-US",{ month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" }));
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, []);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }, []);

  const navigate = (p) => setPage(p);

  const pageTitles = {
    dashboard:"DASHBOARD", trainers:"TRAINER ASSESSMENTS", reviews:"CLIENT REVIEWS",
    purchases:"PURCHASES & SALES", equipment:"EQUIPMENT RATINGS", clients:"CLIENT OVERVIEW",
    excursions:"EXCURSIONS", birthdays:"BIRTHDAYS", schedule:"SESSIONS SCHEDULE",
    orders:"ORDER PICKUPS", livechat:"LIVE CHAT SUPPORT",
  };

  const renderPage = () => {
    switch(page) {
      case "dashboard":  return <DashboardPage navigate={navigate} schedule={schedule} reviews={ALL_REVIEWS} orders={orders} />;
      case "trainers":   return <TrainersPage trainers={trainers} setTrainers={setTrainers} assessHistory={assessHistory} setAssessHistory={setAssessHistory} toast={toast} />;
      case "reviews":    return <ReviewsPage reviews={ALL_REVIEWS} trainers={trainers} />;
      case "purchases":  return <PurchasesPage purchases={purchases} setPurchases={setPurchases} toast={toast} />;
      case "equipment":  return <EquipmentPage equipment={equipment} setEquipment={setEquipment} toast={toast} />;
      case "clients":    return <ClientsPage clients={clients} setClients={setClients} trainers={trainers} toast={toast} />;
      case "excursions": return <ExcursionsPage excursions={excursions} setExcursions={setExcursions} toast={toast} />;
      case "birthdays":  return <BirthdaysPage toast={toast} />;
      case "schedule":   return <SchedulePage schedule={schedule} setSchedule={setSchedule} toast={toast} />;
      case "orders":     return <OrdersPage orders={orders} setOrders={setOrders} toast={toast} />;
      case "livechat":   return <LiveChatPage toast={toast} />;
      default:           return null;
    }
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <nav className="sidebar">
        <div className="sidebar-logo"><span>⚡</span> GYMPRO</div>
        {NAV_ITEMS.map((item, i) => {
          if (item.section) return <div key={i} className="nav-section">{item.section}</div>;
          const badge = item.id === "livechat" ? chatBadge : item.badge;
          return (
            <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>navigate(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {badge ? <span className="nav-badge">{badge}</span> : null}
            </div>
          );
        })}
      </nav>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{pageTitles[page] || page.toUpperCase()}</div>
          <div className="topbar-right">
            <span className="topbar-time">{clock}</span>
            <span className="admin-tag">ADMIN ACCESS</span>
          </div>
        </div>
        {renderPage()}
      </div>

      <Toast message={toastMsg} />
    </div>
  );
}