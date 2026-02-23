import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Navbar from '../component/Navbar';
import AuthCard from '../component/AuthCard';
import FormField from '../component/FormField';
import SocialLogin from '../component/SocialLogin';
import { UserIcon, EmailIcon, LockIcon } from '../component/Icons';

import { register } from '../api/serverapi';
import '../styles/global.css';
import './Register.css';

const NAV_LINKS = [
  { label: 'Home', to: '/home' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Profile', to: '/profile' },
  { label: 'Calculator', to: '/calculator' },
  { label: 'Login', to: '/login' },
];

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get role from RegisterType page
  const role = location.state?.role || 'customer';
  const roleLabel = role === 'nutritionist' ? 'Nutritionist' : 'Customer';

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [credentialFile, setCredentialFile] = useState(null);
  const [credentialPreview, setCredentialPreview] = useState(null);
  const [pending, setPending] = useState(false);

  // ── Handlers ──
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5 MB.');
      return;
    }

    setCredentialFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCredentialPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setCredentialFile(null);
    setCredentialPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (role === 'nutritionist' && !credentialFile) {
      alert('Please upload your credential / certificate image.');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('email', formData.email);
      payload.append('username', formData.fullName);
      payload.append('password', formData.password);
      payload.append('role', role);
      if (credentialFile) payload.append('credentialImage', credentialFile);

      const response = await register(payload);

      if (role === 'nutritionist') {
        setPending(true); // show pending screen
      } else {
        localStorage.setItem('authToken', response.token);
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // ── Pending screen for nutritionists ──
  if (pending) {
    return (
      <div className="auth-page">
        <Navbar links={NAV_LINKS} ctaLabel="" />
        <div className="register-pending">
          <div className="register-pending__icon">🩺</div>
          <h2 className="register-pending__title">Application Submitted!</h2>
          <p className="register-pending__body">
            Thank you for registering as a Nutritionist. Your credentials are under
            review by our admin team. You will receive access once your account is
            approved.
          </p>
          <button
            className="register-pending__btn"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ──
  const ctaClick = () => navigate('/registerType');

  return (
    <div className="auth-page">
      <Navbar
        links={NAV_LINKS}
        ctaLabel={roleLabel === 'Nutritionist' ? 'Register as Customer' : 'Register as Nutritionist'}
        onCtaClick={ctaClick}
      />

      <AuthCard
        title="Create Your Account"
        subtitle={`${roleLabel} Registration`}
        footerText="Already have an account?"
        footerLink={{ to: '/login', label: 'Log in' }}
        maxWidth="520px"
      >
        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <FormField
            id="fullName"
            label="Full Name"
            icon={<UserIcon />}
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

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

          <FormField
            id="confirmPassword"
            label="Confirm Password"
            icon={<LockIcon />}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          {role === 'nutritionist' && (
            <div className="form-field credential-upload">
              <label htmlFor="credentialImage" className="form-field__label">
                Credential / Certificate Image <span className="credential-upload__required">*</span>
              </label>
              {credentialPreview ? (
                <div className="credential-upload__preview-wrap">
                  <img src={credentialPreview} alt="Credential preview" className="credential-upload__preview" />
                  <button type="button" className="credential-upload__remove" onClick={handleRemoveFile}>
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label htmlFor="credentialImage" className="credential-upload__drop-zone">
                  📄 Click to upload or drag & drop
                  <input
                    ref={fileInputRef}
                    id="credentialImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="credential-upload__input"
                  />
                </label>
              )}
            </div>
          )}

          <div className="register-form__terms">
            <label className="register-form__terms-label">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
              <span>
                I agree to the{' '}
                <a href="#terms" className="register-form__terms-link">Terms of Service</a> and{' '}
                <a href="#privacy" className="register-form__terms-link">Privacy Policy</a>
              </span>
            </label>
          </div>

          <button type="submit" className="register-form__submit">
            {role === 'nutritionist' ? 'Submit Application' : 'Create Account'}
          </button>

          <div className="register-form__divider">
            <span>Or continue with</span>
          </div>
        </form>

        <SocialLogin role={role} redirectTo="/dashboard" />
      </AuthCard>
    </div>
  );
};

export default Register;