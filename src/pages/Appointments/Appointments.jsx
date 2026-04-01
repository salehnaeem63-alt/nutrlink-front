import React, { useState, useEffect, useContext } from 'react'
import { getCustomerAppointments, getNutritionistSchedule } from '../../api/appointmetapi'
import { AuthContext } from '../../AuthContext'
import Navbar from '../../component/Navigationbar/Navbar'
import AppointmentsHero from './sections/AppointmentsHero'
import LoadingOverlay from '../../component/LoadingOverlay/LoadingOverlay'
// import AppointmentsManager from './sections/AppointmentsManager'
import './Appointments.css'


const Appointments = () => {
  const { user } = useContext(AuthContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const response = (user.role === 'nutritionist')
          ? await getNutritionistSchedule()
          : await getCustomerAppointments()

        const dataArray = Array.isArray(response) ? response : (response.appointments || [])
        setAppointments(dataArray)
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.role])

  const upcomingAppointments = (appointments || []).filter(appt => appt.status === 'booked')

  return (
    <div className='appointments-container'>
      <Navbar />
      <LoadingOverlay message="Searching for experts..." isActive={loading} />
      {!loading && <AppointmentsHero appointments={upcomingAppointments} role={user?.role} />}
      {/* <AppointmentsManager /> */}
    </div>
  )
}


export default Appointments