import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import '../styles/global.css';
import './RegisterType.css';

const ROLES = [
  {
    value: 'customer',
    label: "I'm a Customer",
    icon: '👥',
    description: 'Looking to improve my nutrition and wellness with expert guidance',
    features: [
      'Book consultations with nutritionists',
      'Get personalized meal plans',
      'Track your progress',
      'Access AI assistant 24/7'
    ],
    buttonText: 'Sign Up as Customer',
    buttonColor: 'green'
  },
  {
    value: 'nutritionist',
    label: "I'm a Nutritionist",
    icon: '🩺',
    description: 'Ready to help clients achieve their health goals',
    features: [
      'Manage your client base',
      'Create custom diet plans',
      'Track client progress',
      'Flexible scheduling'
    ],
    buttonText: 'Sign Up as Nutritionist',
    buttonColor: 'blue'
  },
];

export const RegisterType = () => {
  const navigate = useNavigate();

  return (
    <div className="register-type-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="brand">
            <div className="brand-icon">N</div>
            <span className="brand-name">NutriPlan</span>
          </div>
          <ul className="nav-links">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/calculator">Calculator</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
          <Link to="/register">
            <button className="get-started-btn">Get Started</button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="role-select">
        <h1 className="role-select__heading">Join NutriPlan</h1>
        <p className="role-select__subheading">Choose how you'd like to get started</p>

        <div className="role-select__cards">
          {ROLES.map(({ value, label, icon, description, features, buttonText, buttonColor }) => (
            <div key={value} className={`role-select__card ${value}-card`}>
              <div className="role-select__card-icon">
                <span>{icon}</span>
              </div>
              <h2 className="role-select__card-title">{label}</h2>
              <p className="role-select__card-desc">{description}</p>
              <ul className="role-select__features">
                {features.map((feature, index) => (
                  <li key={index}>
                    <svg className="check-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`role-select__btn ${buttonColor}-btn`}
                onClick={() => navigate("/register", { state: { role: value } })}
              >
                {buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="already-account">
          Already have an account? <Link to="/login" className="link-green">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterType;