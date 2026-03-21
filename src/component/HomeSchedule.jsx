import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { getCustomerAppointments, getNutritionistSchedule } from '../api/appointmetapi';
import './HomeSchedule.css'

const HomeSchedule = () => {
  const { user, isLogin } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyData = async () => {
      if (!isLogin || !user) return;

      try {
        setLoading(true);
        let data;

        if (user.role === 'nutritionist') {
          data = await getNutritionistSchedule('booked');
        } else {
          data = await getCustomerAppointments();
        }

        const response = await getCustomerAppointments();

        if (response && response.appointments) {
          setAppointments(response.appointments.slice(0, 3));
        } else {
          setAppointments([]);
        }

      } catch (error) {
        console.error('Error loading home schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyData();
  }, [isLogin, user]);

  if (!isLogin) return null;

  return (
    <div className="home-schedule">
      <div className="schedule-list-side">
        <h2>Your Upcoming Sessions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : appointments.length > 0 ? (
          <ul className="schedule-list">
            {appointments.map(app => (
              <li key={app._id} className="schedule-item">
                <div className="appt-info">
                  <div className="appt-avatar">
                    {app.nutritionistId?.profilePic ? (
                      <img
                        src={app.nutritionistId.profilePic}
                        alt={app.nutritionistId.username}
                        className="avatar-img"
                      />
                    ) : (
                      app.nutritionistId?.username?.charAt(0).toUpperCase() || "?"
                    )}
                  </div>

                  <div className="appt-details">
                    <span className="nutritionist-name">
                      {/* Change: Remove the .user middleman */}
                      Dr. {app.nutritionistId?.username || "Nutritionist"}
                    </span>
                    <span className="appt-time">{app.timeSlot}</span>
                  </div>
                </div>

                <div className="appt-meta">
                  <span className="appt-date">{new Date(app.date).toLocaleDateString()}</span>
                  <button className="details-btn">Details</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming sessions.</p>
        )}
      </div>

      <div className="schedule-info-side">
        <h2>Your Progress</h2>
        <p>More stuff goes here (Stats, Goals, etc.)</p>
      </div>

    </div>
  );
};

export default HomeSchedule;