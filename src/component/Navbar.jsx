import { Link } from 'react-router-dom';
import './Navbar.css';
import { NutrlinkLogo } from './Icons';
import { useState, useEffect, useRef } from 'react';

const Navbar = ({ isLogin, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)


// Inside your Navbar component:
const menuRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    // If the menu is open AND the click happened outside the menuRef
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  // Add the listener to the whole document
  document.addEventListener("mousedown", handleClickOutside);

  // Cleanup: Remove the listener when the component unmounts
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  // 1. Data Definition: The "Source of Truth"
  const NAV_MAP = [
    { label: 'Home', to: '/', isPublic: true },
    { label: 'Dashboard', to: '/dashboard', isPublic: false },
    { label: 'Profile', to: '/profile', isPublic: false },
    { label: 'Calculator', to: '/calculator', isPublic: true },
  ];

  // 2. Logic: Filtering based on Auth State
  const visibleLinks = NAV_MAP.filter(link => link.isPublic || isLogin);

  return (
    <nav className="navbar">
      <div className="navbar__inner">

        {/* Brand Section */}
        <Link to="/" className="navbar__brand">
          <div className="navbar__brand-icon"> <NutrlinkLogo /></div>
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
            <div className="navbar__user-group">
              <span className="navbar__greeting">
                Welcome Back, <strong>{user?.username}</strong>! 👋
              </span>

              <div className="navbar__profile-container" ref={menuRef}>
                <button className="navbar__profile-btn" onClick={toggleMenu}>
                  <img src={user?.profilePic} alt="Profile" className='navbar__avatar' />
                </button>

                {isMenuOpen && (
                  <div className="navbar__dropdown">

                    <div className="navbar__dropdown-header">
                      <img src={user?.profilePic} alt="Profile Image" className='navbar__dropdown-avatar' />
                      <div className="navbar__user-info">
                        <span className='navbar__username'>{user?.username}</span>
                        <span className="navbar__email">{user?.email}</span>
                      </div>
                      <Link to="/profile" className="navbar__manage-profile">Manage your profile</Link>
                    </div>

                    <div className="divider"></div>

                    <ul className='navbar__dropdown-list'>
                      <li> <Link to='/settings'>Settings</Link></li>
                      <li className="divider"></li>
                      <li><button onClick={onLogout} className='logout-link'>Logout</button></li>
                    </ul>
                  </div>
                )}

              </div>
            </div>
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