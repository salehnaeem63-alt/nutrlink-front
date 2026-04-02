import React, { useState, useEffect } from 'react';
import { getProfileById } from '../../api/nutritionist';
// Make sure this path matches your actual file structure for your appointments API
import { getAvailableSlots, bookAppointment } from '../../api/appointmetapi';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import './BookingModal.css';

const BookingModal = ({ nutritionistId, onClose }) => {
  // --- Data Fetching State ---
  const [nutritionistInfo, setNutritionistInfo] = useState(null);
  const [availableSlotsData, setAvailableSlotsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- UI Selection State ---
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedTimeSlotObj, setSelectedTimeSlotObj] = useState(null);

  useEffect(() => {
    if (!nutritionistId) return;

    const fetchModalData = async () => {
      setLoading(true);
      try {
        const [profileRes, slotRes] = await Promise.all([
          getProfileById(nutritionistId),
          getAvailableSlots(nutritionistId)
        ]);
        setNutritionistInfo(profileRes);
        setAvailableSlotsData(slotRes.slots || []);
      } catch (err) {
        setError("Failed to load booking data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchModalData();
  }, [nutritionistId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Attach listener when the modal mounts
    window.addEventListener('keydown', handleKeyDown);

    // Remove listener when the modal unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // 2. Early Returns for empty/loading/error states
  if (!nutritionistId) return null;

  if (loading) {
    return (
      <div className="booking-modal-overlay" onClick={onClose}>
        <div className="booking-modal" onClick={(e) => e.stopPropagation()} style={{ minHeight: '300px', position: 'relative' }}>
          {/* I added isActive={true} since your Nutritionists.js file showed this component expects that prop */}
          <LoadingOverlay message="Loading schedule..." isActive={true} />
        </div>
      </div>
    );
  }

  if (error || !nutritionistInfo) {
    return (
      <div className="booking-modal-overlay" onClick={onClose}>
        <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
          <h2>{error || "Profile not found"}</h2>
          <button className="continue-btn" onClick={onClose} style={{ marginTop: '20px' }}>Close</button>
        </div>
      </div>
    );
  }

  // 3. Helper Variables & Functions
  const bioDescription = nutritionistInfo.cardBio ||
    `Specializing in personalized nutrition plans that fit your lifestyle. With over ${nutritionistInfo.yearsOfExperience || '5'} years of experience.`;

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

  // This correctly matches the clicked date with the slots from the database
  const getTimesForSelectedDate = () => {
    if (!selectedDate) return [];

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // FIXED: getMonth()
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDateString = `${year}-${month}-${day}`;

    // FIXED: slot.date instead of slot - date
    return availableSlotsData.filter(slot => {
      if (!slot.date) return false;

      // Extracts "2026-04-15" from "2026-04-15T00:00:00.000Z"
      const dbDateOnly = slot.date.split('T')[0];

      return dbDateOnly === formattedDateString;
    });
  };

  const timesForSelectedDate = getTimesForSelectedDate();

  // 4. Click Handlers
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlotObj(null); // Reset time when a new date is picked
  };

  const handleTimeClick = (slotObj) => {
    setSelectedTimeSlotObj(slotObj);
  };

  const handleContinue = async () => {
    if (selectedDate && selectedTimeSlotObj) {
      try {
        await bookAppointment(selectedTimeSlotObj._id);
        alert("Booking successful!");
        onClose(); // Close modal upon success
      } catch (err) {
        alert("Booking failed. Please try again.");
        console.error(err);
      }
    }
  };

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const parseTimeForSort = (timeString) => {
    if (!timeString) return 0;
    const startTime = timeString.split(' - ')[0]; // Gets "07:00 AM"
    const [time, modifier] = startTime.split(' ');
    let [hours, minutes] = time.split(':');

    hours = parseInt(hours, 10);
    if (hours === 12) hours = modifier.toUpperCase() === 'AM' ? 0 : 12;
    else if (modifier.toUpperCase() === 'PM') hours += 12;

    return hours * 60 + parseInt(minutes, 10);
  };

  const sortedTimesForSelectedDate = [...timesForSelectedDate].sort(
    (a, b) => parseTimeForSort(a.timeSlot) - parseTimeForSort(b.timeSlot)
  );

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="booking-header">
          <div className="booking-header-content">
            <img
              src={nutritionistInfo.user?.profilePic}
              alt={nutritionistInfo.user?.username}
              className="booking-nutritionist-avatar"
            />
            <div className="booking-nutritionist-info">
              <h2 className="booking-title">Book a Session</h2>
              <p className="booking-subtitle">with Dr. {nutritionistInfo.user?.username}</p>
            </div>
          </div>
          <button className="booking-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Profile Bio Section */}
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

        {/* Booking Content */}
        <div className="booking-content">

          {/* Calendar Section */}
          <div className="booking-section">
            <div className="date-header">
              <button
                className="date-nav-btn"
                onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
                disabled={currentWeek === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="date-range">{formatDateRange()}</span>
              <button
                className="date-nav-btn"
                onClick={() => setCurrentWeek(currentWeek + 1)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="calendar-grid">
              {weekDates.map((date, index) => {
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                const isPast = date < new Date() && !isToday;

                // Format the current loop date to check against DB data
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const checkDateString = `${year}-${month}-${day}`;

                // Check if this specific day has any available slots
                const hasAvailability = availableSlotsData.some(slot => {
                  if (!slot.date) return false;
                  return slot.date.split('T')[0] === checkDateString;
                });

                return (
                  <button
                    key={index}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isPast ? 'disabled' : ''} ${hasAvailability && !isPast && !isSelected ? 'has-available-slots' : ''}`}
                    onClick={() => !isPast && handleDateClick(date)}
                    disabled={isPast}
                  >
                    <span className="day-name">{daysOfWeek[date.getDay()]}</span>
                    <span className="day-number">{date.getDate()}</span>
                    {isToday && <span className="today-badge">Today</span>}

                    {/* Render a dot if slots exist, unless the day is already selected/past */}
                    {hasAvailability && !isPast && !isSelected && (
                      <span className="availability-dot-indicator"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Section (Only visible if a date is selected) */}
          {selectedDate && (
            <div className="booking-section time-section">
              <label className="booking-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Available Times
              </label>

              <div className="time-slots" style={{ marginTop: '10px' }}>
                {timesForSelectedDate.length === 0 ? (
                  <p style={{ color: '#666', fontSize: '14px', width: '250px' }}>No available slots for this date.</p>
                ) : (
                  sortedTimesForSelectedDate.map((slot) => (
                    <button
                      key={slot._id}
                      className={`time-slot ${selectedTimeSlotObj?._id === slot._id ? 'selected' : ''}`}
                      onClick={() => handleTimeClick(slot)}
                    >
                      {slot.timeSlot}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="booking-footer">
          <div className="booking-summary">
            {selectedDate && selectedTimeSlotObj && (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span>
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedTimeSlotObj.timeSlot}
                </span>
              </>
            )}
          </div>
          <button
            className="continue-btn"
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTimeSlotObj}
          >
            Confirm & Continue
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingModal;