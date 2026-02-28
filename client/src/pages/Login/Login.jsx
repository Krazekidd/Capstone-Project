import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", formData);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="login-container-wrapper">
      <div className="background-gradient"></div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-left">
            <img
              src="images/triallogo.png"
              alt="B.A.D People Fitness Logo"
              className="logo"
            ></img>
            <h2>LOG IN</h2>
            <p>Log in to your account</p>
          </div>

          <div className="login-right">
            <form id="login-form">
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  required
                ></input>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  required
                ></input>
              </div>

              <div className="options">
                <label className="remember">
                  <input type="checkbox" id="remember"></input>
                  <span className="checkmark"></span> Remember Me
                </label>
                <a href="#" className="forgot">
                  Forgot Password?
                </a>
              </div>

              <button className="primary-btn" type="submit">
                Login
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
