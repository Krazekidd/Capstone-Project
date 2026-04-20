import { useState, useEffect, useRef } from "react";
import "./Consultations.css";
import Navbar from "../../Components/navbar";

/* ═══════════════════════════════════════
   MOCK LOGGED-IN USER
   Replace with your auth context / hook
═══════════════════════════════════════ */
const MOCK_USER = {
  firstName: "Jordan",
  lastName:  "Wells",
  email:     "jordan.wells@email.com",
  avatar:    "JW",
  membership:"Pro Member",
};

/* ═══════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════ */
const CONSULTATION_TYPES = [
  {
    id: "starter",
    icon: "🚀",
    title: "Starter Consultation",
    subtitle: "New to GymVault",
    duration: "45 min",
    price: "Free",
    badge: "Complimentary",
    badgeColor: "green",
    desc: "Your perfect entry point. Our coaches assess your current fitness level, understand your goals and build a personalised roadmap for your first 90 days at GymVault.",
    includes: [
      "Full fitness baseline assessment",
      "Goal-setting & roadmap planning",
      "Gym orientation & equipment walkthrough",
      "Membership plan recommendation",
      "Free first-week programme",
    ],
    coach: "Any certified GymVault coach",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&fit=crop",
  },
  {
    id: "nutrition",
    icon: "🥗",
    title: "Nutritional Consultation",
    subtitle: "Fuel Your Performance",
    duration: "60 min",
    price: "$45",
    badge: "Most Popular",
    badgeColor: "orange",
    desc: "A deep-dive into your diet, metabolism and eating habits with a certified Precision Nutrition coach. Walk away with a fully personalised meal plan and supplement strategy.",
    includes: [
      "Body composition analysis",
      "Macro & calorie target setting",
      "Personalised meal plan (7-day)",
      "Supplement protocol",
      "Ongoing tracking setup (app)",
      "Follow-up check-in included",
    ],
    coach: "Precision Nutrition Level 2 coach",
    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80&fit=crop",
  },
  {
    id: "general",
    icon: "💬",
    title: "General Consultation",
    subtitle: "Talk to an Expert",
    duration: "30 min",
    price: "Free",
    badge: "Open to All",
    badgeColor: "blue",
    desc: "Have a question about training, recovery, memberships or programmes? Book a no-pressure chat with one of our senior coaches — available in-person or via video call.",
    includes: [
      "Open Q&A with a senior coach",
      "Programme review & advice",
      "Injury or recovery guidance",
      "Membership & upgrade support",
      "In-person or video call option",
    ],
    coach: "Senior GymVault coach",
    img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80&fit=crop",
  },
];

/* ═══════════════════════════════════════
   AVAILABILITY ENGINE
   - Holidays: closed dates
   - Booked slots: already taken
   - Business hours: Mon–Fri 6am–8pm,
     Sat 7am–5pm, Sun closed
═══════════════════════════════════════ */

const HOLIDAYS = new Set([
  "2026-01-01", // New Year's Day
  "2026-01-19", // MLK Day
  "2026-02-16", // Presidents' Day
  "2026-05-25", // Memorial Day
  "2026-07-04", // Independence Day
  "2026-09-07", // Labor Day
  "2026-11-26", // Thanksgiving
  "2026-12-25", // Christmas
  "2026-12-31", // New Year's Eve
]);

/* Pre-booked slots: "YYYY-MM-DD|HH:MM" */
const BOOKED = new Set([
  "2026-04-08|09:00","2026-04-08|10:00","2026-04-08|11:00",
  "2026-04-08|14:00","2026-04-09|09:00","2026-04-09|13:00",
  "2026-04-10|10:00","2026-04-10|11:00","2026-04-10|15:00",
  "2026-04-14|09:00","2026-04-14|10:00","2026-04-15|09:00",
  "2026-04-15|14:00","2026-04-15|15:00","2026-04-16|11:00",
  "2026-04-21|09:00","2026-04-22|14:00","2026-04-23|10:00",
]);

const SLOT_INTERVAL = 60; // minutes between slots

function getSlotsForDate(dateStr) {
  const date     = new Date(dateStr + "T00:00:00");
  const dow      = date.getDay(); // 0=Sun,1=Mon,...,6=Sat
  let startH, endH;

  if (dow === 0) return [];                    // Sunday closed
  if (dow === 6) { startH = 7;  endH = 17; }  // Saturday
  else           { startH = 6;  endH = 20; }  // Mon–Fri

  const slots = [];
  for (let h = startH; h < endH; h++) {
    const label = `${String(h).padStart(2,"0")}:00`;
    const key   = `${dateStr}|${label}`;
    slots.push({ time: label, booked: BOOKED.has(key) });
  }
  return slots;
}

function getDateStatus(dateStr) {
  const date  = new Date(dateStr + "T00:00:00");
  const dow   = date.getDay();
  const today = new Date();
  today.setHours(0,0,0,0);
  if (date < today)               return "past";
  if (HOLIDAYS.has(dateStr))      return "holiday";
  if (dow === 0)                  return "closed";
  return "open";
}

/* ═══════════════════════════════════════
   CALENDAR HELPERS
═══════════════════════════════════════ */
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function buildCalendarDays(year, month) {
  const first   = new Date(year, month, 1).getDay();
  const daysIn  = new Date(year, month + 1, 0).getDate();
  const cells   = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) {
    const mm  = String(month + 1).padStart(2,"0");
    const dd  = String(d).padStart(2,"0");
    cells.push(`${year}-${mm}-${dd}`);
  }
  return cells;
}

/* ═══════════════════════════════════════
   ICONS
═══════════════════════════════════════ */
const ChevLeft  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>;
const ChevDown  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const ClockIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CalIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const UserIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const StarIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const ArrowRight= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const LockIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const VideoIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const InfoIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;



/* ═══════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════ */
function StepBar({ step }) {
  const steps = [
    { num:1, label:"Choose Type" },
    { num:2, label:"Pick Date & Time" },
    { num:3, label:"Confirm Booking" },
  ];
  return (
    <div className="step-bar">
      {steps.map((s, i) => (
        <div key={s.num} className="step-bar-segment">
          <div className={`step-node${step >= s.num ? " step-node--done" : ""}${step === s.num ? " step-node--active" : ""}`}>
            <div className="step-num">{step > s.num ? <CheckIcon/> : s.num}</div>
            <span className="step-label">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-connector${step > s.num ? " step-connector--done" : ""}`}/>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 1 — CHOOSE CONSULTATION TYPE
═══════════════════════════════════════ */
function Step1({ selected, onSelect, onNext }) {
  return (
    <div className="step-panel step1-panel">
      <div className="step-header">
        <div className="step-eyebrow"><span className="eyebrow-line"/>Step 1 of 3</div>
        <h2 className="step-title">CHOOSE YOUR CONSULTATION</h2>
        <p className="step-sub">Select the type of session that best fits your goals. All consultations are available in-person or via video call.</p>
      </div>

      <div className="consult-grid">
        {CONSULTATION_TYPES.map(ct => (
          <div
            key={ct.id}
            className={`consult-card${selected?.id === ct.id ? " consult-card--selected" : ""}`}
            onClick={() => onSelect(ct)}
          >
            {/* Top image strip */}
            <div className="cc-img-wrap">
              <div className="cc-img" style={{ backgroundImage:`url(${ct.img})` }}/>
              <div className="cc-img-overlay"/>
              <span className={`cc-badge cc-badge--${ct.badgeColor}`}>{ct.badge}</span>
            </div>

            {/* Body */}
            <div className="cc-body">
              <div className="cc-icon">{ct.icon}</div>
              <div className="cc-meta-row">
                <span className="cc-duration"><ClockIcon/> {ct.duration}</span>
                <span className="cc-price">{ct.price}</span>
              </div>
              <h3 className="cc-title">{ct.title}</h3>
              <p className="cc-subtitle">{ct.subtitle}</p>
              <p className="cc-desc">{ct.desc}</p>

              <ul className="cc-includes">
                {ct.includes.map(item => (
                  <li key={item}><span className="cc-check"><CheckIcon/></span>{item}</li>
                ))}
              </ul>

              <div className="cc-coach-row">
                <span className="cc-coach-lbl">Coach:</span>
                <span className="cc-coach-val">{ct.coach}</span>
              </div>

              <div className="cc-video-row">
                <VideoIcon/>
                <span>In-person or video call available</span>
              </div>

              {/* Selection indicator */}
              <div className="cc-select-indicator">
                {selected?.id === ct.id
                  ? <><CheckIcon/> Selected</>
                  : <>Select this consultation</>
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="step-footer">
        <div className="step-footer-info">
          <InfoIcon/> All consultations include a confirmation email and calendar invite.
        </div>
        <button
          className="btn-next"
          disabled={!selected}
          onClick={onNext}
        >
          Continue to Scheduling <ArrowRight/>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 2 — DATE & TIME PICKER
═══════════════════════════════════════ */
function Step2({ consultType, selectedDate, selectedTime, onDateSelect, onTimeSelect, onNext, onBack }) {
  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const days  = buildCalendarDays(calYear, calMonth);
  const slots = selectedDate ? getSlotsForDate(selectedDate) : [];

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y=>y-1); setCalMonth(11); }
    else setCalMonth(m=>m-1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y=>y+1); setCalMonth(0); }
    else setCalMonth(m=>m+1);
  };

  const canGoPrev = () => {
    const now = new Date();
    return !(calYear === now.getFullYear() && calMonth === now.getMonth());
  };

  const formatDisplayDate = (ds) => {
    if (!ds) return "";
    const d = new Date(ds + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  };

  const formatTime12 = (t) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12  = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
  };

  return (
    <div className="step-panel step2-panel">
      <div className="step-header">
        <div className="step-eyebrow"><span className="eyebrow-line"/>Step 2 of 3</div>
        <h2 className="step-title">SELECT DATE & TIME</h2>
        <p className="step-sub">Choose an available date, then pick your preferred time slot. Greyed-out dates and times are unavailable.</p>
      </div>

      {/* Selected type summary */}
      <div className="selected-type-summary">
        <span className="sts-icon">{consultType.icon}</span>
        <div>
          <p className="sts-name">{consultType.title}</p>
          <p className="sts-meta"><ClockIcon/> {consultType.duration} &nbsp;·&nbsp; {consultType.price}</p>
        </div>
        <button className="sts-change" onClick={onBack}>Change</button>
      </div>

      <div className="cal-layout">
        {/* Calendar */}
        <div className="calendar-panel">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={prevMonth} disabled={!canGoPrev()}>
              <ChevLeft/>
            </button>
            <span className="cal-month-label">
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button className="cal-nav-btn" onClick={nextMonth}>
              <ChevRight/>
            </button>
          </div>

          {/* Day labels */}
          <div className="cal-day-labels">
            {DAY_LABELS.map(d=><span key={d}>{d}</span>)}
          </div>

          {/* Day cells */}
          <div className="cal-grid">
            {days.map((ds, i) => {
              if (!ds) return <div key={`e-${i}`} className="cal-cell cal-cell--empty"/>;
              const status  = getDateStatus(ds);
              const dayNum  = parseInt(ds.split("-")[2], 10);
              const isSelected = ds === selectedDate;
              const available  = status === "open";

              let cellClass = "cal-cell";
              if (!available)   cellClass += " cal-cell--disabled";
              if (isSelected)   cellClass += " cal-cell--selected";
              if (status === "holiday") cellClass += " cal-cell--holiday";
              if (status === "closed")  cellClass += " cal-cell--closed";

              return (
                <button
                  key={ds}
                  className={cellClass}
                  disabled={!available}
                  onClick={() => { onDateSelect(ds); onTimeSelect(null); }}
                  title={
                    status === "holiday" ? "Public Holiday — Closed" :
                    status === "closed"  ? "Closed on Sundays" :
                    status === "past"    ? "Date has passed" :
                    "Available"
                  }
                >
                  <span className="cal-day-num">{dayNum}</span>
                  {status === "holiday" && <span className="cal-cell-tag">Holiday</span>}
                  {status === "closed"  && <span className="cal-cell-tag">Closed</span>}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="cal-legend">
            <div className="legend-item"><div className="legend-dot legend-dot--available"/><span>Available</span></div>
            <div className="legend-item"><div className="legend-dot legend-dot--selected"/><span>Selected</span></div>
            <div className="legend-item"><div className="legend-dot legend-dot--holiday"/><span>Holiday</span></div>
            <div className="legend-item"><div className="legend-dot legend-dot--closed"/><span>Closed/Booked</span></div>
          </div>
        </div>

        {/* Time slots panel */}
        <div className="time-panel">
          {!selectedDate ? (
            <div className="time-empty">
              <CalIcon/>
              <p>Select a date to see<br/>available time slots</p>
            </div>
          ) : (
            <>
              <div className="time-panel-header">
                <h4 className="time-panel-title">Available Times</h4>
                <p className="time-panel-date">{formatDisplayDate(selectedDate)}</p>
                <p className="time-panel-tz">Timezone: Eastern Time (ET)</p>
              </div>

              {slots.length === 0 ? (
                <div className="time-empty">
                  <ClockIcon/>
                  <p>No slots available<br/>on this day</p>
                </div>
              ) : (
                <div className="time-slots-grid">
                  {slots.map(slot => {
                    const isBooked   = slot.booked;
                    const isSel      = slot.time === selectedTime;
                    let cls = "time-slot";
                    if (isBooked) cls += " time-slot--booked";
                    if (isSel)    cls += " time-slot--selected";

                    return (
                      <button
                        key={slot.time}
                        className={cls}
                        disabled={isBooked}
                        onClick={() => onTimeSelect(slot.time)}
                        title={isBooked ? "Already booked" : `Book ${formatTime12(slot.time)}`}
                      >
                        {formatTime12(slot.time)}
                        {isBooked && <span className="slot-tag">Booked</span>}
                        {isSel    && <span className="slot-tag slot-tag--sel">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedTime && (
                <div className="time-selection-confirm">
                  <CheckIcon/>
                  <span>{formatTime12(selectedTime)} selected</span>
                </div>
              )}
            </>
          )}

          {/* Hours info */}
          <div className="hours-info-box">
            <p className="hours-info-title">GymVault Consultation Hours</p>
            <ul className="hours-info-list">
              <li><span>Mon – Fri</span><span>6:00 AM – 8:00 PM</span></li>
              <li><span>Saturday</span><span>7:00 AM – 5:00 PM</span></li>
              <li><span>Sunday</span><span>Closed</span></li>
              <li><span>Public Holidays</span><span>Closed</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="step-footer">
        <button className="btn-back" onClick={onBack}><ChevLeft/> Back</button>
        <button
          className="btn-next"
          disabled={!selectedDate || !selectedTime}
          onClick={onNext}
        >
          Review & Confirm <ArrowRight/>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 3 — CONFIRM BOOKING
═══════════════════════════════════════ */
function Step3({ consultType, selectedDate, selectedTime, onBack, onConfirm }) {
  const [notes,  setNotes]  = useState("");
  const [format, setFormat] = useState("in-person");
  const [agreed, setAgreed] = useState(false);

  const formatDisplayDate = (ds) => {
    const d = new Date(ds + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  };
  const formatTime12 = (t) => {
    const [h] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:00 ${ampm}`;
  };

  return (
    <div className="step-panel step3-panel">
      <div className="step-header">
        <div className="step-eyebrow"><span className="eyebrow-line"/>Step 3 of 3</div>
        <h2 className="step-title">REVIEW & CONFIRM</h2>
        <p className="step-sub">Review your booking details below. Once confirmed, you'll receive a confirmation email and calendar invite.</p>
      </div>

      <div className="confirm-grid">
        {/* Left — booking summary */}
        <div className="confirm-summary">
          <h4 className="confirm-section-title">Booking Summary</h4>

          {/* User info */}
          <div className="confirm-block confirm-block--user">
            <div className="confirm-avatar">{MOCK_USER.avatar}</div>
            <div className="confirm-user-info">
              <p className="confirm-user-name">{MOCK_USER.firstName} {MOCK_USER.lastName}</p>
              <p className="confirm-user-email"><MailIcon/> {MOCK_USER.email}</p>
              <p className="confirm-user-badge"><StarIcon/> {MOCK_USER.membership}</p>
            </div>
          </div>

          {/* Booking details */}
          <div className="confirm-details">
            <div className="confirm-detail-row">
              <div className="cdr-icon">{consultType.icon}</div>
              <div>
                <p className="cdr-label">Consultation Type</p>
                <p className="cdr-val">{consultType.title}</p>
                <p className="cdr-sub">{consultType.duration} session · {consultType.price}</p>
              </div>
            </div>

            <div className="confirm-detail-row">
              <div className="cdr-icon"><CalIcon/></div>
              <div>
                <p className="cdr-label">Date</p>
                <p className="cdr-val">{formatDisplayDate(selectedDate)}</p>
              </div>
            </div>

            <div className="confirm-detail-row">
              <div className="cdr-icon"><ClockIcon/></div>
              <div>
                <p className="cdr-label">Time</p>
                <p className="cdr-val">{formatTime12(selectedTime)} Eastern Time (ET)</p>
              </div>
            </div>

            <div className="confirm-detail-row">
              <div className="cdr-icon"><UserIcon/></div>
              <div>
                <p className="cdr-label">Coach</p>
                <p className="cdr-val">{consultType.coach}</p>
              </div>
            </div>
          </div>

          {/* Format toggle */}
          <div className="confirm-format">
            <p className="confirm-format-label">Session Format</p>
            <div className="format-toggle">
              <button
                className={`format-btn${format === "in-person" ? " format-btn--active" : ""}`}
                onClick={() => setFormat("in-person")}
              >
                <UserIcon/> In-Person
              </button>
              <button
                className={`format-btn${format === "video" ? " format-btn--active" : ""}`}
                onClick={() => setFormat("video")}
              >
                <VideoIcon/> Video Call
              </button>
            </div>
            {format === "video" && (
              <p className="format-video-note">
                A GymVault Meet link will be sent to your email 15 minutes before your session.
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="confirm-notes">
            <label className="confirm-notes-label">Additional Notes <span className="opt-tag">(optional)</span></label>
            <textarea
              className="confirm-notes-input"
              rows={3}
              placeholder="Tell us about your goals, injuries, or anything you'd like to discuss…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Terms */}
          <label className="confirm-terms">
            <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/>
            <span>
              I agree to GymVault's <a href="#" onClick={e=>e.preventDefault()}>Cancellation Policy</a> — bookings may be cancelled or rescheduled up to 24 hours before the session.
            </span>
          </label>

          <div className="confirm-actions">
            <button className="btn-back" onClick={onBack}><ChevLeft/> Back</button>
            <button
              className="btn-confirm"
              disabled={!agreed}
              onClick={() => onConfirm({ format, notes })}
            >
              <LockIcon/> Confirm Booking
            </button>
          </div>
        </div>

        {/* Right — what to expect */}
        <div className="confirm-right">
          <div className="what-to-expect">
            <h4 className="wte-title">What to Expect</h4>
            <ul className="wte-list">
              {consultType.includes.map(item=>(
                <li key={item}><span className="wte-check"><CheckIcon/></span>{item}</li>
              ))}
            </ul>
          </div>

          <div className="confirm-policy-box">
            <p className="cpb-title"><InfoIcon/> Cancellation Policy</p>
            <ul className="cpb-list">
              <li>Free cancellation up to 24 hours before your session.</li>
              <li>Late cancellations (under 24 hrs) may forfeit paid sessions.</li>
              <li>Reschedule anytime via your booking confirmation email.</li>
            </ul>
          </div>

          <div className="confirm-next-steps">
            <p className="cns-title">After Confirming You'll Receive:</p>
            <div className="cns-item"><span className="cns-num">01</span><span>Confirmation email with booking reference</span></div>
            <div className="cns-item"><span className="cns-num">02</span><span>Calendar invite (.ics) for your session</span></div>
            <div className="cns-item"><span className="cns-num">03</span><span>Coach introduction email 24 hrs before</span></div>
            {format === "video" && <div className="cns-item"><span className="cns-num">04</span><span>GymVault Meet link 15 mins before start</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   BOOKING SUCCESS MODAL
═══════════════════════════════════════ */
function SuccessModal({ booking, onClose }) {
  const { consultType, selectedDate, selectedTime, format, notes } = booking;

  const formatDisplayDate = (ds) => {
    const d = new Date(ds + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  };
  const formatTime12 = (t) => {
    const [h] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:00 ${ampm}`;
  };

  const ref = `GV-${Math.random().toString(36).substring(2,8).toUpperCase()}`;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="success-modal">
        {/* Animated checkmark */}
        <div className="sm-check-wrap">
          <div className="sm-check-ring"/>
          <div className="sm-check-icon"><CheckIcon/></div>
        </div>

        <div className="sm-top">
          <h2 className="sm-title">CONSULTATION BOOKED!</h2>
          <p className="sm-subtitle">
            Your session has been confirmed. <strong>Check your email</strong> for full details, your calendar invite and coach introduction.
          </p>
        </div>

        {/* Booking card */}
        <div className="sm-booking-card">
          <div className="sm-booking-ref">
            <span className="sm-ref-lbl">Booking Reference</span>
            <span className="sm-ref-val">{ref}</span>
          </div>

          <div className="sm-booking-details">
            <div className="sm-detail">
              <span className="sm-detail-lbl">Member</span>
              <span className="sm-detail-val">{MOCK_USER.firstName} {MOCK_USER.lastName}</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Email</span>
              <span className="sm-detail-val">{MOCK_USER.email}</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Consultation</span>
              <span className="sm-detail-val">{consultType.title}</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Date</span>
              <span className="sm-detail-val">{formatDisplayDate(selectedDate)}</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Time</span>
              <span className="sm-detail-val">{formatTime12(selectedTime)} ET</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Format</span>
              <span className="sm-detail-val" style={{ textTransform:"capitalize" }}>{format.replace("-"," ")}</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Duration</span>
              <span className="sm-detail-val">{consultType.duration}</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Price</span>
              <span className="sm-detail-val" style={{ color:"var(--orange)", fontWeight:700 }}>{consultType.price}</span>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="sm-next">
          <p className="sm-next-title">What happens next:</p>
          <div className="sm-next-items">
            <div className="sm-next-item"><span className="sm-next-num">01</span><span>Confirmation email sent to <strong>{MOCK_USER.email}</strong></span></div>
            <div className="sm-next-item"><span className="sm-next-num">02</span><span>Calendar invite (.ics) attached for easy scheduling</span></div>
            <div className="sm-next-item"><span className="sm-next-num">03</span><span>Your coach will email you 24 hrs before the session</span></div>
            {format === "video" && <div className="sm-next-item"><span className="sm-next-num">04</span><span>GymVault Meet link sent 15 minutes before start</span></div>}
          </div>
        </div>

        <div className="sm-actions">
          <button className="sm-btn-secondary" onClick={onClose}>Book Another</button>
          <a href="/" className="sm-btn-primary">Back to Home <ArrowRight/></a>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function ConsultationPage() {
  const [step,          setStep]         = useState(1);
  const [consultType,   setConsultType]  = useState(null);
  const [selectedDate,  setSelectedDate] = useState(null);
  const [selectedTime,  setSelectedTime] = useState(null);
  const [booking,       setBooking]      = useState(null);
  const topRef = useRef(null);

  const scrollTop = () => { if (topRef.current) topRef.current.scrollIntoView({ behavior:"smooth" }); };

  const goTo = (n) => { setStep(n); setTimeout(scrollTop, 50); };

  const handleConfirm = ({ format, notes }) => {
    setBooking({ consultType, selectedDate, selectedTime, format, notes });
  };

  const handleModalClose = () => {
    setBooking(null);
    setStep(1);
    setConsultType(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <div className="consult-page">
    

      {/* Hero */}
      <section className="consult-hero">
        <div className="ch-bg"/>
        <div className="ch-overlay"/>
        <div className="ch-grid"/>
        <div className="ch-content">
          <div className="ch-eyebrow"><span className="eyebrow-line"/>Book a Session</div>
          <h1 className="ch-title">BOOK YOUR<br/><span className="ch-accent">CONSULTATION</span></h1>
          <p className="ch-sub">Three steps. Zero friction. Expert guidance waiting for you.</p>
          <div className="ch-user-tag">
            <div className="ch-user-avatar">{MOCK_USER.avatar}</div>
            <span>Booking as <strong>{MOCK_USER.firstName} {MOCK_USER.lastName}</strong> · {MOCK_USER.membership}</span>
          </div>
        </div>
      </section>

      {/* Booking flow */}
      <div className="booking-wrapper" ref={topRef}>
        <div className="booking-inner">
          <StepBar step={step}/>
          <div className="booking-body">
            {step === 1 && (
              <Step1
                selected={consultType}
                onSelect={setConsultType}
                onNext={() => goTo(2)}
              />
            )}
            {step === 2 && (
              <Step2
                consultType={consultType}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateSelect={setSelectedDate}
                onTimeSelect={setSelectedTime}
                onNext={() => goTo(3)}
                onBack={() => goTo(1)}
              />
            )}
            {step === 3 && (
              <Step3
                consultType={consultType}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onBack={() => goTo(2)}
                onConfirm={handleConfirm}
              />
            )}
          </div>
        </div>
      </div>

      {/* Success modal */}
      {booking && (
        <SuccessModal booking={booking} onClose={handleModalClose}/>
      )}

      {/* Footer strip */}
      <footer className="consult-footer">
        <div className="consult-footer-inner">
          <div className="cf-logo">
            <div className="cf-logo-hex"><div className="cflh-bg"/><div className="cflh-inner"/><span className="cflh-letter">G</span></div>
            <span className="cf-logo-name">GYMVAULT</span>
          </div>
          <p className="cf-copy">© 2026 GymVault Global Inc. All rights reserved.</p>
          <div className="cf-links">
            {["Privacy Policy","Terms","Cancellation Policy"].map(l=>(
              <a key={l} href="#" onClick={e=>e.preventDefault()}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}