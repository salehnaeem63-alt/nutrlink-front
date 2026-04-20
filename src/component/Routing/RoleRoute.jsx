import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';

/**
 * RoleRoute — renders children only if the user's role matches.
 * Otherwise redirects to the correct profile page.
 *
 * Usage:
 * <RoleRoute role="customer">  <Profile />          </RoleRoute>
 * <RoleRoute role="nutritionist"> <NutriProfile />  </RoleRoute>
 */
const RoleRoute = ({ children, role }) => {
  const { user, isLogin, loading } = useContext(AuthContext);

  if (loading) return <div className="loading-spinner">Checking Sessions...</div>;
  if (!isLogin) return <Navigate to="/login" />;

  // 🔍 ROBUST ROLE CHECK:
  // Check the root 'role' first, and if it's undefined, check inside the nested 'user' object
  const actualRole = user?.role || user?.user?.role;

  // Case-insensitive check just to be 100% safe
  if (!actualRole || actualRole.toLowerCase() !== role.toLowerCase()) {
    console.warn(`Role mismatch! Expected: ${role}, but found: ${actualRole}. Redirecting to /unauthorized`);
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default RoleRoute;