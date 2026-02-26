import { Navigate } from 'react-router-dom';

/**
 * RoleRoute — renders children only if the user's role matches.
 * Otherwise redirects to the correct profile page.
 *
 * Usage:
 *   <RoleRoute role="customer">  <Profile />          </RoleRoute>
 *   <RoleRoute role="nutritionist"> <NutriProfile />  </RoleRoute>
 */
const RoleRoute = ({ children, role }) => {
  const token     = localStorage.getItem('authToken');
  const userRole  = localStorage.getItem('userRole');

  // Not logged in at all → go to login
  if (!token) return <Navigate to="/login" replace />;

  // Role matches → render the page
  if (userRole === role) return children;

  // Wrong role → redirect to their correct profile
  if (userRole === 'nutritionist') return <Navigate to="/Nprofile" replace />;
  if (userRole === 'customer')     return <Navigate to="/profile"  replace />;

  // Fallback
  return <Navigate to="/login" replace />;
};

export default RoleRoute;