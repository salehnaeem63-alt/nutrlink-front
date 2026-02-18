import { Link } from 'react-router-dom';
import './Navbar.css';

/**
 * Navbar
 *
 * Props:
 *   links  – array of { label, to, href }   (optional, uses defaults)
 */
const DEFAULT_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'Features',     href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
];

const Navbar = ({ links = DEFAULT_LINKS, ctaLabel = 'Get Started', onCtaClick }) => (
  <nav className="navbar">
    <div className="navbar__inner">
      {/* Brand */}
      <Link to="/" className="navbar__brand">
        <div className="navbar__brand-icon">N</div>
        <span>NutriPlan</span>
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

      <button className="navbar__cta" onClick={onCtaClick}>
        {ctaLabel}
      </button>
    </div>
  </nav>
);

export default Navbar;
