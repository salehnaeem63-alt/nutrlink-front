import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import FilterBar from '../component/FilterBar';
import NutritionistCard from '../component/NutritionistCard';

const Home = () => {
  const navigate = useNavigate();
  const isLogin = localStorage.getItem("authToken");
  
  
  // Sample nutritionists data
  const featuredNutritionists = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
      rating: 4.8,
      reviews: 284,
      price: 45,
      specialties: ['Weight Loss', 'Sports Nutrition', 'Meal Planning'],
      badge: 'Bestseller'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
      rating: 4.9,
      reviews: 412,
      price: 50,
      specialties: ['Diabetes Management', 'Heart Health'],
      badge: 'Premium'
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
      rating: 4.7,
      reviews: 198,
      price: 40,
      specialties: ['Vegan Nutrition', 'Gut Health'],
      badge: 'New'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
      rating: 4.8,
      reviews: 356,
      price: 55,
      specialties: ['Clinical Nutrition', 'Disease Prevention'],
      badge: 'Premium'
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      rating: 4.6,
      reviews: 167,
      price: 38,
      specialties: ['Pregnancy Nutrition', 'Child Nutrition'],
      badge: 'Bestseller'
    }
  ];

  const scrollCarousel = (direction, carouselId) => {
    const carousel = document.getElementById(carouselId);
    const scrollAmount = 320;
    carousel.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

 
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };


  const handleFilterChange = (filters) => {
    console.log('Filters changed:', filters);
   
  };
  

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="brand">
            <div className="brand-icon">N</div>
            <span className="brand-name">NutriPlan</span>
          </Link>

          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="#dashboard">Dashboard</Link></li>
            <li><Link to="#profile">Profile</Link></li>
            <li><Link to="#calculator">Calculator</Link></li>
            {!isLogin && <li><Link to="/login">Login</Link></li>}
          </ul>

          {/* Conditional Button: Get Started or Logout */}
          {!isLogin ? (
            <Link to="/RegisterType">
              <button className="get-started-btn">Get Started</button>
            </Link>
          ) : (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section - Only show "Get Started" content when NOT logged in */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Your Journey to <span className="text-green">Better Health</span> Starts Here
            </h1>
            <p className="hero-description">
              Connect with expert nutritionists, track your diet, and achieve your wellness goals with our AI-powered platform.
            </p>

            {/* Conditional Buttons */}
            {!isLogin ? (
              <div className="hero-buttons">
                <Link to="/RegisterType">
                  <button className="btn-primary">Get Started</button>
                </Link>
                <Link to="/nutritionists">
                  <button className="btn-secondary">Book Appointment</button>
                </Link>
              </div>
            ) : (
              <div className="hero-buttons">
                <Link to="/dashboard">
                  <button className="btn-primary">Go to Dashboard</button>
                </Link>
                <Link to="/nutritionists">
                  <button className="btn-secondary">Find Nutritionists</button>
                </Link>
              </div>
            )}

            {/* Stats */}
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

      {/* Filter Bar */}
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Featured Nutritionists Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Recommended for you</h2>
          <div className="carousel-controls">
            <button 
              className="carousel-btn" 
              onClick={() => scrollCarousel('left', 'nutritionists-carousel')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button 
              className="carousel-btn" 
              onClick={() => scrollCarousel('right', 'nutritionists-carousel')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel" id="nutritionists-carousel">
            {featuredNutritionists.map((nutritionist) => (
              <NutritionistCard 
                key={nutritionist.id} 
                nutritionist={nutritionist} 
              />
            ))}
          </div>
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="feature-title">Expert Nutritionists</h3>
            <p className="feature-description">
              Connect with certified nutrition professionals tailored to your needs
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 className="feature-title">Personalized Meal Plans</h3>
            <p className="feature-description">
              Get custom meal plans designed for your goals and preferences
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 className="feature-title">Progress Tracking</h3>
            <p className="feature-description">
              Monitor your journey with detailed analytics and insights
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 className="feature-title">24/7 AI Assistant</h3>
            <p className="feature-description">
              Get instant answers to your nutrition questions anytime
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show when NOT logged in */}
      {!isLogin && (
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Health?</h2>
            <p className="cta-description">
              Join thousands of people already achieving their wellness goals with NutriPlan
            </p>
            <Link to="/RegisterType">
              <button className="cta-button">Start Your Journey Today</button>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="brand">
              <div className="brand-icon">N</div>
              <span className="brand-name">NutriPlan</span>
            </div>
            <p className="footer-text">
              Your partner in achieving better health through expert nutrition guidance.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-links">
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 NutriPlan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
