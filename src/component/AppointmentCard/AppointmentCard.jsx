import React, { useState, useEffect } from 'react'
import { isSessionLive } from '../../utils/isSessionLive'
import './AppointmentCard.css'

const AppointmentCard = ({ appointment, role, onSelect }) => {
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


  const isNutri = role === 'nutritionist'
  const target = isNutri ? appointment.customerId : appointment.nutritionistId
  const title = isNutri ? "" : "Dr. "


  return (
    <div className="appointment-card">
      <img src={target?.profilePic} alt={target?.username || 'Profile'} className='profilePic' />
      <div className="info-text">
        <h3>{title}{target?.username}</h3>
        <p className='type'>{appointment.type}</p>
      </div>
      <span className="session-number">Session {appointment.sessionNumber || 1}</span>
      <div className='time-date-container'>
        <span className='date'>{appointment.date.split('T')[0]}</span>
        <span className='time'>{appointment.timeSlot}</span>
      </div>
      <div className="button-group">

        <button className="details-btn-hero" onClick={onSelect} >Details</button>
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