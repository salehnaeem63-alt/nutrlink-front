import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * AdminRoute
 * this is new
 * Protects admin-only routes. Only users with isadmin: true can access.
 * Redirects to /dashboard if not an admin.
 */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('authToken');
      return <Navigate to="/login" replace />;
    }

    // Check if user is admin
    if (!decoded.isadmin) {
      // Not an admin → redirect to dashboard
      return <Navigate to="/dashboard" replace />;
    }

    // User is admin → allow access
    return children;

  } catch (error) {
    console.error('Invalid token:', error);
    localStorage.removeItem('authToken');
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;