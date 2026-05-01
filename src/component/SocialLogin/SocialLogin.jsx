import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '../../api/serverapi';
import { AuthContext } from '../../AuthContext';
import './SocialLogin.css';

const SocialLogin = ({ role = 'customer', onSuccess }) => {
  const navigate = useNavigate();
  const { handleLogin } = useContext(AuthContext);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // 1. Call the backend API
      const res = await loginWithGoogle({
        token: credentialResponse.credential,
        role,
      });

      // 2. Update Global State
      // This ensures 'user.profilePic' is available immediately to the Navbar
      handleLogin(res, res.token); 

      // 3. Optional Callback
      onSuccess?.(res);

      // 4. Role-based Navigation
      // Nutritionists go to their specific home/dashboard, customers to theirs
      if (res.role === 'nutritionist') {
        navigate('/home'); 
      } else {
        navigate('/home');
      }

    } catch (err) {
      console.error('Google login failed:', err);
      // Detailed error alert for debugging
      alert(err.response?.data?.message || 'Google login failed.');
    }
  };

  return (
    <div className="social-login">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => alert('Google authentication failed.')}
        useOneTap
      />
    </div>
  );
};

export default SocialLogin;