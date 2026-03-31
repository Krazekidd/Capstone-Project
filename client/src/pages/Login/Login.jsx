import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../api/api";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = authAPI.getToken();
    if (token) {
      navigate('/account');
    }
    
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, remember: true }));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      
      if (formData.remember) {
        localStorage.setItem('remembered_email', formData.email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      
      navigate('/account');
    } catch (err) {
      setError(err.detail || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container-wrapper">
      <div className="background-gradient"></div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-left">
            <img
              src="/images/triallogo.png"
              alt="B.A.D People Fitness Logo"
              className="logo"
            />
            <h2>LOG IN</h2>
            <p>Log in to your account</p>
          </div>

          <div className="login-right">
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="options">
                <label className="remember">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span> Remember Me
                </label>
                <a href="/forgot-password" className="forgot">
                  Forgot Password?
                </a>
              </div>

              <button 
                className="primary-btn" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="login-logo-divider">
              <span>or</span>
            </div>

            <div className="social-login-circles">
              <button className="social-circle google">
                <i className="fab fa-google"></i>
              </button>
              <button className="social-circle apple">
                <i className="fab fa-apple"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;