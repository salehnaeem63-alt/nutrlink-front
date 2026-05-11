import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthCard from '../../component/AuthCard/AuthCard';
import FormField from '../../component/FormField/FormField';
import SocialLogin from '../../component/SocialLogin/SocialLogin';
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon } from '../../component/Icons';

import { login } from '../../api/serverapi';
import { AuthContext } from '../../AuthContext';

import './LoginModal.css';

const LoginModal = ({ onClose, onLoginSuccess }) => {
  const navigate = useNavigate();
  const { handleLogin } = useContext(AuthContext);

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

      console.log("Full Response Object:", response);

      // Pass the user data and token to the global auth context
      handleLogin(response, response.token);

      // Close the modal and trigger success callback
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      onClose();

    } catch (error) {
      alert(error.message);
    }
  };

  const handleOverlayClick = (e) => {
    // Close modal when clicking on the overlay (not the content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal-content">
        <button className="login-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

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
              rightIcon={showPassword ? <EyeIcon /> : <EyeOffIcon />}
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

          <SocialLogin role="customer" redirectTo="/dashboard" />
        </AuthCard>
      </div>
    </div>
  );
};

export default LoginModal;