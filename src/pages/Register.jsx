import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar      from '../component/Navbar';
import AuthCard    from '../component/AuthCard';
import FormField   from '../component/FormField';
import SocialLogin from '../component/SocialLogin';
import { UserIcon, EmailIcon, LockIcon } from '../component/Icons';

import { register } from '../api/serverapi';
import '../styles/global.css';
import './Register.css';

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'Features',     href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Login',        to: '/login' },
];

/**
 * Register
 *
 * Props:
 *   role – 'customer' | 'nutritionist'  (passed from RegisterType)
 *
 * Behaviour:
 *   - Customers  → standard form, auto-approved on submit, redirected to /dashboard
 *   - Nutritionists → same form + a required credential-image upload;
 *                     after submit they see a "pending approval" message instead
 *                     of being redirected, because their account is not yet approved.
 */
const Register = ({ role = 'customer' }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
    agreeToTerms:    false,
  });

  const [credentialFile, setCredentialFile]   = useState(null);   // File object
  const [credentialPreview, setCredentialPreview] = useState(null); // Data URL for preview
  const [pending, setPending] = useState(false); // true after nutritionist successfully registers

  // ── Handlers ───────────────────────────────────────────────────────────────

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

    // Basic client-side validation
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
      // Build FormData so we can include the file for nutritionists
      const payload = new FormData();
      payload.append('email',    formData.email);
      payload.append('username', formData.fullName);
      payload.append('password', formData.password);
      payload.append('role',     role);
      if (credentialFile) {
        payload.append('credentialImage', credentialFile);
      }

      const response = await register(payload);

      if (role === 'nutritionist') {
        // Nutritionist is not yet approved → show pending message
        setPending(true);
      } else {
        // Customer is auto-approved → go straight to dashboard
        localStorage.setItem('authToken', response.token);
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // ── Pending screen (nutritionist after submit) ──────────────────────────────

  if (pending) {
    return (
      <div className="auth-page">
        <Navbar links={NAV_LINKS} />
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

  // ── Main form ───────────────────────────────────────────────────────────────

  const roleLabel = role === 'nutritionist' ? 'Nutritionist' : 'Customer';

  return (
    <div className="auth-page">
      <Navbar links={NAV_LINKS} />

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

          {/* ── Credential upload (nutritionists only) ── */}
          {role === 'nutritionist' && (
            <div className="form-field credential-upload">
              <label className="form-field__label" htmlFor="credentialImage">
                Credential / Certificate Image
                <span className="credential-upload__required"> *</span>
              </label>
              <p className="credential-upload__hint">
                Upload a photo of your nutrition certification or relevant degree.
                This will be reviewed by our admin team before your account is activated.
              </p>

              {credentialPreview ? (
                <div className="credential-upload__preview-wrap">
                  <img
                    src={credentialPreview}
                    alt="Credential preview"
                    className="credential-upload__preview"
                  />
                  <button
                    type="button"
                    className="credential-upload__remove"
                    onClick={handleRemoveFile}
                    aria-label="Remove image"
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label htmlFor="credentialImage" className="credential-upload__drop-zone">
                  <span className="credential-upload__drop-icon">📄</span>
                  <span className="credential-upload__drop-text">
                    Click to upload or drag &amp; drop
                  </span>
                  <span className="credential-upload__drop-sub">
                    JPEG, PNG, WEBP — max 5 MB
                  </span>
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

          {/* Terms agreement */}
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
                <a href="#terms"   className="register-form__terms-link">Terms of Service</a>
                {' '}and{' '}
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