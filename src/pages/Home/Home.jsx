import React, { useState, useContext, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Home.css';
import Navbar from '../../component/Navigationbar/Navbar';
import NutritionistSection from '../../component/Home/NutritionistSection';
import { Aibot } from '../../component/Aibot/Aibot';
import HomeSchedule from '../../component/Home/HomeSchedule';
import { getFilteredCards, getRecommendedExperts } from '../../api/nutritionist'
import Hero from '../../component/Home/Hero'

import { AuthContext } from '../../AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, handleLogout } = useContext(AuthContext);
  const isLogin = !!user;

  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommended, setRecommended] = useState([])
  const [recLoading, setRecLoading] = useState(false)

  useEffect(() => {
    const loadHomeData = async () => {
      const shouldFetchRecs = isLogin && user?.role === 'customer';

      try {
        if (nutritionists.length === 0) {
          setLoading(true);
          const cardsResponse = await getFilteredCards();
          setNutritionists(cardsResponse.cards || []);
          setLoading(false);
        }

        if (shouldFetchRecs && recommended.length === 0) {
          setRecLoading(true);
          const recsResponse = await getRecommendedExperts();
          setRecommended(recsResponse || []);
          setRecLoading(false);
        } else if (!isLogin) {
          setRecommended([]);
        }

      } catch (err) {
        console.error('Data Fetch Error:', err);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
        setRecLoading(false);
      }
    };

    loadHomeData();
  }, [isLogin, user?.role]);

  const onLogoutClick = () => {
    handleLogout();
    navigate("/Home");
  };

  const handleCtaClick = () => navigate("/RegisterType");

  return (
    <div className="home-page">
      <Navbar />

      <Aibot />

      <Hero />

      <HomeSchedule />

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <NutritionistSection
          data={nutritionists}
          isLoading={loading}
          limit={10}
          title="Top Rated Experts"
          showViewAll={true}
        />
      )}

      {isLogin && user?.role === 'customer' && (
        <NutritionistSection
          data={recommended}
          isLoading={recLoading}
          limit={10}
          title="Recommended For Your Goals ✨"
          isRecommended={true}
        />
      )}

      <section className="features-section">
        <h2 className="section-title">Everything You Need for a Healthier Life</h2>
        <p className="section-subtitle">Comprehensive tools and expert support at your fingertips</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon green">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            </div>
            <h3 className="feature-title">Expert Nutritionists</h3>
            <p className="feature-description">Connect with certified professionals tailored to your needs</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon blue">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <h3 className="feature-title">Meal Plans</h3>
            <p className="feature-description">Custom meal plans designed for your specific goals</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon purple">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <h3 className="feature-title">Progress Tracking</h3>
            <p className="feature-description">Monitor your journey with detailed analytics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon orange">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <h3 className="feature-title">24/7 AI Assistant</h3>
            <p className="feature-description">Get instant answers to your nutrition questions</p>
          </div>
        </div>
      </section>

      {!isLogin && (
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Health?</h2>
            <button className="cta-button" onClick={handleCtaClick}>Start Your Journey Today</button>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Nutrilink</h3>
            <p className="footer-text">Empowering health through technology.</p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Links</h4>
            <ul className="footer-links">
              <li><Link to="/nutritionists">Find Experts</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Nutrilink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;