import React, { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import './NutritionistPageCards.css';

const NutritionistPageCards = ({ nutritionist, onClick, onLoginRequired }) => {
  const { user } = useContext(AuthContext);
  const isLogin = !!user;

  if (!nutritionist) return null;

  const {
    user: nutriUser,
    rating,
    reviewCount,
    price,
    specialization,
    cardBio,
    languages,
    yearsOfExperience
  } = nutritionist;

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (!isLogin) {
      // NEW: Instead of navigating to login page, trigger the login modal
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }
    onClick()
  };

  return (
    <>
      <div className="nutritionist-card">
        <div className="card-image-wrapper">
          <img
            src={nutriUser?.profilePic}
            alt={nutriUser?.username}
            className="card-image"
            loading="lazy"
          />
        </div>

        <div className="card-content">
          <div className="card-content-inner">
            <div className="card-header">
              <h3 className="card-title">
                Dr. {nutriUser?.username
                  ? nutriUser.username.charAt(0).toUpperCase() + nutriUser.username.slice(1)
                  : 'Expert'}
              </h3>
              <div className="upper-right">
                <div className="available">
                  <span className="availability-dot"></span>
                  <span className="available-text">Available</span>
                </div>
              </div>
            </div>

            <div className="specialties-tags">
              {specialization?.length > 0 ? (
                specialization.map((spec, index) => (
                  <span key={index} className="spec-tag">
                    {spec}
                  </span>
                ))
              ) : (
                <span className="spec-tag">General Health</span>
              )}
            </div>

            <div className="card-footer-ed">
              <div className="card-info">
                <span className="card-bio">
                  {cardBio}
                </span>
                <div className="info-down">
                  {languages?.length > 0 && (
                    <div className='card-languages-ed'>
                      <svg width="17" height="17" viewBox="0 0 14 14" fill="none" stroke="#1D9E75" strokeWidth="1.5">
                        <circle cx="7" cy="4" r="2.5" />
                        <path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5" />
                      </svg>
                      <p>{languages.join(', ')}</p>
                    </div>
                  )}
                  <div className="card-experience">
                    <svg width="17" height="17" viewBox="0 0 14 14" fill="none" stroke="#1D9E75" strokeWidth="1.5">
                      <rect x="2" y="3" width="10" height="9" rx="1.5" />
                      <path d="M5 3V2m4 1V2M2 7h10" />
                    </svg>
                    <p>
                      {yearsOfExperience !== undefined ? yearsOfExperience : '0'} yrs experience
                    </p>
                  </div>
                  <div className="card-review">
                    <svg width="17" height="17" viewBox="0 0 14 14" fill="none" stroke="#1D9E75" strokeWidth="1.5">
                      <path d="M7 2l1.5 3 3.5.5-2.5 2.5.6 3.5L7 10l-3.1 1.5.6-3.5L2 5.5l3.5-.5z" />
                    </svg>
                    <p>
                      {reviewCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="right-info1">
                <div className="price">${price}</div>
                <span className="price-label">per session</span>
                <div className="rating">
                  <svg width="20" height="20" viewBox="0 0 14 14" fill="#EF9F27">
                    <path d="M7 2l1.5 3 3.5.5-2.5 2.5.6 3.5L7 10l-3.1 1.5.6-3.5L2 5.5l3.5-.5z" />
                  </svg>
                  <p>
                    {rating}
                  </p>
                </div>
                <button className="book" onClick={handleCardClick}>Book session</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NutritionistPageCards;