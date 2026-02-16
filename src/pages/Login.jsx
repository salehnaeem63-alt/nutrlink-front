import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { login, loginWithGoogle } from "../api/serverapi";
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });

      console.log("Success:", response);
      localStorage.setItem('authToken', response.token);
      alert("Logged in successfully!");
      navigate('/dashboard');

    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google credential:", credentialResponse);
    try {
      const res = await loginWithGoogle({ 
        token: credentialResponse.credential, 
        role: 'customer' 
      });
      localStorage.setItem('authToken', res.token);
      alert('Logged in with Google successfully!');
      console.log(res);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Google login failed');
    }
  };

  return (
    <div className="login-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="brand">
            <div className="brand-icon">N</div>
            <span className="brand-name">NutriPlan</span>
          </div>
          
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How it Works</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
          
          <button className="get-started-btn">Get Started</button>
        </div>
      </nav>

      {/* Login Form */}
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label>Email Address</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label>Password</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="link-green">Forgot password?</a>
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-buttons">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                alert('Google login failed');
              }}
            />
          </div>

          <div className="signup-link">
            Don't have an account? <Link to="/register" className="link-green">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;