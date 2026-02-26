import Navbar from "../component/Navbar";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();
  const isLogin  = localStorage.getItem("authToken");

  /* ── CTA: Get Started (only shown when NOT logged in) ── */
  const ctaClick = () => navigate("/registerType");

  /* ── Logout ── */
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div>
      <Navbar
        ctaLabel={!isLogin ? "Get Started" : undefined}
        onCtaClick={!isLogin ? ctaClick : undefined}
        isLogin={isLogin}
        onLogout={handleLogout}
      />
    </div>
  );
};