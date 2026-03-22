import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { getCustomerAppointments, getNutritionistSchedule } from '../api/appointmetapi';
import './HomeSchedule.css'

const HomeSchedule = () => {
  const { user, isLogin } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null)

  const closeModal = () => setSelectedAppt(null)

  const formatName = (u) => {
    if (!u?.username) return "User";
    return u.username.charAt(0).toUpperCase() + u.username.slice(1);
  };

  useEffect(() => {
    const fetchMyData = async () => {
      if (!isLogin || !user) return;

      try {
        setLoading(true);
        let res;

        if (user.role === 'nutritionist') {
          res = await getNutritionistSchedule('booked');
        } else {
          res = await getCustomerAppointments();
        }

        // If it's a customer, use .appointments. If it's a nutritionist, use .schedule.
        const allFetched = res?.appointments || res?.schedule || [];

        // 1. Get current time and normalize it to the start of today
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // 2. Filter: Keep only appointments that are today or in the future
        const upcoming = allFetched.filter(app => {
          const appointmentDate = new Date(app.date);
          return appointmentDate >= now;
        });

        // 3. Sort: Order them by date (closest to today first)
        const sorted = upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

        setAppointments(sorted.slice(0, 3));

      } catch (error) {
        console.error('Error loading home schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyData();
  }, [isLogin, user]);

  useEffect(() => {
    // 1. If no modal is open, don't do anything
    if (!selectedAppt) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    // 2. Add the listener to the whole window
    window.addEventListener('keydown', handleKeyDown);

    // 3. CRITICAL: Cleanup to avoid memory leaks
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedAppt]);

  if (!isLogin) return null;

  return (
    <div className="home-schedule">
      <div className="schedule-list-side">
        <h2>Your Upcoming Sessions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : appointments.length > 0 ? (
          <ul className="schedule-list">
            {appointments.map((app) => {

              const isNutri = user.role === 'nutritionist'
              const targetUser = isNutri ? app.customerId : app.nutritionistId;
              const title = isNutri ? "" : "Dr. "

              return (
                <li key={app._id} className="schedule-item">
                  <div className="appt-info">
                    <div className="appt-avatar">
                      {targetUser?.profilePic ? (
                        <img
                          src={targetUser.profilePic}
                          alt={targetUser?.username} // Use targetUser here
                          className="avatar-img"
                        />
                      ) : (
                        /* Use targetUser here so the letter matches the actual user */
                        targetUser?.username?.charAt(0).toUpperCase() || "?"
                      )}
                    </div>

                    <div className="appt-details">
                      <span className="target-name">
                        {/* Change: Remove the .user middleman */}
                        {title}{formatName(targetUser)}
                      </span>
                      <span className="appt-time">{app.timeSlot}</span>
                    </div>
                  </div>

                  <div className="appt-meta">
                    <span className="appt-date">{new Date(app.date).toLocaleDateString()}</span>
                    <button className="details-btn" onClick={() => setSelectedAppt(app)}>Details</button>
                  </div>
                </li>
              )
            })}
            <div className="view-all">
              <button className="view-button">View All</button>
            </div>
          </ul>
        ) : (
          <p>No upcoming sessions.</p>
        )}
      </div>

      <div className="schedule-info-side">
        <h2>Your Progress</h2>
        <p>More stuff goes here (Stats, Goals, etc.)</p>
      </div>

      {selectedAppt && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={closeModal}>&times;</button>

            <div className="modal-header">
              <h2>Appointment Details</h2>
            </div>

            <hr className="modal-divider" />

            <div className="modal-body">
              <div className="info-row">
                <span className="label">Participant:</span>
                <span className="value">
                  {(() => {
                    const isNutri = user.role === 'nutritionist';
                    const target = isNutri ? selectedAppt.customerId : selectedAppt.nutritionistId;
                    const title = isNutri ? "" : "Dr. ";
                    return `${title}${formatName(target)}`;
                  })()}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Time:</span>
                <span className="value">{selectedAppt.timeSlot}</span>
              </div>
              <div className="info-row">
                <span className="label">Date:</span>
                <span className="value">{new Date(selectedAppt.date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="modal-footer">
              {/* The Chat Button */}
              <button className="chat-btn" onClick={() => console.log("Open Chat with:", selectedAppt._id)}>
                <span className="btn-icon">💬</span>
                Send Message
              </button>

              {/* Join Meeting Button (Optional but recommended) */}
              <button className="join-btn">Join Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSchedule;