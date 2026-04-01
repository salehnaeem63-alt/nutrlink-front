import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppointmentCard from '../../../component/AppointmentCard/AppointmentCard'
import './AppointmentsHero.css'

const AppointmentsHero = ({ appointments, role }) => {
  const [selectedAppt, setSelectedAppt] = useState(null)
  const navigate = useNavigate()

  if (!appointments || appointments.length === 0)
    return <div className="no-appointments">No upcoming sessions found</div>


  const isNutri = role === 'nutritionist'
  const target = isNutri ? selectedAppt?.customerId : selectedAppt?.nutritionistId
  const title = isNutri ? "" : 'Dr. '
  const targetRole = isNutri ? 'customer' : 'nutritionist';

  return (
    <div className="appointments-hero">
      <div className="hero-sidebar">
        <h2 className='my-appointments' >My  Appointments</h2>
        <div className="hero-scroll-list">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              role={role}
              onSelect={() => {
                if (selectedAppt?._id === appointment._id)
                  setSelectedAppt(null)
                else
                  setSelectedAppt(appointment)
              }}
            />
          ))}
        </div>
      </div>

      <div className="hero-main-view">
        {appointments.length < 3 && (
          <div className="barear">d</div>
        )}
        {selectedAppt ? (
          /* 4. This is your "Pop-up" inside the required space */
          <div className="details-overlay-absolute">
            <button onClick={() => setSelectedAppt(null)} className='exit-btn'>X</button>
            <div className="details-info">
              <div className="profile-image-wrapper">
                <img src={target?.profilePic} alt="Profile" className="profile-pic" />
              </div>

              <div className="text-info">
                <h3 className='username' >{title}{target?.username}</h3>
                <h2 className='email' >{target?.email} </h2>
              </div>
              <div className="devider"></div>

            </div>


            <div className="body-info">
              <div className="date-info">Date: <span>{selectedAppt.date.split('T')[0]} </span></div>
              <div className="time-info">Time: <span className='time'>{selectedAppt.timeSlot} </span></div>
            </div>

            <div className="footer-info">
              <div className="footer-left-info">
                <h2 className='session'>Session 3</h2>
              </div>

              <div className="footer-right-info">
                <button className='message'>message </button>
                <button className='see-profile' onClick={() => navigate(`/${targetRole}/profile/${target?._id}`)} >see profile</button>
              </div>


            </div>

          </div>
        ) : (
          <div className="no-result-container">
            <h2 className='no-result'>click over any appointments to see details</h2>
          </div>
        )}
      </div>

    </div>
  )
}

export default AppointmentsHero