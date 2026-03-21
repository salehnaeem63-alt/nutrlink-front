import React, { useState, useContext } from 'react';
import CountUp from 'react-countup';
import Typewriter from 'typewriter-effect';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Home.css';
import Navbar from '../component/Navbar';
import FilterBar from '../component/FilterBar';
import NutritionistCard from '../component/NutritionistCard';
import { Aibot } from '../component/Aibot';

// Global state for authentication
import { AuthContext } from '../AuthContext';

const Home = () => {
  const navigate = useNavigate();

  // Global state logic
  const { user, handleLogout } = useContext(AuthContext);
  const isLogin = !!user;


  // Nutritionists Dataset
  const featuredNutritionists = [
    { id: 1, name: 'Dr. Sarah Johnson', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', rating: 4.8, reviews: 284, price: 45, specialties: ['Weight Loss', 'Sports Nutrition'], badge: 'Bestseller' },
    { id: 2, name: 'Dr. Michael Chen', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', rating: 4.9, reviews: 412, price: 50, specialties: ['Diabetes Management'], badge: 'Premium' },
    { id: 4, name: 'Dr. James Wilson', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', rating: 4.8, reviews: 356, price: 55, specialties: ['Clinical Nutrition'], badge: 'Premium' },
    { id: 6, name: 'David Park', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', rating: 4.9, reviews: 120, price: 42, specialties: ['Keto Diet'], badge: 'New' },
    // { id: 3, name: 'Emma Rodriguez', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400', rating: 4.7, reviews: 198, price: 40, specialties: ['Vegan Nutrition'], badge: 'New' },
    // { id: 5, name: 'Lisa Anderson', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', rating: 4.6, reviews: 167, price: 38, specialties: ['Pregnancy Nutrition'], badge: 'Bestseller' },
    // { id: 7, name: 'Dr. Olivia White', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400', rating: 4.7, reviews: 95, price: 48, specialties: ['Eating Disorders'], badge: 'Premium' },
    // { id: 8, name: 'Marcus Thorne', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', rating: 4.8, reviews: 210, price: 44, specialties: ['Bodybuilding'], badge: 'Bestseller' },
    // { id: 9, name: 'Sophia Loren', image: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=400', rating: 4.5, reviews: 88, price: 35, specialties: ['Meal Prep'], badge: 'New' },
    // { id: 10, name: 'Dr. Robert Fox', image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', rating: 4.9, reviews: 530, price: 65, specialties: ['Holistic Health'], badge: 'Premium' },
    // { id: 11, name: 'Isabella Garcia', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', rating: 4.7, reviews: 142, price: 39, specialties: ['Hormonal Balance'], badge: 'Bestseller' },
    // { id: 12, name: 'Kevin Hartly', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', rating: 4.6, reviews: 75, price: 40, specialties: ['Senior Nutrition'], badge: 'New' }
  ];

  const onLogoutClick = () => {
    handleLogout();
    navigate("/Home");
  };

  const handleCtaClick = () => navigate("/RegisterType");

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;
  const totalPages = Math.ceil(featuredNutritionists.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentNutritionists = featuredNutritionists.slice(indexOfFirstCard, indexOfLastCard);

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handleFilterChange = (filters) => console.log('Filters changed:', filters);

  const getHeroContent = (user, isLogin) => {
    const role = user?.role?.toLowerCase();

    const displayName = user?.username
      ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
      : "User";

    if (!isLogin) {
      return {
        title: <>Your Journey to <span className='text-green'>Better Health</span> Starts Here</>,
        description: "Connect with expert nutritionists, track your diet, and achieve your wellness goals with our AI-powered platform.",
        primaryBtn: { text: "Get Started", link: "/RegisterType" },
        secondaryBtn: { text: "Book Appointment", link: "/nutritionists" }
      };
    }

    if (role === 'nutritionist') {
      return {
        title: <>Empower Your <span className="text-green">Clinic</span> with AI</>,
        description: `Welcome back, Coach ${displayName}. Manage your patients, update diet plans, and check your schedule.`,
        primaryBtn: { text: "Go to Dashboard", link: "/Ndashboard" },
        secondaryBtn: { text: "View Appointments", link: "/appointments" }
      };
    }

    return {
      title: <>Welcome Back, <span className="text-green">{displayName}</span>!</>,
      description: "Ready to reach your weight goals today? Check your latest meal plan and track your progress.",
      primaryBtn: { text: "Go to Dashboard", link: "/Dashboard" },
      secondaryBtn: { text: "Find Nutritionists", link: "/nutritionists" }
    };
  };

  const content = getHeroContent(user, isLogin);

  const typewriterOptions = {
    nutritionist: [
      'Managing your clients efficiently',
      'Creating professional meal plans',
      'Tracking patient health metrics',
      'Expanding your wellness practice'
    ],
    customer: [
      'Tracking your daily progress',
      'Achieving your weight goals',
      'Personalizing your diet plan',
      'Connecting with your expert'
    ],
    guest: [
      'Making your life better',
      'The Smart Bridge to Better Health',
      'Connecting you with experts',
      'Personalizing your diet',
      'Smart food tracking',
      'Evidence-Based Wellness Ecosystem'
    ]
  }
  const userRole = user?.role || 'guest'
  const activeStrings = typewriterOptions[userRole] || typewriterOptions.guest

  return (
    <div className="container">
      <div className="home-page">
        <Navbar
          isLogin={isLogin}
          user={user}
          onLogout={onLogoutClick}
          ctaLabel={!isLogin ? "Get Started" : ""}
          onCtaClick={handleCtaClick}
        />
        <Aibot />

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              {/* Typetwriter AI Feed */}
              <div className="typewriter-container">
                <span className="typewriter-label"></span>
                <Typewriter
                  options={{
                    strings: activeStrings,
                    autoStart: true,
                    loop: true,
                    deleteSpeed: 50,
                    delay: 75,
                    cursor: '_'
                  }}
                />
              </div>

              <h1 className="hero-title"> {content.title} </h1>

              <p className="hero-description"> {content.description} </p>

              <div className="hero-buttons">
                {!isLogin ? (
                  <>
                    <Link to="/RegisterType"><button className="btn-primary">Get Started</button></Link>
                    <Link to="/nutritionists"><button className="btn-secondary">Book Appointment</button></Link>
                  </>
                ) : (
                  <>
                    <Link to={user?.role === 'nutritionist' ? '/Ndashboard' : '/Dashboard'}>
                      <button className="btn-primary">Go to Dashboard</button>
                    </Link>
                    <Link to="/nutritionists"><button className="btn-secondary">Find Nutritionists</button></Link>
                  </>
                )}
              </div>

              <div className="stats-container">
                <div className="stat-item">
                  <h3><CountUp className='stat-number' end={10} duration={3} />K+</h3>
                  <p className='stat-label'>Happy Clients</p>
                </div>
                <div className="stat-item">
                  <h3><CountUp className='stat-number' end={500} duration={3} />+</h3>
                  <p className='stat-label'>Nutritionists</p>
                </div>
                <div className="stat-item">
                  <h3><CountUp className='stat-number' end={95} duration={3} />%</h3>
                  <p className="stat-label">Success Rate</p>
                </div>
              </div>
            </div>

            <div className="hero-image">
              <img
                src="https://img.freepik.com/premium-photo/laptop-desk-nutritionists-office-with-healthy-food-displays_1170794-294316.jpg"
                alt="Healthy Food"
                className="food-image"
              />
            </div>
          </div>
        </section>

        

        {/* {Top Nutritionists Rated Section} */}
        {!isLogin && (
          <section className="featured-section">
            <div className="section-header">
              <h2 className="section-title">Top Rated Nutritionists</h2>
            </div>
            <div className="nutritionists-grid">
              {currentNutritionists.map((nutritionist) => (
                <NutritionistCard key={nutritionist.id} nutritionist={nutritionist} />
              ))}
            </div>

            <div className="view-all-container">
              <Link to="/nutritionists" style={{ textDecoration: 'none' }}>
                <button className='view-nutritionists'>
                  View All Nutritionists
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
            {/* <div className="pagination">
            <button className="pagination-arrow" onClick={handlePrevPage} disabled={currentPage === 1}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="pagination-arrow" onClick={handleNextPage} disabled={currentPage === totalPages}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div> */}
          </section>
        )}

        {/* {Recommended for you Section} */}
        {isLogin && user?.role === 'customer' && (
          <section className="featured-section">
            <div className="section-header">
              <h2 className="section-title">ٌRecommended for You</h2>
            </div>
            <div className="nutritionists-grid">
              {currentNutritionists.map((nutritionist) => (
                <NutritionistCard key={nutritionist.id} nutritionist={nutritionist} />
              ))}
            </div>
            <div className="view-all-container">
              <Link to="/nutritionists" style={{ textDecoration: 'none' }}>
                <button className='view-nutritionists'>
                  View All Nutritionists
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </section>
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
    </div>
  );
}



export default Home;