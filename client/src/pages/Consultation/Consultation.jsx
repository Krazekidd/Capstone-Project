import { useState, useEffect, useRef } from "react";
import { accountAPI, consultationsAPI } from "../../api/api";
import "./Consultations.css";
import Navbar from "../../Components/navbar";

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
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const RefreshIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;

// Helper function for formatting time
const formatTime12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

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

/* ═══════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════ */
function StepBar({ step }) {
  const steps = [
    { num: 1, label: "Choose Type" },
    { num: 2, label: "Pick Date & Time" },
    { num: 3, label: "Confirm Booking" },
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
   MY BOOKINGS SECTION (Updated)
═══════════════════════════════════════ */
function MyBookingsSection({ upcomingBookings, pastBookings, onCancel, onReschedule, onFeedback, loading }) {
  const [cancellingId, setCancellingId] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
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

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'rescheduled': return 'status-rescheduled';
      case 'no_show': return 'status-no-show';
      default: return 'status-default';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'confirmed': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'rescheduled': return 'Rescheduled';
      case 'no_show': return 'No Show';
      default: return status;
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
                  <div className="booking-type-icon">{booking.emoji_icon || (booking.consultation_type_id === 'starter' ? '🚀' : booking.consultation_type_id === 'nutrition' ? '🥗' : '💬')}</div>
                  <div className="booking-info">
                    <h4 className="booking-title">{booking.consultation_type_name || booking.consultation_title}</h4>
                    <p className="booking-meta">
                      <CalIcon/> {formatDate(booking.scheduled_date || booking.booking_date)} at {formatTime(booking.scheduled_time || booking.booking_time)}
                    </p>
                    <p className="booking-meta">
                      <UserIcon/> Coach: {booking.coach_name || 'TBD'}
                    </p>
                    <p className="booking-meta">
                      <VideoIcon/> {booking.format === 'in_person' ? 'In-Person' : booking.format === 'video' ? 'Video Call' : (booking.session_format || 'In-Person')}
                    </p>
                  </div>
                  <div className="booking-actions">
                    <button 
                      className="booking-reschedule-btn"
                      onClick={() => setRescheduleModal(booking)}
                    >
                      <RefreshIcon/> Reschedule
                    </button>
                    <button 
                      className="booking-cancel-btn"
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? <div className="spinner-small"/> : <TrashIcon/>}
                      Cancel
                    </button>
                  </div>
                </div>
                <div className="booking-card-footer">
                  <span className="booking-ref">Ref: {booking.reference || booking.booking_reference}</span>
                  <span className={`booking-status ${getStatusBadgeClass(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
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
                  <div className="booking-type-icon">{booking.emoji_icon || (booking.consultation_type_id === 'starter' ? '🚀' : booking.consultation_type_id === 'nutrition' ? '🥗' : '💬')}</div>
                  <div className="booking-info">
                    <h4 className="booking-title">{booking.consultation_type_name || booking.consultation_title}</h4>
                    <p className="booking-meta">
                      <CalIcon/> {formatDate(booking.scheduled_date || booking.booking_date)} at {formatTime(booking.scheduled_time || booking.booking_time)}
                    </p>
                    <p className="booking-meta">
                      <UserIcon/> Coach: {booking.coach_name || 'TBD'}
                    </p>
                    <p className="booking-meta">
                      <VideoIcon/> {booking.format === 'in_person' ? 'In-Person' : booking.format === 'video' ? 'Video Call' : (booking.session_format || 'In-Person')}
                    </p>
                  </div>
                  {booking.status === 'completed' && !booking.has_feedback && (
                    <button 
                      className="booking-feedback-btn"
                      onClick={() => setFeedbackModal(booking)}
                    >
                      <StarIcon/> Rate Session
                    </button>
                  )}
                </div>
                <div className="booking-card-footer">
                  <span className="booking-ref">Ref: {booking.reference || booking.booking_reference}</span>
                  <span className={`booking-status ${getStatusBadgeClass(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <RescheduleModal 
          booking={rescheduleModal}
          onClose={() => setRescheduleModal(null)}
          onReschedule={onReschedule}
        />
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <FeedbackModal 
          booking={feedbackModal}
          onClose={() => setFeedbackModal(null)}
          onSubmit={onFeedback}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   RESCHEDULE MODAL
═══════════════════════════════════════ */
function RescheduleModal({ booking, onClose, onReschedule }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const availability = await consultationsAPI.getAvailability(date, booking.consultation_type_id);
      setSlots(availability.coaches?.find(c => c.coach_id === booking.coach_id)?.slots || []);
    } catch (err) {
      console.error("Failed to load slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedDate);
    }
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    await onReschedule(booking.id, selectedDate, selectedTime, reason);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="reschedule-modal">
        <h3>Reschedule Consultation</h3>
        <p className="modal-sub">Select a new date and time for your {booking.consultation_type_name}</p>
        
        <div className="reschedule-date-picker">
          <label>New Date</label>
          <input 
            type="date" 
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate || ''}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {selectedDate && (
          <div className="reschedule-time-slots">
            <label>Available Times</label>
            {loadingSlots ? (
              <div className="loading-spinner-small"/>
            ) : (
              <div className="time-slots-grid">
                {slots.filter(s => s.available).map(slot => (
                  <button
                    key={slot.time}
                    className={`time-slot ${selectedTime === slot.time ? 'time-slot--selected' : ''}`}
                    onClick={() => setSelectedTime(slot.time)}
                  >
                    {formatTime12(slot.time)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="reschedule-reason">
          <label>Reason for Rescheduling (optional)</label>
          <textarea 
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell us why you need to reschedule..."
          />
        </div>

        <div className="modal-actions">
          <button className="btn-back" onClick={onClose}>Cancel</button>
          <button 
            className="btn-confirm" 
            disabled={!selectedDate || !selectedTime || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Processing..." : "Confirm Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   FEEDBACK MODAL
═══════════════════════════════════════ */
function FeedbackModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await onSubmit(booking.id, rating, review, wouldRecommend);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="feedback-modal">
        <h3>Rate Your Consultation</h3>
        <p className="modal-sub">How was your {booking.consultation_type_name} with {booking.coach_name || 'your coach'}?</p>
        
        <div className="rating-stars">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              className={`star-btn ${star <= (hoverRating || rating) ? 'star-active' : ''}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>

        <div className="feedback-review">
          <label>Your Review (optional)</label>
          <textarea 
            rows={3}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with the coach and consultation..."
          />
        </div>

        <div className="feedback-recommend">
          <label>Would you recommend this consultation to others?</label>
          <div className="recommend-buttons">
            <button 
              className={`recommend-btn ${wouldRecommend ? 'active-yes' : ''}`}
              onClick={() => setWouldRecommend(true)}
            >
              Yes, definitely
            </button>
            <button 
              className={`recommend-btn ${!wouldRecommend ? 'active-no' : ''}`}
              onClick={() => setWouldRecommend(false)}
            >
              Not really
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-back" onClick={onClose}>Skip</button>
          <button 
            className="btn-confirm" 
            disabled={rating === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 1 — CHOOSE CONSULTATION TYPE (Updated)
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
            <div className="cc-body">
              <div className="cc-icon">{ct.emoji_icon || '💬'}</div>
              <div className="cc-meta-row">
                <span className="cc-duration"><ClockIcon/> {ct.duration_minutes} min</span>
                <span className="cc-price">${ct.price === 0 ? 'Free' : ct.price}</span>
              </div>
              <h3 className="cc-title">{ct.name}</h3>
              <p className="cc-subtitle">{ct.subtitle}</p>
              <p className="cc-desc">{ct.description}</p>

              <ul className="cc-includes">
                {ct.what_to_expect?.map((item, idx) => (
                  <li key={idx}><span className="cc-check"><CheckIcon/></span>{item}</li>
                ))}
              </ul>

              {ct.requires_membership && ct.requires_membership !== 'free' && (
                <div className="cc-membership-warning">
                  <LockIcon/> Requires {ct.requires_membership} membership
                </div>
              )}

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
   STEP 2 — DATE & TIME PICKER (Updated for multi-coach)
═══════════════════════════════════════ */
function Step2({ consultType, selectedDate, selectedTime, selectedCoach, onDateSelect, onTimeSelect, onCoachSelect, onNext, onBack }) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [availability, setAvailability] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

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
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    if (date < todayDate) return "past";
    return "open";
  };

const loadAvailability = async (dateStr) => {
  setLoadingSlots(true);
  try {
    console.log('Fetching availability for date:', dateStr);
    console.log('Consultation type ID:', consultType?.id);
    
    const data = await consultationsAPI.getAvailability(dateStr, consultType?.id);
    console.log('Availability response:', data);
    
    setAvailability(data);
    
    if (!data.coaches || data.coaches.length === 0) {
      console.log('No coaches available on this date');
    }
  } catch (err) {
    console.error("Failed to load availability:", err);
    setAvailability(null);
  } finally {
    setLoadingSlots(false);
  }
};

  useEffect(() => {
    if (selectedDate) {
      loadAvailability(selectedDate);
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
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
  };

  return (
    <div className="step-panel step2-panel">
      <div className="step-header">
        <div className="step-eyebrow"><span className="eyebrow-line"/>Step 2 of 3</div>
        <h2 className="step-title">SELECT DATE, TIME & COACH</h2>
        <p className="step-sub">Choose an available date, then pick your preferred time slot and coach.</p>
      </div>

      <div className="selected-type-summary">
        <span className="sts-icon">{consultType.emoji_icon || '💬'}</span>
        <div>
          <p className="sts-name">{consultType.name}</p>
          <p className="sts-meta"><ClockIcon/> {consultType.duration_minutes} min &nbsp;·&nbsp; ${consultType.price === 0 ? 'Free' : consultType.price}</p>
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

              return (
                <button
                  key={ds}
                  className={cellClass}
                  disabled={!available}
                  onClick={() => { onDateSelect(ds); onTimeSelect(null); onCoachSelect(null); }}
                >
                  <span className="cal-day-num">{dayNum}</span>
                </button>
              );
            })}
          </div>

          <div className="cal-legend">
            <div className="legend-item"><div className="legend-dot legend-dot--available"/><span>Available</span></div>
            <div className="legend-item"><div className="legend-dot legend-dot--selected"/><span>Selected</span></div>
          </div>
        </div>

        <div className="time-panel">
          {!selectedDate ? (
            <div className="time-empty">
              <CalIcon/>
              <p>Select a date to see<br/>available time slots & coaches</p>
            </div>
          ) : loadingSlots ? (
            <div className="time-empty">
              <div className="loading-spinner-small"></div>
              <p>Loading available times...</p>
            </div>
          ) : (
            <>
              <div className="time-panel-header">
                <h4 className="time-panel-title">Available Sessions</h4>
                <p className="time-panel-date">{formatDisplayDate(selectedDate)}</p>
              </div>

              {!availability?.coaches?.length ? (
                <div className="time-empty">
                  <ClockIcon/>
                  <p>No sessions available<br/>on this day</p>
                </div>
              ) : (
                <>
                  {availability.coaches.map(coach => (
                    <div key={coach.coach_id} className="coach-slot-group">
                      <div className="coach-header">
                        <UserIcon/>
                        <span className="coach-name">{coach.coach_name}</span>
                      </div>
                      <div className="time-slots-grid">
                        {coach.slots.filter(s => s.available).map(slot => (
                          <button
                            key={slot.time}
                            className={`time-slot ${selectedTime === slot.time && selectedCoach === coach.coach_id ? 'time-slot--selected' : ''}`}
                            onClick={() => {
                              onTimeSelect(slot.time);
                              onCoachSelect(coach.coach_id);
                            }}
                          >
                            {formatTime12(slot.time)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {selectedTime && selectedCoach && (
                <div className="time-selection-confirm">
                  <CheckIcon/>
                  <span>{formatTime12(selectedTime)} with {availability?.coaches?.find(c => c.coach_id === selectedCoach)?.coach_name} selected</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="step-footer">
        <button className="btn-back" onClick={onBack}><ChevLeft/> Back</button>
        <button
          className="btn-next"
          disabled={!selectedDate || !selectedTime || !selectedCoach}
          onClick={onNext}
        >
          Review & Confirm <ArrowRight/>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 3 — CONFIRM BOOKING (Updated)
═══════════════════════════════════════ */
function Step3({ consultType, selectedDate, selectedTime, selectedCoach, coachName, userData, onBack, onConfirm }) {
  const [notes, setNotes] = useState("");
  const [format, setFormat] = useState("in_person");
  const [agreed, setAgreed] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const formatDisplayDate = (ds) => {
    const d = new Date(ds + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  };
  const formatTime12 = (t) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
  };

  const handleConfirm = async () => {
    if (!agreed) return;
    setBookingInProgress(true);
    await onConfirm({ format, notes, coach_id: selectedCoach });
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
              <p className="confirm-user-badge"><StarIcon/> {userData?.membership_tier || 'Active'} Member</p>
            </div>
          </div>

          <div className="confirm-details">
            <div className="confirm-detail-row">
              <div className="cdr-icon">{consultType.emoji_icon || '💬'}</div>
              <div>
                <p className="cdr-label">Consultation Type</p>
                <p className="cdr-val">{consultType.name}</p>
                <p className="cdr-sub">{consultType.duration_minutes} min session · ${consultType.price === 0 ? 'Free' : consultType.price}</p>
              </div>
            </div>

            <div className="confirm-detail-row">
              <div className="cdr-icon"><UserIcon/></div>
              <div>
                <p className="cdr-label">Coach</p>
                <p className="cdr-val">{coachName || 'Assigned Coach'}</p>
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
                <p className="cdr-val">{formatTime12(selectedTime)} (Timezone: America/New_York)</p>
              </div>
            </div>
          </div>

          <div className="confirm-format">
            <p className="confirm-format-label">Session Format</p>
            <div className="format-toggle">
              <button
                className={`format-btn${format === "in_person" ? " format-btn--active" : ""}`}
                onClick={() => setFormat("in_person")}
              >
                <UserIcon/> In-Person
              </button>
              <button
                className={`format-btn${format === "video_call" ? " format-btn--active" : ""}`}
                onClick={() => setFormat("video_call")}
              >
                <VideoIcon/> Video Call
              </button>
            </div>
            {format === "video_call" && (
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
              {consultType.what_to_expect?.map((item, idx) => (
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
   BOOKING SUCCESS MODAL (Updated)
═══════════════════════════════════════ */
function SuccessModal({ booking, userData, onClose }) {
  const { consultType, selectedDate, selectedTime, format, notes, response, coachName } = booking;

  const formatDisplayDate = (ds) => {
    const d = new Date(ds + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  };
  const formatTime12 = (t) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
  };

  const bookingRef = response?.reference || response?.booking_reference || `GV-${Math.random().toString(36).substring(2,8).toUpperCase()}`;

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
              <span className="sm-detail-val">{consultType.name}</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Coach</span>
              <span className="sm-detail-val">{coachName || 'Assigned Coach'}</span>
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
              <span className="sm-detail-val" style={{ textTransform:"capitalize" }}>{format.replace("_", " ")}</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Duration</span>
              <span className="sm-detail-val">{consultType.duration_minutes} minutes</span>
            </div>
            <div className="sm-detail">
              <span className="sm-detail-lbl">Price</span>
              <span className="sm-detail-val" style={{ color:"var(--orange)", fontWeight:700 }}>
                ${consultType.price === 0 ? 'Free' : consultType.price}
              </span>
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
   MAIN PAGE (Updated)
═══════════════════════════════════════ */
export default function ConsultationPage() {
  const [step, setStep] = useState(1);
  const [consultType, setConsultType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedCoachName, setSelectedCoachName] = useState(null);
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
      const accountData = await accountAPI.getMyAccount();
      setUserData(accountData);
      
      const typesResponse = await consultationsAPI.getConsultationTypes();
      const types = typesResponse.types || typesResponse;
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

  const handleConfirm = async ({ format, notes, coach_id }) => {
    try {
      const bookingData = {
        consultation_type_id: consultType.id,
        coach_id: coach_id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        format: format,
        notes: notes,
        agreed_cancellation_policy: true
      };
      
      const response = await consultationsAPI.bookConsultation(bookingData);
      
      // Get coach name from availability data or response
      const coachNameValue = selectedCoachName || response.coach_name || 'Assigned Coach';
      
      setBooking({ 
        consultType, 
        selectedDate, 
        selectedTime, 
        format, 
        notes, 
        response,
        coachName: coachNameValue
      });
      
      await loadMyBookings();
      setStep(1);
      setConsultType(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedCoach(null);
      setSelectedCoachName(null);
    } catch (err) {
      console.error("Booking failed:", err);
      alert(err.detail || "Failed to book consultation. Please try again.");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await consultationsAPI.cancelConsultation(bookingId);
      await loadMyBookings();
      alert("Consultation cancelled successfully.");
    } catch (err) {
      console.error("Cancellation failed:", err);
      alert(err.detail || "Failed to cancel consultation. Please try again.");
    }
  };

  const handleRescheduleBooking = async (bookingId, newDate, newTime, reason) => {
    try {
      await consultationsAPI.rescheduleBooking(bookingId, newDate, newTime, reason);
      await loadMyBookings();
      alert("Consultation rescheduled successfully.");
    } catch (err) {
      console.error("Reschedule failed:", err);
      alert(err.detail || "Failed to reschedule consultation. Please try again.");
    }
  };

  const handleSubmitFeedback = async (bookingId, rating, review, wouldRecommend) => {
    try {
      await consultationsAPI.submitFeedback(bookingId, rating, review, wouldRecommend);
      await loadMyBookings();
      alert("Thank you for your feedback!");
    } catch (err) {
      console.error("Feedback submission failed:", err);
      alert(err.detail || "Failed to submit feedback. Please try again.");
    }
  };

  const handleModalClose = () => {
    setBooking(null);
  };

  // Helper function to format time for display
  const formatTime12Helper = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
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
            <span>Booking as <strong>{userData?.name || 'Member'}</strong> · {userData?.membership_tier || 'Active'} Member</span>
          </div>
        </div>
      </section>

      {/* My Bookings Section */}
      <div className="my-bookings-wrapper">
        <MyBookingsSection 
          upcomingBookings={upcomingBookings}
          pastBookings={pastBookings}
          onCancel={handleCancelBooking}
          onReschedule={handleRescheduleBooking}
          onFeedback={handleSubmitFeedback}
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
                selectedCoach={selectedCoach}
                onDateSelect={setSelectedDate}
                onTimeSelect={setSelectedTime}
                onCoachSelect={(coachId) => {
                  setSelectedCoach(coachId);
                  // Find coach name from availability data
                  // This would be populated from the availability response
                }}
                onNext={() => goTo(3)}
                onBack={() => goTo(1)}
              />
            )}
            {step === 3 && (
              <Step3
                consultType={consultType}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedCoach={selectedCoach}
                coachName={selectedCoachName}
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

