import { useState, useEffect } from 'react';
import { nutritionistChartData, nutritionistDashboardStats, getProfile, getNutritionistSchedule } from "../api/nDashboard";
import Navbar from "../component/Navbar";
import './Ndashboard.css';

export const Ndashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [profileData, statsData, chartDataRes, scheduleData] = await Promise.all([
        getProfile().catch(() => null),
        nutritionistDashboardStats().catch(() => null),
        nutritionistChartData().catch(() => ({ data: [] })),
        getNutritionistSchedule().catch(() => ({ schedule: [] }))
      ]);
      
      console.log('Profile:', profileData);
      console.log('Stats:', statsData);
      console.log('Chart:', chartDataRes);
      console.log('Schedule:', scheduleData);
      
      setProfile(profileData);
      setStats(statsData?.stats || null);
      setChartData(chartDataRes?.data || []);
      
      // Filter today's appointments from schedule
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysAppts = (scheduleData?.schedule || []).filter(appt => {
        const apptDate = new Date(appt.date);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() === today.getTime() && appt.status === 'booked';
      });
      
      // Get upcoming appointments (future dates, booked status)
      const upcomingAppts = (scheduleData?.schedule || [])
        .filter(appt => {
          const apptDate = new Date(appt.date);
          return apptDate > today && appt.status === 'booked';
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
      
      setTodayAppointments(todaysAppts);
      setUpcomingSessions(upcomingAppts);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = (appointmentId) => {
    console.log("Starting session:", appointmentId);
    // Add your session start logic here
  };

  const handleCancelAppointment = (appointmentId) => {
    console.log("Cancelling appointment:", appointmentId);
    // Add your cancel logic here
  };

  if (loading) {
    return (
      <div className="ndashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Month names for chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate max value for chart scaling
  const maxValue = Math.max(
    ...chartData.map(m => Math.max(m.completedAppointments || 0, m.uniqueCustomer || 0)),
    5 // Minimum scale
  );

  return (
    <div className="ndashboard">
      <Navbar isLogin={true} onLogout={() => {/* Add logout logic */}} />
      
      <div className="ndashboard__container">
        {/* Header */}
        <div className="ndashboard__header">
          <div className="header-left">
            <p className="header-date">{currentDate}</p>
            <h1>Welcome, {profile?.user?.username || 'Nutritionist'}!</h1>
          </div>
          <div className="header-right">
            <div className="profile-badge">
              <div className="profile-badge__info">
                <p className="profile-badge__name">{profile?.user?.username || 'Nutritionist'}</p>
                <p className="profile-badge__role">Registered Nutritionist</p>
              </div>
              <div className="profile-badge__avatar">
                {profile?.user?.username?.charAt(0).toUpperCase() || 'N'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <p className="stat-label">Total Clients Served</p>
              <p className="stat-value">{stats?.clientServed || 0}</p>
              <p className="stat-subtext">+{stats?.thisMonthCount || 0} this month</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <p className="stat-label">Average Rating</p>
              <p className="stat-value">{stats?.rating || 0} ⭐</p>
              <p className="stat-subtext">based on {stats?.reviewCount || 0} reviews</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-content">
              <p className="stat-label">Experience</p>
              <p className="stat-value">{stats?.yearsOfExperience || 0} Years</p>
              <p className="stat-subtext">{profile?.specialization?.[0] || 'Nutrition Expert'}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <p className="stat-label">Today's Agenda</p>
              <p className="stat-value">{stats?.todayCount || todayAppointments.length} Sessions</p>
              <p className="stat-subtext">
                {todayAppointments.length > 0 
                  ? `Next: ${todayAppointments[0].timeSlot.split(' - ')[0]}`
                  : 'No sessions today'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="ndashboard__grid">
          
          {/* Today's Schedule */}
          <div className="ndashboard__card schedule-card">
            <h2>Today's Schedule ({new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})</h2>
            
            <div className="appointments-list appointments-list--scrollable">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-item">
                    <div className="appointment-time">
                      <p className="time-slot">{appointment.timeSlot}</p>
                      <span className={`status-badge status-badge--${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                      </span>
                    </div>
                    
                    <div className="appointment-client">
                      <div className="client-avatar">
                        {appointment.customerId?.username?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="client-info">
                        <p className="client-name">{appointment.customerId?.username || 'Client'}</p>
                        <p className="session-type">Consultation</p>
                      </div>
                    </div>
                    
                    <div className="appointment-actions">
                      <button 
                        className="btn btn--primary"
                        onClick={() => handleStartSession(appointment._id)}
                      >
                        Start Session
                      </button>
                      <button 
                        className="btn btn--secondary"
                        onClick={() => handleCancelAppointment(appointment._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>📅 No appointments scheduled for today</p>
                </div>
              )}
            </div>
            
            <button 
              className="btn btn--outline btn--full"
              onClick={() => setShowScheduleModal(true)}
            >
              View Full Schedule
            </button>
          </div>

          {/* Right Column */}
          <div className="ndashboard__right">
            
            {/* Monthly Performance Chart */}
            <div className="ndashboard__card chart-card">
              <h2>Monthly Performance: Completed Appointments (2026)</h2>
              
              <div className="chart-container">
                <div className="chart-bars">
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthData = chartData.find(m => m._id === i + 1) || {};
                    const appointments = monthData.completedAppointments || 0;
                    const clients = monthData.uniqueCustomer || 0;
                    
                    const appointmentsHeight = appointments > 0 ? (appointments / maxValue) * 100 : 10;
                    const clientsHeight = clients > 0 ? (clients / maxValue) * 100 : 10;
                    
                    return (
                      <div key={i} className="chart-bar-group">
                        <div className="chart-bars-wrapper">
                          <div 
                            className={`chart-bar ${appointments > 0 ? 'chart-bar--appointments' : 'chart-bar--appointments chart-bar--zero'}`}
                            style={{ height: `${appointmentsHeight}%` }}
                            title={`${appointments} appointments`}
                          >
                            {appointments > 0 && <span className="bar-label">{appointments}</span>}
                          </div>
                          
                          <div 
                            className={`chart-bar ${clients > 0 ? 'chart-bar--clients' : 'chart-bar--clients chart-bar--zero'}`}
                            style={{ height: `${clientsHeight}%` }}
                            title={`${clients} unique clients`}
                          >
                            {clients > 0 && <span className="bar-label">{clients}</span>}
                          </div>
                        </div>
                        <p className="chart-month">{monthNames[i]}</p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-color legend-color--appointments"></span>
                    <span>Appointments</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color legend-color--clients"></span>
                    <span>Unique Clients</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Schedule Modal */}
        {showScheduleModal && (
          <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>All Upcoming Sessions ({upcomingSessions.length})</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowScheduleModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <p className="upcoming-subtitle">Booked appointments</p>
                
                <div className="upcoming-list">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session) => (
                      <div key={session._id} className="upcoming-item">
                        <span className="upcoming-date">
                          {new Date(session.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}, {session.timeSlot.split(' - ')[0]}
                        </span>
                        <span className="upcoming-client">
                          {session.customerId?.username || 'Client'}
                        </span>
                        <span className="upcoming-type">{session.status}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No upcoming sessions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};