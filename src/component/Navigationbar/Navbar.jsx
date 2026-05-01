import { useState, useEffect, useRef, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NutrlinkLogo } from '../Icons';
import { AuthContext } from '../../AuthContext';
import { useSocket } from '../../SocketContext';
import './Navbar.css';

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=random&name=User";

const Navbar = () => {
  const { isLogin, user, handleLogout } = useContext(AuthContext);
  const { unreadCount } = useSocket();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const NAV_MAP = [
    { label: 'Home', to: '/', isPublic: true },
    { label: 'Nutritionists', to: '/nutritionists', isPublic: true },
    {
      label: 'Dashboard',
      to: user?.role === 'nutritionist' ? '/Ndashboard' : '/dashboard',
      isPublic: false
    },
    { label: 'Appointments', to: '/appointments', isPublic: false },
    { label: 'Calculator', to: '/calculator', isPublic: true },
    {
      label: 'Diet Plan',
      to: user?.role === 'nutritionist' ? '/NutritionistDietPlan' : '/CustomerDietPlan',
      isPublic: false
    },
  ];

  const visibleLinks = NAV_MAP.filter(link => link.isPublic || isLogin);
  const userImg = user?.profilePic || DEFAULT_AVATAR;

  return (
    <nav className="navbar">
      <div className="navbar__inner">

        <Link to="/" className="navbar__brand">
          <div className="navbar__brand-icon"> <NutrlinkLogo /></div>
          <span>Nutrlink</span>
        </Link>

        <ul className="navbar__links">
          {visibleLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          {isLogin ? (
            <div className="navbar__user-group">
              
              {/* NEW: Messages Icon with Badge */}
              <Link to="/chat" className="navbar__messages-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="navbar__badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="navbar__profile-container" ref={menuRef}>
                <button className="navbar__profile-btn" onClick={toggleMenu}>
                  <img
                    src={userImg}
                    alt="Profile"
                    className='navbar__avatar'
                    onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                  />
                </button>

                {isMenuOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <img
                        src={userImg}
                        alt="Profile"
                        className='navbar__dropdown-avatar'
                        onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                      />
                      <div className="navbar__user-info">
                        <span className='navbar__username'>{user?.username}</span>
                        <span className="navbar__email">{user?.email}</span>
                      </div>
                      <NavLink
                        to={user?.role === 'nutritionist' ? "/Nprofile" : "/profile"}
                        className="navbar__manage-profile"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Manage your profile
                      </NavLink>
                    </div>

                    <div className="divider"></div>

                    <ul className='navbar__dropdown-list'>
                      <li> <Link to='/settings' onClick={() => setIsMenuOpen(false)}>Settings</Link></li>
                      <li className="divider"></li>
                      <li><button onClick={handleLogout} className='logout-link'>Logout</button></li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="navbar__guest-group">
              <Link to="/login" className="nav-link-text">Login</Link>
              <Link to="/RegisterType" className="nav-link-text">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;