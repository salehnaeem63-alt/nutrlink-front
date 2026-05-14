import { useNavigate, Link } from "react-router-dom";
import Navbar from '../../component/Navigationbar/Navbar';
import '../../styles/global.css';
// We are keeping this import just for your background/animations if they exist, 
// but the cards themselves now use Tailwind.
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
      'Access AI assistant 24/7',
    ],
    buttonText: 'Sign Up as Customer',
    buttonColor: 'green',
    iconBg: 'bg-green-100/50',
    btnGradient: 'bg-gradient-to-br from-[#00c853] to-[#00b248] hover:shadow-[0_6px_16px_rgba(0,200,83,0.4)]',
    checkColor: 'text-[#00c853]',
    hoverBorder: 'hover:border-green-300'
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
      'Flexible scheduling',
    ],
    buttonText: 'Sign Up as Nutritionist',
    buttonColor: 'blue',
    iconBg: 'bg-blue-100/50',
    btnGradient: 'bg-gradient-to-br from-blue-600 to-blue-700 hover:shadow-[0_6px_16px_rgba(37,99,235,0.4)]',
    checkColor: 'text-blue-600',
    hoverBorder: 'hover:border-blue-300'
  },
];

export const RegisterType = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[#e8f5e9] to-[#f1f8f4] overflow-x-hidden font-sans">
      <Navbar />

      <div className="flex flex-col items-center justify-center py-16 px-5 flex-1 w-full max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 text-center">Join NutriPlan</h1>
        <p className="text-base text-gray-600 mb-12 text-center">Choose how you'd like to get started</p>

        {/* ── Tailwind Flexbox Container ── */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 w-full mb-8">
          
          {ROLES.map((role) => (
            <div 
              key={role.value} 
              // This is the magic line. flex-1 makes them equal width, flex-col stacks inner items.
              className={`flex flex-col flex-1 min-w-0 bg-white border-2 border-transparent rounded-2xl p-8 md:p-10 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${role.hoverBorder}`}
            >

              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6 shrink-0 ${role.iconBg}`}>
                <span>{role.icon}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3 w-full break-words">{role.label}</h2>
              <p className="text-sm text-gray-600 mb-7 leading-relaxed w-full break-words">{role.description}</p>

              {/* flex-grow pushes the button to the absolute bottom */}
              <ul className="flex flex-col gap-3.5 w-full grow mb-8">
                {role.features.map((feature, index) => (
                  <li key={index} className="flex flex-row items-start gap-3 text-sm text-gray-700 w-full">
                    <svg className={`w-5 h-5 shrink-0 mt-0.5 ${role.checkColor}`} viewBox="0 0 24 24" fill="none">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* mt-auto permanently pins this to the bottom of the card */}
              <button
                className={`w-full py-3.5 px-4 rounded-lg text-[15px] font-semibold text-white text-center mt-auto shrink-0 transition-transform ${role.btnGradient}`}
                onClick={() => navigate("/register", { state: { role: role.value } })}
              >
                {role.buttonText}
              </button>

            </div>
          ))}
        </div>

        <div className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00c853] font-semibold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterType;