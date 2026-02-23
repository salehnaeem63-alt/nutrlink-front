import { useNavigate } from "react-router-dom";
import '../styles/global.css';
import './RegisterType.css';

const ROLES = [
  {
    value: 'customer',
    label: 'Customer',
    icon: '🥗',
    description: 'Track your nutrition and get personalized meal plans.',
  },
  {
    value: 'nutritionist',
    label: 'Nutritionist',
    icon: '🩺',
    description: 'Manage clients and build professional diet programs.',
  },
];

export const RegisterType = () => {
  const navigate = useNavigate();

  return (
    <div className="role-select">
      <h1 className="role-select__heading">Join NutriPlan</h1>
      <p className="role-select__subheading">How will you be using the app?</p>

      <div className="role-select__cards">
        {ROLES.map(({ value, label, icon, description }) => (
          <button
            key={value}
            className="role-select__card"
            onClick={() => navigate("/register", { state: { role: value } })}
          >
            <span className="role-select__card-icon">{icon}</span>
            <p className="role-select__card-title">{label}</p>
            <p className="role-select__card-desc">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};