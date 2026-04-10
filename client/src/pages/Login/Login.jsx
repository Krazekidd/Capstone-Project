import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";   // import auth context
import "./Login.css";

/* ─────────────────────────────────────────────────────────────
   IMPORTANT — GOOGLE OAUTH SETUP
─────────────────────────────────────────────────────────────── */
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

/* ─────────────────────────────────────────────────────────────
   NAVBAR (without user pill and without Account link)
───────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: "Programs",
    path: "/programs",
    children: [
      { label: "Strength & Conditioning", desc: "Build raw power", path: "/programs/strength" },
      { label: "HIIT & Cardio", desc: "Fat-burning workouts", path: "/programs/hiit" },
      { label: "Yoga & Flexibility", desc: "Restore balance", path: "/programs/yoga" },
      { label: "Boxing & Combat", desc: "Fight conditioning", path: "/programs/boxing" },
      { label: "Personal Training", desc: "1-on-1 coaching", path: "/programs/personal-training" },
    ],
  },
  {
    label: "Membership",
    path: "/membership",
    children: [
      { label: "Starter Plan", desc: "Equipment access", path: "/membership#starter" },
      { label: "Pro Plan", desc: "Unlimited classes", path: "/membership#pro" },
      { label: "Elite Plan", desc: "Full premium access", path: "/membership#elite" },
      { label: "Corporate", desc: "Team memberships", path: "/membership#corporate" },
    ],
  },
  {
    label: "About",
    path: "/about",
    children: [
      { label: "Our Story", desc: "15 years of champions", path: "/about#story" },
      { label: "Our Trainers", desc: "World-class coaches", path: "/trainers" },
      { label: "Locations", desc: "200+ gyms worldwide", path: "/locations" },
      { label: "Press", desc: "News & media", path: "/press" },
    ],
  },
  { label: "Schedule", path: "/schedule", children: null },
  { label: "Contact", path: "/contact", children: null },
];

const ChevDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function LoginNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseEnter = (label) => {
    clearTimeout(closeTimer.current);
    setActiveMenu(label);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 180);
  };

  return (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar-inner">
        <NavLink to="/" className="nav-logo">
          <div className="nav-logo-hex">
            <div className="nlh-bg" />
            <div className="nlh-inner" />
            <span className="nlh-letter">G</span>
          </div>
          <span className="nav-logo-name">GYMVAULT</span>
        </NavLink>

        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.label}
              className="nav-item"
              onMouseEnter={() => item.children && handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <NavLink
                to={item.path || "#"}
                className={({ isActive }) =>
                  `nav-link${isActive ? " nav-link--active" : ""}${activeMenu === item.label ? " nav-link--active" : ""}`
                }
                end
              >
                {item.label}
                {item.children && <ChevDown />}
              </NavLink>

              {item.children && activeMenu === item.label && (
                <div
                  className="nav-dropdown"
                  onMouseEnter={() => clearTimeout(closeTimer.current)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="nav-dropdown-inner">
                    {item.children.map((child) => (
                      <NavLink key={child.label} to={child.path || "#"} className="nav-dropdown-item">
                        <span className="ndi-label">{child.label}</span>
                        <span className="ndi-desc">{child.desc}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <button className="nav-hamburger" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
          <span className={mobileOpen ? "ham-open" : ""} />
          <span className={mobileOpen ? "ham-open" : ""} />
          <span className={mobileOpen ? "ham-open" : ""} />
        </button>
      </div>

      {mobileOpen && (
        <div className="nav-mobile">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="nav-mobile-item">
              <NavLink to={item.path || "#"} className="nav-mobile-label">
                {item.label}
              </NavLink>
              {item.children && (
                <div className="nav-mobile-children">
                  {item.children.map((child) => (
                    <NavLink key={child.label} to={child.path || "#"} className="nav-mobile-child">
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}

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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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

const SpinnerIcon = () => (
  <svg className="g-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round"/>
  </svg>
);

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

/* ════════════════════════════════
   MAIN COMPONENT
════════════════════════════════ */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  /* Sign-in state */
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [showPw, setShowPw] = useState(false);

  /* Google OAuth state */
  const [gReady, setGReady]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [gUser, setGUser]     = useState(null);
  const gInitRef              = useRef(false);

  /* Create-account modal state */
  const [modal, setModal] = useState(false);
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({
    firstName: "", lastName: "", email: "", gender: "",
    dob: "", phone: "", password: "", confirm: "", agree: false,
  });
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [errs, setErrs]     = useState({});

  /* Forgot-password modal state */
  const [fpModal, setFpModal]       = useState(false);
  const [fpEmail, setFpEmail]       = useState("");
  const [fpEmailErr, setFpEmailErr] = useState("");
  const [fpSent, setFpSent]         = useState(false);

  /* ─────────────────────────────────
     GOOGLE IDENTITY SERVICES — INIT
  ───────────────────────────────── */
  useEffect(() => {
    if (gInitRef.current) return;
    gInitRef.current = true;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        ux_mode: "popup",
      });
      setGReady(true);
    };
    script.onerror = () => {
      console.error("Failed to load Google Identity Services script.");
    };
    document.body.appendChild(script);

    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  const handleGoogleCredential = (response) => {
    setGLoading(false);
    if (!response?.credential) return;

    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      const userData = {
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        avatar: payload.given_name?.charAt(0).toUpperCase(),
        membership: "Pro Member", // fetch real membership from backend later
      };
      setGUser(userData);
      login(userData);
      navigate("/account");
    } catch {
      console.error("Could not decode Google credential.");
    }
  };

  const handleGoogleClick = () => {
    if (!gReady || gLoading) return;
    setGLoading(true);

    window.google.accounts.id.prompt((notification) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          callback: (tokenResponse) => {
            setGLoading(false);
            if (tokenResponse?.access_token) {
              fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              })
                .then(r => r.json())
                .then(info => {
                  const userData = {
                    firstName: info.given_name,
                    lastName: info.family_name,
                    email: info.email,
                    avatar: info.given_name?.charAt(0).toUpperCase(),
                    membership: "Pro Member",
                  };
                  setGUser(userData);
                  login(userData);
                  navigate("/account");
                })
                .catch(() => setGLoading(false));
            } else {
              setGLoading(false);
            }
          },
        });
        client.requestAccessToken({ prompt: "select_account" });
      }
    });
  };

  const handleGoogleSignOut = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    setGUser(null);
  };

  /* ── Email sign-in handler ── */
  const handleEmailSignIn = () => {
    // Replace this with your real authentication logic
    if (!email || !pw) {
      alert("Please enter email and password");
      return;
    }
    // For demo, we create a user object from the email
    const userData = {
      firstName: email.split('@')[0],
      email: email,
      avatar: email.charAt(0).toUpperCase(),
      membership: "Pro Member",
    };
    login(userData);
    navigate("/account");
  };

  /* ── Create-account helpers ── */
  const fc = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrs(p => ({ ...p, [name]: "" }));
  };

  const v1 = () => {
    const e = {};
    if (!form.firstName.trim())                           e.firstName = "First name required";
    if (!form.lastName.trim())                            e.lastName  = "Last name required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email     = "Valid email required";
    if (!form.gender)                                     e.gender    = "Please select";
    if (!form.dob)                                        e.dob       = "Required";
    setErrs(e);
    return !Object.keys(e).length;
  };

  const v2 = () => {
    const e = {};
    if (!form.password || form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.password !== form.confirm)             e.confirm  = "Passwords do not match";
    if (!form.agree)                                e.agree    = "You must accept the terms";
    setErrs(e);
    return !Object.keys(e).length;
  };

  const openCreate  = () => { setModal(true); setStep(1); setErrs({}); };
  const closeCreate = () => { setModal(false); setStep(1); };
  const next        = () => { if (v1()) setStep(2); };
  const submitCreate = () => {
    if (v2()) {
      // In a real app, send registration data to your backend
      // Then automatically log in the user
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        avatar: form.firstName.charAt(0).toUpperCase(),
        membership: "Pro Member",
      };
      login(userData);
      navigate("/account");
      closeCreate();
    }
  };

  /* ── Forgot-password helpers ── */
  const openFp = e => {
    e.preventDefault();
    setFpEmail(""); setFpEmailErr(""); setFpSent(false);
    setFpModal(true);
  };
  const closeFp = () => {
    setFpModal(false);
    setFpEmail(""); setFpEmailErr(""); setFpSent(false);
  };
  const submitFp = () => {
    if (!fpEmail || !/\S+@\S+\.\S+/.test(fpEmail)) {
      setFpEmailErr("Please enter a valid email address");
      return;
    }
    setFpSent(true);
    // In a real app, call backend to send reset email
  };

  const str    = pwStr(form.password);
  const strLbl = ["","Weak","Fair","Good","Strong"][str];
  const strCls = ["","weak","fair","good","strong"][str];

  return (
    <>
      <div className="app-shell">
        <LoginNavbar />

        {/* LEFT PANEL (unchanged) */}
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
                <span className="logo-letter"><span><img src="images/triallogo.png" alt="GymPRO Logo" style={{ width: "150px", height: "200px" }} /></span></span>
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

          <div className="left-footer">© 2026 GymPRO Global Inc.</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="form-wrap">

            {gUser && (
              <div className="g-signed-banner">
                <img src={gUser.picture} alt={gUser.name} className="g-avatar"/>
                <div className="g-signed-info">
                  <p className="g-signed-name">Welcome, {gUser.given_name}!</p>
                  <p className="g-signed-email">{gUser.email}</p>
                </div>
                <button className="g-signout-btn" onClick={handleGoogleSignOut} type="button">Sign out</button>
              </div>
            )}

            <div className="form-head">
              <div className="eyebrow"><span className="eyebrow-line"/>Member Portal</div>
              <h1>SIGN IN</h1>
              <p>Access your training dashboard, track progress, and manage your membership.</p>
            </div>

            <div className="fgrp">
              <label>Email Address</label>
              <input
                type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="fgrp">
              <label>Password</label>
              <div className="inp-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={pw} onChange={e => setPw(e.target.value)}
                  autoComplete="current-password"
                />
                <button className="eye-btn" onClick={() => setShowPw(s => !s)} type="button" tabIndex={-1}>
                  <EyeIcon open={showPw}/>
                </button>
              </div>
              <div className="aux-row">
                <a href="#" className="link-aux" onClick={openFp}>Forgot Password?</a>
              </div>
            </div>

            <button className="btn-main" type="button" onClick={handleEmailSignIn}>Sign In</button>

            <div className="divider"><span>or continue with</span></div>

            <button
              className={`btn-google${gLoading ? " btn-google--loading" : ""}${!gReady ? " btn-google--disabled" : ""}`}
              type="button"
              onClick={handleGoogleClick}
              disabled={!gReady || gLoading}
              title={!gReady ? "Loading Google Sign-In…" : "Sign in with Google"}
            >
              {gLoading
                ? <><SpinnerIcon/><span>Opening Google…</span></>
                : <><GoogleIcon/><span>Continue with Google</span></>
              }
            </button>

            {!gReady && <p className="g-loading-hint">Loading Google Sign-In…</p>}

            <div className="form-foot">
              <span>Not a member yet?</span>
              <a href="#" className="link-cta" onClick={e => { e.preventDefault(); openCreate(); }}>Create Account</a>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (unchanged) */}
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
                <button className="btn-main" type="button" onClick={submitFp}>Reset Password</button>
                <div className="fp-back-row">
                  <a href="#" className="link-aux" onClick={e => { e.preventDefault(); closeFp(); }}>← Back to Sign In</a>
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
                  <a href="#" className="link-cta" onClick={e => { e.preventDefault(); setFpSent(false); }}>try again</a>.
                </p>
                <button className="btn-main fp-done-btn" type="button" onClick={closeFp}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Account Modal (unchanged, but login added on submit) */}
      {modal && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) closeCreate(); }}>
          <div className="modal-box">
            <button className="modal-close" onClick={closeCreate} type="button">✕</button>

            <div className="modal-head">
              <div className="eyebrow"><span className="eyebrow-line"/>New Member</div>
              <h2>CREATE ACCOUNT</h2>
              <p>Join over a million members worldwide. Step {step} of 2.</p>
            </div>

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
                  <div className="fgrp"><label>First Name</label><input name="firstName" placeholder="John" value={form.firstName} onChange={fc}/>{errs.firstName && <span className="err">{errs.firstName}</span>}</div>
                  <div className="fgrp"><label>Last Name</label><input name="lastName" placeholder="Doe" value={form.lastName} onChange={fc}/>{errs.lastName && <span className="err">{errs.lastName}</span>}</div>
                </div>
                <div className="fgrp"><label>Email Address</label><input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={fc}/>{errs.email && <span className="err">{errs.email}</span>}</div>
                <div className="f2col">
                  <div className="fgrp"><label>Gender</label><select name="gender" value={form.gender} onChange={fc}><option value="">Select</option><option>Male</option><option>Female</option><option>Non-binary</option><option value="prefer-not">Prefer not to say</option></select>{errs.gender && <span className="err">{errs.gender}</span>}</div>
                  <div className="fgrp"><label>Date of Birth</label><input name="dob" type="date" value={form.dob} onChange={fc}/>{errs.dob && <span className="err">{errs.dob}</span>}</div>
                </div>
                <div className="fgrp"><label>Phone <span className="opt">(optional)</span></label><input name="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={fc}/></div>
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
                  <span>I agree to GymPRO's <a href="#" className="link-cta" onClick={e => e.preventDefault()}>Terms & Conditions</a> and <a href="#" className="link-cta" onClick={e => e.preventDefault()}>Privacy Policy</a>. I understand that my membership is subject to GymPRO's code of conduct.</span>
                </label>
                {errs.agree && <span className="err">{errs.agree}</span>}
                <div className="mactions">
                  <button className="btn-out" type="button" onClick={() => { setStep(1); setErrs({}); }}>← Back</button>
                  <button className="btn-main" type="button" onClick={submitCreate}>Create Account</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}