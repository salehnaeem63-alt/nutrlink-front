import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '../api/serverapi';
import './SocialLogin.css';

/**
 * SocialLogin
 *
 * Props:
 *   role          – 'customer' | 'nutritionist'  (sent to the API)
 *   redirectTo    – ignored now (redirect is role-based automatically)
 *   onSuccess     – optional extra callback(res)
 */
const SocialLogin = ({ role = 'customer', redirectTo, onSuccess }) => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await loginWithGoogle({
        token: credentialResponse.credential,
        role,
      });

      // ── Save token AND role ──────────────────────────
      localStorage.setItem('authToken', res.token);
      localStorage.setItem('userRole',  res.role);   // ← NEW
      // ────────────────────────────────────────────────

      onSuccess?.(res);

      // ── Redirect based on role ───────────────────────
      if (res.role === 'nutritionist') {
        navigate('/Nprofile');
      } else {
        navigate('/profile');
      }
      // ────────────────────────────────────────────────

    } catch (err) {
      console.error('Google login failed:', err);
      alert('Google login failed. Please try again.');
    }
  };

  return (
    <div className="social-login">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => alert('Google login failed. Please try again.')}
      />
    </div>
  );
};

export default SocialLogin;