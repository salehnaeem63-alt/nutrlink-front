import React, { useState } from 'react';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, nutritionist }) => {
  const [selectedDuration, setSelectedDuration] = useState('60');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(0);

  if (!isOpen || !nutritionist) return null;

  // Persuasive bio - uses nutritionist data or a high-converting default
  const bioDescription = nutritionist.description || 
    `Specializing in personalized nutrition plans that fit your lifestyle. With over ${nutritionist.experience || '5'} years of experience, I help clients achieve sustainable results through evidence-based coaching and constant support.`;

  const generateWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + (weekOffset * 7));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = generateWeekDates(currentWeek);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const availableTimes = {
    morning: ['09:00', '10:00', '11:00'],
    afternoon: ['13:00', '14:00', '15:00', '16:00'],
    evening: ['17:00', '18:00', '19:00']
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeClick = (time) => setSelectedTime(time);

  const handleContinue = () => {
    if (selectedDate && selectedTime && selectedDuration) {
      const bookingData = {
        nutritionist: nutritionist.name,
        date: selectedDate.toLocaleDateString(),
        time: selectedTime,
        duration: selectedDuration
      };
      console.log('Booking:', bookingData);
      onClose();
    }
  };

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="booking-header">
          <div className="booking-header-content">
            <img 
              src={nutritionist.image} 
              alt={nutritionist.name}
              className="booking-nutritionist-avatar"
            />
            <div className="booking-nutritionist-info">
              <h2 className="booking-title">Book a Session</h2>
              <p className="booking-subtitle">with {nutritionist.name}</p>
            </div>
          </div>
          <button className="booking-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* PERSUASIVE DESCRIPTION SECTION */}
        <div className="booking-description-section">
          <div className="description-badge">Professional Profile</div>
          <p className="nutritionist-bio">
            "{bioDescription}"
          </p>
          <div className="trust-indicators">
             <span><span className="check">✓</span> Verified Expert</span>
             <span><span className="check">✓</span> 1-on-1 Video Call</span>
             <span><span className="check">✓</span> Custom Meal Plan</span>
          </div>
        </div>

        {/* Content */}
        <div className="booking-content">
          <div className="booking-section">
            <label className="booking-label">Session Duration</label>
            <div className="duration-options">
              <button 
                className={`duration-btn ${selectedDuration === '30' ? 'active' : ''}`}
                onClick={() => setSelectedDuration('30')}
              >
                30 mins
              </button>
              <button 
                className={`duration-btn ${selectedDuration === '60' ? 'active' : ''}`}
                onClick={() => setSelectedDuration('60')}
              >
                60 mins
              </button>
            </div>
          </div>

          <div className="booking-section">
            <div className="date-header">
              <button 
                className="date-nav-btn"
                onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
                disabled={currentWeek === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <span className="date-range">{formatDateRange()}</span>
              <button 
                className="date-nav-btn"
                onClick={() => setCurrentWeek(currentWeek + 1)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>

            <div className="calendar-grid">
              {weekDates.map((date, index) => {
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                const isPast = date < new Date() && !isToday;

                return (
                  <button
                    key={index}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isPast ? 'disabled' : ''}`}
                    onClick={() => !isPast && handleDateClick(date)}
                    disabled={isPast}
                  >
                    <span className="day-name">{daysOfWeek[date.getDay()]}</span>
                    <span className="day-number">{date.getDate()}</span>
                    {isToday && <span className="today-badge">Today</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="booking-section time-section">
              <label className="booking-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Available Times
              </label>
              <p className="timezone-info">Times shown in your local timezone</p>

              {Object.entries(availableTimes).map(([period, slots]) => (
                <div className="time-group" key={period}>
                  <h4 className="time-group-title">{period}</h4>
                  <div className="time-slots">
                    {slots.map((time) => (
                      <button
                        key={time}
                        className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                        onClick={() => handleTimeClick(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="booking-footer">
          <div className="booking-summary">
            {selectedDate && selectedTime && (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedTime}
                </span>
              </>
            )}
          </div>
          <button 
            className="continue-btn"
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime}
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;