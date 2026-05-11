import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../api/api";
import { useAuth } from "../../Context/AuthContext";
import "./Login.css";

/* ── Icons ── */
const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/></>}
  </svg>
);

const Check = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const MailIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <polyline points="2,4 12,13 22,4"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   ROLE-BASED REDIRECTION HELPER
════════════════════════════════════════════════════════════ */
const getRedirectPath = (role) => {
  switch(role) {
    case 'admin':   return '/admin';
    case 'trainer': return '/trainer';
    case 'client':  return '/account';
    default:        return '/account';
  }
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function Login() {
  const navigate = useNavigate();
  const { login, user, isLoggedIn } = useAuth();

  /* Sign-in state */
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  /* Create-account modal state */
  const [modal, setModal] = useState(false);
  const [step, setStep]   = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm]   = useState({
    firstName: "", lastName: "", email: "", gender: "",
    dob: "", phone: "", height: "", weight: "",
    password: "", confirm: "", agree: false,
  });
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [errs, setErrs]     = useState({});

  /* Forgot-password modal state */
  const [fpModal, setFpModal]       = useState(false);
  const [fpEmail, setFpEmail]       = useState("");
  const [fpEmailErr, setFpEmailErr] = useState("");
  const [fpSent, setFpSent]         = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  /* Legal modal state */
  const [legalModal, setLegalModal] = useState(null); // "terms" | "privacy" | null

  // Check if already logged in and redirect based on role
  useEffect(() => {
    // Check auth context first
    if (isLoggedIn && user) {
      const isSenior = user.role === 'trainer' && !!user.is_senior;
      const redirectPath = isSenior ? '/STrainer' : getRedirectPath(user.role);
      navigate(redirectPath);
      return;
    }
    
    // Fallback to token check via localStorage
    const token = authAPI.getToken();
    const role = authAPI.getUserRole();
    
    if (token && role) {
      let isSenior = false;
      try {
        const stored = JSON.parse(localStorage.getItem('userData') || '{}');
        isSenior = role === 'trainer' && !!stored.is_senior;
      } catch (_) {}
      const redirectPath = isSenior ? '/STrainer' : getRedirectPath(role);
      navigate(redirectPath);
    }
    
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
    }
  }, [navigate, isLoggedIn, user]);

  /* ── Sign In handler with role-based redirect ── */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await authAPI.login(email, pw);
      
      // Store user data in auth context
      login(response);
      
      // Store remembered email if checkbox exists
      const rememberCheckbox = document.querySelector('input[name="remember"]');
      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      
      // Redirect based on role — role lives in response.user.role
      const role = response.user?.role || response.role || 'client';
      const isSenior = response.is_senior ?? false;
      const redirectPath = role === 'trainer' && isSenior ? '/STrainer' : getRedirectPath(role);
      navigate(redirectPath);
    } catch (err) {
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Handle FastAPI validation errors (array of validation errors)
          errorMessage = err.response.data.detail
            .map(error => error.msg || error.message || 'Validation error')
            .join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.detail) {
        errorMessage = err.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setLoginError(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  /* ── Create-account helpers ── */
  const fc = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrs(p => ({ ...p, [name]: "" }));
  };

  const v1 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name required";
    if (!form.lastName.trim()) e.lastName = "Last name required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.gender) e.gender = "Please select";
    if (!form.dob) e.dob = "Required";
    setErrs(e);
    return !Object.keys(e).length;
  };

  const v2 = () => {
    const e = {};
    if (!form.password || form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!form.agree) e.agree = "You must accept the terms";
    setErrs(e);
    return !Object.keys(e).length;
  };

  const openCreate = () => { 
    setModal(true); 
    setStep(1); 
    setErrs({});
    setForm({
      firstName: "", lastName: "", email: "", gender: "",
      dob: "", phone: "", height: "", weight: "",
      password: "", confirm: "", agree: false,
    });
  };
  
  const closeCreate = () => { 
    setModal(false); 
    setStep(1);
    setIsCreating(false);
  };
  
  const next = () => { 
    if (v1()) setStep(2); 
  };
  
  const submitCreate = async () => {
    if (!v2()) return;
    
    setIsCreating(true);
    try {
      const userData = {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || "",
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        birthday: form.dob || null,
        gender: form.gender !== "prefer-not" ? form.gender : "prefer_not_to_say"
      };
      
      const response = await authAPI.register(userData);
      
      // Store user data in auth context
      login(response);
      
      closeCreate();
      
      // Redirect based on role (new clients always get client role)
      const redirectPath = getRedirectPath(response.role);
      navigate(redirectPath);
    } catch (err) {
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Handle FastAPI validation errors (array of validation errors)
          errorMessage = err.response.data.detail
            .map(error => error.msg || error.message || 'Validation error')
            .join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.detail) {
        errorMessage = err.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setErrs({ general: errorMessage });
    } finally {
      setIsCreating(false);
    }
  };

  /* ── Forgot-password helpers ── */
  const openFp = e => {
    e.preventDefault();
    setFpEmail("");
    setFpEmailErr("");
    setFpSent(false);
    setFpModal(true);
  };
  
  const closeFp = () => {
    setFpModal(false);
    setFpEmail("");
    setFpEmailErr("");
    setFpSent(false);
    setIsSendingReset(false);
  };
  
  const submitFp = async () => {
    if (!fpEmail || !/\S+@\S+\.\S+/.test(fpEmail)) {
      setFpEmailErr("Please enter a valid email address");
      return;
    }
    
    setIsSendingReset(true);
    try {
      await authAPI.forgotPassword(fpEmail);
      setFpSent(true);
    } catch (err) {
      setFpEmailErr(err.detail || "Failed to send reset email. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  /* ── Password strength helper ── */
  function pwStr(p) {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  const str = pwStr(form.password);
  const strLbl = ["", "Weak", "Fair", "Good", "Strong"][str];
  const strCls = ["", "weak", "fair", "good", "strong"][str];

  return (
    <>
      <div className="app-shell">
        {/* ══ LEFT PANEL ══ */}
        <div className="left-panel">
          <div className="left-bg-img"/>
          <div className="left-overlay"/>
          <div className="left-top-corner"/>
          <div className="left-bot-corner"/>
          <div className="left-orange-accent"/>

          <div className="left-content">
            <div className="logo-wrap">
              <div className="logo-hex-wrap"> 
                <div className="logo-hex-bg"/> 
                <div className="logo-hex-inner"/>
                <span className="logo-letter">
                  <span>
                    <img src="/images/triallogo.png" alt="GymPRO Logo" style={{ width: "150px", height: "200px" }} />
                  </span>
                </span>
              </div>
              <div className="brand-name">GYMPRO</div>
              <div className="brand-tagline">Forge Your Legacy</div>
            </div>

            <div className="stats-row">
              <div className="stat"><div className="stat-val">100+</div><div className="stat-lbl">Programmes</div></div>
              <div className="stat"><div className="stat-val">300+</div><div className="stat-lbl">Members</div></div>
              <div className="stat"><div className="stat-val">15+</div><div className="stat-lbl">Years</div></div>
            </div>
          </div>

          <div className="left-footer"> 2026 GymPRO Global Inc.</div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="right-panel">
          <div className="form-wrap">

            <div className="form-head">
              <div className="eyebrow"><span className="eyebrow-line"/>Member Portal</div>
              <h1>SIGN IN</h1>
              <p>Access your training dashboard, track progress, and manage your membership.</p>
            </div>

            {loginError && <div className="error-message">{loginError}</div>}

            <form onSubmit={handleSignIn}>
              <div className="fgrp">
                <label>Email Address</label>
                <input
                  type="email" 
                  placeholder="you@example.com"
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoggedIn}
                  required
                />
              </div>

              <div className="fgrp">
                <label>Password</label>
                <div className="inp-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={pw} 
                    onChange={e => setPw(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button className="eye-btn" onClick={() => setShowPw(s => !s)} type="button" tabIndex={-1} disabled={isLoggedIn}>
                    <EyeIcon open={showPw}/>
                  </button>
                </div>
                <div className="aux-row">
                  <a href="#" className="link-aux" onClick={openFp}>Forgot Password?</a>
                </div>
              </div>

              <div className="options-row">
                <label className="remember-checkbox">
                  <input type="checkbox" name="remember" disabled={isLoggedIn} /> Remember Me
                </label>
              </div>

              <button className="btn-main" type="submit" disabled={isLoggingIn || isLoggedIn}>
                {isLoggedIn ? "Already Signed In" : isLoggingIn ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="form-foot">
              <span>Not a member yet?</span>
              <a href="#" className="link-cta" onClick={e => { e.preventDefault(); openCreate(); }}>Create Account</a>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════
          FORGOT PASSWORD MODAL
      ══════════════════════════ */}
      {fpModal && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) closeFp(); }}>
          <div className="modal-box fp-box">
            <button className="modal-close" onClick={closeFp} type="button">✕</button>

            {!fpSent ? (
              <>
                <div className="modal-head">
                  <div className="eyebrow"><span className="eyebrow-line"/>Account Recovery</div>
                  <h2>FORGOT PASSWORD?</h2>
                  <p>Enter the email address linked to your GymPRO account and we'll send you a reset link.</p>
                </div>

                <div className="fgrp">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={fpEmail}
                    onChange={e => { setFpEmail(e.target.value); setFpEmailErr(""); }}
                    autoComplete="email"
                  />
                  {fpEmailErr && <span className="err">{fpEmailErr}</span>}
                </div>

                <button className="btn-main" type="button" onClick={submitFp} disabled={isSendingReset}>
                  {isSendingReset ? "Sending..." : "Reset Password"}
                </button>

                <div className="fp-back-row">
                  <a href="#" className="link-aux" onClick={e => { e.preventDefault(); closeFp(); }}>
                    ← Back to Sign In
                  </a>
                </div>
              </>
            ) : (
              <div className="fp-success">
                <div className="fp-success-icon"><MailIcon/></div>
                <h2>CHECK YOUR EMAIL</h2>
                <p className="fp-success-sub">We've sent a password reset link to</p>
                <p className="fp-sent-email">{fpEmail}</p>
                <p className="fp-success-note">
                  Didn't receive it? Check your spam folder or{" "}
                  <a href="#" className="link-cta" onClick={e => { e.preventDefault(); setFpSent(false); }}>
                    try again
                  </a>.
                </p>
                <button className="btn-main fp-done-btn" type="button" onClick={closeFp}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════
          CREATE ACCOUNT MODAL
      ══════════════════════════ */}
      {modal && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) closeCreate(); }}>
          <div className="modal-box">
            <button className="modal-close" onClick={closeCreate} type="button">✕</button>

            <div className="modal-head">
              <div className="eyebrow"><span className="eyebrow-line"/>New Member</div>
              <h2>CREATE ACCOUNT</h2>
              <p>Join over a million members worldwide. Step {step} of 2.</p>
            </div>

            {errs.general && <div className="error-message">{errs.general}</div>}

            <div className="steps">
              <div className={`s-node ${step >= 1 ? "active":""} ${step > 1 ? "done":""}`}>
                <div className="s-num">{step > 1 ? <Check/> : "1"}</div>
                <span className="s-lbl">Personal Info</span>
              </div>
              <div className={`s-line ${step > 1 ? "done":""}`}/>
              <div className={`s-node ${step >= 2 ? "active":""}`}>
                <div className="s-num">2</div>
                <span className="s-lbl">Security</span>
              </div>
            </div>

            {step === 1 && (
              <div className="mfields">
                <div className="f2col">
                  <div className="fgrp">
                    <label>First Name</label>
                    <input name="firstName" placeholder="John" value={form.firstName} onChange={fc}/>
                    {errs.firstName && <span className="err">{errs.firstName}</span>}
                  </div>
                  <div className="fgrp">
                    <label>Last Name</label>
                    <input name="lastName" placeholder="Doe" value={form.lastName} onChange={fc}/>
                    {errs.lastName && <span className="err">{errs.lastName}</span>}
                  </div>
                </div>
                <div className="fgrp">
                  <label>Email Address</label>
                  <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={fc}/>
                  {errs.email && <span className="err">{errs.email}</span>}
                </div>
                <div className="f2col">
                  <div className="fgrp">
                    <label>Gender</label>
                    <select name="gender" value={form.gender} onChange={fc}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                    {errs.gender && <span className="err">{errs.gender}</span>}
                  </div>
                  <div className="fgrp">
                    <label>Date of Birth</label>
                    <input name="dob" type="date" value={form.dob} onChange={fc}/>
                    {errs.dob && <span className="err">{errs.dob}</span>}
                  </div>
                </div>
                <div className="f2col">
                  <div className="fgrp">
                    <label>Height (cm) <span className="opt">(optional)</span></label>
                    <input name="height" type="number" step="0.1" placeholder="e.g., 175" value={form.height} onChange={fc}/>
                  </div>
                  <div className="fgrp">
                    <label>Weight (kg) <span className="opt">(optional)</span></label>
                    <input name="weight" type="number" step="0.1" placeholder="e.g., 70.5" value={form.weight} onChange={fc}/>
                  </div>
                </div>
                <div className="fgrp">
                  <label>Phone <span className="opt">(optional)</span></label>
                  <input name="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={fc}/>
                </div>
                <button className="btn-main" type="button" onClick={next}>Continue →</button>
              </div>
            )}

            {step === 2 && (
              <div className="mfields">
                <div className="fgrp">
                  <label>Password</label>
                  <div className="inp-wrap">
                    <input name="password" type={showP1 ? "text":"password"} placeholder="Minimum 8 characters" value={form.password} onChange={fc}/>
                    <button className="eye-btn" onClick={() => setShowP1(s => !s)} type="button" tabIndex={-1}><EyeIcon open={showP1}/></button>
                  </div>
                  {form.password && (
                    <div className="pw-strength">
                      <div className="pw-bars">{[1,2,3,4].map(i => <div key={i} className={`pw-bar ${str >= i ? strCls : ""}`}/>)}</div>
                      <span className={`pw-lbl ${strCls}`}>{strLbl}</span>
                    </div>
                  )}
                  {errs.password && <span className="err">{errs.password}</span>}
                </div>
                <div className="fgrp">
                  <label>Confirm Password</label>
                  <div className="inp-wrap">
                    <input name="confirm" type={showP2 ? "text":"password"} placeholder="Re-enter password" value={form.confirm} onChange={fc}/>
                    <button className="eye-btn" onClick={() => setShowP2(s => !s)} type="button" tabIndex={-1}><EyeIcon open={showP2}/></button>
                  </div>
                  {errs.confirm && <span className="err">{errs.confirm}</span>}
                </div>
                <label className={`chk-label ${errs.agree ? "eb" : ""}`}>
                  <input name="agree" type="checkbox" checked={form.agree} onChange={fc}/>
                  <span>
                    I agree to GymPRO's{" "}
                    <a href="#" className="link-cta" onClick={e => { e.preventDefault(); setLegalModal("terms"); }}>Terms & Conditions</a>{" "}
                    and{" "}
                    <a href="#" className="link-cta" onClick={e => { e.preventDefault(); setLegalModal("privacy"); }}>Privacy Policy</a>.
                    I understand that my membership is subject to GymPRO's code of conduct.
                  </span>
                </label>
                {errs.agree && <span className="err">{errs.agree}</span>}
                <div className="mactions">
                  <button className="btn-out" type="button" onClick={() => { setStep(1); setErrs({}); }}>← Back</button>
                  <button className="btn-main" type="button" onClick={submitCreate} disabled={isCreating}>
                    {isCreating ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ══════════════════════════
          LEGAL MODAL (Terms / Privacy)
      ══════════════════════════ */}
      {legalModal && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setLegalModal(null); }}>
          <div className="modal-box legal-box">
            <button className="modal-close" onClick={() => setLegalModal(null)} type="button">✕</button>

            {/* Tab switcher */}
            <div className="legal-tabs">
              <button
                className={`legal-tab ${legalModal === "terms" ? "legal-tab-active" : ""}`}
                onClick={() => setLegalModal("terms")}
                type="button"
              >
                Terms of Service
              </button>
              <button
                className={`legal-tab ${legalModal === "privacy" ? "legal-tab-active" : ""}`}
                onClick={() => setLegalModal("privacy")}
                type="button"
              >
                Privacy Policy
              </button>
            </div>

            {legalModal === "terms" && (
              <div className="legal-content">
                <div className="modal-head">
                  <div className="eyebrow"><span className="eyebrow-line"/>GymPro</div>
                  <h2>TERMS OF SERVICE</h2>
                  <p>Effective Date: April 15, 2026 &nbsp;·&nbsp; Last Updated: May 10, 2026</p>
                </div>
                <div className="legal-body">
                  <div className="legal-section">
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing or using the GymPro website and any associated services (collectively, the "Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>
                  </div>
                  <div className="legal-section">
                    <h3>2. Eligibility</h3>
                    <p>You must be at least 18 years old to register an account. If you are under 18, you may only use the Service with the consent and supervision of a parent or legal guardian.</p>
                  </div>
                  <div className="legal-section">
                    <h3>3. Account Registration, Security & Data Processing</h3>
                    <p>You must provide accurate, complete, and up-to-date information when creating an account. You are responsible for safeguarding your login credentials. Any activity under your account is your responsibility. Notify us immediately of any unauthorised use.</p>
                    <p style={{marginTop:10}}>We process your personal data (account data, client data, transaction data, communication data, and technical data) to provide and improve the Service. Certain health-related data constitutes Sensitive Personal Data under the Data Protection Act and will only be processed with your explicit consent, which may be withdrawn at any time.</p>
                  </div>
                  <div className="legal-section">
                    <h3>4. Your Data Protection Rights</h3>
                    <p>Under the Data Protection Act you have the right to: access your data (s.32), rectification (s.33), restriction of processing (s.34), object to processing (s.35), rights related to automated decision-making (s.36), and data portability (s.37). Contact us to exercise any of these rights; we will respond within 30 days.</p>
                  </div>
                  <div className="legal-section">
                    <h3>5. Service Description</h3>
                    <p>GymPro provides a fitness management platform including body measurement tracking, consultation booking, excursion registration, shop purchases, AI-powered fitness advice, and role-based dashboards. We may modify or discontinue features at any time with reasonable notice.</p>
                  </div>
                  <div className="legal-section">
                    <h3>6. User Obligations</h3>
                    <p>You agree not to use the Service for unlawful purposes, share false information, interfere with security, transfer your account, or upload malicious code.</p>
                  </div>
                  <div className="legal-section">
                    <h3>7. Payments & Subscriptions</h3>
                    <p>Certain features require payment in Jamaican Dollars. Payments are processed through third-party gateways; we do not store full card details. All sales are final unless otherwise stated.</p>
                  </div>
                  <div className="legal-section">
                    <h3>8. Cancellation Policy</h3>
                    <p>Consultations may be cancelled free of charge up to 24 hours before the scheduled start time. Excursion cancellation terms are stated on each excursion's detail page.</p>
                  </div>
                  <div className="legal-section">
                    <h3>9. AI Chatbot & Content</h3>
                    <p>The AI assistant is powered by a third-party service (OpenRouter). We are not responsible for the accuracy of AI-generated advice. Always consult a qualified professional before making significant changes to your diet or exercise routine.</p>
                  </div>
                  <div className="legal-section">
                    <h3>10. Intellectual Property</h3>
                    <p>All content on the Service is the property of GymPro or its licensors. You may not copy, modify, or distribute it without prior written consent.</p>
                  </div>
                  <div className="legal-section">
                    <h3>11. Termination</h3>
                    <p>You may terminate your account at any time. Account data will be deleted within 30 days unless retention is legally required. We may suspend or terminate your account immediately for violation of these Terms.</p>
                  </div>
                </div>
              </div>
            )}

            {legalModal === "privacy" && (
              <div className="legal-content">
                <div className="modal-head">
                  <div className="eyebrow"><span className="eyebrow-line"/>GymPro</div>
                  <h2>PRIVACY POLICY</h2>
                  <p>Effective Date: May 11, 2026 &nbsp;·&nbsp; Last Updated: May 11, 2026</p>
                </div>
                <div className="legal-body">
                  <div className="legal-section">
                    <h3>1. Introduction</h3>
                    <p>GymPro is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information in compliance with the Data Protection Act, 2020 (DPA) of Jamaica.</p>
                  </div>
                  <div className="legal-section">
                    <h3>2. Data Controller</h3>
                    <p>GymPro is the Data Controller for personal data collected through the Service. For any questions about your data, please contact us via our registered email address.</p>
                  </div>
                  <div className="legal-section">
                    <h3>3. Personal Data We Collect</h3>
                    <p>We collect account data (name, email, phone, role), client data (fitness goals, body measurements, progress), transaction data (bookings, orders, payment info), trainer/admin data, communication data (messages, support requests), and technical data (IP address, device info, usage logs).</p>
                  </div>
                  <div className="legal-section">
                    <h3>4. Sensitive Personal Data</h3>
                    <p>Health-related data (height, weight, measurements, fitness goals) is Sensitive Personal Data under the DPA. We process it only with your explicit, separate consent, which you may withdraw at any time by contacting us.</p>
                  </div>
                  <div className="legal-section">
                    <h3>5. How We Use Your Data</h3>
                    <p>We use your data to provide and improve the Service, personalise your dashboard, process bookings and purchases, communicate with you, ensure security, and analyse usage trends using anonymised data where possible.</p>
                  </div>
                  <div className="legal-section">
                    <h3>6. Legal Bases for Processing</h3>
                    <p>We rely on: Consent (sensitive data and marketing), Contractual Necessity (providing the service), Legitimate Interests (fraud prevention, security), and Legal Obligation (compliance with Jamaican law).</p>
                  </div>
                  <div className="legal-section">
                    <h3>7. Data Sharing & Disclosure</h3>
                    <p>We do not sell your personal data. We may share it with service providers (cloud hosting, payment processors), our AI chatbot provider (OpenRouter), or as required by law. In a business transfer, you will be notified of any data changes.</p>
                  </div>
                  <div className="legal-section">
                    <h3>8. International Data Transfers</h3>
                    <p>Your data may be stored on servers outside Jamaica. We ensure adequate protection through standard contractual clauses or other approved mechanisms as required by the DPA.</p>
                  </div>
                  <div className="legal-section">
                    <h3>9. Data Security</h3>
                    <p>We implement TLS encryption in transit and at rest, role-based access controls, and regular security assessments. No internet transmission is 100% secure; you use the Service at your own risk.</p>
                  </div>
                  <div className="legal-section">
                    <h3>10. Data Breach Notification</h3>
                    <p>In the event of a breach likely to risk your rights and freedoms, we will notify the Office of the Information Commissioner (OIC) of Jamaica within 72 hours and affected users without undue delay.</p>
                  </div>
                  <div className="legal-section">
                    <h3>11. Data Retention</h3>
                    <p>Account data is retained while active and deleted within 30 days of termination. Transaction records are retained for 7 years for legal compliance. Health and progress data is retained until you delete your account or withdraw consent.</p>
                  </div>
                  <div className="legal-section">
                    <h3>12. Your Rights Under the DPA</h3>
                    <p>You have the right to access, rectify, restrict processing of, object to, and receive a portable copy of your data, as well as rights related to automated decision-making. Contact us to exercise these rights; we will respond within 30 days.</p>
                  </div>
                  <div className="legal-section">
                    <h3>13. Children's Privacy</h3>
                    <p>The Service is not intended for children under 18 without parental consent. If we discover we have collected data from a minor without verified consent, we will delete it promptly.</p>
                  </div>
                  <div className="legal-section">
                    <h3>14. Complaints</h3>
                    <p>You may lodge a complaint with the Office of the Information Commissioner (OIC) of Jamaica at <strong>complaints@oic.gov.jm</strong> or <strong>www.oic.gov.jm</strong>. We encourage you to contact us first so we can resolve your concern directly.</p>
                  </div>
                  <div className="legal-section">
                    <h3>15. Changes to This Policy</h3>
                    <p>We may update this Privacy Policy and will notify you of material changes by posting an updated version with a new date and, where significant, by email.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="legal-footer">
              <button className="btn-main" type="button" onClick={() => setLegalModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}