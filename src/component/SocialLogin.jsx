import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '../api/serverapi';
import './SocialLogin.css';

/**
 * SocialLogin
 *
 * Renders the Google OAuth button and handles the credential exchange.
 *
 * Props:
 *   role          – 'customer' | 'nutritionist'  (sent to the API)
 *   redirectTo    – path to push after success   (default: '/dashboard')
 *   onSuccess     – optional extra callback(res)
 */
const SocialLogin = ({ role = 'customer', redirectTo = '/dashboard', onSuccess }) => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await loginWithGoogle({
        token: credentialResponse.credential,
        role,
      });
      localStorage.setItem('authToken', res.token);
      onSuccess?.(res);
      navigate(redirectTo);
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
