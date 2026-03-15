import React, { useState, useEffect, useCallback } from 'react';
import Nnavbar from '../component/Nnavbar';
import './NutritionistAppointments.css';
import {
  createSlot,
  deleteSlot,
  getNutritionistSchedule,
  markCompleted,
  cancelAppointment
} from '../api/appointment'; 

const NutritionistAppointments = () => {
  const isLogin = !!localStorage.getItem("authToken");
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, completed, create
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Create slot form state
  const [newSlot, setNewSlot] = useState({
    date: '',
    timeSlot: ''
  });

  // Predefined time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
  ];

  // ─── UPDATED FUNCTION: Fixed the .map() crash here ───
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let status = null;
      if (activeTab === 'upcoming') status = 'booked';
      if (activeTab === 'completed') status = 'completed';
      
      const response = await getNutritionistSchedule(status);
      
      // Defend against non-array responses from the backend
      const safeData = Array.isArray(response) ? response : (response?.appointments || []);
      
      setAppointments(safeData);
    } catch (error) {
      console.error('Error loading appointments:', error);
      alert('Failed to load appointments: ' + error.message);
      setAppointments([]); // Fallback to empty array so .map() never breaks
    } finally {
      setLoading(false);
    }
  }, [activeTab]); 

  // Load appointments on component mount and tab change
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]); 

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    
    if (!newSlot.date || !newSlot.timeSlot) {
      alert('Please select both date and time');
      return;
    }

    setLoading(true);
    try {
      await createSlot({
        date: newSlot.date,
        timeSlot: newSlot.timeSlot
      });
      
      alert('Appointment slot created successfully!');
      setNewSlot({ date: '', timeSlot: '' });
      setActiveTab('upcoming');
      loadAppointments();
    } catch (error) {
      alert('Failed to create slot: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;

    setLoading(true);
    try {
      await deleteSlot(slotId);
      alert('Slot deleted successfully');
      loadAppointments();
    } catch (error) {
      alert('Failed to delete slot: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (appointmentId) => {
    if (!window.confirm('Mark this appointment as completed?')) return;

    setLoading(true);
    try {
      await markCompleted(appointmentId);
      alert('Appointment marked as completed');
      loadAppointments();
    } catch (error) {
      alert('Failed to mark as completed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment? The slot will become available again.')) return;

    setLoading(true);
    try {
      await cancelAppointment(appointmentId);
      alert('Appointment cancelled successfully');
      loadAppointments();
    } catch (error) {
      alert('Failed to cancel appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'status-available';
      case 'booked': return 'status-booked';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="nutritionist-appointments-page">
      <Nnavbar isLogin={isLogin} onLogout={handleLogout} />

      <div className="appointments-container">
        {/* Header */}
        <div className="appointments-header">
          <h1 className="page-title">Appointment Management</h1>
          <p className="page-subtitle">Manage your schedule and appointments</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Upcoming Appointments
          </button>

          <button 
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Completed
          </button>

          <button 
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create New Slot
          </button>
        </div>

        {/* Content */}
        <div className="appointments-content">
          {/* Create Slot Tab */}
          {activeTab === 'create' && (
            <div className="create-slot-section">
              <div className="create-slot-card">
                <h2 className="section-title">Create Available Time Slot</h2>
                <p className="section-description">
                  Set up new time slots when you're available for appointments
                </p>

                <form onSubmit={handleCreateSlot} className="create-slot-form">
                  <div className="form-group">
                    <label htmlFor="date">Select Date</label>
                    <input
                      type="date"
                      id="date"
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="timeSlot">Select Time</label>
                    <select
                      id="timeSlot"
                      value={newSlot.timeSlot}
                      onChange={(e) => setNewSlot({ ...newSlot, timeSlot: e.target.value })}
                      required
                    >
                      <option value="">Choose a time slot</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-create-slot"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Slot'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Upcoming Appointments Tab */}
          {activeTab === 'upcoming' && (
            <div className="appointments-list">
              {loading ? (
                <div className="loading">Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <h3>No upcoming appointments</h3>
                  <p>Create new time slots to accept appointments</p>
                </div>
              ) : (
                <div className="appointments-grid">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="appointment-card">
                      <div className="appointment-header">
                        <div className="appointment-date">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {formatDate(appointment.date)}
                        </div>
                        <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>

                      <div className="appointment-time">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {appointment.timeSlot}
                      </div>

                      {appointment.customerId && (
                        <div className="appointment-customer">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          <span>Customer: {appointment.customerId.name || 'Not specified'}</span>
                        </div>
                      )}

                      <div className="appointment-actions">
                        {appointment.status === 'booked' && (
                          <>
                            <button 
                              className="btn-complete"
                              onClick={() => handleMarkCompleted(appointment._id)}
                              disabled={loading}
                            >
                              Mark Complete
                            </button>
                            <button 
                              className="btn-cancel"
                              onClick={() => handleCancelAppointment(appointment._id)}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appointment.status === 'available' && (
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteSlot(appointment._id)}
                            disabled={loading}
                          >
                            Delete Slot
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Completed Appointments Tab */}
          {activeTab === 'completed' && (
            <div className="appointments-list">
              {loading ? (
                <div className="loading">Loading completed appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <h3>No completed appointments</h3>
                  <p>Completed appointments will appear here</p>
                </div>
              ) : (
                <div className="appointments-grid">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="appointment-card completed">
                      <div className="appointment-header">
                        <div className="appointment-date">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          </svg>
                          {formatDate(appointment.date)}
                        </div>
                        <span className="status-badge status-completed">
                          Completed
                        </span>
                      </div>

                      <div className="appointment-time">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {appointment.timeSlot}
                      </div>

                      {appointment.customerId && (
                        <div className="appointment-customer">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          <span>Customer: {appointment.customerId.name || 'Not specified'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionistAppointments;