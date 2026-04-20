import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Membership.css";
import Navbar from "../../Components/navbar";


/* ═══════════════════════════════════════
   ICONS
═══════════════════════════════════════ */
const CheckIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const StarIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const ArrowRight   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const ChevDown     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;
const ChevUp       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>;
const WhatsappIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
const InstagramIcon= () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const MailIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapPinIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const PlayIcon     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const ZapIcon      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const ShieldIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const UsersIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CartIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const HeartIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const ClockIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const TrophyIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 9a6 6 0 0 0 12 0"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="8" y1="19" x2="16" y2="19"/><path d="M18 2a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4"/><path d="M6 2a4 4 0 0 0-4 4v1a4 4 0 0 0 4 4"/></svg>;
const CloseIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

/* ═══════════════════════════════════════
   MEMBERSHIP PLANS DATA
═══════════════════════════════════════ */
const PLANS = [
  {
    id: "Kiddies",
    icon: "🧒",
    title: "KidS Programme",
    subtitle: "Ages 6 – 15 Years",
    monthlyPrice: 3000,
    yearlyPrice:  30000,
    yearlyMonthly: 2500,
    badge: null,
    badgeColor: null,
    color: "#22C55E",
    popular: false,
    cartName: "Kiddies Programme - Monthly",
    desc: "Safe, structured and fun fitness environment designed specifically for young athletes aged 6–15.",
    features: [
      "Age-appropriate training sessions",
      "Certified youth fitness coaches",
      "Safety-first supervised environment",
      "Fun group challenges & games",
      "Basic nutrition & health education",
      "Monthly fitness progress reports",
      "Parent communication updates",
      "After-school friendly scheduling",
    ],
    
    includes: ["Gym access during session hours", "Locker use", "Water station access"],
    note: "Parent/guardian consent required. Medical form must be completed at sign-up.",
  },
  {
    id: "group",
    icon: "👥",
    title: "Group Training",
    subtitle: "Train Together, Grow Together",
    monthlyPrice: 5000,
    yearlyPrice:  50000,
    yearlyMonthly: 4167,
    badge: "Great Value",
    badgeColor: "blue",
    color: "#3B82F6",
    popular: false,
    cartName: "Group Training - Monthly",
    desc: "High-energy group sessions led by expert coaches. Build strength, lose fat and find your tribe in a motivated, community-driven training environment.",
    features: [
      "Up to 12 sessions per month",
      "All group class formats included",
      "HIIT, Strength, Yoga & more",
      "Certified group fitness coaches",
      "Shared accountability & motivation",
      "Body composition check-ins",
      "Access to class booking app",
      "Monthly challenge events",
    ],
    includes: ["Full gym floor access", "Group class access", "Locker room & showers"],
    note: "Classes subject to availability. Book in advance via the app.",
  },
  {
    id: "single",
    icon: "⚡",
    title: "Single Training",
    subtitle: "1-on-1 Elite Coaching",
    monthlyPrice: 12000,
    yearlyPrice:  120000,
    yearlyMonthly: 10000,
    badge: "Most Popular",
    badgeColor: "orange",
    color: "#F26522",
    popular: true,
    cartName: "Single Training - Monthly",
    desc: "The ultimate personalised fitness experience. Your dedicated coach designs every session around your specific goals, adapting in real time to maximise your results.",
    features: [
      "Personal sessions",
      "Dedicated certified personal trainer",
      "Fully customised training programme",
      "Personalised nutrition guidance",
      "Full gym access — unlimited",
      "Complimentary muscle massage",
    ],
    schedule: "Flexible scheduling — 6:00 AM to 9:00 PM, 7 days a week",
    includes: ["Unlimited gym access", "All group classes", "Locker & showers", "Towel service"],
    note: "Coach assignment based on availability and your goals. Reassignment available on request.",
  },
  {
    id: "specialized",
    icon: "🏆",
    title: "Specialized Training",
    subtitle: "Elite Seasonal Programmes",
    monthlyPrice: null,
    yearlyPrice:  null,
    yearlyMonthly: null,
    badge: "Seasonal",
    badgeColor: "gold",
    color: "#F59E0B",
    popular: false,
    cartName: null,
    desc: "Elite, limited-availability programmes that rotate seasonally — from sport-specific conditioning to competition prep and transformation challenges. Always evolving, always elite.",
    features: [
      "Seasonal sport-specific programmes",
      "Competition & event prep packages",
      "Transformation challenges (6–12 weeks)",
      "Expert specialist coaches",
      "Small group cohorts (max 8 people)",
      "Nutrition planning included",
      "Before/after assessment tracking",
      "Certificate of completion",
    ],
    includes: ["Programme-specific gym access", "All specialist coaching", "Custom plan"],
    note: "Availability is seasonal and limited. Contact us to check current openings.",
    inquiryOnly: true,
  },
];

/* ═══════════════════════════════════════
   TESTIMONIALS DATA
═══════════════════════════════════════ */
const TESTIMONIALS = [
  { name: "Kezia Thompson",  role: "Group Training Member", avatar: "KT", rating: 5, text: "Best gym in Kingston 🔥 The energy in every class is unmatched. I've tried gyms all over the island and B.A.D People is on a completely different level. The coaches push you without making you feel judged.", joined: "Member since 2022" },
  { name: "Marcus Brown",    role: "Single Training Member", avatar: "MB", rating: 5, text: "My trainer completely changed how I think about fitness. I went from barely showing up to training 5 days a week. B.A.D People helped me stay consistent when I was ready to give up. Real results, real people.", joined: "Member since 2023" },
  { name: "Shanelle Reid",   role: "Group Training Member", avatar: "SR", rating: 5, text: "Trainers actually care about your progress, not just your payments. First gym I've ever been to where the coaches remember your name and your goals. The community here is like family.", joined: "Member since 2021" },
  { name: "Andre Nembhard",  role: "Single Training Member", avatar: "AN", rating: 5, text: "Lost 18 lbs in 3 months with my personal trainer. The programme was tailored exactly to what I needed. The nutrition guidance alone was worth the membership fee. 10/10 would recommend.", joined: "Member since 2023" },
  { name: "Tamara Williams", role: "Kiddies Programme",     avatar: "TW", rating: 5, text: "My daughter (8) absolutely loves her sessions. She's more confident, more active and genuinely looks forward to going every week. The youth coaches are incredible with kids.", joined: "Member since 2024" },
  { name: "Devon Clarke",    role: "Specialized Training",  avatar: "DC", rating: 5, text: "Did the competition prep programme before the corporate challenge and placed 1st in my category. The specialist coaching is elite. Not for the faint-hearted but 100% worth it.", joined: "Member since 2022" },
];

/* ═══════════════════════════════════════
   FAQ DATA
═══════════════════════════════════════ */
const FAQS = [
  { q: "Do I need experience to join?", a: "Not at all! B.A.D People Fitness welcomes complete beginners. Our coaches are trained to meet you exactly where you are — from first-timers to seasoned athletes. Every plan starts with a baseline assessment so we understand your current level." },
  { q: "Are there contracts or long-term commitments?", a: "No contracts. Our memberships are month-to-month. If you choose the annual plan you save significantly, but monthly plans have no lock-in period and can be cancelled with 30 days notice." },
  { q: "Can I cancel or pause my membership anytime?", a: "Yes. Monthly members can cancel with 30 days notice at any time. Annual members can pause up to 60 days per year (e.g. illness, travel). Contact our front desk or email us to process." },
  { q: "What should I bring to my first session?", a: "Wear comfortable workout clothes and athletic shoes. Bring a water bottle (refill stations available), a small towel, and your ID for registration. Lockers are provided — bring your own padlock or purchase one from reception." },
  { q: "Can I switch between membership plans?", a: "Absolutely. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately (pro-rated billing), while downgrades apply from the next billing cycle." },
  { q: "Is there a free trial or visitor day?", a: "Yes! We offer a complimentary first session for new members so you can experience B.A.D People Fitness before committing. Book via our contact page or just walk in during opening hours." },
  { q: "What are your opening hours?", a: "We're open Monday–Friday 5:00 AM to 10:00 PM, Saturday 6:00 AM to 8:00 PM, and Sunday 8:00 AM to 4:00 PM. Personal training and specialized sessions may vary." },
  { q: "How does the Kiddies Programme work for parents?", a: "Parents/guardians drop off and pick up at the scheduled session times. A certified youth coach supervises all activities. We send monthly progress updates and require a signed medical/consent form before your child's first session." },
];

/* ═══════════════════════════════════════
   GALLERY DATA
═══════════════════════════════════════ */
const GALLERY_IMGS = [
  { src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&fit=crop", label: "Main Training Floor" },
  { src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80&fit=crop", label: "Strength Zone" },
  { src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&fit=crop", label: "HIIT Classes" },
  { src: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&q=80&fit=crop", label: "Group Sessions" },
  { src: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80&fit=crop", label: "Yoga & Recovery" },
  { src: "https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=600&q=80&fit=crop", label: "Combat Training" },
];

const VIDEOS = [
  { thumb: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80&fit=crop", label: "Morning HIIT Session — Full Class Footage", duration: "4:22" },
  { thumb: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80&fit=crop", label: "Personal Trainer Spotlight — Coach Marcus", duration: "2:58" },
  { thumb: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&q=80&fit=crop", label: "Member Transformation — 3-Month Journey", duration: "5:10" },
];

/* ═══════════════════════════════════════
   CART CONTEXT INTEGRATION HOOK
   Pushes the selected plan into localStorage
   so Shop.jsx can read it from its cart.
   Replace with your actual cart context.
═══════════════════════════════════════ */
function useMembershipCart() {
  const [added, setAdded] = useState(null);

  const addToCart = (plan, billing) => {
    const cartKey = "badpf_membership_cart";
    const existing = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const item = {
      id:    `membership-${plan.id}-${billing}`,
      name:  `${plan.cartName} (${billing === "yearly" ? "Annual" : "Monthly"})`,
      price: billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice,
      img:   null,
      qty:   1,
      type:  "membership",
    };
    const updated = [...existing.filter(i => i.type !== "membership"), item];
    localStorage.setItem(cartKey, JSON.stringify(updated));
    setAdded(plan.id);
    setTimeout(() => setAdded(null), 3000);
    window.dispatchEvent(new CustomEvent("membershipAdded", { detail: item }));
  };

  return { addToCart, added };
}


/* ═══════════════════════════════════════
   PLAN CARD
═══════════════════════════════════════ */
function PlanCard({ plan, billing, onSelect, onInquire, added }) {
  const monthlyDisplay = billing === "yearly" ? plan.yearlyMonthly : plan.monthlyPrice;
  const isAdded = added === plan.id;

  return (
    <div className={`plan-card${plan.popular ? " plan-card--popular" : ""}`} style={{ "--plan-color": plan.color }}>
      {plan.badge && (
        <div className={`plan-badge plan-badge--${plan.badgeColor}`}>{plan.badge}</div>
      )}

      <div className="plan-card-top">
        <div className="plan-icon">{plan.icon}</div>
        <div>
          <h3 className="plan-title">{plan.title}</h3>
          <p className="plan-subtitle">{plan.subtitle}</p>
        </div>
      </div>

      {/* Price */}
      <div className="plan-price-block">
        {plan.monthlyPrice ? (
          <>
            <div className="plan-price-row">
              <span className="plan-currency">$</span>
              <span className="plan-amount">{monthlyDisplay?.toLocaleString()}</span>
              <span className="plan-period">JMD/mo</span>
            </div>
            {billing === "yearly" && (
              <p className="plan-yearly-note">
                Billed ${plan.yearlyPrice?.toLocaleString()} JMD/year · Save ${((plan.monthlyPrice * 12) - plan.yearlyPrice).toLocaleString()} JMD
              </p>
            )}
            {billing === "monthly" && (
              <p className="plan-yearly-note">
                Or ${plan.yearlyMonthly?.toLocaleString()} JMD/mo billed annually
              </p>
            )}
          </>
        ) : (
          <div className="plan-price-inquiry">
            <TrophyIcon/>
            <span>Pricing varies by programme</span>
          </div>
        )}
      </div>

      <p className="plan-desc">{plan.desc}</p>

      {/* Features */}
      <ul className="plan-features">
        {plan.features.map((f, i) => (
          <li key={i}><span className="plan-feature-check"><CheckIcon/></span>{f}</li>
        ))}
      </ul>

      {/* Schedule */}
      <div className="plan-schedule">
        <ClockIcon/>
        <span>{plan.schedule}</span>
      </div>

      {/* Includes */}
      <div className="plan-includes">
        <p className="plan-includes-title">Included</p>
        <div className="plan-includes-tags">
          {plan.includes.map(inc => <span key={inc} className="plan-inc-tag">{inc}</span>)}
        </div>
      </div>

      {plan.note && <p className="plan-note">{plan.note}</p>}

      {/* CTA */}
      {plan.inquiryOnly ? (
        <button className="plan-cta plan-cta--inquiry" onClick={() => onInquire(plan)}>
          Check Availability <ArrowRight/>
        </button>
      ) : (
        <button
          className={`plan-cta${isAdded ? " plan-cta--added" : ""}${plan.popular ? " plan-cta--popular" : ""}`}
          onClick={() => !isAdded && onSelect(plan)}
        >
          {isAdded ? <><CheckIcon/> Added to Cart!</> : <><CartIcon/> {plan.popular ? "Get Started — Most Popular" : "Select This Plan"}</>}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   INQUIRY MODAL (specialized)
═══════════════════════════════════════ */
function InquiryModal({ plan, onClose }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", interest:"" });

  if (!plan) return null;
  const fc = e => setForm(f=>({...f,[e.target.name]:e.target.value}));

  return (
    <div className="modal-bg" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="inquiry-modal">
        <button className="modal-close-btn" onClick={onClose}><CloseIcon/></button>

        {!sent ? (
          <>
            <div className="inq-header">
              <span className="inq-icon">🏆</span>
              <h3 className="inq-title">INQUIRE ABOUT SPECIALIZED TRAINING</h3>
              <p className="inq-sub">Our specialized programmes are seasonal and limited. Reach out via any channel below — our team responds within 24 hours.</p>
            </div>

            {/* Contact channels */}
            <div className="inq-channels">
              <a href="https://wa.me/18764598128 " target="_blank" rel="noopener noreferrer" className="inq-channel inq-channel--whatsapp">
                <WhatsappIcon/><div><p>WhatsApp</p><span>1 (876) 459-8128 </span></div>
              </a>
              <a href="tel:+18764598128 " className="inq-channel inq-channel--phone">
                <PhoneIcon/><div><p>Phone</p><span>1 (876) 459-8128 </span></div>
              </a>
              <a href="https://www.instagram.com/b.a.dpplfitness/" target="_blank" rel="noopener noreferrer" className="inq-channel inq-channel--instagram">
                <InstagramIcon/><div><p>Instagram</p><span>@badpeoplefitness</span></div>
              </a>
              <a href="mailto:info@badpeoplefitness.com" className="inq-channel inq-channel--email">
                <MailIcon/><div><p>Email</p><span>info@badpeoplefitness.com</span></div>
              </a>
              <div className="inq-channel inq-channel--location">
                <MapPinIcon/><div><p>In Person</p><span>107 Hughenden, Kingston 20</span></div>
              </div>
            </div>

            <div className="inq-divider"><span>or fill out the quick form</span></div>

            <div className="inq-form">
              <div className="inq-form-row">
                <div className="inq-field"><label>Full Name</label><input name="name" placeholder="Your name" value={form.name} onChange={fc}/></div>
                <div className="inq-field"><label>Email</label><input name="email" type="email" placeholder="you@email.com" value={form.email} onChange={fc}/></div>
              </div>
              <div className="inq-field"><label>Phone / WhatsApp</label><input name="phone" type="tel" placeholder="+1 (876) 000-0000" value={form.phone} onChange={fc}/></div>
              <div className="inq-field"><label>What interests you?</label><textarea name="interest" rows={3} placeholder="Tell us your goals or what programme you're interested in…" value={form.interest} onChange={fc}/></div>
              <button className="inq-submit" onClick={() => { if(form.name && form.email) setSent(true); }}>
                Send Inquiry <ArrowRight/>
              </button>
            </div>
          </>
        ) : (
          <div className="inq-success">
            <div className="inq-success-ring"/>
            <div className="inq-success-icon"><CheckIcon/></div>
            <h3>Inquiry Sent!</h3>
            <p>Thanks {form.name}! Our team will reach out to you within 24 hours to discuss available specialized programmes.</p>
            <button className="inq-done-btn" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   CART TOAST
═══════════════════════════════════════ */
function CartToast({ plan, billing, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!plan) return null;
  return (
    <div className="cart-toast">
      <div className="ct-icon">{plan.icon}</div>
      <div className="ct-body">
        <p className="ct-title">Added to Cart!</p>
        <p className="ct-sub">{plan.title} · {billing === "yearly" ? "Annual" : "Monthly"}</p>
      </div>
      <Link to="/shop" className="ct-link" onClick={onClose}>View Cart <ArrowRight/></Link>
      <button className="ct-close" onClick={onClose}><CloseIcon/></button>
    </div>
  );
}

/* ═══════════════════════════════════════
   TESTIMONIAL CARD
═══════════════════════════════════════ */
function TestimonialCard({ t, delay }) {
  return (
    <div className="testimonial-card" style={{ animationDelay: `${delay}s` }}>
      <div className="tc-stars">{[...Array(t.rating)].map((_,i)=><StarIcon key={i}/>)}</div>
      <p className="tc-text">"{t.text}"</p>
      <div className="tc-author">
        <div className="tc-avatar">{t.avatar}</div>
        <div>
          <p className="tc-name">{t.name}</p>
          <p className="tc-role">{t.role}</p>
          <p className="tc-joined">{t.joined}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   FAQ ITEM
═══════════════════════════════════════ */
function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " faq-item--open" : ""}`}>
      <button className="faq-question" onClick={() => setOpen(o=>!o)}>
        <span className="faq-num">0{index + 1}</span>
        <span className="faq-q-text">{faq.q}</span>
        <span className="faq-chevron">{open ? <ChevUp/> : <ChevDown/>}</span>
      </button>
      {open && <div className="faq-answer"><p>{faq.a}</p></div>}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN MEMBERSHIP PAGE
═══════════════════════════════════════ */
export default function Membership() {
  const [billing,       setBilling]       = useState("monthly");
  const [inquiryPlan,   setInquiryPlan]   = useState(null);
  const [cartToast,     setCartToast]     = useState(null);
  const [galleryIndex,  setGalleryIndex]  = useState(null);
  const { addToCart, added }              = useMembershipCart();
  const testimonialRef                    = useRef(null);

  const handleSelectPlan = (plan) => {
    addToCart(plan, billing);
    setCartToast({ plan, billing });
  };

  const closeGallery = () => setGalleryIndex(null);

  return (
    <div className="membership-page">
     

      {/* ── HERO ── */}
      <section className="mem-hero">
        <div className="mem-hero-bg"/>
        <div className="mem-hero-overlay"/>
        <div className="mem-hero-grid"/>
        <div className="mem-hero-content">
          <div className="mem-hero-eyebrow"><span className="eyebrow-line"/>Official Membership Plans</div>
          <h1 className="mem-hero-title">
            BUILD YOUR<br/><span className="mem-hero-accent">BEST SELF.</span>
          </h1>
          <p className="mem-hero-sub">
            Four plans. Every level. Zero excuses.<br/>
            B.A.D People Fitness has a programme built for exactly where you are right now.
          </p>
          <div className="mem-hero-stats">
            <div className="mhs-item"><span className="mhs-val">300+</span><span className="mhs-lbl">Active Members</span></div>
            <div className="mhs-divider"/>
            <div className="mhs-item"><span className="mhs-val">5+</span><span className="mhs-lbl">Expert Coaches</span></div>
            <div className="mhs-divider"/>
            <div className="mhs-item"><span className="mhs-val">5AM</span><span className="mhs-lbl">Early Access</span></div>
            <div className="mhs-divider"/>
            <div className="mhs-item"><span className="mhs-val">100%</span><span className="mhs-lbl">No Contract</span></div>
          </div>
          <div className="mem-hero-actions">
            <a href="#plans" className="mem-btn-primary">View Plans <ArrowRight/></a>
            <a href="#gallery" className="mem-btn-ghost">See the Gym</a>
          </div>
        </div>
        <div className="mem-hero-scroll"><div className="mem-scroll-line"/><span>Scroll</span></div>
      </section>

      {/* ── WHY JOIN ── */}
      <section className="why-section">
        <div className="why-inner">
          {[
            { icon: <ZapIcon/>,    title: "Results Guaranteed",   desc: "Every programme is results-driven. If you show up, we guarantee progress tracked every step of the way." },
            { icon: <UsersIcon/>,  title: "Real Community",       desc: "More than a gym, a family. Our members push each other, celebrate each other, and grow together." },
            { icon: <ShieldIcon/>, title: "No Contracts Ever",    desc: "Month-to-month flexibility. No penalties, no fine print. Your fitness journey, your terms." },
            { icon: <TrophyIcon/>, title: "Championship Coaches", desc: "Our trainers hold elite national and international certifications and have coached athletes to podiums across Jamaica and beyond." },
          ].map((w, i) => (
            <div key={i} className="why-card">
              <div className="why-card-icon">{w.icon}</div>
              <h4 className="why-card-title">{w.title}</h4>
              <p className="why-card-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="plans-section" id="plans">
        <div className="plans-section-inner">
          <div className="plans-header">
            <div className="section-eyebrow"><span className="eyebrow-line"/>Membership Plans</div>
            <h2 className="section-title">CHOOSE YOUR PATH</h2>
            <p className="section-sub">Select the plan that fits your goals, schedule and budget. Switch anytime — no penalties.</p>

            {/* Billing toggle */}
            <div className="billing-toggle">
              <button
                className={`billing-btn${billing === "monthly" ? " billing-btn--active" : ""}`}
                onClick={() => setBilling("monthly")}
              >Monthly</button>
              <button
                className={`billing-btn${billing === "yearly" ? " billing-btn--active" : ""}`}
                onClick={() => setBilling("yearly")}
              >
                Annual
                <span className="billing-save-badge">Save up to 17%</span>
              </button>
            </div>
          </div>

          <div className="plans-grid">
            {PLANS.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billing={billing}
                onSelect={handleSelectPlan}
                onInquire={setInquiryPlan}
                added={added}
              />
            ))}
          </div>

          <div className="plans-footer-note">
            <ShieldIcon/> All plans include a complimentary first session · No credit card required to inquire · Prices in Jamaican Dollars (JMD)
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="compare-section">
        <div className="compare-inner">
          <div className="plans-header">
            <div className="section-eyebrow"><span className="eyebrow-line"/>Compare Plans</div>
            <h2 className="section-title">WHAT'S INCLUDED</h2>
          </div>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>🧒 Kiddies</th>
                  <th>👥 Group</th>
                  <th className="compare-popular">⚡ Single</th>
                  <th>🏆 Specialized</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Monthly price",           "$3,000 JMD",   "$5,000 JMD",   "$12,000 JMD",  "Inquire"],
                  ["Gym floor access",         "Session only", "✓",            "Unlimited",    "Programme"],
                  ["Personal trainer",         "—",            "—",            "✓ Dedicated",  "✓ Specialist"],
                  ["Group classes",            "Youth only",   "✓ Unlimited",  "✓ Included",   "—"],
                  ["Nutrition guidance",       "Basic",        "—",            "✓ Full",       "✓ Included"],
                  ["Progress tracking",        "Monthly",      "Check-ins",    "Weekly",       "Assessment"],
                  ["Website consultationbooking access",       "✓",            "✓",            "✓",   "Programme"],
                  ["Website Bages Awards",              "✓",            "✓",            "✓",            "✓"],
                ].map(([feat, ...vals]) => (
                  <tr key={feat}>
                    <td className="compare-feat">{feat}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={i === 2 ? "compare-popular" : ""}>
                        {v === "✓" ? <span className="compare-check"><CheckIcon/></span> : v === "—" ? <span className="compare-dash">—</span> : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="gallery-section" id="gallery">
        <div className="gallery-inner">
          <div className="plans-header">
            <div className="section-eyebrow"><span className="eyebrow-line"/>Our Facility</div>
            <h2 className="section-title">SEE THE GYM</h2>
            <p className="section-sub">World-class equipment. Professional environment. Your second home.</p>
          </div>

          {/* Image grid */}
          <div className="gallery-grid">
            {GALLERY_IMGS.map((img, i) => (
              <div key={i} className="gallery-cell" onClick={() => setGalleryIndex(i)}>
                <div className="gallery-img" style={{ backgroundImage:`url(${img.src})` }}/>
                <div className="gallery-overlay"><span>{img.label}</span></div>
              </div>
            ))}
          </div>

          {/* Videos */}
          <div className="videos-row">
            {VIDEOS.map((v, i) => (
              <div key={i} className="video-card">
                <div className="video-thumb" style={{ backgroundImage:`url(${v.thumb})` }}>
                  <div className="video-overlay"/>
                  <div className="video-play-btn"><PlayIcon/></div>
                  <span className="video-duration">{v.duration}</span>
                </div>
                <p className="video-label">{v.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {galleryIndex !== null && (
        <div className="lightbox" onClick={closeGallery}>
          <button className="lightbox-close"><CloseIcon/></button>
          <div className="lightbox-img" style={{ backgroundImage:`url(${GALLERY_IMGS[galleryIndex].src})` }}/>
          <p className="lightbox-label">{GALLERY_IMGS[galleryIndex].label}</p>
          <div className="lightbox-nav">
            <button onClick={e=>{e.stopPropagation();setGalleryIndex(i=>(i-1+GALLERY_IMGS.length)%GALLERY_IMGS.length);}}>‹</button>
            <button onClick={e=>{e.stopPropagation();setGalleryIndex(i=>(i+1)%GALLERY_IMGS.length);}}>›</button>
          </div>
        </div>
      )}

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section" ref={testimonialRef}>
        <div className="testimonials-inner">
          <div className="plans-header">
            <div className="section-eyebrow"><span className="eyebrow-line"/>Member Stories</div>
            <h2 className="section-title">WHAT OUR MEMBERS SAY</h2>
            <p className="section-sub">Real people. Real results. Real community. Don't take our word for it.</p>
          </div>

          <div className="testimonials-marquee-wrap">
            <div className="testimonials-marquee">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <TestimonialCard key={i} t={t} delay={0}/>
              ))}
            </div>
          </div>

          {/* Overall rating */}
          <div className="overall-rating">
            <div className="or-stars">{[...Array(5)].map((_,i)=><StarIcon key={i}/>)}</div>
            <p className="or-score">4.8 / 5.0</p>
            <p className="or-label">Based on 500+ member reviews</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section">
        <div className="faq-inner">
          <div className="plans-header">
            <div className="section-eyebrow"><span className="eyebrow-line"/>FAQ</div>
            <h2 className="section-title">GOT QUESTIONS?</h2>
            <p className="section-sub">We've answered the most common ones below. Still unsure? Just reach out.</p>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} index={i}/>)}
          </div>
          <div className="faq-contact-cta">
            <p>Still have questions?</p>
            <div className="faq-cta-btns">
              <a href="https://wa.me/18761234567" target="_blank" rel="noopener noreferrer" className="faq-cta-btn faq-cta-btn--whatsapp"><WhatsappIcon/> WhatsApp Us</a>
              <a href="mailto:info@badpeoplefitness.com" className="faq-cta-btn faq-cta-btn--email"><MailIcon/> Email Us</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta-section">
        <div className="final-cta-bg"/>
        <div className="final-cta-overlay"/>
        <div className="final-cta-content">
          <div className="section-eyebrow" style={{justifyContent:"center",marginBottom:"14px"}}><span className="eyebrow-line"/>Start Today</div>
          <h2 className="final-cta-title">THE BEST TIME TO START<br/>WAS YESTERDAY.</h2>
          <p className="final-cta-sub">The second best time is right now. First session is on us — no commitment required.</p>
          <div className="final-cta-btns">
            <a href="#plans" className="mem-btn-primary">View Plans <ArrowRight/></a>
            <a href="https://wa.me/18761234567" target="_blank" rel="noopener noreferrer" className="final-whatsapp-btn"><WhatsappIcon/> Message Us on WhatsApp</a>
          </div>
        </div>
      </section>



      {/* Inquiry Modal */}
      {inquiryPlan && <InquiryModal plan={inquiryPlan} onClose={() => setInquiryPlan(null)}/>}

      {/* Cart Toast */}
      {cartToast && (
        <CartToast
          plan={cartToast.plan}
          billing={cartToast.billing}
          onClose={() => setCartToast(null)}
        />
      )}
    </div>
  );
}