import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Trainer.css";

// ─── DATA ────────────────────────────────────────────────────────────────────

const TRAINER = {
  name: "Marcus Steele",
  age: 34,
  rank: "Senior Trainer",
  specialisation: "Strength & Conditioning, Functional Training",
  certification: "NASM, ACE, CSCS",
  yearsExperience: 8,
  rating: 4.7,
  bio: "Elite performance coach specialising in athletic conditioning and functional movement. Known for transformative results and evidence-based programming.",
  coverImg: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80",
  avatarImg: "https://randomuser.me/api/portraits/men/32.jpg",
};

const ALL_CLIENTS = [
  { id: 1, name: "Robert Johnson",   goal: "Lose 15kg",       progress: 32, risk: true,  avatar: "https://randomuser.me/api/portraits/men/11.jpg",  interventionTrainer: null },
  { id: 2, name: "Emily Davis",      goal: "Run 5k",          progress: 28, risk: true,  avatar: "https://randomuser.me/api/portraits/women/44.jpg", interventionTrainer: null },
  { id: 3, name: "Michael Brown",    goal: "Gain 5kg muscle", progress: 45, risk: true,  avatar: "https://randomuser.me/api/portraits/men/56.jpg",  interventionTrainer: "Jessica Hale" },
  { id: 4, name: "Sophia Turner",    goal: "Flexibility",     progress: 20, risk: true,  avatar: "https://randomuser.me/api/portraits/women/65.jpg", interventionTrainer: null },
  { id: 5, name: "Chris Martin",     goal: "Core strength",   progress: 15, risk: true,  avatar: "https://randomuser.me/api/portraits/men/78.jpg",  interventionTrainer: null },
  { id: 6, name: "Natalie Brooks",   goal: "Endurance",       progress: 38, risk: true,  avatar: "https://randomuser.me/api/portraits/women/22.jpg", interventionTrainer: null },
  { id: 7, name: "Jake Torres",      goal: "Weight loss",     progress: 10, risk: true,  avatar: "https://randomuser.me/api/portraits/men/33.jpg",  interventionTrainer: null },
];

const ALL_NON_RISK_CLIENTS = [
  { id: 8,  name: "Liam Chen",       goal: "Hypertrophy",     progress: 72, trainer: "Marcus Steele", avatar: "https://randomuser.me/api/portraits/men/41.jpg" },
  { id: 9,  name: "Olivia Park",     goal: "Tone & shred",    progress: 65, trainer: "Leon Cruz",     avatar: "https://randomuser.me/api/portraits/women/31.jpg" },
  { id: 10, name: "Ethan Wright",    goal: "Marathon prep",   progress: 80, trainer: "Alicia Chen",   avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
  { id: 11, name: "Maya Johnson",    goal: "Post-natal",      progress: 55, trainer: "Derek Wong",    avatar: "https://randomuser.me/api/portraits/women/55.jpg" },
];

const OTHER_TRAINERS = [
  { name: "Jessica Hale", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
  { name: "Leon Cruz",    avatar: "https://randomuser.me/api/portraits/men/15.jpg" },
  { name: "Alicia Chen",  avatar: "https://randomuser.me/api/portraits/women/25.jpg" },
  { name: "Derek Wong",   avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
  { name: "Sofia Martinez", avatar: "https://randomuser.me/api/portraits/women/37.jpg" },
  { name: "James Lee",    avatar: "https://randomuser.me/api/portraits/men/62.jpg" },
];

const ASSESSMENT_CRITERIA = ["Knowledge", "Communication", "Professionalism", "Session Planning", "Motivation"];

const MONTHLY_INTERNAL = [
  { month: "Sep", score: 72, sessions: 14, clients: 10, attendance: 89 },
  { month: "Oct", score: 78, sessions: 16, clients: 11, attendance: 91 },
  { month: "Nov", score: 82, sessions: 18, clients: 11, attendance: 93 },
  { month: "Dec", score: 75, sessions: 13, clients: 10, attendance: 87 },
  { month: "Jan", score: 85, sessions: 19, clients: 12, attendance: 94 },
  { month: "Feb", score: 87, sessions: 18, clients: 12, attendance: 94 },
];

const MONTHLY_CLIENT_RATINGS = [
  { month: "Sep", rating: 4.2, reviews: 8 },
  { month: "Oct", rating: 4.4, reviews: 9 },
  { month: "Nov", rating: 4.5, reviews: 11 },
  { month: "Dec", rating: 4.3, reviews: 7 },
  { month: "Jan", rating: 4.6, reviews: 13 },
  { month: "Feb", rating: 4.7, reviews: 15 },
];

const PUBLIC_REVIEWS = [
  { user: "Alice M.", rating: 5, comment: "Marcus completely transformed my approach to fitness. His programming is second to none.", avatar: "https://randomuser.me/api/portraits/women/14.jpg", date: "Feb 2026" },
  { user: "Bob K.",   rating: 4, comment: "Very knowledgeable and professional. Sessions are always well-planned.", avatar: "https://randomuser.me/api/portraits/men/27.jpg", date: "Feb 2026" },
  { user: "Sara L.",  rating: 5, comment: "Best trainer in the gym. Results speak for themselves!", avatar: "https://randomuser.me/api/portraits/women/68.jpg", date: "Jan 2026" },
  { user: "Tom R.",   rating: 5, comment: "Incredible attention to detail and always motivating.", avatar: "https://randomuser.me/api/portraits/men/54.jpg", date: "Jan 2026" },
];

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────

function StarRating({ value, max = 5, size = "md" }) {
  return (
    <span className={`stars stars--${size}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.floor(value) ? "star star--full" : i < value ? "star star--half" : "star star--empty"}>★</span>
      ))}
    </span>
  );
}

function MiniBarChart({ data, valueKey, label, color = "var(--accent)", maxVal }) {
  const max = maxVal || Math.max(...data.map(d => d[valueKey]));
  return (
    <div className="mini-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="mini-bar-wrap">
          <div className="mini-bar-outer">
            <div className="mini-bar-inner" style={{ height: `${(d[valueKey] / max) * 100}%`, background: color }} />
          </div>
          <span className="mini-bar-label">{d.month}</span>
          <span className="mini-bar-val">{d[valueKey]}{label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, valueKey, color = "var(--accent)", minVal, maxVal, suffix = "" }) {
  const W = 420, H = 140, PAD = 20;
  const vals = data.map(d => d[valueKey]);
  const min = minVal ?? Math.min(...vals) - 5;
  const max = maxVal ?? Math.max(...vals) + 5;
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((d[valueKey] - min) / (max - min)) * (H - PAD * 2);
    return { x, y, ...d };
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length - 1].x},${H - PAD} L${pts[0].x},${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="line-chart-svg">
      <defs>
        <linearGradient id={`grad-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${valueKey})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={color} stroke="white" strokeWidth="2" />
          <title>{p.month}: {p[valueKey]}{suffix}</title>
        </g>
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H - 2} textAnchor="middle" className="chart-tick">{p.month}</text>
      ))}
    </svg>
  );
}

function RadialProgress({ value, max = 100, size = 120, stroke = 10, color = "var(--accent)", label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (value / max) * circ;
  return (
    <div className="radial-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8e8e8" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="radial-label">
        <span className="radial-val">{value}{label || "%"}</span>
      </div>
    </div>
  );
}

// ─── SECTION: RATING HISTORY ─────────────────────────────────────────────────

function RatingHistorySection() {
  const [selected, setSelected] = useState(MONTHLY_INTERNAL.length - 1);
  const sel = MONTHLY_INTERNAL[selected];
  const clientSel = MONTHLY_CLIENT_RATINGS[selected];

  return (
    <section className="section" id="history">
      <div className="section-header">
        <span className="section-tag">Analytics</span>
        <h2 className="section-title">Performance History</h2>
        <p className="section-sub">Monthly breakdown of internal scores and client satisfaction</p>
      </div>

      {/* Month selector pills */}
      <div className="month-pills">
        {MONTHLY_INTERNAL.map((m, i) => (
          <button key={i} className={`month-pill ${selected === i ? "month-pill--active" : ""}`} onClick={() => setSelected(i)}>
            {m.month}
          </button>
        ))}
      </div>

      <div className="history-grid">
        {/* Internal score card */}
        <div className="history-card glass-card">
          <div className="history-card-top">
            <div>
              <p className="history-card-label">Internal Score</p>
              <p className="history-card-label">{sel.month} 2025–26</p>
            </div>
            <div className="history-score-badge" style={{ background: sel.score >= 80 ? "#16a34a" : sel.score >= 65 ? "#d97706" : "#dc2626" }}>
              {sel.score}
            </div>
          </div>
          <div className="history-stats-row">
            <div className="hstat"><span className="hstat-val">{sel.sessions}</span><span className="hstat-label">Sessions</span></div>
            <div className="hstat"><span className="hstat-val">{sel.clients}</span><span className="hstat-label">Clients</span></div>
            <div className="hstat"><span className="hstat-val">{sel.attendance}%</span><span className="hstat-label">Attendance</span></div>
          </div>
          <LineChart data={MONTHLY_INTERNAL} valueKey="score" suffix="" minVal={60} maxVal={100} />
        </div>

        {/* Client rating card */}
        <div className="history-card glass-card">
          <div className="history-card-top">
            <div>
              <p className="history-card-label">Client Rating</p>
              <p className="history-card-label">{clientSel.month} 2025–26</p>
            </div>
            <div className="history-score-badge" style={{ background: "var(--accent)" }}>
              {clientSel.rating}
            </div>
          </div>
          <div className="history-stats-row">
            <div className="hstat"><span className="hstat-val">{clientSel.reviews}</span><span className="hstat-label">Reviews</span></div>
            <div className="hstat"><StarRating value={clientSel.rating} size="sm" /></div>
          </div>
          <LineChart data={MONTHLY_CLIENT_RATINGS} valueKey="rating" color="#f59e0b" suffix="" minVal={3.5} maxVal={5} />
        </div>
      </div>
    </section>
  );
}

// ─── SECTION: CLIENTS AT RISK ─────────────────────────────────────────────────

function ClientsAtRiskSection() {
  const [clients, setClients] = useState(ALL_CLIENTS);
  const [showAll, setShowAll] = useState(false);
  const [switchRequest, setSwitchRequest] = useState(null); // { clientId, targetTrainer }
  const [switchModal, setSwitchModal] = useState(false);
  const [switchTarget, setSwitchTarget] = useState(null);
  const [switchClientId, setSwitchClientId] = useState(null);

  const displayed = showAll ? clients : clients.slice(0, 5);

  const handleIntervene = (clientId) => {
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, interventionTrainer: TRAINER.name } : c
    ));
  };

  const handleRemoveIntervention = (clientId) => {
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, interventionTrainer: null } : c
    ));
  };

  const openSwitchModal = (clientId) => {
    setSwitchClientId(clientId);
    setSwitchModal(true);
    setSwitchTarget(null);
  };

  const submitSwitchRequest = () => {
    if (!switchTarget) return;
    setSwitchRequest({ clientId: switchClientId, targetTrainer: switchTarget });
    setSwitchModal(false);
    alert(`Switch request sent to ${switchTarget}. Awaiting their acceptance.`);
  };

  const riskColor = (progress) => {
    if (progress < 20) return "#ef4444";
    if (progress < 35) return "#f97316";
    return "#eab308";
  };

  const riskLabel = (progress) => {
    if (progress < 20) return "Critical";
    if (progress < 35) return "High";
    return "Moderate";
  };

  return (
    <section className="section" id="clients">
      <div className="section-header">
        <span className="section-tag">Risk Monitor</span>
        <h2 className="section-title">Clients at Risk</h2>
        <p className="section-sub">Clients falling behind their goals — intervene or reassign</p>
      </div>

      <div className="risk-grid">
        {displayed.map(c => {
          const myIntervention = c.interventionTrainer === TRAINER.name;
          const otherIntervention = c.interventionTrainer && !myIntervention;
          const hasPendingSwitch = switchRequest?.clientId === c.id;
          const col = riskColor(c.progress);

          return (
            <div key={c.id} className="risk-card glass-card">
              <div className="risk-card-top">
                <img src={c.avatar} alt={c.name} className="risk-avatar" />
                <div className="risk-name-wrap">
                  <h4 className="risk-name">{c.name}</h4>
                  <span className="risk-goal">{c.goal}</span>
                </div>
                <div className="risk-badge" style={{ background: col }}>
                  {riskLabel(c.progress)}
                </div>
              </div>

              <div className="risk-progress-wrap">
                <div className="risk-progress-bar">
                  <div className="risk-progress-fill" style={{ width: `${c.progress}%`, background: col }} />
                </div>
                <span className="risk-progress-val" style={{ color: col }}>{c.progress}%</span>
              </div>

              {c.interventionTrainer && (
                <div className="intervention-banner" style={{ background: myIntervention ? "#16a34a22" : "#3b82f622", borderColor: myIntervention ? "#16a34a" : "#3b82f6" }}>
                  <span style={{ color: myIntervention ? "#16a34a" : "#3b82f6" }}>
                    {myIntervention ? "✓ You are intervening" : `⚡ ${c.interventionTrainer} is intervening`}
                  </span>
                </div>
              )}

              <div className="risk-actions">
                {myIntervention ? (
                  <button className="risk-btn risk-btn--danger" onClick={() => handleRemoveIntervention(c.id)}>
                    Stop Intervening
                  </button>
                ) : otherIntervention ? (
                  <button className="risk-btn risk-btn--disabled" disabled>
                    Intervention Locked
                  </button>
                ) : (
                  <button className="risk-btn risk-btn--primary" onClick={() => handleIntervene(c.id)}>
                    ⚡ Intervene
                  </button>
                )}
                <button className="risk-btn risk-btn--outline" onClick={() => openSwitchModal(c.id)}>
                  {hasPendingSwitch ? "⌛ Pending..." : "⇄ Request Switch"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {clients.length > 5 && (
        <button className="view-more-btn" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show Less ▲" : `View All ${clients.length} Clients ▼`}
        </button>
      )}

      {/* Switch Trainer Modal */}
      {switchModal && (
        <div className="modal-overlay" onClick={() => setSwitchModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setSwitchModal(false)}>✕</button>
            <h3 className="modal-title">Request Client Switch</h3>
            <p className="modal-sub">Select a trainer to receive this client. They must accept before the switch is finalised.</p>
            <div className="switch-trainer-list">
              {OTHER_TRAINERS.map(t => (
                <div
                  key={t.name}
                  className={`switch-trainer-item ${switchTarget === t.name ? "switch-trainer-item--selected" : ""}`}
                  onClick={() => setSwitchTarget(t.name)}
                >
                  <img src={t.avatar} alt={t.name} className="switch-avatar" />
                  <span>{t.name}</span>
                  {switchTarget === t.name && <span className="switch-check">✓</span>}
                </div>
              ))}
            </div>
            <button className="modal-confirm-btn" onClick={submitSwitchRequest} disabled={!switchTarget}>
              Send Switch Request
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── SECTION: TRAINER ASSESSMENT ─────────────────────────────────────────────

function TrainerAssessmentSection() {
  const [assessments, setAssessments] = useState({});
  const [assessed, setAssessed] = useState({});
  const [modal, setModal] = useState(null);
  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState("");

  const open = (t) => {
    setModal(t);
    if (!scores[t.name]) {
      setScores(prev => ({ ...prev, [t.name]: ASSESSMENT_CRITERIA.reduce((o, c) => ({ ...o, [c]: 0 }), {}) }));
    }
    setRemarks("");
  };

  const submit = () => {
    const vals = Object.values(scores[modal.name] || {});
    const avg = vals.length ? (vals.reduce((a, b) => a + Number(b), 0) / vals.length).toFixed(1) : 0;
    setAssessed(prev => ({ ...prev, [modal.name]: { done: true, avg } }));
    setModal(null);
  };

  return (
    <section className="section" id="assessment">
      <div className="section-header">
        <span className="section-tag">Peer Review</span>
        <h2 className="section-title">Trainer Assessment</h2>
        <p className="section-sub">Evaluate your fellow trainers across key performance criteria</p>
      </div>

      <div className="assess-grid">
        {OTHER_TRAINERS.map(t => {
          const done = assessed[t.name]?.done;
          return (
            <div key={t.name} className={`assess-card glass-card ${done ? "assess-card--done" : ""}`}>
              <img src={t.avatar} alt={t.name} className="assess-avatar" />
              <div className="assess-info">
                <h4 className="assess-name">{t.name}</h4>
                {done && <span className="assess-score">Score: {assessed[t.name].avg}/10</span>}
              </div>
              <button className={`assess-btn ${done ? "assess-btn--redo" : "assess-btn--primary"}`} onClick={() => open(t)}>
                {done ? "Re-assess" : "Assess"}
              </button>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box modal-box--wide" onClick={e => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setModal(null)}>✕</button>
            <div className="modal-assess-header">
              <img src={modal.avatar} alt={modal.name} className="modal-assess-avatar" />
              <div>
                <h3 className="modal-title">Assessing {modal.name}</h3>
                <p className="modal-sub">Rate each criterion from 0–10</p>
              </div>
            </div>
            <div className="sliders-wrap">
              {ASSESSMENT_CRITERIA.map(c => (
                <div key={c} className="slider-row">
                  <label className="slider-label">{c}</label>
                  <input
                    type="range" min="0" max="10" step="1"
                    value={scores[modal.name]?.[c] || 0}
                    onChange={e => setScores(prev => ({ ...prev, [modal.name]: { ...prev[modal.name], [c]: e.target.value } }))}
                    className="slider-input"
                  />
                  <span className="slider-val">{scores[modal.name]?.[c] || 0}</span>
                </div>
              ))}
            </div>
            <textarea placeholder="Add remarks (optional)..." className="modal-remarks" value={remarks} onChange={e => setRemarks(e.target.value)} />
            <button className="modal-confirm-btn" onClick={submit}>Submit Assessment</button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── SECTION: CLIENT SWITCH REQUESTS ─────────────────────────────────────────

function ClientSwitchSection() {
  const [inbound, setInbound] = useState([
    { id: 1, from: "Jessica Hale", client: ALL_NON_RISK_CLIENTS[1], fromAvatar: "https://randomuser.me/api/portraits/women/12.jpg" },
    { id: 2, from: "Leon Cruz",    client: ALL_NON_RISK_CLIENTS[2], fromAvatar: "https://randomuser.me/api/portraits/men/15.jpg" },
  ]);

  const respond = (id, accept) => {
    setInbound(prev => prev.filter(r => r.id !== id));
    alert(accept ? "Client accepted and added to your roster." : "Request declined.");
  };

  if (inbound.length === 0) return null;

  return (
    <section className="section" id="switches">
      <div className="section-header">
        <span className="section-tag">Incoming</span>
        <h2 className="section-title">Switch Requests</h2>
        <p className="section-sub">Other trainers want to hand over clients to you</p>
      </div>
      <div className="switch-req-list">
        {inbound.map(r => (
          <div key={r.id} className="switch-req-card glass-card">
            <div className="switch-req-from">
              <img src={r.fromAvatar} alt={r.from} className="switch-req-avatar" />
              <div>
                <span className="switch-req-label">From</span>
                <span className="switch-req-name">{r.from}</span>
              </div>
              <div className="switch-req-arrow">→</div>
              <img src={r.client.avatar} alt={r.client.name} className="switch-req-avatar" />
              <div>
                <span className="switch-req-label">Client</span>
                <span className="switch-req-name">{r.client.name}</span>
              </div>
            </div>
            <p className="switch-req-goal">Goal: {r.client.goal} — Progress: {r.client.progress}%</p>
            <div className="switch-req-actions">
              <button className="risk-btn risk-btn--primary" onClick={() => respond(r.id, true)}>Accept</button>
              <button className="risk-btn risk-btn--danger" onClick={() => respond(r.id, false)}>Decline</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── SECTION: REVIEWS ─────────────────────────────────────────────────────────

function ReviewsSection() {
  const avgRating = (PUBLIC_REVIEWS.reduce((s, r) => s + r.rating, 0) / PUBLIC_REVIEWS.length).toFixed(1);
  return (
    <section className="section" id="reviews">
      <div className="section-header">
        <span className="section-tag">Feedback</span>
        <h2 className="section-title">Public Reviews</h2>
      </div>
      <div className="reviews-overview">
        <div className="reviews-big-score">{avgRating}</div>
        <div>
          <StarRating value={Number(avgRating)} size="lg" />
          <p className="reviews-count">{PUBLIC_REVIEWS.length} verified reviews</p>
        </div>
      </div>
      <div className="reviews-grid">
        {PUBLIC_REVIEWS.map((r, i) => (
          <div key={i} className="review-card glass-card">
            <div className="review-top">
              <img src={r.avatar} alt={r.user} className="review-avatar" />
              <div>
                <strong className="review-user">{r.user}</strong>
                <span className="review-date">{r.date}</span>
              </div>
              <StarRating value={r.rating} size="sm" />
            </div>
            <p className="review-comment">"{r.comment}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── SECTION: COACHING SESSION ────────────────────────────────────────────────

function CoachingSection() {
  const [form, setForm] = useState({ client: "", date: "", time: "", message: "" });
  const send = () => {
    alert(`Message sent to ${form.client || "client"}!`);
    setForm({ client: "", date: "", time: "", message: "" });
  };
  return (
    <section className="section" id="coaching">
      <div className="section-header">
        <span className="section-tag">Messaging</span>
        <h2 className="section-title">Coaching Session</h2>
        <p className="section-sub">Schedule and message clients directly</p>
      </div>
      <div className="coaching-card glass-card">
        <div className="coaching-grid">
          <div className="coaching-left">
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80"
              alt="coaching"
              className="coaching-img"
            />
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80"
              alt="training"
              className="coaching-img coaching-img--offset"
            />
          </div>
          <div className="coaching-right">
            <input className="form-input" placeholder="Client Name" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} />
            <div className="form-row">
              <input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              <input className="form-input" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
            </div>
            <textarea className="form-input form-textarea" placeholder="Session message or notes..." rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
            <button className="cta-btn" onClick={send}>Send Message →</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function TrainerPage() {
  const [bgColor, setBgColor] = useState("#e63946");
  const [showColors, setShowColors] = useState(false);
  const [isEditCert, setIsEditCert] = useState(false);
  const [cert, setCert] = useState(TRAINER.certification);
  const [scrolled, setScrolled] = useState(false);

  const COLORS = ["#e63946", "#ff6b00", "#2563eb", "#16a34a", "#7c3aed"];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Compute aggregate stats from all clients
  const avgProgress = Math.round(ALL_CLIENTS.reduce((s, c) => s + c.progress, 0) / ALL_CLIENTS.length);
  const latestInternal = MONTHLY_INTERNAL[MONTHLY_INTERNAL.length - 1];
  const latestClient   = MONTHLY_CLIENT_RATINGS[MONTHLY_CLIENT_RATINGS.length - 1];

  return (
    <div className="trainer-page" style={{ "--accent": bgColor }}>
      {/* NAV */}
      <nav className={`tp-nav ${scrolled ? "tp-nav--scrolled" : ""}`}>
        <Link to="/" className="nav-back">← Back</Link>
        <span className="nav-name">{TRAINER.name}</span>
        <div className="color-picker">
          <button className="color-trigger" onClick={() => setShowColors(!showColors)}>
            <span className="color-dot-current" style={{ background: bgColor }} />
          </button>
          {showColors && (
            <div className="color-dropdown">
              {COLORS.map(c => (
                <button key={c} className="color-swatch" style={{ background: c }}
                  onClick={() => { setBgColor(c); setShowColors(false); }} />
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-bg">
          <img src={TRAINER.coverImg} alt="gym" className="hero-bg-img" />
          <div className="hero-overlay" />
          <div className="hero-overlay-accent" style={{ background: `${bgColor}22` }} />
        </div>
        <div className="hero-body">
          <div className="hero-left">
            <div className="hero-avatar-wrap">
              <img src={TRAINER.avatarImg} alt={TRAINER.name} className="hero-avatar" />
              <div className="hero-avatar-ring" />
            </div>
            <div className="hero-tag-row">
              <span className="hero-tag">{TRAINER.rank}</span>
              <span className="hero-tag hero-tag--outline">{TRAINER.yearsExperience} yrs exp.</span>
            </div>
            <h1 className="hero-name">{TRAINER.name}</h1>
            <p className="hero-bio">{TRAINER.bio}</p>
            <div className="hero-meta">
              <div className="hero-meta-item">
                <span className="hero-meta-label">Specialisation</span>
                <span className="hero-meta-val">{TRAINER.specialisation}</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Certification</span>
                {isEditCert ? (
                  <input
                    className="cert-input"
                    value={cert}
                    autoFocus
                    onChange={e => setCert(e.target.value)}
                    onBlur={() => setIsEditCert(false)}
                    onKeyDown={e => e.key === "Enter" && setIsEditCert(false)}
                  />
                ) : (
                  <span className="hero-meta-val" onClick={() => setIsEditCert(true)} style={{ cursor: "pointer", textDecoration: "underline dotted" }}>{cert}</span>
                )}
              </div>
            </div>
            <div className="hero-rating-row">
              <StarRating value={TRAINER.rating} size="lg" />
              <span className="hero-rating-val">{TRAINER.rating}</span>
            </div>
          </div>

          {/* KPI strip */}
          <div className="hero-kpis">
            <div className="kpi">
              <RadialProgress value={latestInternal.score} size={110} stroke={9} color={bgColor} />
              <span className="kpi-label">Internal Score</span>
            </div>
            <div className="kpi">
              <RadialProgress value={Math.round(latestClient.rating * 20)} size={110} stroke={9} color="#f59e0b" label="%" />
              <span className="kpi-label">Client Rating</span>
            </div>
            <div className="kpi">
              <RadialProgress value={avgProgress} size={110} stroke={9} color="#22c55e" />
              <span className="kpi-label">Avg Client Progress</span>
            </div>
            <div className="kpi">
              <RadialProgress value={latestInternal.attendance} size={110} stroke={9} color="#818cf8" />
              <span className="kpi-label">Attendance</span>
            </div>
          </div>
        </div>

        {/* Floating images */}
        <div className="hero-float-imgs">
          <img src="https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&q=80" alt="" className="float-img float-img--1" />
          <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80" alt="" className="float-img float-img--2" />
        </div>
      </header>

      {/* QUICK STATS BANNER */}
      <div className="stats-banner">
        {[
          { label: "Sessions This Month", val: latestInternal.sessions },
          { label: "Clients Assigned",    val: latestInternal.clients },
          { label: "Avg Assessment",      val: "8.3/10" },
          { label: "At-Risk Clients",     val: ALL_CLIENTS.length },
          { label: "Total Reviews",       val: PUBLIC_REVIEWS.length },
        ].map((s, i) => (
          <div key={i} className="stats-banner-item">
            <span className="stats-banner-val">{s.val}</span>
            <span className="stats-banner-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* PAGE BODY */}
      <main className="tp-main">
        <RatingHistorySection />
        <ClientsAtRiskSection />
        <ClientSwitchSection />
        <TrainerAssessmentSection />
        <CoachingSection />
        <ReviewsSection />
      </main>

      {/* FOOTER STRIP */}
      <footer className="tp-footer">
        <p>FitPro Studio · Trainer Dashboard · {TRAINER.name}</p>
      </footer>
    </div>
  );
}