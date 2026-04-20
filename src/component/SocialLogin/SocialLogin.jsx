import { useContext } from 'react'; // ADD THIS
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '../../api/serverapi';
import { AuthContext } from '../../AuthContext'; // ADD THIS
import './SocialLogin.css';

const SocialLogin = ({ role = 'customer', onSuccess }) => {
  const navigate = useNavigate();
  const { handleLogin } = useContext(AuthContext); // CONNECT TO BRAIN

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await loginWithGoogle({
        token: credentialResponse.credential,
        role,
      });

      // 1. UPDATE GLOBAL STATE (This handles localStorage internally)
      // This ensures the Navbar changes to "Logout" immediately
      handleLogin(res, res.token); 

      onSuccess?.(res);

      // 2. REDIRECT TO THE DASHBOARD (Not just home)
      navigate('/home'); 

    } catch (err) {
      console.error('Google login failed:', err);
      alert('Google login failed.');
    }
  };

  return (
    <div className="social-login">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => alert('Google login failed.')}
      />
    </div>
  );
};

export default SocialLogin;