import { Link } from 'react-router-dom';
import './AuthCard.css';

/**
 * AuthCard  –  white card shell used on auth pages.
 *
 * Props:
 *   title       – heading text
 *   subtitle    – sub-heading text
 *   footerText  – text before the link  e.g. "Already have an account?"
 *   footerLink  – { to, label }          e.g. { to: '/login', label: 'Log in' }
 *   maxWidth    – override card width    (default '460px')
 *   children    – form content
 */
const AuthCard = ({
  title,
  subtitle,
  footerText,
  footerLink,
  maxWidth = '460px',
  children,
}) => (
  <div className="auth-card__container">
    <div className="auth-card" style={{ '--card-max-width': maxWidth }}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="auth-card__header">
          {title    && <h1 className="auth-card__title">{title}</h1>}
          {subtitle && <p  className="auth-card__subtitle">{subtitle}</p>}
        </div>
      )}

      {/* Slotted content */}
      {children}

      {/* Footer */}
      {footerText && footerLink && (
        <div className="auth-card__footer">
          {footerText}{' '}
          <Link to={footerLink.to} className="auth-card__link">
            {footerLink.label}
          </Link>
        </div>
      )}
    </div>
  </div>
);

export default AuthCard;
