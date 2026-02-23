import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Navbar      from '../component/Navbar';
import AuthCard    from '../component/AuthCard';
import FormField   from '../component/FormField';
import SocialLogin from '../component/SocialLogin';
import { EmailIcon, LockIcon } from '../component/Icons';

import { login } from '../api/serverapi';
import '../styles/global.css';
import './Login.css';

// Nav links specific to the Login page
const NAV_LINKS = [
  { label: 'Home',         to: '/home' },
  { label: 'Dashboard',     to: '/Dashboard' },
  { label: 'Profile', to: '/Profile' },
  { label: 'calculetor', to: '/calculetor' },
  { label: 'Register',     to: '/register' },
];

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email:      '',
    password:   '',
    rememberMe: false,
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({
        email:    formData.email,
        password: formData.password,
      });
      localStorage.setItem('authToken', response.token);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="auth-page">
      <Navbar links={NAV_LINKS} />

      <AuthCard
        title="Welcome Back"
        subtitle="Login to your account"
        footerText="Don't have an account?"
        footerLink={{ to: '/register', label: 'Sign up' }}
      >
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <FormField
            id="email"
            label="Email Address"
            icon={<EmailIcon />}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <FormField
            id="password"
            label="Password"
            icon={<LockIcon />}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          {/* Remember me + Forgot password */}
          <div className="login-form__options">
            <label className="login-form__remember">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="login-form__forgot">Forgot password?</a>
          </div>

          <button type="submit" className="login-form__submit">
            Login
          </button>

          <div className="login-form__divider">
            <span>Or continue with</span>
          </div>
        </form>

        <SocialLogin role="customer" redirectTo="/dashboard" />
      </AuthCard>
    </div>
  );
};

export default Login;
