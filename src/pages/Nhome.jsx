import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NHome.css';
import Navbar from '../component/Nnavbar';
import FilterBar from '../component/FilterBar';
import NutritionistCard from '../component/NutritionistCard';

const Nhome = () => {
  const navigate = useNavigate();
  const isLogin = !!localStorage.getItem("authToken");

  // Full dataset of 12 nutritionists
  const featuredNutritionists = [
    { id: 1, name: 'Dr. Sarah Johnson', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', rating: 4.8, reviews: 284, price: 45, specialties: ['Weight Loss', 'Sports Nutrition', 'Meal Planning'], badge: 'Bestseller' },
    { id: 2, name: 'Dr. Michael Chen', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', rating: 4.9, reviews: 412, price: 50, specialties: ['Diabetes Management', 'Heart Health'], badge: 'Premium' },
    { id: 3, name: 'Emma Rodriguez', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400', rating: 4.7, reviews: 198, price: 40, specialties: ['Vegan Nutrition', 'Gut Health'], badge: 'New' },
    { id: 4, name: 'Dr. James Wilson', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', rating: 4.8, reviews: 356, price: 55, specialties: ['Clinical Nutrition', 'Disease Prevention'], badge: 'Premium' },
    { id: 5, name: 'Lisa Anderson', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', rating: 4.6, reviews: 167, price: 38, specialties: ['Pregnancy Nutrition', 'Child Nutrition'], badge: 'Bestseller' },
    { id: 6, name: 'David Park', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', rating: 4.9, reviews: 120, price: 42, specialties: ['Keto Diet', 'Intermittent Fasting'], badge: 'New' },
    { id: 7, name: 'Dr. Olivia White', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400', rating: 4.7, reviews: 95, price: 48, specialties: ['Eating Disorders', 'Mental Wellness'], badge: 'Premium' },
    { id: 8, name: 'Marcus Thorne', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', rating: 4.8, reviews: 210, price: 44, specialties: ['Bodybuilding', 'Macro Tracking'], badge: 'Bestseller' },
    { id: 9, name: 'Sophia Loren', image: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=400', rating: 4.5, reviews: 88, price: 35, specialties: ['Childhood Obesity', 'Meal Prep'], badge: 'New' },
    { id: 10, name: 'Dr. Robert Fox', image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', rating: 4.9, reviews: 530, price: 65, specialties: ['Holistic Health', 'Longevity'], badge: 'Premium' },
    { id: 11, name: 'Isabella Garcia', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', rating: 4.7, reviews: 142, price: 39, specialties: ['Hormonal Balance', 'PCOS Diet'], badge: 'Bestseller' },
    { id: 12, name: 'Kevin Hartly', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', rating: 4.6, reviews: 75, price: 40, specialties: ['Senior Nutrition', 'Bone Health'], badge: 'New' }
  ];

  // Logic for Login/Logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const handleCtaClick = () => {
    navigate("/RegisterType");
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6; 

  // Calculate total pages
  const totalPages = Math.ceil(featuredNutritionists.length / cardsPerPage);

  // Get current nutritionists for this page (1-6 then 7-12)
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentNutritionists = featuredNutritionists.slice(indexOfFirstCard, indexOfLastCard);

  // Handle page navigation
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleFilterChange = (filters) => {
    console.log('Filters changed:', filters);
  };

  return (
    <div className="nhome-page">
      <Navbar 
        isLogin={isLogin} 
        onLogout={handleLogout} 
        ctaLabel={!isLogin ? "Get Started" : ""} 
        onCtaClick={handleCtaClick}
      />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Your Journey to <span className="text-green">Better Health</span> Starts Here
            </h1>
            <p className="hero-description">
              Connect with expert nutritionists, track your diet, and achieve your wellness goals with our AI-powered platform.
            </p>

            <div className="hero-buttons">
              {!isLogin ? (
                <>
                  <Link to="/RegisterType">
                    <button className="btn-primary">Get Started</button>
                  </Link>
                  <Link to="/nutritionists">
                    <button className="btn-secondary">Book Appointment</button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/NutritionistAppointments">
                    <button className="btn-primary">Go to Appointment</button>
                  </Link>
                </>
              )}
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Happy Clients</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Nutritionists</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800" 
              alt="Healthy Food" 
              className="food-image"
            />
          </div>
        </div>
      </section>

      <FilterBar onFilterChange={handleFilterChange} />

      {/* Featured Nutritionists Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Available Nutritionist</h2>
        </div>

        <div className="nutritionists-grid">
          {currentNutritionists.map((nutritionist) => (
            <NutritionistCard 
              key={nutritionist.id} 
              nutritionist={nutritionist} 
            />
          ))}
        </div>

        {/* Pagination Logic */}
        <div className="pagination">
          <button 
            className="pagination-arrow" 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button 
            className="pagination-arrow" 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Everything You Need for a Healthier Life</h2>
        <p className="section-subtitle">Comprehensive tools and expert support at your fingertips</p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon green">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="feature-title">Expert Nutritionists</h3>
            <p className="feature-description">Connect with certified professionals tailored to your needs</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 className="feature-title">Personalized Meal Plans</h3>
            <p className="feature-description">Get custom meal plans designed for your goals and preferences</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 className="feature-title">Progress Tracking</h3>
            <p className="feature-description">Monitor your journey with detailed analytics and insights</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 className="feature-title">24/7 AI Assistant</h3>
            <p className="feature-description">Get instant answers to your nutrition questions anytime</p>
          </div>
        </div>
      </section>

      {!isLogin && (
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Health?</h2>
            <p className="cta-description">Join thousands already achieving wellness goals with Nutrilink</p>
            <button className="cta-button" onClick={handleCtaClick}>Start Your Journey Today</button>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
             <h3 className="footer-title">Nutrilink</h3>
             <p className="footer-text">Empowering your health journey through expert advice and technology.</p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
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
};

export default Nhome;