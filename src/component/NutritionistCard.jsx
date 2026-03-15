import React, { useState } from 'react';
import BookingModal from './BookingModal';
import './NutritionistCard.css';

const NutritionistCard = ({ nutritionist }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { 
    id, 
    name, 
    image, 
    rating, 
    reviews, 
    price, 
    specialties, 
    badge 
  } = nutritionist;

  const handleCardClick = () => {
    console.log('View nutritionist profile:', id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="nutritionist-card" onClick={handleCardClick}>
        <div className="card-image-wrapper">
          <img 
            src={image} 
            alt={name}
            className="card-image"
          />
          {badge && (
            <span className={`badge ${badge.toLowerCase()}`}>
              {badge}
            </span>
          )}
        </div>

        <div className="card-content">
          <h3 className="card-title">{name}</h3>
          
          <div className="card-specialties">
            {specialties.join(' • ')}
          </div>

          <div className="card-footer">
            <div className="card-rating">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffa500">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <span className="rating-value">{rating}</span>
              <span className="rating-count">({reviews})</span>
            </div>

            <div className="card-price">
              <span className="price">${price}</span>
              <span className="price-label">/session</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        nutritionist={nutritionist}
      />
    </>
  );
};

export default NutritionistCard;
