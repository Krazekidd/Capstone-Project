import { useState, useEffect, useRef } from "react";
import { accountAPI, consultationsAPI } from "../../api/api";
import "./Consultations.css";

/* ═══════════════════════════════════════
   ICONS (same as before)
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
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;

/* ═══════════════════════════════════════
   NAVBAR
═══════════════════════════════════════ */
const NAV_ITEMS = [
  { label:"Programs",   children:[{label:"Strength & Conditioning",desc:"Build raw power"},{label:"HIIT & Cardio",desc:"Fat-burning workouts"},{label:"Yoga & Flexibility",desc:"Restore balance"},{label:"Boxing & Combat",desc:"Fight conditioning"},{label:"Personal Training",desc:"1-on-1 coaching"}]},
  { label:"Membership", children:[{label:"Starter Plan",desc:"Equipment access"},{label:"Pro Plan",desc:"Unlimited classes"},{label:"Elite Plan",desc:"Full premium access"},{label:"Corporate",desc:"Team memberships"}]},
  { label:"About",      children:[{label:"Our Story",desc:"15 years of champions"},{label:"Our Trainers",desc:"World-class coaches"},{label:"Locations",desc:"200+ gyms worldwide"},{label:"Press",desc:"News & media"}]},
  { label:"Schedule",   children:null },
  { label:"Contact",    children:null },
];

function Navbar({ userData }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const enter = l => { clearTimeout(closeTimer.current); setActiveMenu(l); };
  const leave = ()  => { closeTimer.current = setTimeout(() => setActiveMenu(null), 180); };

  return (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar-inner">
        <div className="nav-logo">
          <div className="nav-logo-hex"><div className="nlh-bg"/><div className="nlh-inner"/><span className="nlh-letter">G</span></div>
          <span className="nav-logo-name">GYMVAULT</span>
        </div>

        <ul className="nav-links">
          {NAV_ITEMS.map(item => (
            <li key={item.label} className="nav-item"
              onMouseEnter={() => item.children && enter(item.label)}
              onMouseLeave={leave}>
              <span className={`nav-link${activeMenu === item.label ? " nav-link--active" : ""}`}>
                {item.label}{item.children && <ChevDown/>}
              </span>
              {item.children && activeMenu === item.label && (
                <div className="nav-dropdown" onMouseEnter={() => clearTimeout(closeTimer.current)} onMouseLeave={leave}>
                  <div className="nav-dropdown-inner">
                    {item.children.map(c => (
                      <a key={c.label} href="#" className="nav-dropdown-item" onClick={e=>e.preventDefault()}>
                        <span className="ndi-label">{c.label}</span>
                        <span className="ndi-desc">{c.desc}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="nav-user-pill">
          <div className="nav-user-avatar">{userData?.name?.charAt(0) || 'U'}</div>
          <div className="nav-user-info">
            <span className="nav-user-name">{userData?.name?.split(' ')[0] || 'Member'}</span>
            <span className="nav-user-badge">Active Member</span>
          </div>
        </div>

        <div className="nav-actions">
          <a href="/login" className="nav-btn-ghost">Sign In</a>
          <a href="/login" className="nav-btn-solid">Join Now</a>
        </div>

        <button className="nav-hamburger" onClick={() => setMobileOpen(o=>!o)}>
          <span className={mobileOpen?"ham-open":""}/><span className={mobileOpen?"ham-open":""}/><span className={mobileOpen?"ham-open":""}/>
        </button>
      </div>

      {mobileOpen && (
        <div className="nav-mobile">
          {NAV_ITEMS.map(item => (
            <div key={item.label} className="nav-mobile-item">
              <span className="nav-mobile-label">{item.label}</span>
              {item.children && (
                <div className="nav-mobile-children">
                  {item.children.map(c=><a key={c.label} href="#" className="nav-mobile-child" onClick={e=>e.preventDefault()}>{c.label}</a>)}
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
   MY BOOKINGS SECTION
═══════════════════════════════════════ */
function MyBookingsSection({ upcomingBookings, pastBookings, onCancel, loading }) {
  const [cancellingId, setCancellingId] = useState(null);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  };

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this consultation? Cancellations must be made at least 24 hours in advance.")) {
      setCancellingId(bookingId);
      await onCancel(bookingId);
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="my-bookings-loading">
        <div className="loading-spinner-small"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (upcomingBookings.length === 0 && pastBookings.length === 0) {
    return (
      <div className="my-bookings-empty">
        <CalIcon/>
        <h3>No Bookings Yet</h3>
        <p>You haven't booked any consultations yet. Start your fitness journey today!</p>
        <a href="#booking-flow" className="empty-book-btn">Book Your First Consultation</a>
      </div>
    );
  }

  return (
    <div className="my-bookings-section">
      <div className="section-header">
        <div className="section-eyebrow"><span className="eyebrow-line"/>My Account</div>
        <h2 className="section-title">MY CONSULTATIONS</h2>
      </div>

      {upcomingBookings.length > 0 && (
        <div className="bookings-category">
          <h3 className="category-title">
            <span className="category-dot upcoming"></span>
            Upcoming Consultations ({upcomingBookings.length})
          </h3>
          <div className="bookings-grid">
            {upcomingBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-type-icon">{booking.consultation_type_id === 'starter' ? '🚀' : booking.consultation_type_id === 'nutrition' ? '🥗' : '💬'}</div>
                  <div className="booking-info">
                    <h4 className="booking-title">{booking.consultation_title}</h4>
                    <p className="booking-meta">
                      <CalIcon/> {formatDate(booking.booking_date)} at {formatTime(booking.booking_time)}
                    </p>
                    <p className="booking-meta">
                      <VideoIcon/> {booking.session_format === 'in-person' ? 'In-Person' : 'Video Call'}
                    </p>
                  </div>
                  <button 
                    className="booking-cancel-btn"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id ? <div className="spinner-small"/> : <TrashIcon/>}
                    Cancel
                  </button>
                </div>
                <div className="booking-card-footer">
                  <span className="booking-ref">Ref: {booking.booking_reference}</span>
                  <span className="booking-status confirmed">Confirmed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pastBookings.length > 0 && (
        <div className="bookings-category">
          <h3 className="category-title">
            <span className="category-dot past"></span>
            Past Consultations ({pastBookings.length})
          </h3>
          <div className="bookings-grid past-grid">
            {pastBookings.map(booking => (
              <div key={booking.id} className="booking-card past-card">
                <div className="booking-card-header">
                  <div className="booking-type-icon">{booking.consultation_type_id === 'starter' ? '🚀' : booking.consultation_type_id === 'nutrition' ? '🥗' : '💬'}</div>
                  <div className="booking-info">
                    <h4 className="booking-title">{booking.consultation_title}</h4>
                    <p className="booking-meta">
                      <CalIcon/> {formatDate(booking.booking_date)} at {formatTime(booking.booking_time)}
                    </p>
                    <p className="booking-meta">
                      <VideoIcon/> {booking.session_format === 'in-person' ? 'In-Person' : 'Video Call'}
                    </p>
                  </div>
                </div>
                <div className="booking-card-footer">
                  <span className="booking-ref">Ref: {booking.booking_reference}</span>
                  <span className={`booking-status ${booking.status}`}>
                    {booking.status === 'completed' ? 'Completed' : booking.status === 'cancelled' ? 'Cancelled' : booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
function Step1({ consultationTypes, selected, onSelect, onNext, loading }) {
  if (loading) {
    return (
      <div className="step-panel step1-panel">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading consultation types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-panel step1-panel">
      <div className="step-header">
        <div className="step-eyebrow"><span className="eyebrow-line"/>Step 1 of 3</div>
        <h2 className="step-title">CHOOSE YOUR CONSULTATION</h2>
        <p className="step-sub">Select the type of session that best fits your goals. All consultations are available in-person or via video call.</p>
      </div>

      <div className="consult-grid">
        {consultationTypes.map(ct => (
          <div
            key={ct.id}
            className={`consult-card${selected?.id === ct.id ? " consult-card--selected" : ""}`}
            onClick={() => onSelect(ct)}
          >
            <div className="cc-img-wrap">
              <div className="cc-img" style={{ backgroundImage:`url(${ct.img_url})` }}/>
              <div className="cc-img-overlay"/>
              {ct.badge_text && (
                <span className={`cc-badge cc-badge--${ct.badge_color}`}>{ct.badge_text}</span>
              )}
            </div>

            <div className="cc-body">
              <div className="cc-icon">{ct.icon}</div>
              <div className="cc-meta-row">
                <span className="cc-duration"><ClockIcon/> {ct.duration_minutes} min</span>
                <span className="cc-price">{ct.price_display}</span>
              </div>
              <h3 className="cc-title">{ct.title}</h3>
              <p className="cc-subtitle">{ct.subtitle}</p>
              <p className="cc-desc">{ct.description}</p>

              <ul className="cc-includes">
                {ct.includes?.map((item, idx) => (
                  <li key={idx}><span className="cc-check"><CheckIcon/></span>{item}</li>
                ))}
              </ul>

              <div className="cc-coach-row">
                <span className="cc-coach-lbl">Coach:</span>
                <span className="cc-coach-val">{ct.coach_description}</span>
              </div>

              <div className="cc-video-row">
                <VideoIcon/>
                <span>In-person or video call available</span>
              </div>

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
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [holidayName, setHolidayName] = useState(null);

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const buildCalendarDays = (year, month) => {
    const first = new Date(year, month, 1).getDay();
    const daysIn = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= daysIn; d++) {
      const mm = String(month + 1).padStart(2,"0");
      const dd = String(d).padStart(2,"0");
      cells.push(`${year}-${mm}-${dd}`);
    }
    return cells;
  };

  const days = buildCalendarDays(calYear, calMonth);

  const getDateStatus = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const dow = date.getDay();
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    if (date < todayDate) return "past";
    if (dow === 0) return "closed";
    return "open";
  };

  const loadSlotsForDate = async (dateStr) => {
    setLoadingSlots(true);
    try {
      const availability = await consultationsAPI.getAvailability(dateStr);
      setSlots(availability.slots || []);
      setIsHoliday(availability.is_holiday);
      setIsClosed(availability.is_closed);
      setHolidayName(availability.holiday_name);
    } catch (err) {
      console.error("Failed to load slots:", err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadSlotsForDate(selectedDate);
    }
  }, [selectedDate]);

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
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
  };

  return (
    <div className="step-panel step2-panel">
      <div className="step-header">
        <div className="step-eyebrow"><span className="eyebrow-line"/>Step 2 of 3</div>
        <h2 className="step-title">SELECT DATE & TIME</h2>
        <p className="step-sub">Choose an available date, then pick your preferred time slot. Greyed-out dates and times are unavailable.</p>
      </div>

      <div className="selected-type-summary">
        <span className="sts-icon">{consultType.icon}</span>
        <div>
          <p className="sts-name">{consultType.title}</p>
          <p className="sts-meta"><ClockIcon/> {consultType.duration_minutes} min &nbsp;·&nbsp; {consultType.price_display}</p>
        </div>
        <button className="sts-change" onClick={onBack}>Change</button>
      </div>

      <div className="cal-layout">
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

          <div className="cal-day-labels">
            {DAY_LABELS.map(d=><span key={d}>{d}</span>)}
          </div>

          <div className="cal-grid">
            {days.map((ds, i) => {
              if (!ds) return <div key={`e-${i}`} className="cal-cell cal-cell--empty"/>;
              const status = getDateStatus(ds);
              const dayNum = parseInt(ds.split("-")[2], 10);
              const isSelected = ds === selectedDate;
              const available = status === "open";

              let cellClass = "cal-cell";
              if (!available)   cellClass += " cal-cell--disabled";
              if (isSelected)   cellClass += " cal-cell--selected";
              if (status === "closed")  cellClass += " cal-cell--closed";

              return (
                <button
                  key={ds}
                  className={cellClass}
                  disabled={!available}
                  onClick={() => { onDateSelect(ds); onTimeSelect(null); }}
                  title={status === "closed" ? "Closed on Sundays" : "Available"}
                >
                  <span className="cal-day-num">{dayNum}</span>
                </button>
              );
            })}
          </div>

          <div className="cal-legend">
            <div className="legend-item"><div className="legend-dot legend-dot--available"/><span>Available</span></div>
            <div className="legend-item"><div className="legend-dot legend-dot--selected"/><span>Selected</span></div>
            <div className="legend-item"><div className="legend-dot legend-dot--closed"/><span>Closed</span></div>
          </div>
        </div>

        <div className="time-panel">
          {!selectedDate ? (
            <div className="time-empty">
              <CalIcon/>
              <p>Select a date to see<br/>available time slots</p>
            </div>
          ) : isHoliday || isClosed ? (
            <div className="time-empty">
              <InfoIcon/>
              <p>{isHoliday ? `Closed for ${holidayName}` : "Closed on this day"}</p>
            </div>
          ) : loadingSlots ? (
            <div className="time-empty">
              <div className="loading-spinner-small"></div>
              <p>Loading available times...</p>
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
                    const isBooked = slot.booked;
                    const isSel = slot.time === selectedTime;
                    let cls = "time-slot";
                    if (isBooked) cls += " time-slot--booked";
                    if (isSel)    cls += " time-slot--selected";

                    return (
                      <button
                        key={slot.time}
                        className={cls}
                        disabled={isBooked || !slot.available}
                        onClick={() => onTimeSelect(slot.time)}
                        title={isBooked ? "Already booked" : `Book ${formatTime12(slot.time)}`}
                      >
                        {formatTime12(slot.time)}
                        {isBooked && <span className="slot-tag">Booked</span>}
                        {isSel && <span className="slot-tag slot-tag--sel">✓</span>}
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

          <div className="hours-info-box">
            <p className="hours-info-title">Consultation Hours</p>
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
function Step3({ consultType, selectedDate, selectedTime, userData, onBack, onConfirm }) {
  const [notes, setNotes] = useState("");
  const [format, setFormat] = useState("in-person");
  const [agreed, setAgreed] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const formatDisplayDate = (ds) => {
    const d = new Date(ds + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  };
  const formatTime12 = (t) => {
    const [h] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:00 ${ampm}`;
  };

  const handleConfirm = async () => {
    if (!agreed) return;
    setBookingInProgress(true);
    await onConfirm({ format, notes });
    setBookingInProgress(false);
  };

  return (
    <div className="step-panel step3-panel">
      <div className="step-header">
        <div className="step-eyebrow"><span className="eyebrow-line"/>Step 3 of 3</div>
        <h2 className="step-title">REVIEW & CONFIRM</h2>
        <p className="step-sub">Review your booking details below. Once confirmed, you'll receive a confirmation email and calendar invite.</p>
      </div>

      <div className="confirm-grid">
        <div className="confirm-summary">
          <h4 className="confirm-section-title">Booking Summary</h4>

          <div className="confirm-block confirm-block--user">
            <div className="confirm-avatar">{userData?.name?.charAt(0) || 'U'}</div>
            <div className="confirm-user-info">
              <p className="confirm-user-name">{userData?.name || 'Member'}</p>
              <p className="confirm-user-email"><MailIcon/> {userData?.email || 'user@example.com'}</p>
              <p className="confirm-user-badge"><StarIcon/> Active Member</p>
            </div>
          </div>

          <div className="confirm-details">
            <div className="confirm-detail-row">
              <div className="cdr-icon">{consultType.icon}</div>
              <div>
                <p className="cdr-label">Consultation Type</p>
                <p className="cdr-val">{consultType.title}</p>
                <p className="cdr-sub">{consultType.duration_minutes} min session · {consultType.price_display}</p>
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
                <p className="cdr-val">{consultType.coach_description}</p>
              </div>
            </div>
          </div>

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
              disabled={!agreed || bookingInProgress}
              onClick={handleConfirm}
            >
              {bookingInProgress ? (
                <>Processing... </>
              ) : (
                <><LockIcon/> Confirm Booking</>
              )}
            </button>
          </div>
        </div>

        <div className="confirm-right">
          <div className="what-to-expect">
            <h4 className="wte-title">What to Expect</h4>
            <ul className="wte-list">
              {consultType.includes?.map((item, idx) => (
                <li key={idx}><span className="wte-check"><CheckIcon/></span>{item}</li>
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
function SuccessModal({ booking, userData, onClose }) {
  const { consultType, selectedDate, selectedTime, format, notes, response } = booking;

  const formatDisplayDate = (ds) => {
    const d = new Date(ds + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  };
  const formatTime12 = (t) => {
    const [h] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:00 ${ampm}`;
  };

  const bookingRef = response?.booking_reference || `GV-${Math.random().toString(36).substring(2,8).toUpperCase()}`;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="success-modal">
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

        <div className="sm-booking-card">
          <div className="sm-booking-ref">
            <span className="sm-ref-lbl">Booking Reference</span>
            <span className="sm-ref-val">{bookingRef}</span>
          </div>

          <div className="sm-booking-details">
            <div className="sm-detail">
              <span className="sm-detail-lbl">Member</span>
              <span className="sm-detail-val">{userData?.name || 'Member'}</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Email</span>
              <span className="sm-detail-val">{userData?.email || 'user@example.com'}</span>
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
              <span className="sm-detail-val">{consultType.duration_minutes} minutes</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Price</span>
              <span className="sm-detail-val" style={{ color:"var(--orange)", fontWeight:700 }}>{consultType.price_display}</span>
            </div>
          </div>
        </div>

        <div className="sm-next">
          <p className="sm-next-title">What happens next:</p>
          <div className="sm-next-items">
            <div className="sm-next-item"><span className="sm-next-num">01</span><span>Confirmation email sent to <strong>{userData?.email}</strong></span></div>
            <div className="sm-next-item"><span className="sm-next-num">02</span><span>Calendar invite (.ics) attached for easy scheduling</span></div>
            <div className="sm-next-item"><span className="sm-next-num">03</span><span>Your coach will email you 24 hrs before the session</span></div>
            {format === "video" && <div className="sm-next-item"><span className="sm-next-num">04</span><span>GymVault Meet link 15 minutes before start</span></div>}
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
  const [step, setStep] = useState(1);
  const [consultType, setConsultType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [booking, setBooking] = useState(null);
  const [userData, setUserData] = useState(null);
  const [consultationTypes, setConsultationTypes] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const topRef = useRef(null);

  const scrollTop = () => { if (topRef.current) topRef.current.scrollIntoView({ behavior:"smooth" }); };

  const goTo = (n) => { setStep(n); setTimeout(scrollTop, 50); };

  // Load user data and consultation types on mount
  useEffect(() => {
    loadData();
    loadMyBookings();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Get user account info
      const accountData = await accountAPI.getMyAccount();
      setUserData(accountData);
      
      // Get consultation types
      const types = await consultationsAPI.getConsultationTypes();
      setConsultationTypes(types);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyBookings = async () => {
    try {
      setLoadingBookings(true);
      const bookings = await consultationsAPI.getMyConsultations();
      setUpcomingBookings(bookings.upcoming || []);
      setPastBookings(bookings.past || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleConfirm = async ({ format, notes }) => {
    try {
      const bookingData = {
        consultation_type_id: consultType.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        session_format: format,
        notes: notes
      };
      
      const response = await consultationsAPI.bookConsultation(bookingData);
      setBooking({ consultType, selectedDate, selectedTime, format, notes, response });
      
      // Refresh bookings after successful booking
      await loadMyBookings();
    } catch (err) {
      console.error("Booking failed:", err);
      alert(err.detail || "Failed to book consultation. Please try again.");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await consultationsAPI.cancelConsultation(bookingId);
      // Refresh bookings after cancellation
      await loadMyBookings();
      alert("Consultation cancelled successfully.");
    } catch (err) {
      console.error("Cancellation failed:", err);
      alert(err.detail || "Failed to cancel consultation. Please try again.");
    }
  };

  const handleModalClose = () => {
    setBooking(null);
    setStep(1);
    setConsultType(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  if (loading) {
    return (
      <div className="consult-page">
        <Navbar userData={null} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading consultation options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consult-page">
      <Navbar userData={userData} />

      <section className="consult-hero">
        <div className="ch-bg"/>
        <div className="ch-overlay"/>
        <div className="ch-grid"/>
        <div className="ch-content">
          <div className="ch-eyebrow"><span className="eyebrow-line"/>Book a Session</div>
          <h1 className="ch-title">BOOK YOUR<br/><span className="ch-accent">CONSULTATION</span></h1>
          <p className="ch-sub">Three steps. Zero friction. Expert guidance waiting for you.</p>
          <div className="ch-user-tag">
            <div className="ch-user-avatar">{userData?.name?.charAt(0) || 'U'}</div>
            <span>Booking as <strong>{userData?.name || 'Member'}</strong> · Active Member</span>
          </div>
        </div>
      </section>

      {/* My Bookings Section */}
      <div className="my-bookings-wrapper">
        <MyBookingsSection 
          upcomingBookings={upcomingBookings}
          pastBookings={pastBookings}
          onCancel={handleCancelBooking}
          loading={loadingBookings}
        />
      </div>

      {/* Booking Flow */}
      <div className="booking-wrapper" id="booking-flow" ref={topRef}>
        <div className="booking-inner">
          <StepBar step={step}/>
          <div className="booking-body">
            {step === 1 && (
              <Step1
                consultationTypes={consultationTypes}
                selected={consultType}
                onSelect={setConsultType}
                onNext={() => goTo(2)}
                loading={loading}
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
                userData={userData}
                onBack={() => goTo(2)}
                onConfirm={handleConfirm}
              />
            )}
          </div>
        </div>
      </div>

      {booking && (
        <SuccessModal booking={booking} userData={userData} onClose={handleModalClose}/>
      )}

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