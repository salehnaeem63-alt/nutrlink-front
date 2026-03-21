import { useState, useContext } from 'react'; // NEW: Imported useContext
import { Link, useNavigate } from 'react-router-dom';

import Navbar from '../component/Navbar';
import AuthCard from '../component/AuthCard';
import FormField from '../component/FormField';
import SocialLogin from '../component/SocialLogin';
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon } from '../component/Icons';

import { login } from '../api/serverapi';
import { AuthContext } from '../AuthContext'; // NEW: Imported the global state

import '../styles/global.css';
import './Login.css';

const NAV_LINKS = [
  { label: 'Home', to: '/home' },
  { label: 'Dashboard', to: '/Dashboard' },
  { label: 'Profile', to: '/Profile' },
  { label: 'calculator', to: '/calculetor' }, 
  { label: 'Register', to: '/register' },
];

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin } = useContext(AuthContext); // NEW: Connected to global state

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);

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
        identifier: formData.identifier,
        password: formData.password,
      });

      

      // ── NEW GLOBAL STATE UPDATE ───────────────────────────────────
      // Passes the API response (token, role, username) to AuthContext.
      // AuthContext will handle saving to localStorage and updating the UI.
      handleLogin(response); 
      // ──────────────────────────────────────────────────────────────

      // ── Redirect based on role ────────────────────────────────────
      if (response.role === 'nutritionist') {
        navigate('/Nhome');
      } else {
        navigate('/home');                            
      }
      // ──────────────────────────────────────────────────────────────

    } catch (error) {
      alert(error.message);
    }
  };

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
            label="Email or Username"
            icon={<EmailIcon />}
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            placeholder="Username or email"
            required
            autoFocus
          />

          <FormField
            id="password"
            label="Password"
            icon={<LockIcon />}
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            rightIcon={showPassword ? <EyeIcon/> : <EyeOffIcon/>}
            onRightIconClick={() => setShowPassword((prev) => !prev)}
          />

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

        {/* Note: We will need to update SocialLogin to use AuthContext later too */}
        <SocialLogin role="customer" redirectTo="/dashboard" />
      </AuthCard>
    </div>
  );
};

export default Login;