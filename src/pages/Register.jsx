import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';
import {register} from "../api/serverapi"
import {  GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from "../api/serverapi"; // new function for Google login


const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
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

  if (!formData.agreeToTerms) {
    alert('Please agree to the Terms of Service and Privacy Policy');
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  try {
    const response = await register({
      email: formData.email,
      username: formData.fullName,  
      password: formData.password,
      role: "customer"
    });

    console.log("Success:", response);
    alert("Account created successfully!");

  } catch (error) {
    alert(error.message);
  }
};


  return (
    <div className="register-page">
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
            <li><Link to="/login">Login</Link></li>
          </ul>
          
          <button className="get-started-btn">Get Started</button>
        </div>
      </nav>

      {/* Registration Form */}
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Create Your Account</h1>
            <p>Customer Registration</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-field">
              <label>Full Name</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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

            <div className="form-field">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="terms-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                />
                <span>
                  I agree to the{' '}
                  <a href="#terms" className="link-green">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#privacy" className="link-green">Privacy Policy</a>
                </span>
              </label>
            </div>

            <button type="submit" className="create-account-btn">
              Create Account
            </button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-buttons">
           <GoogleLogin
  onSuccess={async (credentialResponse) => {
      console.log("Google credential:", credentialResponse);
    try {
      const res = await loginWithGoogle({ 
        token: credentialResponse.credential, 
        role: 'customer' 
      });
      localStorage.setItem('authToken', res.token);
      alert('Logged in with Google successfully!');
      console.log(res);
      // navigate('/dashboard'); // optional
    } catch (err) {
      console.error(err);
      alert('Google login failed');
    }
  }}
  onError={() => {
    alert('Google login failed');
  }}
/>

          </div>

          <div className="already-account">
            Already have an account? <Link to="/login" className="link-green">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
