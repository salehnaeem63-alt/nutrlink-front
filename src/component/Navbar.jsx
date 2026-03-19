import { Link } from 'react-router-dom';
import './Navbar.css';
import { NutrlinkLogo } from './Icons';

const Navbar = ({ isLogin, onLogout }) => {
  // 1. Data Definition: The "Source of Truth"
  const NAV_MAP = [
    { label: 'Home',       to: '/',            isPublic: true },
    { label: 'Dashboard',  to: '/dashboard',   isPublic: false },
    { label: 'Profile',    to: '/profile',     isPublic: false },
    { label: 'Calculator', to: '/calculator',  isPublic: true },
  ];

  // 2. Logic: Filtering based on Auth State
  const visibleLinks = NAV_MAP.filter(link => link.isPublic || isLogin);

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        
        {/* Brand Section */}
        <Link to="/" className="navbar__brand">
          <div className="navbar__brand-icon"> <NutrlinkLogo/></div>
          <span>Nutrlink</span>
        </Link>

        {/* Navigation Links */}
        <ul className="navbar__links">
          {visibleLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>

        {/* Action Area: Gated by isLogin */}
        <div className="navbar__actions">
          {isLogin ? (
            <button className="navbar__logout" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <div className="navbar__guest-group">
              <Link to="/login" className="nav-link-text">Login</Link>
              <Link to="/register" className="nav-link-text">Sign Up</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;