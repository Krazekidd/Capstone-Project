import { useState, useEffect, useRef, useCallback } from "react";
import "./Admin.css";
import { authAPI, accountAPI, progressAPI, excursionsAPI, adminAPI } from "../../api/api";

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
const fmtAvg = (...v) => (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1);

const getStanding = (a) => {
  a = parseFloat(a);
  if (a >= 8.5) return { cls: "badge-green", label: "EXCELLENT" };
  if (a >= 7) return { cls: "badge-cyan", label: "GOOD" };
  if (a >= 5) return { cls: "badge-orange", label: "WARNING" };
  return { cls: "badge-red", label: "CRITICAL" };
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
// STATIC DATA (for fallback)
// ═══════════════════════════════════════════════════════════
const ALL_REVIEWS = [
  { id: 1, client: "Jennifer K.", trainer: "Marcus Steel", stars: 5, type: "public", date: "Mar 2 2026", text: "Marcus completely transformed my approach. Energy is unmatched!" },
  { id: 2, client: "David R.", trainer: "Marcus Steel", stars: 4, type: "private", date: "Mar 1 2026", text: "Great trainer but sometimes sessions overrun by 15 minutes." },
  { id: 3, client: "Alicia M.", trainer: "Aisha Brown", stars: 5, type: "public", date: "Feb 28 2026", text: "Best coach I have ever had. Truly changed my life." },
];

const INITIAL_PURCHASES = [
  { id: 1, date: "2026-03-01", client: "Jennifer K.", item: "Monthly Membership", cat: "Membership", qty: 1, price: 120, status: "Paid" },
  { id: 2, date: "2026-03-02", client: "David R.", item: "Personal Training x10", cat: "PT Package", qty: 10, price: 55, status: "Paid" },
];

const INITIAL_EQUIPMENT = [
  { id: 1, name: "Treadmill #1", cat: "Cardio", rating: 5 },
  { id: 2, name: "Treadmill #2", cat: "Cardio", rating: 2 },
  { id: 3, name: "Rowing Machine", cat: "Cardio", rating: 4 },
];

const INITIAL_SCHEDULE = [
  { id: 1, type: "Nutrition", date: "Mar 4 2026", time: "09:00", dur: "60 min", client: "Jennifer K.", trainer: "Dr. Nadia Cole", notes: "Post-competition meal plan review" },
];

const INITIAL_CHAT_QUEUE = [
  { id: "c1", name: "Anon #4821", anon: true, initials: "", img: "", topic: "Membership pricing", wait: "8m", preview: "Hi, how much is the monthly plan?", msgs: [{ role: "user", text: "Hi, how much is the monthly plan?", time: "10:42" }] },
];

const INITIAL_CHAT_ACTIVE = [
  { id: "a1", name: "Jennifer K.", anon: false, initials: "JK", img: "", topic: "Training schedule", time: "10:31", unread: 0, preview: "Thanks for the update!", msgs: [{ role: "user", text: "Hi, can you help me reschedule?", time: "10:22" }] },
];

const ASSESS_CATS = [
  { k: "perf", l: "Performance & Results" },
  { k: "motiv", l: "Motivation & Energy" },
  { k: "interact", l: "Client Interaction" },
  { k: "knowledge", l: "Technical Knowledge" },
  { k: "punct", l: "Punctuality" },
];

const NAV_ITEMS = [
  { section: "Overview" },
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { section: "Staff" },
  { id: "trainers", icon: "👤", label: "Trainer Assessments" },
  { id: "reviews", icon: "💬", label: "All Reviews", badge: 8 },
  { section: "Finance" },
  { id: "purchases", icon: "💳", label: "Purchases & Sales" },
  { section: "Facility" },
  { id: "equipment", icon: "🏋️", label: "Equipment Ratings" },
  { section: "Clients" },
  { id: "clients", icon: "👥", label: "Client Overview" },
  { id: "excursions", icon: "🏖️", label: "Excursions" },
  { id: "birthdays", icon: "🎂", label: "Birthdays" },
  { section: "Operations" },
  { id: "schedule", icon: "📅", label: "Sessions Schedule" },
  { id: "orders", icon: "📦", label: "Order Pickups", badge: 3 },
  { id: "livechat", icon: "⚡", label: "Live Chat", badgeId: "chatBadge" },
];

// ═══════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════
const DashboardPage = ({ stats, schedule, reviews, orders }) => (
  <div className="page-content">
    <div className="section-label">Command <span>Center</span></div>
    <div className="g4">
      {[
        { num: stats.newClients || 0, label: "New Clients", sub: "This month", cls: "cyan", col: "var(--cyan)" },
        { num: stats.activeClients || 0, label: "Active Clients", sub: "Currently active", cls: "green", col: "var(--green)" },
        { num: stats.inactiveClients || 0, label: "Inactive Clients", sub: "Last 30 days", cls: "red", col: "var(--red)" },
        { num: `$${stats.revenue || 0}`, label: "Revenue (MTD)", sub: "Month to date", cls: "orange", col: "var(--orange)" },
      ].map(s => (
        <div key={s.label} className={`stat-card ${s.cls}`}>
          <div className="stat-num" style={{ color: s.col }}>{s.num}</div>
          <div className="stat-label">{s.label}</div>
          <div className={`stat-sub ${s.cls === "red" ? "stat-down" : "stat-up"}`}>{s.sub}</div>
        </div>
      ))}
    </div>
    <div className="g2">
      <div className="card">
        <div className="card-title">📅 Today's Sessions</div>
        {schedule.slice(0, 3).map((s, i) => (
          <div key={i} className="schedule-item">
            <div className="sched-time">{s.time}</div>
            <div style={{ flex: 1 }}>
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
            <div className="review-text">{r.text?.slice(0, 80)}…</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// TRAINERS PAGE (with database integration)
// ═══════════════════════════════════════════════════════════
const TrainersPage = ({ trainers, setTrainers, assessHistory, setAssessHistory, toast, onRefresh }) => {
  const [assessTrainer, setAssessTrainer] = useState(null);
  const [scores, setScores] = useState({ perf: 8, motiv: 8, interact: 8, knowledge: 8, punct: 8 });
  const [loading, setLoading] = useState(false);
  const [trainerAssessments, setTrainerAssessments] = useState({});

  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 5;
  const standing = getStanding(avg.toFixed(1));

  const openAssess = async (t) => {
    setScores({
      perf: t.rating || 8,
      motiv: 8,
      interact: 8,
      knowledge: 8,
      punct: 8
    });
    setAssessTrainer(t);

    // Load existing assessments for this trainer
    try {
      const assessments = await adminAPI.getTrainerAssessments(t.id);
      setTrainerAssessments(prev => ({ ...prev, [t.id]: assessments }));
    } catch (err) {
      console.error("Failed to load assessments:", err);
    }
  };

  const submitAssess = async () => {
    setLoading(true);
    try {
      const a = parseFloat(avg.toFixed(1));
      const s = getStanding(a);

      await adminAPI.saveTrainerAssessment({
        trainer_id: assessTrainer.id,
        trainer_name: assessTrainer.name,
        scores: scores,
        average: a,
        standing: s.label,
        notes: ""
      });

      // Refresh assessments for this trainer
      const updatedAssessments = await adminAPI.getTrainerAssessments(assessTrainer.id);
      setTrainerAssessments(prev => ({ ...prev, [assessTrainer.id]: updatedAssessments }));

      // Add to history display
      setAssessHistory(prev => [{
        trainer: assessTrainer.name,
        perf: scores.perf,
        motiv: scores.motiv,
        interact: scores.interact,
        avg: a,
        standing: s.label,
        date: new Date().toLocaleDateString()
      }, ...prev]);

      toast(`Assessment for ${assessTrainer.name} saved — Avg: ${a}`);
      setAssessTrainer(null);
    } catch (err) {
      console.error("Failed to save assessment:", err);
      toast("Failed to save assessment: " + (err.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Display assessment history from loaded data
  const displayHistory = assessHistory.length > 0 ? assessHistory :
    Object.values(trainerAssessments).flat().map(a => ({
      trainer: a.trainer_name,
      perf: a.performance_score,
      motiv: a.motivation_score,
      interact: a.interaction_score,
      avg: a.average_score,
      standing: a.standing,
      date: new Date(a.assessment_date).toLocaleDateString()
    }));

  if (!trainers || trainers.length === 0) {
    return (
      <div className="page-content">
        <div className="section-label">Trainer <span>Assessments</span></div>
        <div className="card">
          <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>No trainers found in database.</p>
          <button className="btn btn-primary" onClick={onRefresh}>Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="section-label">Trainer <span>Assessments</span></div>
      <div className="g2">
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: 2, color: "var(--cyan)" }}>
              Select Trainer to Assess
            </span>
            <button className="btn btn-green btn-sm" onClick={onRefresh}>⟳ Refresh</button>
          </div>
          {trainers.map(t => {
            const a = t.rating || 0;
            const s = getStanding(a);
            return (
              <div key={t.id} className="trainer-assess-card" onClick={() => openAssess(t)}>
                <div className="trainer-avatar" style={{ background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  {t.name?.charAt(0) || "T"}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="trainer-card-name">{t.name}</div>
                  <div className="trainer-card-sub">{t.certification || "Certified Trainer"} · Level {t.trainer_level || 1}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="trainer-score" style={{ color: a >= 7 ? "var(--green)" : a >= 5 ? "var(--orange)" : "var(--red)" }}>{a}</div>
                  <Badge cls={s.cls}>{s.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="card-title">📋 Assessment History</div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Trainer</th><th>Perf</th><th>Motiv</th><th>Interact</th><th>Avg</th><th>Standing</th><th>Date</th></tr>
              </thead>
              <tbody>
                {displayHistory.map((a, i) => {
                  const s = getStanding(a.avg);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{a.trainer}</td>
                      <td>{a.perf}</td>
                      <td>{a.motiv}</td>
                      <td>{a.interact}</td>
                      <td style={{ fontWeight: 700, color: "var(--cyan)" }}>{a.avg}</td>
                      <td><Badge cls={s.cls}>{s.label}</Badge></td>
                      <td style={{ fontSize: 11 }}>{a.date}</td>
                    </tr>
                  );
                })}
                {displayHistory.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>No assessments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {assessTrainer && (
        <Modal title={`Assess: <span style="color:var(--cyan)">${assessTrainer.name}</span>`} onClose={() => setAssessTrainer(null)}>
          {ASSESS_CATS.map(cat => (
            <div key={cat.k} className="assess-slider-wrap">
              <div className="assess-slider-header">
                <span className="assess-slider-label">{cat.l}</span>
                <span className="assess-slider-val">{scores[cat.k]}</span>
              </div>
              <input type="range" className="range-slider" min="1" max="10" step="0.5"
                value={scores[cat.k]}
                onChange={e => setScores(prev => ({ ...prev, [cat.k]: parseFloat(e.target.value) }))} />
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 10 }}>AVERAGE SCORE</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--cyan)" }}>{avg.toFixed(1)}</div>
            </div>
            <Badge cls={standing.cls}>{standing.label}</Badge>
          </div>
          <button className="btn btn-cyan" style={{ width: "100%", marginTop: 16, padding: 12 }} onClick={submitAssess} disabled={loading}>
            {loading ? "Saving..." : "Submit Assessment"}
          </button>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// REVIEWS PAGE
// ═══════════════════════════════════════════════════════════
const ReviewsPage = () => (
  <div className="page-content">
    <div className="section-label">Client <span>Reviews</span></div>
    <div className="card">
      {ALL_REVIEWS.map(r => (
        <div key={r.id} className="review-item">
          <div className="review-header">
            <span className="reviewer-name">{r.client}</span>
            <Stars n={r.stars} />
          </div>
          <div className="review-text">{r.text}</div>
        </div>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// PURCHASES PAGE
// ═══════════════════════════════════════════════════════════
const PurchasesPage = ({ purchases, setPurchases, toast }) => {
  const total = purchases.reduce((s, p) => s + (p.qty * p.price), 0);
  return (
    <div className="page-content">
      <div className="section-label">Purchases <span>&amp; Sales</span></div>
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Client</th><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td>{p.date}</td>
                  <td>{p.client}</td>
                  <td>{p.item}</td>
                  <td>{p.qty}</td>
                  <td>${p.price}</td>
                  <td>${p.qty * p.price}</td>
                  <td><Badge cls={p.status === "Paid" ? "badge-green" : "badge-orange"}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="g3" style={{ marginTop: 16 }}>
          <div className="card-title">💰 Total Revenue: ${total}</div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// EQUIPMENT PAGE
// ═══════════════════════════════════════════════════════════
const EquipmentPage = ({ equipment, setEquipment, toast }) => {
  const rateEquip = (id, rating) => {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, rating } : e));
  };
  return (
    <div className="page-content">
      <div className="section-label">Equipment <span>Ratings</span></div>
      <div className="card">
        {equipment.map(e => (
          <div key={e.id} className="equip-row">
            <div style={{ flex: 1 }}><div className="equip-name">{e.name}</div><div className="equip-cat">{e.cat}</div></div>
            <div style={{ display: "flex", gap: 2 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} className={`star-btn ${i <= e.rating ? "lit" : ""}`} onClick={() => rateEquip(e.id, i)}>★</button>
              ))}
            </div>
            <span>{e.rating}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// CLIENTS PAGE (with real status counts)
// ═══════════════════════════════════════════════════════════
const ClientsPage = ({ clients, setClients, toast, onRefresh }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editClient, setEditClient] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);

  // Calculate status counts from actual client data
  const statusCounts = {
    Active: clients.filter(c => c.status === "Active").length,
    Inactive: clients.filter(c => c.status === "Inactive").length,
    New: clients.filter(c => c.status === "New").length
  };

  const filtered = clients
    .filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(c => !statusFilter || c.status === statusFilter);

  const getStatusBadge = (status) => {
    if (status === "Active") return "badge-green";
    if (status === "New") return "badge-cyan";
    return "badge-red";
  };

  const openEdit = (c) => {
    setEditClient(c);
    setEditForm({ ...c });
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      await adminAPI.updateClientStatus(editClient.id, {
        status: editForm.status,
        membership_plan: editForm.membership_plan,
        fitness_goal: editForm.fitness_goal,
        progress_percentage: editForm.progress_percentage
      });
      toast(`${editForm.name} updated successfully`);
      setEditClient(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to update client:", err);
      toast("Failed to update client: " + (err.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="page-content">
        <div className="loading-container">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="section-label">Client <span>Overview</span></div>

      {/* Status Cards with REAL counts */}
      <div className="g4" style={{ marginBottom: 20 }}>
        {[
          { num: statusCounts.New, label: "New (This Month)", cls: "cyan", col: "var(--cyan)" },
          { num: statusCounts.Active, label: "Active", cls: "green", col: "var(--green)" },
          { num: statusCounts.Inactive, label: "Inactive", cls: "red", col: "var(--red)" },
          { num: clients.length, label: "Total Enrolled", cls: "orange", col: "var(--orange)" },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-num" style={{ color: s.col }}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">All Clients</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <input placeholder="🔍 Search client…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "8px 14px", borderRadius: 8, width: 220 }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: 8 }}>
            <option value="">All Status</option>
            <option>Active</option><option>Inactive</option><option>New</option>
          </select>
          <button className="btn btn-ghost" onClick={onRefresh}>⟳ Refresh</button>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Status</th><th>Email</th><th>Phone</th><th>Plan</th><th>Goal</th><th>Progress</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><Badge cls={getStatusBadge(c.status)}>{c.status || "Active"}</Badge></td>
                  <td>{c.email}</td>
                  <td>{c.phone_number}</td>
                  <td><Badge cls="badge-purple">{c.membership_plan || "Standard"}</Badge></td>
                  <td style={{ fontSize: 12 }}>{c.fitness_goal || "General Fitness"}</td>
                  <td><ProgBar pct={c.progress_percentage || 0} /></td>
                  <td><button className="tbl-btn" onClick={() => openEdit(c)}>✏️ Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editClient && (
        <Modal title={`Edit Client: <span>${editClient.name}</span>`} onClose={() => setEditClient(null)}>
          <div className="form-row">
            <div className="form-group"><label>Name</label><input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="form-group"><label>Email</label><input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Phone</label><input value={editForm.phone_number} onChange={e => setEditForm(p => ({ ...p, phone_number: e.target.value }))} /></div>
            <div className="form-group"><label>Status</label>
              <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                <option>Active</option><option>Inactive</option><option>New</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Membership Plan</label>
              <select value={editForm.membership_plan} onChange={e => setEditForm(p => ({ ...p, membership_plan: e.target.value }))}>
                <option>Premium</option><option>Standard</option><option>Basic</option>
              </select>
            </div>
            <div className="form-group"><label>Fitness Goal</label>
              <select value={editForm.fitness_goal} onChange={e => setEditForm(p => ({ ...p, fitness_goal: e.target.value }))}>
                <option>Weight Loss</option><option>Muscle Gain</option><option>Endurance</option><option>Flexibility</option><option>Strength</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Progress ({editForm.progress_percentage || 0}%)</label>
            <input type="range" className="range-slider" min="0" max="100"
              value={editForm.progress_percentage || 0}
              onChange={e => setEditForm(p => ({ ...p, progress_percentage: parseInt(e.target.value) }))} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-cyan" style={{ flex: 1 }} onClick={saveEdit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button className="btn btn-ghost" onClick={() => setEditClient(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// EXCURSIONS PAGE (full CRUD)
// ═══════════════════════════════════════════════════════════
const ExcursionsPage = ({ excursions, setExcursions, toast }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", location: "", level: "beginner", date: "", time: "08:00",
    duration: "5 hours", spots: 20, cost: 0, description: "", guide: "", meetup_point: "", difficulty: 5
  });

  const loadExcursions = async () => {
    setLoading(true);
    try {
      const data = await excursionsAPI.getExcursions();
      setExcursions(data.excursions || []);
    } catch (err) {
      console.error("Failed to load excursions:", err);
      toast("Failed to load excursions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExcursions();
  }, []);

  const addExcursion = async () => {
    if (!form.name.trim()) {
      toast("Please enter an excursion name");
      return;
    }
    setLoading(true);
    try {
      const newExcursion = {
        name: form.name,
        location: form.location,
        level: form.level,
        level_label: form.level === "beginner" ? "Beginner" : form.level === "intermediate" ? "Intermediate" : "Advanced",
        date: form.date,
        time: form.time,
        duration: form.duration,
        spots: parseInt(form.spots),
        cost: parseFloat(form.cost),
        description: form.description,
        guide: form.guide,
        meetup_point: form.meetup_point,
        difficulty: parseInt(form.difficulty),
        img_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80&fit=crop",
        thumb_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80&fit=crop"
      };

      await adminAPI.createExcursion(newExcursion);
      await loadExcursions();
      setShowAdd(false);
      setForm({ name: "", location: "", level: "beginner", date: "", time: "08:00", duration: "5 hours", spots: 20, cost: 0, description: "", guide: "", meetup_point: "", difficulty: 5 });
      toast("Excursion added successfully!");
    } catch (err) {
      console.error("Failed to add excursion:", err);
      toast("Failed to add excursion: " + (err.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteExcursion = async (excursion) => {
    if (!window.confirm(`Are you sure you want to delete "${excursion.name}"?`)) return;
    setLoading(true);
    try {
      await adminAPI.deleteExcursion(excursion.id);
      await loadExcursions();
      toast("Excursion deleted successfully");
    } catch (err) {
      console.error("Failed to delete excursion:", err);
      toast("Failed to delete excursion: " + (err.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateExcursion = async () => {
    if (!showEdit) return;
    setLoading(true);
    try {
      await adminAPI.updateExcursion(showEdit.id, {
        name: showEdit.name,
        location: showEdit.location,
        level: showEdit.level,
        date: showEdit.date,
        time: showEdit.time,
        duration: showEdit.duration,
        spots: showEdit.spots,
        cost: showEdit.cost,
        description: showEdit.description,
        guide: showEdit.guide,
        meetup_point: showEdit.meetup_point,
        difficulty: showEdit.difficulty
      });
      await loadExcursions();
      setShowEdit(null);
      toast("Excursion updated successfully");
    } catch (err) {
      console.error("Failed to update excursion:", err);
      toast("Failed to update excursion");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="page-content">
      <div className="section-label">Gym <span>Excursions</span></div>
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-cyan" onClick={() => setShowAdd(true)}>+ Add Excursion</button>
        <button className="btn btn-ghost" style={{ marginLeft: 10 }} onClick={loadExcursions}>⟳ Refresh</button>
      </div>

      <div className="excursion-grid">
        {excursions.map((e) => (
          <div key={e.id} className="excursion-card">
            <div className="exc-img">🏔️</div>
            <div className="exc-body">
              <div className="exc-title">{e.name}</div>
              <div className="exc-meta">📅 {formatDate(e.date)} · 📍 {e.location}</div>
              <div className="exc-desc">{e.description?.slice(0, 80)}...</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Badge cls="badge-cyan">{e.spots_left || 0}/{e.spots || 0} spots</Badge>
                <Badge cls="badge-gold">${e.cost || 0}</Badge>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(e)}>✏️ Edit</button>
                <button className="btn btn-red btn-sm" onClick={() => deleteExcursion(e)}>🗑 Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add <span>New Excursion</span>" onClose={() => setShowAdd(false)}>
          <div className="form-row">
            <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            <div className="form-group"><label>Time</label><input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Duration</label><input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} /></div>
            <div className="form-group"><label>Max Spots</label><input type="number" value={form.spots} onChange={e => setForm(p => ({ ...p, spots: parseInt(e.target.value) || 20 }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Price ($)</label><input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="form-group"><label>Difficulty (1-10)</label><input type="number" value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: parseInt(e.target.value) || 5 }))} /></div>
          </div>
          <div className="form-group"><label>Guide</label><input value={form.guide} onChange={e => setForm(p => ({ ...p, guide: e.target.value }))} /></div>
          <div className="form-group"><label>Meetup Point</label><input value={form.meetup_point} onChange={e => setForm(p => ({ ...p, meetup_point: e.target.value }))} /></div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
          <button className="btn btn-cyan" style={{ width: "100%", marginTop: 16, padding: 12 }} onClick={addExcursion} disabled={loading}>
            {loading ? "Adding..." : "Publish Excursion"}
          </button>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <Modal title={`Edit: <span>${showEdit.name}</span>`} onClose={() => setShowEdit(null)}>
          <div className="form-row">
            <div className="form-group"><label>Name</label><input value={showEdit.name} onChange={e => setShowEdit(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="form-group"><label>Location</label><input value={showEdit.location} onChange={e => setShowEdit(p => ({ ...p, location: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Date</label><input type="date" value={showEdit.date} onChange={e => setShowEdit(p => ({ ...p, date: e.target.value }))} /></div>
            <div className="form-group"><label>Time</label><input type="time" value={showEdit.time} onChange={e => setShowEdit(p => ({ ...p, time: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Duration</label><input value={showEdit.duration} onChange={e => setShowEdit(p => ({ ...p, duration: e.target.value }))} /></div>
            <div className="form-group"><label>Max Spots</label><input type="number" value={showEdit.spots} onChange={e => setShowEdit(p => ({ ...p, spots: parseInt(e.target.value) || 20 }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Price ($)</label><input type="number" value={showEdit.cost} onChange={e => setShowEdit(p => ({ ...p, cost: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="form-group"><label>Difficulty</label><input type="number" value={showEdit.difficulty} onChange={e => setShowEdit(p => ({ ...p, difficulty: parseInt(e.target.value) || 5 }))} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea value={showEdit.description} onChange={e => setShowEdit(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
          <button className="btn btn-cyan" style={{ width: "100%", marginTop: 16, padding: 12 }} onClick={updateExcursion} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// BIRTHDAYS PAGE
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// BIRTHDAYS PAGE (with email functionality)
// ═══════════════════════════════════════════════════════════
const BirthdaysPage = ({ clients, toast }) => {
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load birthday data on mount
  useEffect(() => {
    loadBirthdayData();
  }, [clients]);

  const loadBirthdayData = async () => {
    setLoading(true);
    try {
      // Get today's birthdays from API
      const todayData = await adminAPI.getTodayBirthdays();
      setTodayBirthdays(todayData || []);
      
      // Calculate upcoming birthdays from clients data
      const today = new Date();
      const upcoming = clients
        .filter(c => c.birthday)
        .map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          birthday: new Date(c.birthday),
          birthdayStr: new Date(c.birthday).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        }))
        .filter(c => {
          // Filter out past birthdays for this year
          const birthdayThisYear = new Date(today.getFullYear(), c.birthday.getMonth(), c.birthday.getDate());
          return birthdayThisYear >= today;
        })
        .sort((a, b) => {
          const dateA = new Date(today.getFullYear(), a.birthday.getMonth(), a.birthday.getDate());
          const dateB = new Date(today.getFullYear(), b.birthday.getMonth(), b.birthday.getDate());
          return dateA - dateB;
        })
        .slice(0, 10);
      
      setUpcomingBirthdays(upcoming);
      
      // If there are today's birthdays, auto-select the first one
      if (todayData.length > 0 && !selectedClient) {
        setSelectedClient(todayData[0]);
        setMessage(`Happy Birthday! 🎉 We're so glad you're part of the GymPro family. Enjoy a complimentary training session on us this month!`);
      }
    } catch (err) {
      console.error("Failed to load birthday data:", err);
      toast("Failed to load birthday data");
    } finally {
      setLoading(false);
    }
  };

  const sendBirthdayWishes = async () => {
    if (!selectedClient) {
      toast("Please select a client");
      return;
    }
    
    if (!message.trim()) {
      toast("Please enter a birthday message");
      return;
    }
    
    setSending(true);
    try {
      await adminAPI.sendBirthdayEmail(selectedClient.id, message);
      setSent(true);
      toast(`Birthday wishes sent to ${selectedClient.name}!`);
      
      // Remove from today's birthdays list
      setTodayBirthdays(prev => prev.filter(c => c.id !== selectedClient.id));
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSent(false);
        if (todayBirthdays.length > 1) {
          setSelectedClient(todayBirthdays[1]);
        } else {
          setSelectedClient(null);
          setMessage("");
        }
      }, 3000);
      
      // Refresh data
      setTimeout(() => loadBirthdayData(), 2000);
    } catch (err) {
      console.error("Failed to send birthday email:", err);
      toast("Failed to send birthday wishes: " + (err.detail || err.message));
    } finally {
      setSending(false);
    }
  };

  const getDaysUntil = (birthdayDate) => {
    const today = new Date();
    const birthdayThisYear = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
    const diffTime = birthdayThisYear - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-container">Loading birthday data...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="section-label">Birthdays <span>🎂</span></div>
      
      {/* Today's Birthdays Alert */}
      {todayBirthdays.length > 0 && (
        <div className="today-birthdays-alert">
          <div className="alert-icon">🎉</div>
          <div className="alert-content">
            <h3>{todayBirthdays.length} Birthday{todayBirthdays.length !== 1 ? 's' : ''} Today!</h3>
            <p>{todayBirthdays.map(c => c.name).join(", ")} {todayBirthdays.length === 1 ? 'is' : 'are'} celebrating today!</p>
          </div>
        </div>
      )}
      
      <div className="g2">
        {/* Upcoming Birthdays List */}
        <div className="card">
          <div className="card-title">🎈 Upcoming Birthdays</div>
          {upcomingBirthdays.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>No upcoming birthdays</p>
          ) : (
            upcomingBirthdays.map((c, i) => {
              const daysUntil = getDaysUntil(c.birthday);
              const isToday = daysUntil === 0;
              return (
                <div 
                  key={i} 
                  className={`bday-item ${isToday ? "bday-today" : ""} ${selectedClient?.id === c.id ? "bday-selected" : ""}`}
                  onClick={() => {
                    setSelectedClient(c);
                    setMessage(`Happy Birthday! 🎉 We're so glad you're part of the GymPro family. Enjoy a complimentary training session on us this month!`);
                    setSent(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="bday-avatar">{c.name.split(" ").map(x => x[0]).join("")}</div>
                  <div style={{ flex: 1 }}>
                    <div className="bday-name">{c.name}</div>
                    <div className="bday-date">
                      🎂 {c.birthdayStr}
                      {isToday ? (
                        <span className="bday-today-badge">TODAY!</span>
                      ) : (
                        <span className="bday-days">in {daysUntil} days</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 18 }}>{isToday ? "🎉" : "🎁"}</div>
                </div>
              );
            })
          )}
          <button className="btn btn-ghost btn-sm" onClick={loadBirthdayData} style={{ marginTop: 16, width: "100%" }}>
            ⟳ Refresh
          </button>
        </div>
        
        {/* Send Birthday Message Card */}
        <div className="card">
          <div className="card-title">📨 Send Birthday Message</div>
          
          {!selectedClient ? (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🎂</div>
              <p>Select a client from the list to send birthday wishes</p>
            </div>
          ) : (
            <>
              <div className="selected-client-info">
                <div className="selected-client-avatar">
                  {selectedClient.name.split(" ").map(x => x[0]).join("")}
                </div>
                <div className="selected-client-details">
                  <h4>{selectedClient.name}</h4>
                  <p>{selectedClient.email}</p>
                  <p className="birthday-date">
                    🎂 Birthday: {new Date(selectedClient.birthday).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Birthday Message</label>
                <textarea 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  rows={5}
                  placeholder="Write a personalized birthday message..."
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>
              
              <div className="birthday-message-preview">
                <p className="preview-label">Preview:</p>
                <div className="preview-content">
                  <p>🎂 <strong>Happy Birthday, {selectedClient.name.split(" ")[0]}!</strong></p>
                  <p>{message.slice(0, 150)}...</p>
                </div>
              </div>
              
              <button 
                className="btn btn-cyan" 
                onClick={sendBirthdayWishes} 
                disabled={sending || sent}
                style={{ width: "100%", marginTop: 16, padding: 12 }}
              >
                {sending ? (
                  "Sending... ✉️"
                ) : sent ? (
                  "Sent! ✓"
                ) : (
                  "🎁 Send Birthday Wishes"
                )}
              </button>
              
              {sent && (
                <div className="sent-confirmation">
                  ✓ Birthday message sent to {selectedClient.name}!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCHEDULE PAGE
// ═══════════════════════════════════════════════════════════
const SchedulePage = ({ schedule }) => (
  <div className="page-content">
    <div className="section-label">Sessions <span>Schedule</span></div>
    <div className="card">
      {schedule.map((s, i) => (
        <div key={i} className="schedule-item">
          <div className="sched-time">{s.time}</div>
          <div><div className="sched-title">{s.client}</div><div className="sched-meta">{s.trainer} · {s.type}</div></div>
        </div>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// ORDERS PAGE (with database integration)
// ═══════════════════════════════════════════════════════════
const OrdersPage = ({ orders, setOrders, toast }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const ordersData = await adminAPI.getAdminOrders();
      const pendingOrders = ordersData.filter(o => o.order_status === "pending" || o.order_status === "processing");
      const completedOrders = ordersData.filter(o => o.order_status === "delivered" || o.order_status === "completed");

      setOrders(pendingOrders);
      setHistory(completedOrders.map(o => ({
        id: o.order_reference,
        client: o.client_name,
        items: o.items.map(i => `${i.name} x${i.quantity}`).join(", "),
        amount: o.total,
        status: "Collected",
        date: new Date(o.placed_at).toLocaleDateString()
      })));
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast("Failed to load orders: " + (err.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const markCollected = async (orderId) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { order_status: "delivered" });
      await loadOrders();
      toast(`Order ${orderId} marked as collected`);
    } catch (err) {
      console.error("Failed to update order:", err);
      toast("Failed to update order status");
    }
  };

  return (
    <div className="page-content">
      <div className="section-label">Order <span>Pickups</span></div>
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-ghost" onClick={loadOrders}>⟳ Refresh</button>
      </div>
      <div className="g2">
        <div>
          <div className="card-title" style={{ color: "var(--orange)", marginBottom: 14 }}>⚠ Ready for Pickup</div>
          {orders.filter(o => o.order_status !== "delivered").map(o => (
            <div key={o.order_reference} className="order-alert">
              <div className="order-icon">📦</div>
              <div className="order-info">
                <div className="order-title">{o.order_reference} — {o.client_name}</div>
                <div className="order-detail">
                  📱 {o.client_phone}<br />
                  🛍 {o.items.map(i => `${i.name} x${i.quantity}`).join(", ")}<br />
                  💰 ${o.total} · 📅 {new Date(o.placed_at).toLocaleDateString()}
                  {o.pickup_notes && <><br />📝 {o.pickup_notes}</>}
                </div>
              </div>
              <div className="order-actions">
                <button className="btn btn-green btn-sm" onClick={() => markCollected(o.id)}>✓ Collected</button>
                <button className="btn btn-ghost btn-sm" onClick={() => toast(`Notification sent to ${o.client_name}`)}>📨 Notify</button>
              </div>
            </div>
          ))}
          {orders.filter(o => o.order_status !== "delivered").length === 0 &&
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--muted)" }}>No pending pickups ✓</div>
          }
        </div>
        <div className="card">
          <div className="card-title">📋 Order History</div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Order #</th><th>Client</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {history.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{o.id}</td>
                    <td>{o.client}</td>
                    <td style={{ fontSize: 12 }}>{o.items}</td>
                    <td style={{ color: "var(--green)", fontWeight: 600 }}>${o.amount}</td>
                    <td><Badge cls="badge-green">{o.status}</Badge></td>
                    <td style={{ fontSize: 11 }}>{o.date}</td>
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
// LIVE CHAT PAGE
// ═══════════════════════════════════════════════════════════
const LiveChatPage = () => (
  <div className="page-content">
    <div className="section-label">Live <span>Chat Support</span></div>
    <div className="card">
      <p>Chat support coming soon...</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════
export default function Admin() {
  const [page, setPage] = useState("dashboard");
  const [toastMsg, setToastMsg] = useState("");
  const [clock, setClock] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [assessHistory, setAssessHistory] = useState([]);
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);
  const [clients, setClients] = useState([]);
  const [excursions, setExcursions] = useState([]);
  const [schedule] = useState(INITIAL_SCHEDULE);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ newClients: 0, activeClients: 0, inactiveClients: 0, revenue: 0 });

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleString());
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load trainers from database
      const trainersData = await adminAPI.getAllTrainers();
      setTrainers(trainersData || []);

      // Load clients with status from database
      const clientsData = await adminAPI.getClientsWithStatus();
      setClients(clientsData || []);

      // Calculate stats from actual client data
      const activeCount = clientsData.filter(c => c.status === "Active").length;
      const inactiveCount = clientsData.filter(c => c.status === "Inactive").length;
      const newCount = clientsData.filter(c => c.status === "New").length;

      setStats({
        newClients: newCount,
        activeClients: activeCount,
        inactiveClients: inactiveCount,
        revenue: 48320
      });

      // Load excursions
      const excursionsData = await excursionsAPI.getExcursions();
      setExcursions(excursionsData.excursions || []);

      // Load orders
      const ordersData = await adminAPI.getAdminOrders();
      setOrders(ordersData.filter(o => o.order_status !== "delivered"));

    } catch (err) {
      console.error("Failed to load admin data:", err);
      toast("Failed to load data: " + (err.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }, []);

  const navigate = (p) => setPage(p);

  const pageTitles = {
    dashboard: "DASHBOARD", trainers: "TRAINER ASSESSMENTS", reviews: "CLIENT REVIEWS",
    purchases: "PURCHASES & SALES", equipment: "EQUIPMENT RATINGS", clients: "CLIENT OVERVIEW",
    excursions: "EXCURSIONS", birthdays: "BIRTHDAYS", schedule: "SESSIONS SCHEDULE",
    orders: "ORDER PICKUPS", livechat: "LIVE CHAT SUPPORT",
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage stats={stats} schedule={schedule} reviews={ALL_REVIEWS} orders={orders} />;
      case "trainers": return <TrainersPage trainers={trainers} setTrainers={setTrainers} assessHistory={assessHistory} setAssessHistory={setAssessHistory} toast={toast} onRefresh={loadAllData} />;
      case "reviews": return <ReviewsPage />;
      case "purchases": return <PurchasesPage purchases={purchases} setPurchases={setPurchases} toast={toast} />;
      case "equipment": return <EquipmentPage equipment={equipment} setEquipment={setEquipment} toast={toast} />;
      case "clients": return <ClientsPage clients={clients} setClients={setClients} toast={toast} onRefresh={loadAllData} />;
      case "excursions": return <ExcursionsPage excursions={excursions} setExcursions={setExcursions} toast={toast} />;
      case "birthdays": return <BirthdaysPage clients={clients} />;
      case "schedule": return <SchedulePage schedule={schedule} />;
      case "orders": return <OrdersPage orders={orders} setOrders={setOrders} toast={toast} />;
      case "livechat": return <LiveChatPage />;
      default: return null;
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="app-shell">
        <div className="loading-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-logo"><span>⚡</span> GYMPRO</div>
        {NAV_ITEMS.map((item, i) => {
          if (item.section) return <div key={i} className="nav-section">{item.section}</div>;
          return (
            <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </div>
          );
        })}
      </nav>

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{pageTitles[page] || page.toUpperCase()}</div>
          <div className="topbar-right">
            <span className="topbar-time">{clock}</span>
            <span className="admin-tag">ADMIN ACCESS</span>
            <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
        {renderPage()}
      </div>

      <Toast message={toastMsg} />
    </div>
  );
}