
import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Excursions.css";
import Navbar from "../../Components/navbar";

/* ═══════════════════════════════════════
   MOCK LOGGED-IN USER
   Replace with your auth context
═══════════════════════════════════════ */
const MOCK_USER = {
  id:          "usr_001",
  firstName:   "Jordan",
  lastName:    "Wells",
  email:       "jordan.wells@email.com",
  phone:       "+1 (876) 555-0192",
  avatar:      "JW",
  membership:  "Single Training",
  memberSince: "2023-03-15",   // used to calc gym tenure
  bmi:         24.2,           // stored from fitness assessment
  fitnessLevel:"intermediate", // beginner | intermediate | advanced
  completedExcursions: ["exc_003"],
  bookedExcursions:    ["exc_002"],
};

/* ═══════════════════════════════════════
   EXCURSION DATA
═══════════════════════════════════════ */
const EXCURSIONS = [
  {
    id: "exc_001",
    name: "Blue Mountain Sunrise Hike",
    location: "Blue Mountains, St. Andrew",
    level: "advanced",
    levelLabel: "Advanced",
    date: "2026-05-03",
    time: "3:00 AM",
    duration: "8 hours",
    spots: 12,
    spotsLeft: 4,
    cost: 8500,
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80&fit=crop",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-76.8500%2C18.0200%2C-76.6500%2C18.1200&layer=mapnik&marker=18.0646%2C-76.7500",
    tags: ["Hiking", "Cardio", "Nature"],
    difficulty: 9,
    desc: "Jamaica's most iconic trek. Conquer the highest peak in the Caribbean at 7,402 ft above sea level. Depart at 3 AM to summit for sunrise — a once-in-a-lifetime experience that demands serious fitness preparation.",
    whatToBring: ["Water (2L minimum)", "Headlamp", "Warm layers", "Energy snacks", "Hiking boots"],
    guide: "Coach Marcus Reid",
    meetupPoint: "B.A.D People Fitness, Kingston",
    minBMI: 15, maxBMI: 30,
    minLevel: "advanced",
    requiredTenure: 12, // months
  },
  {
    id: "exc_002",
    name: "Dunn's River Falls Wellness Walk",
    location: "Dunn's River Falls, Ocho Rios",
    level: "beginner",
    levelLabel: "Beginner",
    date: "2026-04-19",
    time: "8:00 AM",
    duration: "5 hours",
    spots: 20,
    spotsLeft: 11,
    cost: 5500,
    img: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=800&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=400&q=80&fit=crop",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-77.0200%2C18.4000%2C-76.9800%2C18.4300&layer=mapnik&marker=18.4117%2C-77.0145",
    tags: ["Walking", "Wellness", "Waterfall"],
    difficulty: 3,
    desc: "A refreshing family-friendly climb up the iconic Dunn's River Falls. Perfect for beginners looking to enjoy active outdoor fun. Includes a wellness picnic and cool-down stretching session with a certified trainer.",
    whatToBring: ["Water shoes", "Change of clothes", "Sunscreen", "Water bottle"],
    guide: "Coach Priya Nair",
    meetupPoint: "B.A.D People Fitness, Kingston",
    minBMI: 15, maxBMI: 40,
    minLevel: "beginner",
    requiredTenure: 0,
  },
  {
    id: "exc_003",
    name: "Mystic Mountain Trail Run",
    location: "Mystic Mountain, Ocho Rios",
    level: "intermediate",
    levelLabel: "Intermediate",
    date: "2026-05-17",
    time: "7:30 AM",
    duration: "6 hours",
    spots: 15,
    spotsLeft: 0,
    cost: 7000,
    img: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80&fit=crop",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-76.9700%2C18.4050%2C-76.9200%2C18.4300&layer=mapnik&marker=18.4170%2C-76.9450",
    tags: ["Trail Run", "Endurance", "Rainforest"],
    difficulty: 6,
    desc: "An exhilarating trail run through Jamaica's lush rainforest. Moderate terrain with challenging inclines — perfect for those who have built a solid fitness base. Includes post-run recovery session and protein-packed lunch.",
    whatToBring: ["Trail shoes", "Hydration pack", "Sports nutrition", "First aid kit"],
    guide: "Coach Jordan Wells",
    meetupPoint: "B.A.D People Fitness, Kingston",
    minBMI: 15, maxBMI: 34,
    minLevel: "intermediate",
    requiredTenure: 6,
  },
  {
    id: "exc_004",
    name: "Pelican Bar Kayak Challenge",
    location: "Pelican Bar, St. Elizabeth",
    level: "intermediate",
    levelLabel: "Intermediate",
    date: "2026-06-07",
    time: "6:30 AM",
    duration: "7 hours",
    spots: 10,
    spotsLeft: 6,
    cost: 9500,
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80&fit=crop",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-77.9000%2C17.8300%2C-77.8000%2C17.8800&layer=mapnik&marker=17.8530%2C-77.8410",
    tags: ["Kayaking", "Water Sports", "Endurance"],
    difficulty: 7,
    desc: "Paddle your way across the Caribbean Sea to Jamaica's famous Pelican Bar — a bar built on a sandbar in the middle of the ocean. A full-body workout that rewards you with paradise. Upper body and core strength required.",
    whatToBring: ["Rash guard", "Sunscreen", "Waterproof bag", "Water shoes"],
    guide: "Coach Sasha Volkov",
    meetupPoint: "B.A.D People Fitness, Kingston",
    minBMI: 15, maxBMI: 32,
    minLevel: "intermediate",
    requiredTenure: 4,
  },
  {
    id: "exc_005",
    name: "Portland Waterfall Discovery",
    location: "Reach Falls, Portland",
    level: "beginner",
    levelLabel: "Beginner",
    date: "2026-05-31",
    time: "7:00 AM",
    duration: "9 hours",
    spots: 18,
    spotsLeft: 13,
    cost: 6000,
    img: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=80&fit=crop",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-76.3500%2C18.0000%2C-76.1500%2C18.1000&layer=mapnik&marker=18.0500%2C-76.2500",
    tags: ["Hiking", "Waterfall", "Nature Walk"],
    difficulty: 4,
    desc: "Discover the hidden gem of Portland — Reach Falls. A guided walk through lush jungle trails, swimming holes and cascading falls. Suitable for all fitness levels with moderate walking. Includes jungle picnic.",
    whatToBring: ["Water shoes", "Swimwear", "Insect repellent", "Water bottle", "Snacks"],
    guide: "Coach Elena Vasquez",
    meetupPoint: "B.A.D People Fitness, Kingston",
    minBMI: 15, maxBMI: 40,
    minLevel: "beginner",
    requiredTenure: 0,
  },
  {
    id: "exc_006",
    name: "Cockpit Country Extreme Trek",
    location: "Cockpit Country, Trelawny",
    level: "advanced",
    levelLabel: "Advanced",
    date: "2026-06-21",
    time: "5:00 AM",
    duration: "10 hours",
    spots: 8,
    spotsLeft: 3,
    cost: 11000,
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80&fit=crop",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-77.7000%2C18.2000%2C-77.4000%2C18.4000&layer=mapnik&marker=18.2800%2C-77.5800",
    tags: ["Extreme Hiking", "Caving", "Advanced"],
    difficulty: 10,
    desc: "The ultimate Jamaican adventure. Navigate the rugged limestone terrain of the Cockpit Country — one of Jamaica's most biologically diverse and challenging environments. Includes caving and river crossing. Elite fitness required.",
    whatToBring: ["Professional hiking boots", "Headlamp", "GPS tracker", "3L water", "Gloves", "Emergency kit"],
    guide: "Coach Marcus Reid",
    meetupPoint: "B.A.D People Fitness, Kingston",
    minBMI: 15, maxBMI: 28,
    minLevel: "advanced",
    requiredTenure: 18,
  },
];

/* ═══════════════════════════════════════
   ML RECOMMENDATION ENGINE
   Scores each excursion for the user
   based on: level match, BMI range,
   gym tenure, and past activity.
═══════════════════════════════════════ */
function computeMLScore(excursion, user) {
  let score = 0;
  const levelMap = { beginner: 1, intermediate: 2, advanced: 3 };
  const userLevel = levelMap[user.fitnessLevel] || 1;
  const excLevel  = levelMap[excursion.minLevel] || 1;

  // 1. Level compatibility (0–40 pts)
  const levelDiff = Math.abs(userLevel - excLevel);
  if (levelDiff === 0) score += 40;
  else if (levelDiff === 1) score += 20;
  else score += 0;

  // 2. BMI in recommended range (0–30 pts)
  const { minBMI, maxBMI } = excursion;
  if (user.bmi >= minBMI && user.bmi <= maxBMI) score += 30;
  else if (user.bmi < minBMI || user.bmi > maxBMI + 3) score += 5;
  else score += 15;

  // 3. Gym tenure (0–20 pts)
  const memberDate = new Date(user.memberSince);
  const now        = new Date();
  const tenureMonths = Math.floor((now - memberDate) / (1000 * 60 * 60 * 24 * 30));
  if (tenureMonths >= excursion.requiredTenure) score += 20;
  else score += Math.max(0, 20 - (excursion.requiredTenure - tenureMonths) * 2);

  // 4. Availability bonus (0–10 pts)
  const fillRate = 1 - excursion.spotsLeft / excursion.spots;
  if (excursion.spotsLeft > 0) score += Math.round((1 - fillRate) * 10);

  // 5. Already completed — penalise slightly
  if (user.completedExcursions.includes(excursion.id)) score -= 10;

  return Math.min(100, Math.max(0, score));
}

function getMLLabel(score) {
  if (score >= 80) return { label: "Highly Recommended", color: "green" };
  if (score >= 55) return { label: "Good Match",         color: "orange" };
  if (score >= 30) return { label: "Possible Match",     color: "yellow" };
  return             { label: "Not Recommended",         color: "red" };
}

/* ═══════════════════════════════════════
   ICONS
═══════════════════════════════════════ */
const CheckIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const MapPinIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ClockIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UsersIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CalIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const StarIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const ArrowRight  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const CloseIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const BrainIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.14z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.14z"/></svg>;
const InfoIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const TrashIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const DownloadIcon= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const CashIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const CardIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="6" y1="14" x2="10" y2="14"/></svg>;
const AlertIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const ZapIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const FilterIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>;
const PrintIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;


/* ═══════════════════════════════════════
   LEVEL BADGE
═══════════════════════════════════════ */
function LevelBadge({ level }) {
  const colors = { beginner:"green", intermediate:"orange", advanced:"red" };
  return <span className={`level-badge level-badge--${colors[level]||"orange"}`}>{level}</span>;
}

/* ═══════════════════════════════════════
   DIFFICULTY BAR
═══════════════════════════════════════ */
function DifficultyBar({ value }) {
  return (
    <div className="diff-bar-wrap">
      <div className="diff-bar-track">
        <div className="diff-bar-fill" style={{ width:`${value*10}%` }}/>
      </div>
      <span className="diff-bar-label">{value}/10</span>
    </div>
  );
}

/* ═══════════════════════════════════════
   ML SCORE BADGE
═══════════════════════════════════════ */
function MLBadge({ score }) {
  const { label, color } = getMLLabel(score);
  return (
    <div className={`ml-badge ml-badge--${color}`}>
      <BrainIcon/>
      <span>{label}</span>
      <span className="ml-score">{score}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════
   EXCURSION CARD
═══════════════════════════════════════ */
function ExcursionCard({ exc, score, isBooked, isCompleted, onSelect }) {
  const spotsPercent = (exc.spotsLeft / exc.spots) * 100;
  const isFull = exc.spotsLeft === 0;
  const dateObj = new Date(exc.date + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("en-US", { weekday:"short", month:"long", day:"numeric", year:"numeric" });

  return (
    <div className={`exc-card${isFull ? " exc-card--full" : ""}${isBooked ? " exc-card--booked" : ""}`}>
      {/* Image */}
      <div className="exc-card-img-wrap">
        <div className="exc-card-img" style={{ backgroundImage:`url(${exc.img})` }}/>
        <div className="exc-card-img-overlay"/>
        <div className="exc-card-img-top">
          <LevelBadge level={exc.level}/>
          {isFull && <span className="exc-full-tag">FULL</span>}
          {isBooked && <span className="exc-booked-tag">BOOKED ✓</span>}
          {isCompleted && <span className="exc-done-tag">COMPLETED</span>}
        </div>
        <div className="exc-card-tags">
          {exc.tags.map(t => <span key={t}>{t}</span>)}
        </div>
      </div>

      {/* Body */}
      <div className="exc-card-body">
        <MLBadge score={score}/>

        <h3 className="exc-card-title">{exc.name}</h3>

        <div className="exc-card-meta">
          <div className="ecm-row"><MapPinIcon/><span>{exc.location}</span></div>
          <div className="ecm-row"><CalIcon/><span>{dateStr}</span></div>
          <div className="ecm-row"><ClockIcon/><span>{exc.time} · {exc.duration}</span></div>
          <div className="ecm-row"><UsersIcon/><span>{exc.spotsLeft} / {exc.spots} spots left</span></div>
        </div>

        {/* Spots bar */}
        <div className="exc-spots-bar">
          <div className="esb-track">
            <div className={`esb-fill${spotsPercent < 25 ? " esb-fill--low" : ""}`} style={{ width:`${100-spotsPercent}%` }}/>
          </div>
          <span className="esb-label">{isFull ? "Fully Booked" : `${exc.spotsLeft} spots remaining`}</span>
        </div>

        <div className="exc-difficulty">
          <span className="exc-diff-lbl">Difficulty</span>
          <DifficultyBar value={exc.difficulty}/>
        </div>

        <p className="exc-card-desc">{exc.desc.slice(0, 120)}…</p>

        <div className="exc-card-bottom">
          <div className="exc-price">
            <span className="exc-price-val">${exc.cost.toLocaleString()}</span>
            <span className="exc-price-cur">JMD</span>
          </div>
          <button
            className={`exc-select-btn${isFull ? " exc-select-btn--full" : ""}${isBooked ? " exc-select-btn--booked" : ""}`}
            onClick={() => !isFull && onSelect(exc)}
            disabled={isFull}
          >
            {isFull ? "Fully Booked" : isBooked ? "View / Book Again" : <><ArrowRight/> Select Trip</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   BOOKING MODAL
═══════════════════════════════════════ */
function BookingModal({ exc, score, onClose, bookedIds, onConfirm }) {
  const isAlreadyBooked = bookedIds.includes(exc.id);
  const [step, setStep]           = useState(isAlreadyBooked ? "already-booked" : "details");
  const [editInfo, setEditInfo]   = useState(false);
  const [payMethod, setPayMethod] = useState("online");
  const [placing, setPlacing]     = useState(false);
  const [receipt, setReceipt]     = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const refCode = useRef(`BADEXC-${Math.random().toString(36).substring(2,8).toUpperCase()}`);

  const [form, setForm] = useState({
    firstName:  MOCK_USER.firstName,
    lastName:   MOCK_USER.lastName,
    email:      MOCK_USER.email,
    phone:      MOCK_USER.phone,
    specialNote:"",
  });
  const [formErrs, setFormErrs] = useState({});
  const fc = e => { setForm(f=>({...f,[e.target.name]:e.target.value})); setFormErrs(p=>({...p,[e.target.name]:""})); };

  const { label: mlLabel, color: mlColor } = getMLLabel(score);
  const dateStr = new Date(exc.date + "T00:00:00").toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim())     e.phone     = "Required";
    setFormErrs(e);
    return !Object.keys(e).length;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    setPlacing(true);
    setTimeout(() => {
      const r = {
        ref:       refCode.current,
        excursion: exc,
        bookedFor: { ...form },
        payMethod,
        bookedAt:  new Date().toLocaleString("en-US", { dateStyle:"long", timeStyle:"short" }),
        total:     exc.cost,
      };
      setReceipt(r);
      setPlacing(false);
      setStep("receipt");
      onConfirm(exc.id);
    }, 2000);
  };

  const handleAlreadyBookedContinue = () => setStep("details");

  return (
    <div className="bk-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bk-modal">
        <button className="bk-close" onClick={onClose}><CloseIcon/></button>

        {/* ── Already Booked Warning ── */}
        {step === "already-booked" && (
          <div className="bk-section">
            <div className="bk-already-booked">
              <div className="bab-icon"><AlertIcon/></div>
              <h3>You've Already Booked This Trip</h3>
              <p>You have an existing booking for <strong>{exc.name}</strong>. Would you like to book again for another party member?</p>
              <div className="bab-actions">
                <button className="bab-cancel-btn" onClick={onClose}>No, Go Back</button>
                <button className="bab-continue-btn" onClick={handleAlreadyBookedContinue}>
                  Yes, Book for Someone Else <ArrowRight/>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Details + Map + Form ── */}
        {step === "details" && (
          <>
            {/* ML warning */}
            <div className={`bk-ml-warn bk-ml-warn--${mlColor}`}>
              <BrainIcon/>
              <div>
                <p className="bk-ml-label">AI Match Score: <strong>{score}% — {mlLabel}</strong></p>
                <p className="bk-ml-disclaimer">
                  <InfoIcon/> Recommendations provided by this system are based on the information entered by the user and are intended as general guidance only. Results may vary depending on the accuracy of the information provided. <strong>Feel free to reach out to a trainer at the gym facility to confirm whether this excursion is the best fit for you.</strong>
                </p>
              </div>
            </div>

            {/* Excursion summary */}
            <div className="bk-exc-summary">
              <div className="bes-left">
                <LevelBadge level={exc.level}/>
                <h2 className="bes-title">{exc.name}</h2>
                <div className="bes-meta">
                  <span><MapPinIcon/> {exc.location}</span>
                  <span><CalIcon/> {dateStr}</span>
                  <span><ClockIcon/> {exc.time} · {exc.duration}</span>
                  <span><UsersIcon/> {exc.spotsLeft} spots left</span>
                </div>
                <p className="bes-guide">Guide: <strong>{exc.guide}</strong></p>
                <p className="bes-meetup">Meet at: <strong>{exc.meetupPoint}</strong></p>
                <div className="bes-bring">
                  <p className="bes-bring-title">What to Bring</p>
                  <ul>{exc.whatToBring.map(w=><li key={w}><CheckIcon/>{w}</li>)}</ul>
                </div>
              </div>
              <div className="bes-right">
                <img src={exc.thumb} alt={exc.name} className="bes-thumb"/>
              </div>
            </div>

            {/* Map */}
            <div className="bk-map-section">
              <p className="bk-map-title"><MapPinIcon/> Excursion Location</p>
              <div className="bk-map-layout">
                <img src={exc.thumb} alt={exc.name} className="bk-map-mini"/>
                <div className="bk-map-frame-wrap">
                  <iframe
                    className="bk-map-frame"
                    src={exc.mapUrl}
                    title={`Map: ${exc.name}`}
                    loading="lazy"
                  />
                  <div className="bk-map-pin">
                    <div className="bk-pin-dot"/>
                    <span>{exc.location.split(",")[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bk-form-section">
              <div className="bk-form-header">
                <h3 className="bk-form-title">BOOKING DETAILS</h3>
                {!editInfo && (
                  <button className="bk-edit-btn" onClick={() => setEditInfo(true)}>
                    Booking for someone else? Edit details
                  </button>
                )}
              </div>

              {!editInfo ? (
                <div className="bk-user-display">
                  <div className="bud-avatar">{MOCK_USER.avatar}</div>
                  <div className="bud-info">
                    <p className="bud-name">{form.firstName} {form.lastName}</p>
                    <p className="bud-email">{form.email}</p>
                    <p className="bud-phone">{form.phone}</p>
                    <p className="bud-membership"><StarIcon/> {MOCK_USER.membership} · {MOCK_USER.fitnessLevel}</p>
                  </div>
                </div>
              ) : (
                <div className="bk-form-grid">
                  <div className="bk-field">
                    <label>First Name</label>
                    <input name="firstName" value={form.firstName} onChange={fc} placeholder="First name"/>
                    {formErrs.firstName && <span className="bk-err">{formErrs.firstName}</span>}
                  </div>
                  <div className="bk-field">
                    <label>Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={fc} placeholder="Last name"/>
                    {formErrs.lastName && <span className="bk-err">{formErrs.lastName}</span>}
                  </div>
                  <div className="bk-field bk-field--full">
                    <label>Email Address</label>
                    <input name="email" type="email" value={form.email} onChange={fc} placeholder="email@example.com"/>
                    {formErrs.email && <span className="bk-err">{formErrs.email}</span>}
                  </div>
                  <div className="bk-field bk-field--full">
                    <label>Phone / WhatsApp</label>
                    <input name="phone" type="tel" value={form.phone} onChange={fc} placeholder="+1 (876) 000-0000"/>
                    {formErrs.phone && <span className="bk-err">{formErrs.phone}</span>}
                  </div>
                  <button className="bk-reset-btn" onClick={() => { setEditInfo(false); setForm({ firstName:MOCK_USER.firstName, lastName:MOCK_USER.lastName, email:MOCK_USER.email, phone:MOCK_USER.phone, specialNote:"" }); }}>
                    Reset to my details
                  </button>
                </div>
              )}

              <div className="bk-field bk-field--full" style={{marginTop:16}}>
                <label>Special Notes / Dietary Requirements <span className="opt-tag">(optional)</span></label>
                <textarea name="specialNote" rows={3} value={form.specialNote} onChange={fc} placeholder="Any medical conditions, dietary requirements or special requests…"/>
              </div>

              {/* Payment method */}
              <div className="bk-payment">
                <p className="bk-payment-title">Payment Method</p>
                <div className="bk-payment-options">
                  <button
                    className={`bk-pay-btn${payMethod==="online"?" bk-pay-btn--active":""}`}
                    onClick={() => setPayMethod("online")}
                  >
                    <CardIcon/> Online Payment
                    <span>Visa · Mastercard · AMEX</span>
                  </button>
                  <button
                    className={`bk-pay-btn${payMethod==="cash"?" bk-pay-btn--active":""}`}
                    onClick={() => setPayMethod("cash")}
                  >
                    <CashIcon/> Cash Payment
                    <span>Pay at gym reception</span>
                  </button>
                </div>
                {payMethod === "cash" && (
                  <p className="bk-cash-note">
                    <InfoIcon/> Cash payments must be settled at least <strong>48 hours before</strong> the excursion date. Your spot will not be confirmed until payment is received.
                  </p>
                )}
              </div>

              {/* Price summary */}
              <div className="bk-price-summary">
                <div className="bps-row"><span>Excursion cost</span><span>${exc.cost.toLocaleString()} JMD</span></div>
                <div className="bps-row"><span>Processing fee</span><span>{payMethod==="online"?"$0 JMD":"$0 JMD"}</span></div>
                <div className="bps-row bps-total"><span>Total</span><span>${exc.cost.toLocaleString()} JMD</span></div>
              </div>

              <div className="bk-confirm-actions">
                {bookedIds.includes(exc.id) && (
                  <button className="bk-cancel-existing-btn" onClick={() => setCancelConfirm(true)}>
                    <TrashIcon/> Cancel Existing Booking
                  </button>
                )}
                <button
                  className={`bk-confirm-btn${placing?" bk-confirm-btn--loading":""}`}
                  onClick={handleConfirm}
                  disabled={placing}
                >
                  {placing ? "Processing…" : <><CheckIcon/> Confirm Booking — ${exc.cost.toLocaleString()} JMD</>}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Receipt ── */}
        {step === "receipt" && receipt && (
          <div className="bk-receipt">
            <div className="bkr-success-ring"/>
            <div className="bkr-check"><CheckIcon/></div>
            <h2 className="bkr-title">BOOKING CONFIRMED!</h2>
            <p className="bkr-sub">Your spot is secured. Check your email for confirmation details and reminders.</p>

            <div className="bkr-card">
              <div className="bkr-ref-row">
                <span className="bkr-ref-lbl">Booking Reference</span>
                <span className="bkr-ref-val">{receipt.ref}</span>
              </div>

              <div className="bkr-grid">
                <div className="bkr-field"><p className="bkrf-lbl">Excursion</p><p className="bkrf-val">{receipt.excursion.name}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Level</p><p className="bkrf-val">{receipt.excursion.levelLabel}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Location</p><p className="bkrf-val">{receipt.excursion.location}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Date & Time</p><p className="bkrf-val">{dateStr} · {receipt.excursion.time}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Duration</p><p className="bkrf-val">{receipt.excursion.duration}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Guide</p><p className="bkrf-val">{receipt.excursion.guide}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Meet At</p><p className="bkrf-val">{receipt.excursion.meetupPoint}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Booked For</p><p className="bkrf-val">{receipt.bookedFor.firstName} {receipt.bookedFor.lastName}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Email</p><p className="bkrf-val">{receipt.bookedFor.email}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Phone</p><p className="bkrf-val">{receipt.bookedFor.phone}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Payment</p><p className="bkrf-val" style={{textTransform:"capitalize"}}>{receipt.payMethod === "online" ? "Online Payment" : "Cash — Pay at reception"}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Booked On</p><p className="bkrf-val">{receipt.bookedAt}</p></div>
              </div>

              <div className="bkr-total-row">
                <span>Amount {receipt.payMethod==="cash"?"(due at reception)":"Paid"}</span>
                <span className="bkr-total-val">${receipt.total.toLocaleString()} JMD</span>
              </div>

              <div className="bkr-bring">
                <p className="bkr-bring-title">Don't Forget to Bring</p>
                <div className="bkr-bring-items">
                  {receipt.excursion.whatToBring.map(w=><span key={w}><CheckIcon/>{w}</span>)}
                </div>
              </div>

              {receipt.payMethod === "cash" && (
                <div className="bkr-cash-alert">
                  <AlertIcon/> Please pay ${receipt.total.toLocaleString()} JMD at the gym reception at least 48 hours before the excursion to secure your spot.
                </div>
              )}
            </div>

            <div className="bkr-actions">
              <button className="bkr-print-btn" onClick={() => window.print()}><PrintIcon/> Print Receipt</button>
              <button className="bkr-download-btn"><DownloadIcon/> Save to Account</button>
              <button className="bkr-done-btn" onClick={onClose}>Done</button>
            </div>
          </div>
        )}

        {/* Cancel confirm */}
        {cancelConfirm && (
          <div className="bk-cancel-modal">
            <AlertIcon/>
            <h4>Cancel Your Booking?</h4>
            <p>Are you sure you want to cancel your existing booking for <strong>{exc.name}</strong>? This action cannot be undone.</p>
            <div className="bk-cancel-btns">
              <button onClick={() => setCancelConfirm(false)}>Keep Booking</button>
              <button className="bk-cancel-confirm" onClick={() => { setCancelConfirm(false); onClose(); }}>
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MY BOOKINGS SECTION
═══════════════════════════════════════ */
function MyBookings({ bookings, excursions, onCancel }) {
  const booked = excursions.filter(e => bookings.includes(e.id));
  if (booked.length === 0) return null;

  return (
    <div className="my-bookings-section">
      <div className="mbs-header">
        <div className="section-eyebrow"><span className="eyebrow-line"/>My Account</div>
        <h2 className="section-title" style={{color:"var(--white)"}}>MY BOOKINGS</h2>
      </div>
      <div className="mbs-grid">
        {booked.map(exc => {
          const dateStr = new Date(exc.date + "T00:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
          return (
            <div key={exc.id} className="mbs-card">
              <div className="mbs-img" style={{ backgroundImage:`url(${exc.thumb})` }}/>
              <div className="mbs-body">
                <p className="mbs-name">{exc.name}</p>
                <p className="mbs-meta"><MapPinIcon/>{exc.location}</p>
                <p className="mbs-meta"><CalIcon/>{dateStr} · {exc.time}</p>
                <div className="mbs-footer">
                  <LevelBadge level={exc.level}/>
                  <button className="mbs-cancel-btn" onClick={() => onCancel(exc.id)}>
                    <TrashIcon/> Cancel
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function ExcursionPage() {
  const [selectedExc, setSelectedExc] = useState(null);
  const [bookedIds,   setBookedIds]   = useState([...MOCK_USER.bookedExcursions]);
  const [filter,      setFilter]      = useState("all");   // all | beginner | intermediate | advanced
  const [sortBy,      setSortBy]      = useState("recommended");
  const [search,      setSearch]      = useState("");
  const [cancelId,    setCancelId]    = useState(null);

  /* ML scores for all excursions */
  const scores = useMemo(() => {
    const map = {};
    EXCURSIONS.forEach(e => { map[e.id] = computeMLScore(e, MOCK_USER); });
    return map;
  }, []);

  /* Filtered + sorted excursions */
  const displayed = useMemo(() => {
    let list = [...EXCURSIONS];
    if (filter !== "all") list = list.filter(e => e.level === filter);
    if (search) list = list.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    if (sortBy === "recommended") list.sort((a,b) => scores[b.id] - scores[a.id]);
    if (sortBy === "date")        list.sort((a,b) => new Date(a.date) - new Date(b.date));
    if (sortBy === "price-asc")   list.sort((a,b) => a.cost - b.cost);
    if (sortBy === "price-desc")  list.sort((a,b) => b.cost - a.cost);
    if (sortBy === "level")       list.sort((a,b) => { const m={beginner:1,intermediate:2,advanced:3}; return m[a.level]-m[b.level]; });
    return list;
  }, [filter, search, sortBy, scores]);

  const handleConfirmBooking = (id) => {
    setBookedIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const handleCancelBooking = (id) => {
    setCancelId(id);
  };

  const confirmCancel = () => {
    setBookedIds(prev => prev.filter(i => i !== cancelId));
    setCancelId(null);
  };

  return (
    <div className="exc-page">


      {/* ── HERO ── */}
      <section className="exc-hero">
        <div className="exc-hero-bg"/>
        <div className="exc-hero-overlay"/>
        <div className="exc-hero-grid"/>
        <div className="exc-hero-content">
          <div className="exc-hero-eyebrow"><span className="eyebrow-line"/>Fitness Adventures</div>
          <h1 className="exc-hero-title">
            EXPLORE.<br/><span className="exc-hero-accent">CONQUER.</span><br/>REPEAT.
          </h1>
          <p className="exc-hero-sub">
            Push beyond the gym walls. Join B.A.D People Fitness on guided excursions across Jamaica's most spectacular terrain.
          </p>
          <div className="exc-hero-user-card">
            <div className="ehuc-avatar">{MOCK_USER.avatar}</div>
            <div>
              <p className="ehuc-greeting">Welcome back, {MOCK_USER.firstName}!</p>
              <p className="ehuc-details">
                <ZapIcon/> {MOCK_USER.fitnessLevel} · BMI {MOCK_USER.bmi} · Member {Math.floor((new Date()-new Date(MOCK_USER.memberSince))/(1000*60*60*24*30))} months
              </p>
            </div>
          </div>
          <div className="exc-hero-ml-info">
            <BrainIcon/>
            <p>Our AI engine analyses your fitness level, BMI and gym history to recommend the best excursions for you.</p>
          </div>
          <a href="#excursions" className="exc-hero-btn">Browse Excursions <ArrowRight/></a>
        </div>
        <div className="exc-hero-scroll"><div className="exc-scroll-line"/><span>Scroll</span></div>
      </section>

      {/* ── ML DISCLAIMER ── */}
      <div className="exc-disclaimer-bar">
        <InfoIcon/>
        <p>
          <strong>AI Recommendation Notice:</strong> Recommendations provided by this system are based on the information entered by the user and are intended as general guidance only. Results may vary depending on the accuracy of the information provided. Feel free to reach out to a trainer at the gym facility to confirm whether the recommendation is the best fit for you.
        </p>
      </div>

      {/* ── MY BOOKINGS ── */}
      {bookedIds.length > 0 && (
        <MyBookings
          bookings={bookedIds}
          excursions={EXCURSIONS}
          onCancel={handleCancelBooking}
        />
      )}

      {/* ── EXCURSION LISTING ── */}
      <section className="exc-listing-section" id="excursions">
        <div className="exc-listing-inner">
          <div className="exc-listing-header">
            <div>
              <div className="section-eyebrow"><span className="eyebrow-line"/>Current Excursions</div>
              <h2 className="section-title">UPCOMING TRIPS</h2>
            </div>
            <p className="exc-listing-count">{displayed.length} excursion{displayed.length !== 1 ? "s" : ""} found</p>
          </div>

          {/* Toolbar */}
          <div className="exc-toolbar">
            {/* Search */}
            <div className="exc-search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="exc-search" placeholder="Search excursions, locations…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>

            {/* Level filter */}
            <div className="exc-filter-tabs">
              <FilterIcon/>
              {[
                { id:"all",          label:"All Levels" },
                { id:"beginner",     label:"Beginner" },
                { id:"intermediate", label:"Intermediate" },
                { id:"advanced",     label:"Advanced" },
              ].map(f=>(
                <button
                  key={f.id}
                  className={`exc-filter-tab${filter===f.id?" exc-filter-tab--active":""}`}
                  onClick={()=>setFilter(f.id)}
                >{f.label}</button>
              ))}
            </div>

            {/* Sort */}
            <div className="exc-sort">
              <label>Sort</label>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                <option value="recommended">AI Recommended</option>
                <option value="date">Soonest First</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="level">Level: Easy → Hard</option>
              </select>
            </div>
          </div>

          {/* Cards */}
          {displayed.length === 0 ? (
            <div className="exc-no-results">
              <p>No excursions found matching your search.</p>
              <button onClick={()=>{setSearch("");setFilter("all");}}>Clear filters</button>
            </div>
          ) : (
            <div className="exc-grid">
              {displayed.map(exc => (
                <ExcursionCard
                  key={exc.id}
                  exc={exc}
                  score={scores[exc.id]}
                  isBooked={bookedIds.includes(exc.id)}
                  isCompleted={MOCK_USER.completedExcursions.includes(exc.id)}
                  onSelect={setSelectedExc}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── INFO STRIP ── */}
      <section className="exc-info-strip">
        {[
          { icon:"🗺️", title:"Expert Guides",     desc:"All excursions are led by certified B.A.D People Fitness coaches who know the terrain inside out." },
          { icon:"🛡️", title:"Safety First",       desc:"Every trip includes safety briefings, first aid, emergency protocols and coach-to-participant ratios." },
          { icon:"🚌", title:"Transport Provided",  desc:"Return transportation from B.A.D People Fitness to excursion location and back included in all trips." },
          { icon:"📱", title:"WhatsApp Updates",    desc:"You'll receive real-time trip updates, reminders and weather alerts via your registered WhatsApp." },
        ].map((item,i)=>(
          <div key={i} className="exc-info-card">
            <span className="exc-info-icon">{item.icon}</span>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        ))}
      </section>

      {/* ── FOOTER ── */}
      <footer className="exc-footer">
        <div className="exc-footer-motive">
          <div className="efm-inner">
            {["EXPLORE JAMAICA", "✦", "TRAIN OUTSIDE", "✦", "B.A.D PEOPLE FITNESS", "✦", "CONQUER YOUR LIMITS", "✦",
              "EXPLORE JAMAICA", "✦", "TRAIN OUTSIDE", "✦", "B.A.D PEOPLE FITNESS", "✦", "CONQUER YOUR LIMITS", "✦"].map((t,i)=>(
              <span key={i} className={t==="✦"?"efm-div":"efm-text"}>{t}</span>
            ))}
          </div>
        </div>
        <div className="exc-footer-bottom">
          <div className="efb-logo">
            <div className="efbl-hex"><div className="efblh-bg"/><div className="efblh-inner"/><span className="efblh-letter">B</span></div>
            <span className="efbl-name">B.A.D People Fitness</span>
          </div>
          <p className="efb-copy">© 2026 B.A.D People Fitness. All rights reserved.</p>
          <div className="efb-links">
            {["Privacy","Terms","Refund Policy"].map(l=><a key={l} href="#" onClick={e=>e.preventDefault()}>{l}</a>)}
          </div>
        </div>
      </footer>

      {/* ── BOOKING MODAL ── */}
      {selectedExc && (
        <BookingModal
          exc={selectedExc}
          score={scores[selectedExc.id]}
          bookedIds={bookedIds}
          onClose={() => setSelectedExc(null)}
          onConfirm={handleConfirmBooking}
        />
      )}

      {/* ── CANCEL CONFIRM ── */}
      {cancelId && (
        <div className="cancel-overlay" onClick={e=>{if(e.target===e.currentTarget)setCancelId(null);}}>
          <div className="cancel-modal">
            <AlertIcon/>
            <h4>Cancel Booking</h4>
            <p>Are you sure you want to cancel your booking for <strong>{EXCURSIONS.find(e=>e.id===cancelId)?.name}</strong>?</p>
            <div className="cancel-btns">
              <button onClick={()=>setCancelId(null)}>Keep It</button>
              <button className="cancel-confirm-btn" onClick={confirmCancel}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}