import { useState, useEffect, useRef, useCallback } from "react";
import "./Admin.css";
import { authAPI, accountAPI, progressAPI, excursionsAPI, adminAPI, gradesAPI } from "../../api/api";

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
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [addForm, setAddForm] = useState({ firstName: "", lastName: "", role: "Trainer", certDate: "", experience: "", email: "", password: "", expertise: "Strength", photo: null, photoPreview: null });
  const [editTrainer, setEditTrainer] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [confirmDeleteTrainer, setConfirmDeleteTrainer] = useState(null);
  const [gradeLog, setGradeLog] = useState({});
  const [overviewTrainer, setOverviewTrainer] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Load all trainer assessments on mount
  useEffect(() => {
    const loadAllAssessments = async () => {
      if (!trainers || trainers.length === 0) return;
      
      const assessmentsByTrainer = {};
      for (const trainer of trainers) {
        try {
          const assessments = await adminAPI.getTrainerAssessments(trainer.id);
          assessmentsByTrainer[trainer.id] = assessments;
        } catch (err) {
          console.error(`Failed to load assessments for trainer ${trainer.name}:`, err);
          assessmentsByTrainer[trainer.id] = [];
        }
      }
      setTrainerAssessments(assessmentsByTrainer);
    };

    loadAllAssessments();
  }, [trainers]);

  // Load overview data when trainer is selected
  useEffect(() => {
    const loadOverviewData = async () => {
      if (!overviewTrainer) {
        setOverviewData(null);
        return;
      }

      setLoadingOverview(true);
      try {
        const data = await getGradeOverview(overviewTrainer);
        setOverviewData(data);
      } catch (err) {
        console.error("Failed to load overview data:", err);
        setOverviewData(null);
      } finally {
        setLoadingOverview(false);
      }
    };

    loadOverviewData();
  }, [overviewTrainer]);

  // Load gradeLog from localStorage on mount so it persists across sessions
  useEffect(() => {
    const savedGradeLog = localStorage.getItem('gradeLog');
    if (savedGradeLog) {
      try {
        setGradeLog(JSON.parse(savedGradeLog));
      } catch (err) {
        console.error("Failed to parse grade log from localStorage:", err);
        setGradeLog({});
      }
    }
  }, []);

  // Save grade log to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gradeLog', JSON.stringify(gradeLog));
  }, [gradeLog]);

  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 5;
  const standing = getStanding(avg.toFixed(1));

  const getGradeStatus = (trainer) => {
    const trainerId = trainer.id;
    const log = gradeLog[trainerId];
    if (!log) return { canGrade: true, canEdit: false, label: "Grade Trainer" };
    const graded = new Date(log.date);
    const now = new Date();
    const hoursDiff = (now - graded) / (1000 * 60 * 60);
    const sameMonth = graded.getMonth() === now.getMonth() && graded.getFullYear() === now.getFullYear();
    
    // Senior trainers only need 1 assessment per month (admin only)
    // Regular trainers need 3 assessments per month (1 admin + 2 senior trainers)
    if (trainer.is_senior) {
      if (sameMonth && hoursDiff > 24) return { canGrade: false, canEdit: false, label: "Graded This Month" };
      if (sameMonth && hoursDiff <= 24) return { canGrade: true, canEdit: true, label: "Edit Grade" };
    } else {
      // For regular trainers, check if they have all required assessments
      const assessments = trainerAssessments[trainerId] || [];
      const currentMonthAssessments = assessments.filter(a => {
        const assessmentDate = new Date(a.assessment_date);
        return assessmentDate.getMonth() === now.getMonth() && 
               assessmentDate.getFullYear() === now.getFullYear();
      });
      
      if (currentMonthAssessments.length >= 3) {
        return { canGrade: false, canEdit: false, label: "Fully Assessed" };
      }
      
      if (sameMonth && hoursDiff > 24) {
        return { canGrade: true, canEdit: false, label: "Add Assessment" };
      }
      if (sameMonth && hoursDiff <= 24) {
        return { canGrade: true, canEdit: true, label: "Edit Assessment" };
      }
    }
    
    return { canGrade: true, canEdit: false, label: "Grade Trainer" };
  };

  const openAssess = async (t) => {
    const status = getGradeStatus(t);
    if (!status.canGrade) { 
      toast("This trainer has already been graded this month."); 
      return; 
    }
    // Set default scores - use existing rating or defaults
    setScores({ 
      perf: t.rating || 7, 
      motiv: 7, 
      interact: 7, 
      knowledge: 7, 
      punct: 7 
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
    const a = parseFloat(avg.toFixed(1));
    const s = getStanding(a);
    const now = new Date();
    const assessmentDate = now.toISOString().split('T')[0];
    
    // Persist to backend first
    try {
      const backendPayload = {
        trainer_id: assessTrainer.id,
        trainer_name: assessTrainer.name,
        scores: {
          perf: scores.perf,
          motiv: scores.motiv,
          interact: scores.interact,
          knowledge: scores.knowledge,
          punct: scores.punct
        },
        average: a,
        standing: s.label,
        notes: ""
      };
      
      console.log('Saving assessment payload:', backendPayload);
      await adminAPI.saveTrainerAssessment(backendPayload);
      
      // Refresh assessments from backend to get the latest data
      const updatedAssessments = await adminAPI.getTrainerAssessments(assessTrainer.id);
      setTrainerAssessments(prev => ({ ...prev, [assessTrainer.id]: updatedAssessments }));
      
      // Update grade log for timing purposes only
      setGradeLog(prev => ({ ...prev, [assessTrainer.id]: { date: now.toISOString() } }));
      
      // Update trainer rating locally from backend response
      setTrainers(prev => prev.map(t => t.id === assessTrainer.id ? { ...t, rating: a } : t));
      
      toast(`Assessment for ${assessTrainer.name} saved — Avg: ${a}`);
      setAssessTrainer(null);
      
      // Refresh trainers data to get updated ratings
      await onRefresh();
    } catch (err) {
      console.error("Backend save failed:", err);
      toast("Failed to save assessment: " + (err.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const submitAddTrainer = async () => {
    if (!addForm.firstName.trim() || !addForm.lastName.trim()) { toast("Please enter first and last name"); return; }
    if (!addForm.email.trim()) { toast("Please enter an email address"); return; }
    if (!addForm.password.trim()) { toast("Please enter a password"); return; }
    
    setLoading(true);
    try {
      const newTrainer = {
        firstName: addForm.firstName.trim(),
        lastName: addForm.lastName.trim(),
        email: addForm.email.trim(),
        password: addForm.password,
        role: addForm.role,
        experience: parseInt(addForm.experience) || 0,
        expertise: addForm.expertise,
        certDate: addForm.certDate
      };
      
      // Try to save to backend
      const result = await adminAPI.createTrainer(newTrainer);
      toast(`Trainer ${newTrainer.firstName} ${newTrainer.lastName} added successfully`);
      
      // Refresh trainers list
      await onRefresh();
    } catch (err) {
      console.error("Failed to add trainer:", err);
      toast("Failed to add trainer: " + (err.detail || err.message));
    } finally {
      setLoading(false);
      setShowAddTrainer(false);
      setAddForm({ firstName: "", lastName: "", role: "Trainer", certDate: "", experience: "", email: "", password: "", expertise: "Strength", photo: null, photoPreview: null });
    }
  };

  const openEditTrainer = (t) => {
    const nameParts = (t.name || "").split(" ");
    setEditForm({
      id: t.id,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      role: t.certification || "Trainer",
      certDate: t.certification_date || "",
      experience: t.experience_years || "",
      email: t.email || "",
      expertise: t.specialties?.[0] || "Strength",
      photoPreview: t.profile_image || null,
    });
    setEditTrainer(t);
  };

  const submitEditTrainer = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) { toast("Please enter first and last name"); return; }
    if (!editForm.email.trim()) { toast("Please enter an email address"); return; }
    
    setLoading(true);
    try {
      const updatedData = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        experience: parseInt(editForm.experience) || 0,
        expertise: editForm.expertise
      };
      
      await adminAPI.updateTrainer(editTrainer.id, updatedData);
      toast(`Trainer updated successfully`);
      await onRefresh();
    } catch (err) {
      console.error("Failed to update trainer:", err);
      toast("Failed to update trainer: " + (err.detail || err.message));
    } finally {
      setLoading(false);
      setEditTrainer(null);
      setEditForm({});
    }
  };

  const deleteTrainer = async (t) => {
    setLoading(true);
    try {
      await adminAPI.deleteTrainer(t.id);
      setTrainers(prev => prev.filter(tr => tr.id !== t.id));
      setAssessHistory(prev => prev.filter(a => a.trainer !== t.name));
      toast(`Trainer ${t.name} removed`);
    } catch (err) {
      console.error("Failed to delete trainer:", err);
      toast("Failed to delete trainer: " + (err.detail || err.message));
    } finally {
      setLoading(false);
      setConfirmDeleteTrainer(null);
    }
  };

  // Build history from backend assessments only (to avoid duplicates)
  const allHistory = Object.values(trainerAssessments).flat().map(a => {
    return {
      trainer: a.trainer_name || a.trainer_id,
      perf: a.performance_score,
      motiv: a.motivation_score,
      interact: a.interaction_score,
      knowledge: a.knowledge_score,
      punct: a.punctuality_score,
      avg: a.average_score,
      standing: a.standing,
      assessor_role: a.assessor_role || 'admin', // Add fallback back to prevent undefined issues
      assessor_name: a.assessor_name || 'Unknown',
      assessment_date: a.assessment_date,
      month: new Date(a.assessment_date).toLocaleString("default", { month: "long", year: "numeric" }),
      date: new Date(a.assessment_date).toLocaleDateString()
    };
  });

  const historyByMonth = {};
  allHistory.forEach(a => {
    const m = a.month || "Unknown";
    if (!historyByMonth[m]) historyByMonth[m] = [];
    historyByMonth[m].push(a);
  });

  const getGradeOverview = async (t) => {
    // Get all assessments for this trainer from admin system
    const tAssessments = allHistory.filter(h => h.trainer === t.name);
    
    // Also fetch senior trainer grades from grades system
    let seniorGradesFromAPI = [];
    try {
      console.log('Fetching grades for trainer:', t.name, 'ID:', t.id);
      const gradesData = await gradesAPI.getGradesForTrainer(t.id);
      console.log('Grades API response:', gradesData);
      if (gradesData && gradesData.grades && Array.isArray(gradesData.grades)) {
        // Convert grades data to match assessment format
        seniorGradesFromAPI = gradesData.grades
          .filter(gradeData => {
            // Only include May grades (month 4) for demo
            const isMay = gradeData.month_index === 4;
            const isFinalised = gradeData.finalised;
            console.log(`Month ${gradeData.month_index}: May=${isMay}, Finalised=${isFinalised}`);
            return isMay && isFinalised;
          })
          .map(gradeData => ({
            trainer: t.name,
            perf: gradeData.scores?.performance || 0,
            motiv: gradeData.scores?.motivation || 0,
            interact: gradeData.scores?.interaction || 0,
            knowledge: gradeData.scores?.knowledge || 0,
            punct: gradeData.scores?.punctuality || 0,
            avg: gradeData.overall_avg || Object.values(gradeData.scores || {}).reduce((a, b) => a + b, 0) / 5,
            standing: gradeData.overall_avg >= 8.5 ? "Excellent" : gradeData.overall_avg >= 6 ? "Good" : "Needs Work",
            assessor_role: 'senior_trainer',
            assessor_name: 'Senior Trainer', // We could get actual name from user data
            assessment_date: new Date(gradeData.submitted_at).toISOString().split('T')[0],
            month: new Date(gradeData.submitted_at).toLocaleString("default", { month: "long", year: "numeric" }),
            date: new Date(gradeData.submitted_at).toLocaleDateString()
          }));
      }
    } catch (err) {
      console.error("Failed to load senior trainer grades:", err);
    }
    
    // Combine admin assessments with senior trainer grades
    const allAssessmentsCombined = [...tAssessments, ...seniorGradesFromAPI];
    console.log('Combined assessments:', allAssessmentsCombined);
    
    // Separate assessments by role
    const seniorAssessments = allAssessmentsCombined.filter(h => h.assessor_role === 'senior_trainer');
    const adminAssessments = allAssessmentsCombined.filter(h => h.assessor_role === 'admin');
    console.log('Senior assessments:', seniorAssessments);
    console.log('Admin assessments:', adminAssessments);
    
    // Get the most recent assessments (sorted by date)
    const sortedSenior = seniorAssessments.sort((a, b) => new Date(a.assessment_date) - new Date(b.assessment_date));
    const sortedAdmin = adminAssessments.sort((a, b) => new Date(a.assessment_date) - new Date(b.assessment_date));
    
    // Get the scores (use most recent from each category)
    const st1Avg = sortedSenior.length > 0 ? parseFloat(sortedSenior[sortedSenior.length - 1]?.avg) : null;
    const st2Avg = sortedSenior.length > 1 ? parseFloat(sortedSenior[sortedSenior.length - 2]?.avg) : null;
    const adminAvg = sortedAdmin.length > 0 ? parseFloat(sortedAdmin[sortedAdmin.length - 1]?.avg) : null;
    
    // Only use actual assessments, no fallbacks for missing senior trainer assessments
    const raterScores = [st1Avg, st2Avg, adminAvg].filter(v => v !== null && v > 0);
    const weights = raterScores.length === 3 ? [0.25, 0.25, 0.50] : raterScores.length === 2 ? [0.50, 0.50] : [1.00];
    const weightedAvg = raterScores.length ? +(raterScores.reduce((s, v, i) => s + v * weights[i], 0)).toFixed(2) : null;
    const stdDev = raterScores.length >= 2
      ? +(Math.sqrt(raterScores.reduce((s, v) => { const m = raterScores.reduce((a, b) => a + b, 0) / raterScores.length; return s + (v - m) ** 2; }, 0) / raterScores.length)).toFixed(2)
      : null;
    
    // Get assessor names for display
    const st1Assessor = sortedSenior.length > 0 ? sortedSenior[sortedSenior.length - 1]?.assessor_name : null;
    const st2Assessor = sortedSenior.length > 1 ? sortedSenior[sortedSenior.length - 2]?.assessor_name : null;
    const adminAssessor = sortedAdmin.length > 0 ? sortedAdmin[sortedAdmin.length - 1]?.assessor_name : null;
    
    return { st1Avg, st2Avg, adminAvg, weightedAvg, stdDev, st1Name: st1Assessor, st2Name: st2Assessor, adminName: adminAssessor };
  };

  const gradeColor = (s) => {
    if (!s || s === 0) return "var(--muted)";
    if (s >= 8.5) return "var(--green)";
    if (s >= 6)   return "var(--orange)";
    return "var(--red)";
  };

  const gradeLabel = (s) => {
    if (!s || s === 0) return "Not Graded";
    if (s >= 8.5) return "Excellent";
    if (s >= 6)   return "Good";
    return "Needs Work";
  };

  const sdColor = (sd) => sd === null ? "var(--muted)" : sd < 1 ? "var(--green)" : sd <= 2 ? "#F59E0B" : "var(--red)";
  const sdMsg = (sd) => sd === null ? "—" : sd < 1 ? "Raters are in agreement" : sd <= 2 ? "Raters slightly disagree" : "Raters strongly disagree";

  const EXPERTISE_OPTIONS = ["Strength", "Power Lifting", "Olympic Lifting", "HIIT & Conditioning", "Mobility & Recovery"];

  const handlePhotoChange = (e, formSetter) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => formSetter(prev => ({ ...prev, photo: file, photoPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const addTrainerModalJSX = showAddTrainer ? (
    <Modal title="Add <span style='color:var(--cyan)'>New Trainer</span>" onClose={() => setShowAddTrainer(false)}>
      {/* Photo Upload */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: addForm.photoPreview ? "transparent" : "var(--bg3, #1e1e1e)",
            border: "2px dashed var(--cyan)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", fontSize: addForm.photoPreview ? 0 : 28
          }}>
            {addForm.photoPreview
              ? <img src={addForm.photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "📷"}
          </div>
          <span style={{ fontSize: 10, letterSpacing: 1, color: "var(--cyan)", fontFamily: "'JetBrains Mono',monospace" }}>
            {addForm.photoPreview ? "CHANGE PHOTO" : "UPLOAD PHOTO"}
          </span>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handlePhotoChange(e, setAddForm)} />
        </label>
      </div>
      {/* Name Row */}
      <div className="form-row">
        <div className="form-group"><label>First Name</label><input value={addForm.firstName} onChange={e => setAddForm(p => ({ ...p, firstName: e.target.value }))} placeholder="First name" /></div>
        <div className="form-group"><label>Last Name</label><input value={addForm.lastName} onChange={e => setAddForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Last name" /></div>
      </div>
      {/* Email & Password */}
      <div className="form-row">
        <div className="form-group"><label>Email</label><input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} placeholder="trainer@gym.com" /></div>
        <div className="form-group"><label>Password</label><input type="password" value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} placeholder="Set password" /></div>
      </div>
      {/* Role & Expertise */}
      <div className="form-row">
        <div className="form-group"><label>Role</label>
          <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}>
            <option value="Trainer">Trainer</option>
            <option value="Senior Trainer">Senior Trainer</option>
          </select>
        </div>
        <div className="form-group"><label>Expertise</label>
          <select value={addForm.expertise} onChange={e => setAddForm(p => ({ ...p, expertise: e.target.value }))}>
            {EXPERTISE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>
      {/* Cert Date & Experience */}
      <div className="form-row">
        <div className="form-group"><label>Certification Date</label><input type="date" value={addForm.certDate} onChange={e => setAddForm(p => ({ ...p, certDate: e.target.value }))} /></div>
        <div className="form-group"><label>Experience (yrs)</label><input type="number" min="0" max="50" value={addForm.experience} onChange={e => setAddForm(p => ({ ...p, experience: e.target.value }))} placeholder="Years of experience" /></div>
      </div>
      <button className="btn btn-cyan" style={{ width: "100%", marginTop: 16, padding: 12 }} onClick={submitAddTrainer}>Add Trainer</button>
    </Modal>
  ) : null;

  const editTrainerModalJSX = editTrainer ? (
    <Modal title={`Edit <span style='color:var(--cyan)'>${editTrainer.name}</span>`} onClose={() => setEditTrainer(null)}>
      {/* Photo Upload */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: editForm.photoPreview ? "transparent" : "var(--bg3, #1e1e1e)",
            border: "2px dashed var(--cyan)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", fontSize: editForm.photoPreview ? 0 : 28
          }}>
            {editForm.photoPreview
              ? <img src={editForm.photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "📷"}
          </div>
          <span style={{ fontSize: 10, letterSpacing: 1, color: "var(--cyan)", fontFamily: "'JetBrains Mono',monospace" }}>
            {editForm.photoPreview ? "CHANGE PHOTO" : "UPLOAD PHOTO"}
          </span>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handlePhotoChange(e, setEditForm)} />
        </label>
      </div>
      {/* Name Row */}
      <div className="form-row">
        <div className="form-group"><label>First Name</label><input value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} placeholder="First name" /></div>
        <div className="form-group"><label>Last Name</label><input value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Last name" /></div>
      </div>
      {/* Email */}
      <div className="form-group"><label>Email</label><input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} placeholder="trainer@gym.com" /></div>
      {/* Role & Expertise */}
      <div className="form-row">
        <div className="form-group"><label>Role</label>
          <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
            <option value="Trainer">Trainer</option>
            <option value="Senior Trainer">Senior Trainer</option>
          </select>
        </div>
        <div className="form-group"><label>Expertise</label>
          <select value={editForm.expertise} onChange={e => setEditForm(p => ({ ...p, expertise: e.target.value }))}>
            {EXPERTISE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>
      {/* Cert Date & Experience */}
      <div className="form-row">
        <div className="form-group"><label>Certification Date</label><input type="date" value={editForm.certDate} onChange={e => setEditForm(p => ({ ...p, certDate: e.target.value }))} /></div>
        <div className="form-group"><label>Experience (yrs)</label><input type="number" min="0" max="50" value={editForm.experience} onChange={e => setEditForm(p => ({ ...p, experience: e.target.value }))} placeholder="Years of experience" /></div>
      </div>
      <button className="btn btn-cyan" style={{ width: "100%", marginTop: 16, padding: 12 }} onClick={submitEditTrainer}>Save Changes</button>
    </Modal>
  ) : null;

  const deleteConfirmModalJSX = confirmDeleteTrainer && confirmDeleteTrainer !== "select" ? (
    <Modal title={`Delete <span style='color:var(--red)'>${confirmDeleteTrainer.name}</span>?`} onClose={() => setConfirmDeleteTrainer(null)}>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>
        This will permanently remove <strong style={{ color: "var(--off-white)" }}>{confirmDeleteTrainer.name}</strong> and all their assessment history. This action cannot be undone.
      </p>
      {confirmDeleteTrainer.photo && (
        <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
          <img src={confirmDeleteTrainer.photo} alt={confirmDeleteTrainer.name} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--red)", opacity: 0.8 }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button className="btn btn-ghost" style={{ flex: 1, padding: 12 }} onClick={() => setConfirmDeleteTrainer(null)}>Cancel</button>
        <button
          className="btn"
          style={{ flex: 1, padding: 12, background: "rgba(255,92,92,0.15)", color: "var(--red)", border: "1px solid rgba(255,92,92,0.5)", fontFamily: "var(--font-condensed)", letterSpacing: 1, fontWeight: 700 }}
          onClick={() => deleteTrainer(confirmDeleteTrainer)}
        >
          🗑 Confirm Delete
        </button>
      </div>
    </Modal>
  ) : null;

  if (!trainers || trainers.length === 0) {
    return (
      <div className="page-content">
        <div className="section-label">Trainer <span>Assessments</span></div>
        <div className="card">
          <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>No trainers found in database.</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button className="btn btn-cyan btn-sm" onClick={() => setShowAddTrainer(true)}>+ Add Trainer</button>
            <button className="btn btn-green btn-sm" onClick={onRefresh}>⟳ Refresh</button>
          </div>
        </div>
        {addTrainerModalJSX}
        {editTrainerModalJSX}
        {deleteConfirmModalJSX}
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="section-label">Trainer <span>Assessments</span></div>
      <div className="g2">
        {/* Trainer list column */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: 2, color: "var(--cyan)" }}>
              Select Trainer to Assess
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-cyan btn-sm" onClick={() => setShowAddTrainer(true)}>+ Add Trainer</button>
              <button className="btn btn-sm" style={{ background: confirmDeleteTrainer === "select" ? "rgba(255,92,92,0.25)" : "rgba(255,92,92,0.12)", color: "var(--red)", border: `1px solid ${confirmDeleteTrainer === "select" ? "rgba(255,92,92,0.7)" : "rgba(255,92,92,0.35)"}`, fontFamily: "var(--font-condensed)", fontSize: 11, letterSpacing: 1 }} onClick={() => setConfirmDeleteTrainer(confirmDeleteTrainer === "select" ? null : "select")}>
                {confirmDeleteTrainer === "select" ? "✕ Cancel" : "🗑 Delete Trainer"}
              </button>
              <button className="btn btn-green btn-sm" onClick={onRefresh}>⟳ Refresh</button>
            </div>
          </div>
          
          {confirmDeleteTrainer === "select" && (
            <div style={{ marginBottom: 12, padding: "8px 12px", background: "rgba(255,92,92,0.08)", border: "1px solid rgba(255,92,92,0.25)", borderRadius: 6, fontSize: 11, color: "var(--red)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5 }}>
              ⚠ SELECT A TRAINER BELOW TO DELETE
            </div>
          )}
          
          {trainers.map(t => {
            const a = t.rating || 0;
            const s = getStanding(a);
            const status = getGradeStatus(t);
            return (
              <div key={t.id} className="trainer-assess-card">
                <div className="trainer-avatar" style={{
                  background: t.profile_image ? "transparent" : "var(--bg3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: t.profile_image ? 0 : 24, overflow: "hidden"
                }}>
                  {t.profile_image
                    ? <img src={t.profile_image} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (t.name?.charAt(0) || "T")}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="trainer-card-name">{t.name}</div>
                  <div className="trainer-card-sub">{t.certification || "Certified Trainer"} · Level {t.trainer_level || 1}</div>
                  {t.specialties && t.specialties[0] && (
                    <span style={{ display: "inline-block", marginTop: 4, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, color: "var(--orange)", background: "rgba(242,101,34,0.12)", border: "1px solid rgba(242,101,34,0.3)", borderRadius: 3, padding: "2px 6px" }}>
                      {t.specialties[0].toUpperCase()}
                    </span>
                  )}
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 10, letterSpacing: 1 }} onClick={() => setOverviewTrainer(t)}>
                      📊 Grade Overview
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 10, letterSpacing: 1, color: "var(--cyan)", borderColor: "rgba(0,168,204,0.35)" }} onClick={() => openEditTrainer(t)}>
                      ✏️ Edit
                    </button>
                    {confirmDeleteTrainer === "select" && (
                      <button className="btn btn-sm" style={{ fontSize: 10, letterSpacing: 1, color: "var(--red)", background: "rgba(255,92,92,0.1)", border: "1px solid rgba(255,92,92,0.4)" }} onClick={() => setConfirmDeleteTrainer(t)}>
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <div className="trainer-score" style={{ color: a >= 7 ? "var(--green)" : a >= 5 ? "var(--orange)" : "var(--red)" }}>{a || "—"}</div>
                  <Badge cls={s.cls}>{s.label}</Badge>
                  <button
                    className={`btn btn-sm ${status.canGrade ? "btn-grade" : "btn-ghost"}`}
                    onClick={() => status.canGrade && openAssess(t)}
                    disabled={!status.canGrade}
                  >
                    {status.canEdit ? "✏️ " : "⭐ "}{status.label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* History column */}
        <div className="card">
          <div className="card-title">📋 Assessment History</div>
          {Object.keys(historyByMonth).length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>No assessments yet</p>
          ) : (
            Object.entries(historyByMonth).map(([month, entries]) => (
              <div key={month} style={{ marginBottom: 20 }}>
                <div className="assess-month-label">{month}</div>
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr><th>Trainer</th><th>Perf</th><th>Motiv</th><th>Interact</th><th>Know</th><th>Punct</th><th>Avg</th><th>Standing</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {entries.map((a, i) => {
                        const st = getStanding(a.avg);
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{a.trainer}</td>
                            <td>{a.perf}</td>
                            <td>{a.motiv}</td>
                            <td>{a.interact}</td>
                            <td>{a.knowledge || "—"}</td>
                            <td>{a.punct || "—"}</td>
                            <td style={{ fontWeight: 700, color: "var(--cyan)" }}>{a.avg}</td>
                            <td><Badge cls={st.cls}>{st.label}</Badge></td>
                            <td style={{ fontSize: 11 }}>{a.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals - keep your existing modal JSX */}
      {showAddTrainer && (
        <Modal title="Add <span style='color:var(--cyan)'>New Trainer</span>" onClose={() => setShowAddTrainer(false)}>
          {/* Keep your existing add trainer form JSX */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: addForm.photoPreview ? "transparent" : "var(--bg3, #1e1e1e)",
                border: "2px dashed var(--cyan)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", fontSize: addForm.photoPreview ? 0 : 28
              }}>
                {addForm.photoPreview
                  ? <img src={addForm.photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : "📷"}
              </div>
              <span style={{ fontSize: 10, letterSpacing: 1, color: "var(--cyan)", fontFamily: "'JetBrains Mono',monospace" }}>
                {addForm.photoPreview ? "CHANGE PHOTO" : "UPLOAD PHOTO"}
              </span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handlePhotoChange(e, setAddForm)} />
            </label>
          </div>
          <div className="form-row">
            <div className="form-group"><label>First Name</label><input value={addForm.firstName} onChange={e => setAddForm(p => ({ ...p, firstName: e.target.value }))} placeholder="First name" /></div>
            <div className="form-group"><label>Last Name</label><input value={addForm.lastName} onChange={e => setAddForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Last name" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Email</label><input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} placeholder="trainer@gym.com" /></div>
            <div className="form-group"><label>Password</label><input type="password" value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} placeholder="Set password" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Role</label>
              <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}>
                <option value="Trainer">Trainer</option>
                <option value="Senior Trainer">Senior Trainer</option>
              </select>
            </div>
            <div className="form-group"><label>Expertise</label>
              <select value={addForm.expertise} onChange={e => setAddForm(p => ({ ...p, expertise: e.target.value }))}>
                {EXPERTISE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Certification Date</label><input type="date" value={addForm.certDate} onChange={e => setAddForm(p => ({ ...p, certDate: e.target.value }))} /></div>
            <div className="form-group"><label>Experience (yrs)</label><input type="number" min="0" max="50" value={addForm.experience} onChange={e => setAddForm(p => ({ ...p, experience: e.target.value }))} placeholder="Years of experience" /></div>
          </div>
          <button className="btn btn-cyan" style={{ width: "100%", marginTop: 16, padding: 12 }} onClick={submitAddTrainer} disabled={loading}>
            {loading ? "Adding..." : "Add Trainer"}
          </button>
        </Modal>
      )}

      {editTrainer && (
        <Modal title={`Edit <span style='color:var(--cyan)'>${editTrainer.name}</span>`} onClose={() => setEditTrainer(null)}>
          {/* Edit trainer form JSX */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: editForm.photoPreview ? "transparent" : "var(--bg3, #1e1e1e)",
                border: "2px dashed var(--cyan)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", fontSize: editForm.photoPreview ? 0 : 28
              }}>
                {editForm.photoPreview
                  ? <img src={editForm.photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : "📷"}
              </div>
              <span style={{ fontSize: 10, letterSpacing: 1, color: "var(--cyan)", fontFamily: "'JetBrains Mono',monospace" }}>
                {editForm.photoPreview ? "CHANGE PHOTO" : "UPLOAD PHOTO"}
              </span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handlePhotoChange(e, setEditForm)} />
            </label>
          </div>
          <div className="form-row">
            <div className="form-group"><label>First Name</label><input value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} /></div>
            <div className="form-group"><label>Last Name</label><input value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label>Email</label><input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} /></div>
          <div className="form-row">
            <div className="form-group"><label>Role</label>
              <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                <option value="Trainer">Trainer</option>
                <option value="Senior Trainer">Senior Trainer</option>
              </select>
            </div>
            <div className="form-group"><label>Expertise</label>
              <select value={editForm.expertise} onChange={e => setEditForm(p => ({ ...p, expertise: e.target.value }))}>
                {EXPERTISE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Certification Date</label><input type="date" value={editForm.certDate} onChange={e => setEditForm(p => ({ ...p, certDate: e.target.value }))} /></div>
            <div className="form-group"><label>Experience (yrs)</label><input type="number" min="0" max="50" value={editForm.experience} onChange={e => setEditForm(p => ({ ...p, experience: e.target.value }))} /></div>
          </div>
          <button className="btn btn-cyan" style={{ width: "100%", marginTop: 16, padding: 12 }} onClick={submitEditTrainer} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </Modal>
      )}

      {confirmDeleteTrainer && confirmDeleteTrainer !== "select" && (
        <Modal title={`Delete <span style='color:var(--red)'>${confirmDeleteTrainer.name}</span>?`} onClose={() => setConfirmDeleteTrainer(null)}>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>
            This will permanently remove <strong style={{ color: "var(--off-white)" }}>{confirmDeleteTrainer.name}</strong> and all their assessment history. This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn btn-ghost" style={{ flex: 1, padding: 12 }} onClick={() => setConfirmDeleteTrainer(null)}>Cancel</button>
            <button className="btn" style={{ flex: 1, padding: 12, background: "rgba(255,92,92,0.15)", color: "var(--red)", border: "1px solid rgba(255,92,92,0.5)", fontFamily: "var(--font-condensed)", letterSpacing: 1, fontWeight: 700 }} onClick={() => deleteTrainer(confirmDeleteTrainer)}>
              🗑 Confirm Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Grade Overview Modal */}
      {overviewTrainer && (() => {
        if (loadingOverview) {
          return (
            <Modal title={`Grade Overview: <span style="color:var(--cyan)">${overviewTrainer.name}</span>`} onClose={() => setOverviewTrainer(null)}>
              <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                Loading grade data...
              </div>
            </Modal>
          );
        }

        if (!overviewData) {
          return (
            <Modal title={`Grade Overview: <span style="color:var(--cyan)">${overviewTrainer.name}</span>`} onClose={() => setOverviewTrainer(null)}>
              <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                Failed to load grade data.
              </div>
            </Modal>
          );
        }

        const { st1Avg, st2Avg, adminAvg, weightedAvg, stdDev, st1Name, st2Name, adminName } = overviewData;
        const wc = gradeColor(weightedAvg);
        const sd = sdColor(stdDev);
        const RaterLine = ({ label, score, name }) => (
          <div className="admin-rater-row">
            <span className="admin-rater-label">{label}</span>
            {score !== null && score > 0 ? (
              <>
                <div className="admin-rater-bar-track">
                  <div className="admin-rater-bar-fill" style={{ width: `${score * 10}%`, background: gradeColor(score) }} />
                </div>
                <span className="admin-rater-val" style={{ color: gradeColor(score) }}>{score.toFixed(2)}</span>
                <span className="admin-rater-badge" style={{ background: `${gradeColor(score)}22`, color: gradeColor(score), border: `1px solid ${gradeColor(score)}55` }}>
                  {gradeLabel(score)}
                </span>
                {name && <span className="admin-rater-name" style={{ fontSize: 10, color: "var(--muted)", marginLeft: 8 }}>{name}</span>}
              </>
            ) : (
              <span className="admin-rater-none" style={{ gridColumn: "2 / -1" }}>Not graded</span>
            )}
          </div>
        );
        return (
          <Modal title={`Grade Overview: <span style="color:var(--cyan)">${overviewTrainer.name}</span>`} onClose={() => setOverviewTrainer(null)}>
            <div style={{ marginBottom: 6 }}>
              <div className="admin-grade-overview-label">Contributing Grades</div>
              <div className="admin-raters">
                {st1Avg !== null && <RaterLine label={`1 · Senior Trainer${st1Name ? ` (${st1Name})` : ''}`} score={st1Avg} />}
                {st2Avg !== null && <RaterLine label={`2 · Senior Trainer${st2Name ? ` (${st2Name})` : ''}`} score={st2Avg} />}
                {adminAvg !== null && <RaterLine label={`3 · Admin${adminName ? ` (${adminName})` : ''}`} score={adminAvg} />}
              </div>
            </div>
            <div className="admin-grade-key" style={{ marginBottom: 14 }}>
              <span><span className="admin-key-dot" style={{ background: "#22C55E" }} />&gt;= 8.5 Excellent</span>
              <span><span className="admin-key-dot" style={{ background: "#F59E0B" }} />6–8.4 Good</span>
              <span><span className="admin-key-dot" style={{ background: "#EF4444" }} />&lt; 6 Needs Work</span>
              <span><span className="admin-key-dot" style={{ background: "#EF4444" }} />Below 6 Needs Work</span>
            </div>
            <div className="admin-overview-divider" />
            <div style={{ marginBottom: 16 }}>
              <div className="admin-overview-sub-label">
                Overall Weighted Avg <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 10 }}>· ST1 25% · ST2 25% · Admin 50%</span>
              </div>
              {weightedAvg !== null ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 38, color: wc, letterSpacing: 2 }}>{weightedAvg.toFixed(2)}</span>
                  <span style={{ fontFamily: "var(--font-condensed)", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: wc }}>{gradeLabel(weightedAvg)}</span>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: wc, display: "inline-block" }} />
                </div>
              ) : <span style={{ color: "var(--muted)", fontSize: 13 }}>No data yet — grade this trainer first.</span>}
            </div>
            <div className="admin-overview-divider" />
            <div>
              <div className="admin-overview-sub-label">Standard Deviation</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 38, color: sd, letterSpacing: 2 }}>
                  {stdDev !== null ? stdDev.toFixed(2) : "—"}
                </span>
                <span className="admin-sd-agree" style={{ color: sd, borderColor: `${sd}55`, background: `${sd}15` }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: sd, display: "inline-block", marginRight: 6 }} />
                  {sdMsg(stdDev)}
                </span>
              </div>
              <div className="admin-grade-key" style={{ marginTop: 10 }}>
                <span><span className="admin-key-dot" style={{ background: "#22C55E" }} />&lt; 1 — In agreement</span>
                <span><span className="admin-key-dot" style={{ background: "#F59E0B" }} />1–2 — Slightly disagree</span>
                <span><span className="admin-key-dot" style={{ background: "#EF4444" }} />&gt; 2 — Strongly disagree</span>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Assessment Modal */}
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
    setEditForm({
      id: c.id,
      name: c.name || "",
      email: c.email || "",
      phone_number: c.phone_number || "",
      status: c.status || "Active",
      membership_plan: c.membership_plan || "Standard",
      fitness_goal: c.fitness_goal || "General Fitness",
      progress_percentage: c.progress_percentage || 0
    });
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      // Only send the fields that should be updated
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone_number: editForm.phone_number,
        status: editForm.status,
        membership_plan: editForm.membership_plan,
        fitness_goal: editForm.fitness_goal,
        progress_percentage: editForm.progress_percentage
      };
      
      await adminAPI.updateClientStatus(editClient.id, updateData);
      toast(`${editForm.name} updated successfully`);
      setEditClient(null);
      onRefresh(); // Refresh the data from backend
    } catch (err) {
      console.error("Failed to update client:", err);
      toast("Failed to update client: " + (err.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!clients || clients.length === 0) {
    return (
      <div className="page-content">
        <div className="section-label">Client <span>Overview</span></div>
        <div className="card">
          <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            No clients found. Click refresh to load data.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button className="btn btn-cyan" onClick={onRefresh}>⟳ Refresh</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="section-label">Client <span>Overview</span></div>

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
          <input 
            placeholder="🔍 Search client…" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "8px 14px", borderRadius: 8, width: 220 }} 
          />
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: 8 }}
          >
            <option value="">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>New</option>
          </select>
          <button className="btn btn-ghost" onClick={onRefresh}>⟳ Refresh</button>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Status</th><th>Email</th><th>Phone</th><th>Plan</th><th>Goal</th><th>Progress</th><th></th>
              </tr>
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

      {/* Edit Modal - Only showing editable fields */}
      {editClient && (
        <Modal title={`Edit Client: <span style="color:var(--cyan)">${editClient.name}</span>`} onClose={() => setEditClient(null)}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                value={editForm.name} 
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} 
                placeholder="Client full name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={editForm.email} 
                onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} 
                placeholder="client@example.com"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                value={editForm.phone_number} 
                onChange={e => setEditForm(p => ({ ...p, phone_number: e.target.value }))} 
                placeholder="(876) 555-1234"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select 
                value={editForm.status} 
                onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="New">New</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Membership Plan</label>
              <select 
                value={editForm.membership_plan} 
                onChange={e => setEditForm(p => ({ ...p, membership_plan: e.target.value }))}
              >
                <option value="Premium">Premium</option>
                <option value="Standard">Standard</option>
                <option value="Basic">Basic</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fitness Goal</label>
              <select 
                value={editForm.fitness_goal} 
                onChange={e => setEditForm(p => ({ ...p, fitness_goal: e.target.value }))}
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Endurance">Endurance</option>
                <option value="Flexibility">Flexibility</option>
                <option value="Strength">Strength</option>
                <option value="General Fitness">General Fitness</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Progress ({editForm.progress_percentage || 0}%)</label>
            <input 
              type="range" 
              className="range-slider" 
              min="0" 
              max="100"
              value={editForm.progress_percentage || 0}
              onChange={e => setEditForm(p => ({ ...p, progress_percentage: parseInt(e.target.value) }))} 
            />
          </div>
          
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button 
              className="btn btn-cyan" 
              style={{ flex: 1, padding: 12 }} 
              onClick={saveEdit} 
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button 
              className="btn btn-ghost" 
              style={{ flex: 1, padding: 12 }} 
              onClick={() => setEditClient(null)}
            >
              Cancel
            </button>
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
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const ordersData = await adminAPI.getAdminOrders();
      console.log('Loaded orders:', ordersData);
      
      if (Array.isArray(ordersData)) {
        setAllOrders(ordersData);
        // Filter pending orders (not delivered/completed/cancelled)
        const pending = ordersData.filter(o => 
          o.status === "pending" || o.status === "processing"
        );
        setOrders(pending);
        console.log('Pending orders count:', pending.length);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast("Failed to load orders: " + (err.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

const markCollected = async (order) => {
  try {
    await adminAPI.updateOrderStatus(order.id, { status: "delivered" });
    toast(`Order ${order.order_number} marked as collected. Notification sent to customer.`);
    await loadOrders(); // Refresh the list
  } catch (err) {
    console.error("Failed to update order:", err);
    toast("Failed to update order status");
  }
};

const sendNotification = async (order) => {
  try {
    await adminAPI.notifyOrderReady(order.id);
    toast(`Notification sent to ${order.user_name || order.shipping_address?.customer_name}`);
  } catch (err) {
    console.error("Failed to send notification:", err);
    toast("Failed to send notification: " + (err.detail || err.message));
  }
};

  if (loading && allOrders.length === 0) {
    return (
      <div className="page-content">
        <div className="loading-container">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="section-label">Order <span>Pickups</span></div>
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-ghost" onClick={loadOrders}>⟳ Refresh</button>
      </div>
      
      <div className="g2">
        <div>
          <div className="card-title" style={{ color: "var(--orange)", marginBottom: 14 }}>
            ⚠ Ready for Pickup ({orders.length})
          </div>
          
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>📦</div>
              <p>No pending pickups ✓</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-alert">
                <div className="order-icon">📦</div>
                <div className="order-info">
                  <div className="order-title">
                    {order.order_number} — {order.user_name || order.shipping_address?.customer_name || "Unknown"}
                  </div>
                  <div className="order-detail">
                    📱 {order.shipping_address?.phone || "No phone"}<br />
                    🛍 {order.items.map(item => `${item.product_name} x${item.quantity}`).join(", ")}<br />
                    💰 ${order.total_amount.toLocaleString()} · 📅 {new Date(order.created_at).toLocaleDateString()}
                    {order.notes && <><br />📝 {order.notes}</>}
                    {order.shipping_address?.notes && <><br />📝 Delivery notes: {order.shipping_address.notes}</>}
                  </div>
                </div>
                <div className="order-actions">
                  <button 
                    className="btn btn-green btn-sm" 
                    onClick={() => markCollected(order)}
                  >
                    ✓ Mark Collected & Send Confirmation
                  </button>
                  <button 
                    className="btn btn-cyan btn-sm" 
                    onClick={() => sendNotification(order)}
                  >
                    📨 Send Reminder
                  </button>

                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title">📋 Completed Orders</div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Client</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.filter(o => o.status === "delivered" || o.status === "completed").map(order => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{order.order_number}</td>
                    <td>{order.user_name || order.shipping_address?.customer_name}</td>
                    <td style={{ fontSize: 12 }}>
                      {order.items.map(item => `${item.product_name} x${item.quantity}`).join(", ")}
                    </td>
                    <td style={{ color: "var(--green)", fontWeight: 600 }}>${order.total_amount.toLocaleString()}</td>
                    <td style={{ fontSize: 11 }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {allOrders.filter(o => o.status === "delivered" || o.status === "completed").length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
                      No completed orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
        <div key={r.id} className="review-item" style={{ marginBottom: 16 }}>
          <div className="review-header">
            <span className="reviewer-name">{r.client}</span>
            <Stars n={r.stars} />
            <Badge cls={r.type === "public" ? "badge-green" : "badge-cyan"}>
              {r.type}
            </Badge>
          </div>
          <div className="review-text">{r.text}</div>
          <div className="review-meta" style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            {r.date} • {r.trainer}
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
      if (Array.isArray(ordersData)) {
        const pendingOrders = ordersData.filter(o => o.status === "pending" || o.status === "processing");
        setOrders(pendingOrders);
        console.log('Set pending orders:', pendingOrders.length);
      } else {
        setOrders([]);
      }
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