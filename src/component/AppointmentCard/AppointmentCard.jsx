import React, { useState, useEffect } from 'react'
import { isSessionLive } from '../../utils/isSessionLive'
import './AppointmentCard.css'

const AppointmentCard = ({ appointment }) => {
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const checkStatus = () => {
      const active = isSessionLive(appointment.date, appointment.timeSlot)
      setIsLive(active)
    }

    checkStatus()
    const interval = setInterval(checkStatus, 3000)

    return () => clearInterval(interval)
  }, [appointment.date, appointment.timeSlot])


  return (
    <div className="appointment-card">
      <img src={appointment.nutritionistId?.profilePic} alt={appointment.docName} className='profilePic' />
      <div className="info-text">
        <h3>{appointment.nutritionistId?.username}</h3>
        <p className='type'>{appointment.type}</p>
      </div>
      <span className="session-number">Session {appointment.sessionNumber || 1}</span>
      <div className='time-date-container'>
        <span className='date'>{appointment.date}</span>
        <span className='time'>{appointment.timeSlot}</span>
      </div>
      <div className="button-group">

        <button className="details-btn-hero">Details</button>
        <button className={`start-btn-hero ${isLive ? 'active' : 'disabled'}`}
          disabled={!isLive}
        >
          {isLive ? 'Join now' : 'Start Session'}
        </button>
      </div>
    </div>
  )
}

export default AppointmentCard