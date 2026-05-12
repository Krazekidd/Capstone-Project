import { useState, useRef, useEffect, useCallback } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import { trainerAPI, authAPI } from "../../api/api"; // Import your API modules
import "./trainer.css";

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const Ico = {
  arrow: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  close: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  shield: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  swap: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 16V4m0 0L3 8m4-4l4 4" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  warn: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  up: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  down: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  star: (filled) =>
    filled ? (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ) : (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  loading: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rt-spinner">
      <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const avg = (arr) => (arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0);
const gradeCol = (s) => {
  if (s == null) return "#555";
  if (s >= 8.5) return "#22C55E";
  if (s >= 6) return "#F59E0B";
  return "#EF4444";
};
const gradeLbl = (s) => {
  if (s == null) return "Not Graded";
  if (s >= 8.5) return "Excellent";
  if (s >= 6) return "Good";
  return "Needs Improvement";
};
const stars5 = (s) => (s == null ? 0 : Math.round((s / 10) * 5));

/* ─────────────────────────────────────────────
   STAR ROW COMPONENT
───────────────────────────────────────────── */
function StarRow({ score, size = "sm" }) {
  const n = stars5(score);
  return (
    <div className={`rt-stars rt-stars--${size}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>{Ico.star(i <= n)}</span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   TOAST COMPONENT
───────────────────────────────────────────── */
function Toast({ msg, show, type = "success" }) {
  return (
    <div className={`rt-toast${show ? " rt-toast--on" : ""} rt-toast--${type}`}>
      {msg}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING SPINNER
───────────────────────────────────────────── */
function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="rt-loading">
      <Ico.loading />
      <span>{text}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PERFORMANCE CHART COMPONENT
───────────────────────────────────────────── */
function PerfChart({ data }) {
  const ref = useRef(null);
  const ch = useRef(null);

  useEffect(() => {
    if (!ref.current || !data) return;

    ch.current?.destroy();
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    ch.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels: months.slice(0, data.internal?.length || 0),
        datasets: [
          {
            label: "Internal %",
            data: data.internal || [],
            borderColor: "#F26522",
            backgroundColor: "rgba(242,101,34,0.07)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#F26522",
            pointRadius: 4,
          },
          {
            label: "Client ×20",
            data: (data.client || []).map((v) => v * 20),
            borderColor: "#22C55E",
            backgroundColor: "rgba(34,197,94,0.05)",
            borderWidth: 2,
            borderDash: [4, 3],
            tension: 0.4,
            fill: false,
            pointBackgroundColor: "#22C55E",
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) =>
                c.datasetIndex === 0
                  ? `Internal: ${c.raw}%`
                  : `Client: ${(c.raw / 20).toFixed(1)}/5`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: { color: "#555", font: { size: 10 } },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: { color: "#555", font: { size: 10 } },
            min: 0,
            max: 100,
          },
        },
      },
    });

    return () => ch.current?.destroy();
  }, [data]);

  return <canvas ref={ref} />;
}

/* ─────────────────────────────────────────────
   MAIN TRAINER PAGE COMPONENT
───────────────────────────────────────────── */
export default function RegularTrainerPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  
  // State for API data
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [atRiskClients, setAtRiskClients] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [grades, setGrades] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  // UI state
  const [showAllRisk, setShowAllRisk] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(0);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 2800);
  }, []);

  // Load trainer data on mount
  useEffect(() => {
    loadTrainerData();
  }, []);

  const loadTrainerData = async () => {
    setLoading(true);
    try {
      // Load all data in parallel
      const [profileRes, clientsRes, riskRes, perfRes, gradesRes] = await Promise.all([
        trainerAPI.getProfile().catch(() => null),
        trainerAPI.getClients().catch(() => null),
        trainerAPI.getAtRiskClients().catch(() => null),
        trainerAPI.getPerformance().catch(() => null),
        trainerAPI.getGrades().catch(() => null),
      ]);

      if (profileRes?.data) {
        setTrainerProfile(profileRes.data);
      }
      if (clientsRes?.data?.clients) {
        setClients(clientsRes.data.clients);
      }
      if (riskRes?.data?.at_risk_clients) {
        setAtRiskClients(riskRes.data.at_risk_clients);
      }
      if (perfRes?.data) {
        setPerformance(perfRes.data);
      }
      if (gradesRes?.data) {
        setGrades(gradesRes.data);
      }
      
      // For reviews, you might want to add a dedicated endpoint
      // For now, we'll use mock data or fetch from a different endpoint
    } catch (error) {
      console.error("Error loading trainer data:", error);
      showToast("Failed to load trainer data. Using fallback data.", "error");
    } finally {
      setLoading(false);
    }
  };

  // If loading, show spinner
  if (loading && !trainerProfile) {
    return (
      <div className="rt-page">
        <div className="rt-loading-full">
          <Ico.loading />
          <h2>Loading Trainer Dashboard...</h2>
        </div>
      </div>
    );
  }

  // Extract data from API responses or use defaults
  const profile = trainerProfile || {};
  const myClients = clients || [];
  const riskClients = atRiskClients || [];
  const perfData = performance || {};
  const gradeData = grades;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "grades", label: "My Grades" },
    { id: "risk", label: "Clients at Risk" },
    { id: "clients", label: "My Clients" },
    { id: "reviews", label: "My Reviews" },
  ];

  return (
    <div className="rt-page">
      <Toast msg={toast.msg} show={toast.show} type={toast.type} />

      {/* ── HERO SECTION ── */}
      <div className="rt-hero">
        <div
          className="rt-hero-cover"
          style={{
            backgroundImage: `url(${profile.profile_image || "https://images.unsplash.com/photo-1547153760-18fc86324498?w=1600&q=80&fit=crop"})`,
          }}
        />
        <div className="rt-hero-tint" />
        <div className="rt-hero-body">
          {/* Avatar */}
          <div className="rt-hero-left">
            <div className="rt-hero-avatar-ring">
              <img
                src={profile.profile_image || "https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=800&q=80&fit=crop"}
                alt={profile.name || "Trainer"}
                className="rt-hero-avatar"
              />
            </div>
            <div className="rt-trainer-badge">Trainer</div>
          </div>

          {/* Copy */}
          <div className="rt-hero-copy">
            <p className="rt-hero-eyebrow">B.A.D People Fitness · Trainer Dashboard</p>
            <h1 className="rt-hero-name">{profile.name || "Trainer"}</h1>
            <p className="rt-hero-title">
              {profile.certification || "Certified Trainer"}
            </p>
            <p className="rt-hero-bio">
              {profile.bio || "Professional fitness trainer dedicated to helping clients achieve their goals."}
            </p>
            <div className="rt-hero-tags">
              {(profile.specialties || []).map((s) => (
                <span key={s} className="rt-tag">
                  {s}
                </span>
              ))}
            </div>
            <div className="rt-hero-meta">
              <div>
                <span>Experience</span>
                <strong>{profile.experience_years || 0} yrs</strong>
              </div>
              <div>
                <span>Clients</span>
                <strong>{myClients.length}</strong>
              </div>
              <div>
                <span>Rating</span>
                <strong>{profile.rating || "N/A"}</strong>
              </div>
              <div>
                <span>Level</span>
                <strong>{profile.trainer_level || "Beginner"}</strong>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="rt-hero-kpis">
            <div className="rt-hero-kpi">
              <span className="rt-hero-kpi-val" style={{ color: gradeCol(perfData.internal_rating) }}>
                {perfData.internal_rating || "N/A"}
              </span>
              <span>Internal Rating</span>
            </div>
            <div className="rt-hero-kpi">
              <span className="rt-hero-kpi-val" style={{ color: "#22C55E" }}>
                {perfData.client_rating || "N/A"}
              </span>
              <span>Client Rating</span>
            </div>
            <div className="rt-hero-kpi">
              <span className="rt-hero-kpi-val" style={{ color: "#F26522" }}>
                {perfData.overall_score || "N/A"}
              </span>
              <span>Overall Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div className="rt-tab-bar">
        <div className="rt-tab-inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`rt-tab${activeTab === t.id ? " rt-tab--on" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="rt-main">
        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <div className="rt-tab-content">
            {/* KPI Strip */}
            <div className="rt-kpi-strip">
              {[
                { val: perfData.internal_rating || "N/A", lbl: "Internal Rating", col: gradeCol(perfData.internal_rating) },
                { val: perfData.client_rating || "N/A", lbl: "Client Rating", col: "#22C55E" },
                { val: myClients.length, lbl: "Total Clients", col: "#F26522" },
                { val: riskClients.length, lbl: "At Risk", col: "#EF4444" },
                { val: profile.experience_years || 0, lbl: "Years Experience", col: "#F26522" },
                { val: profile.hourly_rate ? `$${profile.hourly_rate}` : "N/A", lbl: "Hourly Rate", col: "#22C55E" },
              ].map((k, i) => (
                <div key={i} className="rt-kpi-card">
                  <span className="rt-kpi-val" style={{ color: k.col }}>
                    {k.val}
                  </span>
                  <span className="rt-kpi-lbl">{k.lbl}</span>
                </div>
              ))}
            </div>

            {/* Performance Chart + Snapshot */}
            <div className="rt-two-col">
              <div className="rt-panel">
                <div className="rt-panel-hdr">
                  <h3>Performance Overview</h3>
                  <div className="rt-chart-legend">
                    <span>
                      <span className="rt-leg-dot rt-leg-dot--orange" />
                      Internal %
                    </span>
                    <span>
                      <span className="rt-leg-dot rt-leg-dot--green" />
                      Client ×20
                    </span>
                  </div>
                </div>
                <div className="rt-chart-wrap">
                  {perfData.chart_data ? (
                    <PerfChart data={perfData.chart_data} />
                  ) : (
                    <p className="rt-no-data">No performance data available</p>
                  )}
                </div>
              </div>

              <div className="rt-panel">
                <div className="rt-panel-hdr">
                  <h3>Quick Stats</h3>
                </div>
                <div className="rt-snapshot-list">
                  {[
                    { label: "Active Clients", val: myClients.filter(c => c.is_active).length || myClients.length, total: myClients.length },
                    { label: "At Risk Clients", val: riskClients.length, total: myClients.length },
                    { label: "Avg. Rating", val: profile.rating || "N/A", total: 5 },
                    { label: "Experience", val: `${profile.experience_years || 0} yrs`, total: null },
                  ].map((s, i) => (
                    <div key={i} className="rt-snapshot-row">
                      <span className="rt-snapshot-label">{s.label}</span>
                      <div className="rt-snapshot-right">
                        <span className="rt-snapshot-val">
                          {s.val}
                          {s.total ? ` / ${s.total}` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* At Risk Preview */}
            {riskClients.length > 0 && (
              <div className="rt-panel">
                <div className="rt-panel-hdr">
                  <h3>At-Risk Clients ({riskClients.length})</h3>
                  <button className="rt-tab-link" onClick={() => setActiveTab("risk")}>
                    View All <Ico.arrow />
                  </button>
                </div>
                <div className="rt-clients-preview">
                  {riskClients.slice(0, 5).map((c) => (
                    <div key={c.id} className="rt-client-row">
                      <div className="rt-client-info">
                        <span className="rt-client-name">{c.name}</span>
                        <span className="rt-client-goal">
                          Risk: {c.risk_level || "Unknown"} — {c.risk_factors?.join(", ") || "No factors"}
                        </span>
                      </div>
                      <div className="rt-client-bar-col">
                        <span className="rt-client-pct" style={{ color: "#EF4444" }}>
                          {c.risk_level || "?"}
                        </span>
                      </div>
                      <span className="rt-client-risk-dot" style={{ background: "#EF4444" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ GRADES TAB ═══ */}
        {activeTab === "grades" && (
          <div className="rt-tab-content">
            <div className="rt-section-intro">
              <h2 className="rt-section-title">My Performance Grades</h2>
              <p className="rt-section-sub">
                Grades submitted by your senior trainer and management. Review your performance across all criteria.
              </p>
            </div>
            {gradeData ? (
              <div className="rt-panel">
                <div className="rt-panel-hdr">
                  <h3>Performance Breakdown</h3>
                </div>
                <div className="rt-crit-bars">
                  {[
                    { key: "performance", label: "Performance & Results", icon: "🏆" },
                    { key: "motivation", label: "Motivation & Energy", icon: "⚡" },
                    { key: "interaction", label: "Client Interaction", icon: "🤝" },
                    { key: "knowledge", label: "Technical Knowledge", icon: "🧠" },
                    { key: "punctuality", label: "Punctuality", icon: "⏱️" },
                  ].map((c) => {
                    const v = gradeData[c.key] || 0;
                    const cc = gradeCol(v);
                    return (
                      <div key={c.key} className="rt-crit-row">
                        <span className="rt-crit-icon">{c.icon}</span>
                        <span className="rt-crit-label">{c.label}</span>
                        <div className="rt-crit-bar-track">
                          <div className="rt-crit-bar-fill" style={{ width: `${v * 10}%`, background: cc }} />
                        </div>
                        <span className="rt-crit-val" style={{ color: cc }}>
                          {v.toFixed(1)}
                        </span>
                        <StarRow score={v} size="xs" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="rt-no-data">No grade data available yet.</p>
            )}
          </div>
        )}

        {/* ═══ CLIENTS AT RISK TAB ═══ */}
        {activeTab === "risk" && (
          <div className="rt-tab-content">
            <div className="rt-section-intro">
              <h2 className="rt-section-title">Clients at Risk</h2>
              <p className="rt-section-sub">
                Clients showing warning signs that may need additional attention or intervention.
              </p>
            </div>
            {riskClients.length > 0 ? (
              <div className="rt-risk-grid">
                {riskClients.map((c) => (
                  <div key={c.id} className="rt-risk-card" style={{ "--rc": "#EF4444" }}>
                    <div className="rt-risk-top">
                      <div className="rt-risk-main">
                        <div className="rt-risk-name-row">
                          <span className="rt-risk-name">{c.name}</span>
                          <span className="rt-risk-badge" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}>
                            {c.risk_level || "Medium"}
                          </span>
                        </div>
                        <div className="rt-risk-reason">
                          <Ico.warn />
                          {c.risk_factors?.join(", ") || "Low activity"}
                        </div>
                        <span className="rt-risk-seen">Last active: {c.last_activity || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rt-no-data">No at-risk clients at this time. Great job!</p>
            )}
          </div>
        )}

        {/* ═══ MY CLIENTS TAB ═══ */}
        {activeTab === "clients" && (
          <div className="rt-tab-content">
            <div className="rt-section-intro">
              <h2 className="rt-section-title">My Clients ({myClients.length})</h2>
              <p className="rt-section-sub">
                All clients assigned to you. Click on a client to view detailed information and progress.
              </p>
            </div>
            <div className="rt-clients-preview">
              {myClients.map((c) => (
                <div key={c.id} className="rt-client-row">
                  <div className="rt-client-info">
                    <span className="rt-client-name">{c.name}</span>
                    <span className="rt-client-goal">{c.email || "No email"}</span>
                  </div>
                  <div className="rt-client-bar-col">
                    <span className="rt-client-pct">{c.fitness_goals || "General"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ REVIEWS TAB ═══ */}
        {activeTab === "reviews" && (
          <div className="rt-tab-content">
            <div className="rt-section-intro">
              <h2 className="rt-section-title">My Reviews</h2>
              <p className="rt-section-sub">
                Client reviews and feedback about your training sessions.
              </p>
            </div>
            {reviews.length > 0 ? (
              <div className="rt-reviews-grid">
                {reviews.map((r) => (
                  <div key={r.id} className="rt-review-card">
                    <div className="rt-review-top">
                      <div className="rt-review-meta">
                        <span className="rt-review-client">{r.client || "Anonymous"}</span>
                        <span className="rt-review-datetime">{r.date || "N/A"}</span>
                      </div>
                      <div className="rt-review-rating">
                        <div className="rt-review-stars">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} style={{ color: i <= (r.rating || 0) ? "#F59E0B" : "rgba(255,255,255,0.12)", fontSize: 15 }}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="rt-review-comment">"{r.review || r.comment || "No comment"}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rt-no-data">No reviews yet.</p>
            )}
          </div>
        )}
      </div>

      {/* ── MARQUEE ── */}
      <div className="rt-marquee">
        <div className="rt-marquee-inner">
          {["FORGE YOUR LEGACY", "✦", "ELITE COACHING", "✦", "REAL RESULTS", "✦", "B.A.D PEOPLE FITNESS", "✦", "FORGE YOUR LEGACY", "✦", "ELITE COACHING", "✦", "REAL RESULTS", "✦", "B.A.D PEOPLE FITNESS", "✦"].map(
            (t, i) => (
              <span key={i} className={t === "✦" ? "rt-mq-sep" : "rt-mq-text"}>
                {t}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}