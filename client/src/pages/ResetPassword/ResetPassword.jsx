import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../../api/api";
import "./ResetPassword.css";

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

const MailIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <polyline points="2,4 12,13 22,4"/>
  </svg>
);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const validatePassword = () => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.detail || "Failed to reset password. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

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

            {!tokenValid ? (
              <div className="form-head">
                <div className="eyebrow"><span className="eyebrow-line"/>Account Recovery</div>
                <h1>INVALID RESET LINK</h1>
                <p>This password reset link is invalid or has expired. Please request a new password reset.</p>
              </div>
            ) : success ? (
              <div className="form-head">
                <div className="eyebrow"><span className="eyebrow-line"/>Account Recovery</div>
                <h1>PASSWORD RESET SUCCESSFUL</h1>
                <p>Your password has been successfully updated. You can now log in with your new password.</p>
              </div>
            ) : (
              <div className="form-head">
                <div className="eyebrow"><span className="eyebrow-line"/>Account Recovery</div>
                <h1>RESET PASSWORD</h1>
                <p>Enter your new password below to secure your account.</p>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {!tokenValid ? (
              <button className="btn-main" onClick={() => navigate('/login')}>
                BACK TO LOGIN
              </button>
            ) : success ? (
              <div>
                <button className="btn-main" onClick={() => navigate('/login')}>
                  GO TO LOGIN
                </button>
                <div className="form-foot">
                  <span>Need more help?</span>
                  <a href="#" className="link-cta" onClick={() => navigate('/login')}>Contact Support</a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="fgrp">
                  <label>New Password</label>
                  <div className="inp-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      className="eye-btn" 
                      onClick={() => setShowPassword(!showPassword)} 
                      type="button" 
                      tabIndex={-1}
                    >
                      <EyeIcon open={showPassword}/>
                    </button>
                  </div>
                </div>

                <div className="fgrp">
                  <label>Confirm New Password</label>
                  <div className="inp-wrap">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button 
                      className="eye-btn" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      type="button" 
                      tabIndex={-1}
                    >
                      <EyeIcon open={showConfirmPassword}/>
                    </button>
                  </div>
                </div>

                <button 
                  className="btn-main" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "RESETTING..." : "RESET PASSWORD"}
                </button>
              </form>
            )}

            {!tokenValid && !success && (
              <div className="form-foot">
                <span>Remember your password?</span>
                <a href="#" className="link-cta" onClick={() => navigate('/login')}>Back to Sign In</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
