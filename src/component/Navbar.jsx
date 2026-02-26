import { Link } from 'react-router-dom';
import './Navbar.css';

const DEFAULT_LINKS = [
  { label: 'Home',       to: '/home' },
  { label: 'Dashboard',  to: '/Dashboard' },
  { label: 'Profile',    to: '/Profile' },
  { label: 'calculetor', to: '/calculetor' },
];

const Navbar = ({ links = DEFAULT_LINKS, ctaLabel = '', onCtaClick, isLogin, onLogout }) => (
  <nav className="navbar">
    <div className="navbar__inner">

      {/* Brand */}
      <Link to="/" className="navbar__brand">
        <div className="navbar__brand-icon">N</div>
        <span>Nutrlink</span>
      </Link>

      {/* Nav links */}
      <ul className="navbar__links">
        {links.map(({ label, to, href }) => (
          <li key={label}>
            {to
              ? <Link to={to}>{label}</Link>
              : <a href={href}>{label}</a>}
          </li>
        ))}
      </ul>

      {/* CTA — shown when not logged in */}
      {ctaLabel && (
        <button className="navbar__cta" onClick={onCtaClick}>
          {ctaLabel}
        </button>
      )}

      {/* Logout — shown when logged in */}
      {isLogin && onLogout && (
        <button className="navbar__logout" onClick={onLogout}>
          Logout
        </button>
      )}

    </div>
  </nav>
);

export default Navbar;