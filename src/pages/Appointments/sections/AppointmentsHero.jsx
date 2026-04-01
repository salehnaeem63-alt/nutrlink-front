import React from 'react'
import AppointmentCard from '../../../component/AppointmentCard/AppointmentCard'
import './AppointmentsHero.css'

const AppointmentsHero = ({ appointments, role }) => {
  if (!appointments || appointments.length === 0)
    return <div className="no-appointments">No upcoming sessions found</div>

  return (
    <div className="appointments-hero">
      <div className="hero-sidebar">
        <h2>Your Upcoming Appointments</h2>
        <div className="hero-scroll-list">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment._id} appointment={appointment} role={role} />
          ))}
        </div>
      </div>
      <div className="hero-main-view">
        <h2>click over any appointments to see details</h2>
      </div>
    </div>
  )
}

export default AppointmentsHero