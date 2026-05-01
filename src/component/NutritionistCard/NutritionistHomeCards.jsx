import React, { useState, useContext } from 'react';
import BookingModal from '../Bookingmodal/Bookingmodal';
import { AuthContext } from '../../AuthContext';
import { showAlert } from '../../utils/alertService';
import './NutritionistHomeCards.css';

const NutritionistHomeCards = ({ nutritionist }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const isLogin = !!user;

  if (!nutritionist) return null;

  const {
    user: nutriUser,
    rating,
    reviewCount,
    price,
    specialization,
    languages,
    badge
  } = nutritionist;

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (!isLogin) {
      showAlert('Authentication Required', 'Please login to book an appointment.', 'warning');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="home-nutritionist-card" onClick={handleCardClick} role="button">
        <div className="card-image-wrapper">
          <img
            src={nutriUser?.profilePic || 'https://via.placeholder.com/150'}
            alt={nutriUser?.username}
            className="card-image"
            loading="lazy"
          />
          <div className="card-image-overlay"></div>
          {badge && <span className={`badge ${badge.toLowerCase()}`}>{badge}</span>}
        </div>

        <div className="card-content">
          <div className="card-content-inner">
            <div className="card-header">
              <h3 className="card-title">
                Dr. {nutriUser?.username
                  ? nutriUser.username.charAt(0).toUpperCase() + nutriUser.username.slice(1)
                  : 'Expert'}
              </h3>
              <span className="availability-dot"></span>
            </div>

            <p className="card-specialties">
              {specialization?.length > 0
                ? specialization.join(' • ')
                : 'General Health • Wellness'}
            </p>
            {languages?.length > 0 && (
              <p className='card-languages'>
                🌐 {languages.join(', ')}
              </p>
            )}

            <div className="card-footer">
              <div className="card-rating">
                <span className="star-icon">★</span>
                <span className="rating-value">{rating || '5.0'}</span>
                <span className="rating-count">({reviewCount || 0})</span>
              </div>

              <div className="card-price">
                <span className="price">${price}</span>
                <span className="price-label">/hr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <BookingModal
          nutritionistId={nutritionist.user._id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default NutritionistHomeCards;