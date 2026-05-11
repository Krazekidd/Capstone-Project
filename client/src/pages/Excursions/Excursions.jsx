import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { authAPI, excursionsAPI } from "../../api/api";
import "./Excursions.css";

/* ═══════════════════════════════════════
   ICONS (same as before)
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
   NAVBAR
═══════════════════════════════════════ */
function Navbar({ userData }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  
  return (
    <nav className={`exc-nav${scrolled ? " exc-nav--scrolled" : ""}`}>
      <div className="exc-nav-inner">
        <div className="exc-nav-logo">
          <div className="enl-hex"><div className="enl-bg"/><div className="enl-inner"/><span className="enl-letter">B</span></div>
          <div><p className="enl-name">B.A.D People Fitness</p><p className="enl-sub">Excursions</p></div>
        </div>
        <div className="exc-nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/membership">Membership</Link>
          <Link to="/excursions" className="active">Excursions</Link>
          <Link to="/consultation">Book Session</Link>
        </div>
        <div className="exc-nav-right">
          <div className="exc-nav-user">
            <div className="exc-user-avatar">{userData?.name?.charAt(0) || 'U'}</div>
            <div>
              <p className="exc-user-name">{userData?.name || 'Member'}</p>
              <p className="exc-user-level">{userData?.fitness_level || 'Active'} · BMI {userData?.bmi || '--'}</p>
            </div>
          </div>
          <a href="#excursions" className="exc-nav-btn">Browse Trips</a>
        </div>
        <button className="exc-hamburger" onClick={() => setMobileOpen(o=>!o)}>
          <span/><span/><span/>
        </button>
      </div>
      {mobileOpen && (
        <div className="exc-mobile-menu">
          <Link to="/" onClick={()=>setMobileOpen(false)}>Home</Link>
          <Link to="/shop" onClick={()=>setMobileOpen(false)}>Shop</Link>
          <Link to="/membership" onClick={()=>setMobileOpen(false)}>Membership</Link>
          <Link to="/excursions" onClick={()=>setMobileOpen(false)}>Excursions</Link>
          <a href="#excursions" onClick={()=>setMobileOpen(false)}>Browse Trips</a>
        </div>
      )}
    </nav>
  );
}

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
  const getMLLabel = (score) => {
    if (score >= 80) return { label: "Highly Recommended", color: "green" };
    if (score >= 55) return { label: "Good Match", color: "orange" };
    if (score >= 30) return { label: "Possible Match", color: "yellow" };
    return { label: "Not Recommended", color: "red" };
  };
  
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
  const spotsPercent = (exc.spots_left / exc.spots) * 100;
  const isFull = exc.spots_left === 0;
  const dateObj = new Date(exc.date);
  const dateStr = dateObj.toLocaleDateString("en-US", { weekday:"short", month:"long", day:"numeric", year:"numeric" });

  return (
    <div className={`exc-card${isFull ? " exc-card--full" : ""}${isBooked ? " exc-card--booked" : ""}`}>
      <div className="exc-card-img-wrap">
        <div className="exc-card-img" style={{ backgroundImage:`url(${exc.img_url})` }}/>
        <div className="exc-card-img-overlay"/>
        <div className="exc-card-img-top">
          <LevelBadge level={exc.level}/>
          {isFull && <span className="exc-full-tag">FULL</span>}
          {isBooked && <span className="exc-booked-tag">BOOKED ✓</span>}
          {isCompleted && <span className="exc-done-tag">COMPLETED</span>}
        </div>
        <div className="exc-card-tags">
          {exc.tags?.map(t => <span key={t}>{t}</span>)}
        </div>
      </div>

      <div className="exc-card-body">
        <MLBadge score={score}/>

        <h3 className="exc-card-title">{exc.name}</h3>

        <div className="exc-card-meta">
          <div className="ecm-row"><MapPinIcon/><span>{exc.location}</span></div>
          <div className="ecm-row"><CalIcon/><span>{dateStr}</span></div>
          <div className="ecm-row"><ClockIcon/><span>{exc.time} · {exc.duration}</span></div>
          <div className="ecm-row"><UsersIcon/><span>{exc.spots_left} / {exc.spots} spots left</span></div>
        </div>

        <div className="exc-spots-bar">
          <div className="esb-track">
            <div className={`esb-fill${spotsPercent < 25 ? " esb-fill--low" : ""}`} style={{ width:`${spotsPercent}%` }}/>
          </div>
          <span className="esb-label">{isFull ? "Fully Booked" : `${exc.spots_left} spots remaining`}</span>
        </div>

        <div className="exc-difficulty">
          <span className="exc-diff-lbl">Difficulty</span>
          <DifficultyBar value={exc.difficulty}/>
        </div>

        <p className="exc-card-desc">{exc.description?.slice(0, 120)}…</p>

        <div className="exc-card-bottom">
          <div className="exc-price">
            <span className="exc-price-val">${exc.cost?.toLocaleString()}</span>
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
  const [userData, setUserData] = useState(null);
  const refCode = useRef(`BADEXC-${Math.random().toString(36).substring(2,8).toUpperCase()}`);

  const [form, setForm] = useState({
    firstName:  "",
    lastName:   "",
    email:      "",
    phone:      "",
    specialNote:"",
  });
  const [formErrs, setFormErrs] = useState({});
  
  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const accountData = await excursionsAPI.getMyAccount();
        setUserData(accountData);
        setForm({
          firstName: accountData.name?.split(' ')[0] || "",
          lastName: accountData.name?.split(' ')[1] || "",
          email: accountData.email || "",
          phone: accountData.phone_number || "",
          specialNote: "",
        });
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    };
    loadUserData();
  }, []);
  
  const fc = e => { setForm(f=>({...f,[e.target.name]:e.target.value})); setFormErrs(p=>({...p,[e.target.name]:""})); };

  const getMLLabel = (score) => {
    if (score >= 80) return { label: "Highly Recommended", color: "green" };
    if (score >= 55) return { label: "Good Match", color: "orange" };
    if (score >= 30) return { label: "Possible Match", color: "yellow" };
    return { label: "Not Recommended", color: "red" };
  };
  
  const { label: mlLabel, color: mlColor } = getMLLabel(score);
  const dateStr = new Date(exc.date).toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim())     e.phone     = "Required";
    setFormErrs(e);
    return !Object.keys(e).length;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setPlacing(true);
    
    try {
      const bookingData = {
        excursion_id: exc.id,
        booked_for_name: `${form.firstName} ${form.lastName}`,
        booked_for_email: form.email,
        booked_for_phone: form.phone,
        special_notes: form.specialNote,
        payment_method: payMethod
      };
      
      const response = await excursionsAPI.bookExcursion(bookingData);
      
      const r = {
        ref: response.booking_reference,
        excursion: exc,
        bookedFor: { ...form },
        payMethod,
        bookedAt: new Date().toLocaleString("en-US", { dateStyle:"long", timeStyle:"short" }),
        total: exc.cost,
      };
      setReceipt(r);
      setPlacing(false);
      setStep("receipt");
      onConfirm(exc.id);
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed. Please try again.");
      setPlacing(false);
    }
  };

  const handleAlreadyBookedContinue = () => setStep("details");

  return (
    <div className="bk-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bk-modal">
        <button className="bk-close" onClick={onClose}><CloseIcon/></button>

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

        {step === "details" && (
          <>
            <div className={`bk-ml-warn bk-ml-warn--${mlColor}`}>
              <BrainIcon/>
              <div>
                <p className="bk-ml-label">AI Match Score: <strong>{score}% — {mlLabel}</strong></p>
                <p className="bk-ml-disclaimer">
                  <InfoIcon/> Recommendations provided by this system are based on the information entered by the user and are intended as general guidance only. Results may vary depending on the accuracy of the information provided. <strong>Feel free to reach out to a trainer at the gym facility to confirm whether this excursion is the best fit for you.</strong>
                </p>
              </div>
            </div>

            <div className="bk-exc-summary">
              <div className="bes-left">
                <LevelBadge level={exc.level}/>
                <h2 className="bes-title">{exc.name}</h2>
                <div className="bes-meta">
                  <span><MapPinIcon/> {exc.location}</span>
                  <span><CalIcon/> {dateStr}</span>
                  <span><ClockIcon/> {exc.time} · {exc.duration}</span>
                  <span><UsersIcon/> {exc.spots_left} spots left</span>
                </div>
                <p className="bes-guide">Guide: <strong>{exc.guide}</strong></p>
                <p className="bes-meetup">Meet at: <strong>{exc.meetup_point}</strong></p>
                <div className="bes-bring">
                  <p className="bes-bring-title">What to Bring</p>
                  <ul>{exc.what_to_bring?.map(w=><li key={w}><CheckIcon/>{w}</li>)}</ul>
                </div>
              </div>
              <div className="bes-right">
                <img src={exc.thumb_url} alt={exc.name} className="bes-thumb"/>
              </div>
            </div>

            <div className="bk-map-section">
              <p className="bk-map-title"><MapPinIcon/> Excursion Location</p>
              <div className="bk-map-layout">
                <img src={exc.thumb_url} alt={exc.name} className="bk-map-mini"/>
                <div className="bk-map-frame-wrap">
                  <iframe
                    className="bk-map-frame"
                    src={exc.map_url}
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

            <div className="bk-form-section">
              <div className="bk-form-header">
                <h3 className="bk-form-title">BOOKING DETAILS</h3>
                {!editInfo && (
                  <button className="bk-edit-btn" onClick={() => setEditInfo(true)}>
                    Booking for someone else? Edit details
                  </button>
                )}
              </div>

              {!editInfo && userData ? (
                <div className="bk-user-display">
                  <div className="bud-avatar">{userData.name?.charAt(0) || 'U'}</div>
                  <div className="bud-info">
                    <p className="bud-name">{form.firstName} {form.lastName}</p>
                    <p className="bud-email">{form.email}</p>
                    <p className="bud-phone">{form.phone}</p>
                    <p className="bud-membership"><StarIcon/> Active Member</p>
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
                </div>
              )}

              <div className="bk-field bk-field--full" style={{marginTop:16}}>
                <label>Special Notes / Dietary Requirements <span className="opt-tag">(optional)</span></label>
                <textarea name="specialNote" rows={3} value={form.specialNote} onChange={fc} placeholder="Any medical conditions, dietary requirements or special requests…"/>
              </div>

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

              <div className="bk-price-summary">
                <div className="bps-row"><span>Excursion cost</span><span>${exc.cost?.toLocaleString()} JMD</span></div>
                <div className="bps-row"><span>Processing fee</span><span>$0 JMD</span></div>
                <div className="bps-row bps-total"><span>Total</span><span>${exc.cost?.toLocaleString()} JMD</span></div>
              </div>

              <div className="bk-confirm-actions">
                <button
                  className={`bk-confirm-btn${placing?" bk-confirm-btn--loading":""}`}
                  onClick={handleConfirm}
                  disabled={placing}
                >
                  {placing ? "Processing…" : <><CheckIcon/> Confirm Booking — ${exc.cost?.toLocaleString()} JMD</>}
                </button>
              </div>
            </div>
          </>
        )}

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
                <div className="bkr-field"><p className="bkrf-lbl">Level</p><p className="bkrf-val">{receipt.excursion.level_label}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Location</p><p className="bkrf-val">{receipt.excursion.location}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Date & Time</p><p className="bkrf-val">{dateStr} · {receipt.excursion.time}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Duration</p><p className="bkrf-val">{receipt.excursion.duration}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Guide</p><p className="bkrf-val">{receipt.excursion.guide}</p></div>
                <div className="bkr-field"><p className="bkrf-lbl">Meet At</p><p className="bkrf-val">{receipt.excursion.meetup_point}</p></div>
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
                  {receipt.excursion.what_to_bring?.map(w=><span key={w}><CheckIcon/>{w}</span>)}
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
function MyBookings({ bookings, onCancel }) {
  if (bookings.length === 0) return null;

  return (
    <div className="my-bookings-section">
      <div className="mbs-header">
        <div className="section-eyebrow"><span className="eyebrow-line"/>My Account</div>
        <h2 className="section-title" style={{color:"var(--white)"}}>MY BOOKINGS</h2>
      </div>
      <div className="mbs-grid">
        {bookings.map(booking => {
          const dateStr = new Date(booking.excursion_date).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
          return (
            <div key={booking.id} className="mbs-card">
              <div className="mbs-img" style={{ backgroundImage:`url(${booking.thumb_url})` }}/>
              <div className="mbs-body">
                <p className="mbs-name">{booking.excursion_name}</p>
                <p className="mbs-meta"><MapPinIcon/>{booking.location}</p>
                <p className="mbs-meta"><CalIcon/>{dateStr} · {booking.excursion_time}</p>
                <div className="mbs-footer">
                  <LevelBadge level={booking.level}/>
                  <button className="mbs-cancel-btn" onClick={() => onCancel(booking.id)}>
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
  const [userData, setUserData] = useState(null);
  const [excursions, setExcursions] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [mlScores, setMlScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedExc, setSelectedExc] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [search, setSearch] = useState("");
  const [cancelId, setCancelId] = useState(null);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Get user account info
      const accountData = await excursionsAPI.getMyAccount();
      setUserData(accountData);
      
      // Get excursions
      const excursionsData = await excursionsAPI.getExcursions();
      setExcursions(excursionsData.excursions || []);
      
      // Get user's bookings
      const bookingsData = await excursionsAPI.getMyBookings();
      setMyBookings(bookingsData.bookings || []);
      
      // Get ML recommendations
      const recommendationsData = await excursionsAPI.getMLRecommendations();
      const scoreMap = {};
      recommendationsData.recommendations?.forEach(rec => {
        scoreMap[rec.excursion_id] = rec.score;
      });
      setMlScores(scoreMap);
      
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered + sorted excursions
  const displayed = useMemo(() => {
    let list = [...excursions];
    
    if (filter !== "all") {
      list = list.filter(e => e.level === filter);
    }
    
    if (search) {
      list = list.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase()) ||
        e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (sortBy === "recommended") {
      list.sort((a, b) => (mlScores[b.id] || 0) - (mlScores[a.id] || 0));
    }
    if (sortBy === "date") {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.cost - b.cost);
    }
    if (sortBy === "price-desc") {
      list.sort((a, b) => b.cost - a.cost);
    }
    if (sortBy === "level") {
      const levelMap = { beginner: 1, intermediate: 2, advanced: 3 };
      list.sort((a, b) => levelMap[a.level] - levelMap[b.level]);
    }
    
    return list;
  }, [excursions, filter, search, sortBy, mlScores]);

  const handleConfirmBooking = async (excursionId) => {
    // Refresh bookings after booking
    try {
      const bookingsData = await excursionsAPI.getMyBookings();
      setMyBookings(bookingsData.bookings || []);
    } catch (err) {
      console.error("Failed to refresh bookings:", err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancelId(bookingId);
  };

  const confirmCancel = async () => {
    try {
      await excursionsAPI.cancelBooking(cancelId);
      // Refresh bookings
      const bookingsData = await excursionsAPI.getMyBookings();
      setMyBookings(bookingsData.bookings || []);
      setCancelId(null);
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  // Get booked excursion IDs
  const bookedIds = myBookings.map(b => b.excursion_id);
  
  // Get completed excursions (for now, none)
  const completedIds = [];

  // Calculate user stats
  const memberSince = userData?.created_at;
  let tenureMonths = 0;
  if (memberSince) {
    const memberDate = new Date(memberSince);
    const now = new Date();
    tenureMonths = (now.getFullYear() - memberDate.getFullYear()) * 12 + (now.getMonth() - memberDate.getMonth());
  }
  
  const bmi = userData?.weight && userData?.height 
    ? (parseFloat(userData.weight) / ((parseFloat(userData.height) / 100) ** 2)).toFixed(1)
    : 24;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading excursions...</p>
      </div>
    );
  }

  return (
    <div className="exc-page">
      <Navbar userData={userData} />

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
            <div className="ehuc-avatar">{userData?.name?.charAt(0) || 'U'}</div>
            <div>
              <p className="ehuc-greeting">Welcome back, {userData?.name?.split(' ')[0] || 'Member'}!</p>
              <p className="ehuc-details">
                <ZapIcon/> Active · BMI {bmi} · Member {tenureMonths} months
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

      <div className="exc-disclaimer-bar">
        <InfoIcon/>
        <p>
          <strong>AI Recommendation Notice:</strong> Recommendations provided by this system are based on the information entered by the user and are intended as general guidance only. Results may vary depending on the accuracy of the information provided. Feel free to reach out to a trainer at the gym facility to confirm whether the recommendation is the best fit for you.
        </p>
      </div>

      {myBookings.length > 0 && (
        <MyBookings
          exc
          bookings={myBookings}
          onCancel={handleCancelBooking}
        />
      )}

      <section className="exc-listing-section" id="excursions">
        <div className="exc-listing-inner">
          <div className="exc-listing-header">
            <div>
              <div className="section-eyebrow"><span className="eyebrow-line"/>Current Excursions</div>
              <h2 className="section-title">UPCOMING TRIPS</h2>
            </div>
            <p className="exc-listing-count">{displayed.length} excursion{displayed.length !== 1 ? "s" : ""} found</p>
          </div>

          <div className="exc-toolbar">
            <div className="exc-search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="exc-search" placeholder="Search excursions, locations…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>

            <div className="exc-filter-tabs">
              <FilterIcon/>
              {[
                { id:"all", label:"All Levels" },
                { id:"beginner", label:"Beginner" },
                { id:"intermediate", label:"Intermediate" },
                { id:"advanced", label:"Advanced" },
              ].map(f=>(
                <button
                  key={f.id}
                  className={`exc-filter-tab${filter===f.id?" exc-filter-tab--active":""}`}
                  onClick={()=>setFilter(f.id)}
                >{f.label}</button>
              ))}
            </div>

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
                  score={mlScores[exc.id] || 50}
                  isBooked={bookedIds.includes(exc.id)}
                  isCompleted={completedIds.includes(exc.id)}
                  onSelect={setSelectedExc}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="exc-info-strip">
        {[
          { icon:"🗺️", title:"Expert Guides", desc:"All excursions are led by certified B.A.D People Fitness coaches who know the terrain inside out." },
          { icon:"🛡️", title:"Safety First", desc:"Every trip includes safety briefings, first aid, emergency protocols and coach-to-participant ratios." },
          { icon:"🚌", title:"Transport Provided", desc:"Return transportation from B.A.D People Fitness to excursion location and back included in all trips." },
          { icon:"📱", title:"WhatsApp Updates", desc:"You'll receive real-time trip updates, reminders and weather alerts via your registered WhatsApp." },
        ].map((item,i)=>(
          <div key={i} className="exc-info-card">
            <span className="exc-info-icon">{item.icon}</span>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        ))}
      </section>

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

      {selectedExc && (
        <BookingModal
          exc={selectedExc}
          score={mlScores[selectedExc.id] || 50}
          bookedIds={bookedIds}
          onClose={() => setSelectedExc(null)}
          onConfirm={handleConfirmBooking}
        />
      )}

      {cancelId && (
        <div className="cancel-overlay" onClick={e=>{if(e.target===e.currentTarget)setCancelId(null);}}>
          <div className="cancel-modal">
            <AlertIcon/>
            <h4>Cancel Booking</h4>
            <p>Are you sure you want to cancel this booking?</p>
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