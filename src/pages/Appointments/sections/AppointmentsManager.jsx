import React, { useState } from 'react'
import './AppointmentsManager.css'
import { createSlot, deleteSlot } from '../../../api/appointmetapi'
import { showAlert, showConfirm } from '../../../utils/alertService'

const AppointmentsManager = ({ appointments = [], role, refreshData }) => {

  const [activeTab, setActiveTab] = useState(role === 'nutritionist' ? 'available' : 'history')

  const getFilteredAppointments = () => {
    switch (activeTab) {
      case 'history':
        return appointments.filter(appt => ['completed', 'canceled'].includes(appt.status))
      case 'available':
        return appointments.filter(appt => appt.status === 'available')
      default:
        return []
    }
  }

  const filteredAppointments = getFilteredAppointments();

  const handleCreateSlot = async (e) => {
    e.preventDefault();

    // 🚦 HARD SECURITY GUARD: Stop customers immediately
    if (role !== 'nutritionist') {
      showAlert('Unauthorized', 'Only nutritionists can create slots.', 'error');
      return;
    }

    const formData = new FormData(e.target)
    const date = formData.get('date')
    const startTimeRaw = formData.get('startTime')
    const endTimeRaw = formData.get('endTime')

    if (startTimeRaw >= endTimeRaw) {
      showAlert('Invalid Time', 'End time must be after the start time.', 'error');
      return
    }

    const timeSlot = `${formatTimeString(startTimeRaw)} - ${formatTimeString(endTimeRaw)}`

    const newSlotData = {
      date: date,
      timeSlot: timeSlot
    }

    try {
      await createSlot(newSlotData)
      showAlert('Success!', 'Slot successfully published!', 'success');

      if (refreshData) {
        await refreshData();
      }

      e.target.reset()
      setActiveTab('available')
    } catch (err) {
      showAlert('Error', 'Failed to create slot. Please check your connection.', 'error');
      console.error(err)
    }
  };

  const handleDeleteSlot = async (slotId) => {
    // 🚦 HARD SECURITY GUARD: Stop customers immediately
    if (role !== 'nutritionist') {
      showAlert('Unauthorized', 'Only nutritionists can delete slots.', 'error');
      return;
    }

    const result = await showConfirm(
      "Are you sure?",
      "Do you really want to delete this slot? This action cannot be undone.",
      true
    );

    if (!result.isConfirmed) return;
    
    try {
      await deleteSlot(slotId)

      if (refreshData) await refreshData()
    } catch (err) {
      showAlert('Error', 'Failed to delete the slot. Please try again.', 'error');
      console.error(err)
    }
  }

  const formatTimeString = (time24) => {
    let [hours, minutes] = time24.split(':')
    hours = parseInt(hours, 10)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12

    const formattedHours = hours.toString().padStart(2, '0')
    return `${formattedHours}:${minutes} ${ampm}`
  }

  return (
    <div className="appointments-manager">
      <div className="header-buttons">
        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}
        >
          History
        </button>

        {role === 'nutritionist' && (
          <>
            <button className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`} onClick={() => setActiveTab('available')}
            >
              Available
            </button>
            <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}
            >
              + Create Slot
            </button>
          </>
        )}
      </div>

      <div className="appointments-content">
        {/* Double-check the role here just to be 100% safe! */}
        {activeTab === 'create' && role === 'nutritionist' ? (
          <div className="create-slot-container">
            <h3>add a New Available Slot</h3>
            <form onSubmit={handleCreateSlot} className='create-slot-form'>
              <div className="form-group">
                <label>Date:</label>
                <input type="date" name='date' required />
              </div>

              <div className="time-picker-group">
                <div className="form-group">
                  <label>Start Time:</label>
                  <input type="time" name="startTime" required />
                </div>
                <div className="form-group">
                  <label>End Time:</label>
                  <input type="time" name="endTime" required />
                </div>
              </div>
              <button type='submit' className='submit-slot-btn'>Publish Slot</button>
            </form>
          </div>
        ) : (
          <div className="appointments-list">
            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <p>No {activeTab} sessions found.</p>
              </div>
            ) : (
              <div className="appointments-grid">
                {filteredAppointments.map((appt) => {

                  const participant = role === 'nutritionist' ? appt.customerId : appt.nutritionistId
                  const isHistory = activeTab === 'history'

                  return (
                    <div key={appt._id} className="appointment-cards">

                      <div className="card-headers">
                        <span className="appt-date">
                          {appt.date ? new Date(appt.date).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className={`status-badge ${appt.status}`}>
                          {appt.status}
                        </span>
                      </div>

                      <div className="card-body">

                        {isHistory && participant && (
                          <div className="participant-info">
                            <img src={participant.profilePic || '/default-avatar.png'}
                              alt="User" className='participant-img' />
                            <span className='participant-name'>{participant.username}</span>
                          </div>
                        )}

                        <div className="card-footer-history">
                          <div className="time-row">
                            <i className="clock-icon">🕒</i>
                            <span className="appt-time">{appt.timeSlot}</span>
                          </div>
                          {isHistory && participant && role === 'nutritionist' && (
                            <>
                              <button className='history-delete-btn' onClick={() => handleDeleteSlot(appt._id)} >Remove</button>
                            </>
                          )}
                        </div>
                      </div>

                      {activeTab === 'available' && role === 'nutritionist' && (
                        <div className="card-footer">
                          <button className="delete-slot-btn" onClick={() => handleDeleteSlot(appt._id)} >Delete Slot</button>
                        </div>
                      )}

                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentsManager