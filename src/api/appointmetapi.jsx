import axios from 'axios';

// We declare the Base URL ONCE here.
const api = axios.create({
  baseURL: "http://localhost:5000/nutrlink/api/appointments"
});

// We also handle the Token ONCE here using an Interceptor.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * @param {Object} slotData - { date: "2026-03-01", timeSlot: "10:00 AM" }
 */

export async function createSlot(slotData) {
  try {
    const res = await api.post('/slot', slotData);

    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete Slot (Nutritionist only)
 * @param {string} slotId - The unique ID of the appointment slot to remove.
 * @returns {Promise<Object>} The server confirmation message.
 */
export async function deleteSlot(slotId) {
  try {
    const res = await api.delete(`/slot/${slotId}`);

    return res.data;
  } catch (error) {
    console.error("Delete failed:", error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Get Nutritionist Schedule (Nutritionist only)
 * @param {string|null} status - Optional filter (e.g., 'booked', 'available')
 * @returns {Promise<Array>} List of schedule slots
 */
export async function getNutritionistSchedule(status = null) {
  try {
    // Axios takes the 'params' object and turns it into '?status=...' automatically
    const res = await api.get('/schedule', {
      params: { status }
    });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    throw error;
  }
}

/**
 * Mark Appointment as Completed (Nutritionist only)
 * @param {String} appointmentId - The ID of the booked appointment
 */
export async function markCompleted(appointmentId) {
  try {
    // We use .put() because we are updating an existing resource
    const res = await api.put(`/complete/${appointmentId}`);

    return res.data;
  } catch (error) {
    console.error("Error marking appointment as completed:", error);
    throw error; // Let the UI handle the error message
  }
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER ENDPOINTS
// ═══════════════════════════════════════════════════════════

/**
 * Book Appointment (Customer only)
 * Converts an 'available' slot into a 'booked' appointment for the user
 * @param {String} slotId - The ID of the available slot
 */
export async function bookAppointment(slotId) {
  try {
    const res = await api.put(`/book/${slotId}`);

    return res.data;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
}

/**
 * Get Customer Appointments (Customer only)
 * Fetches the logged-in user's list of booked/upcoming slots
 */
export async function getCustomerAppointments() {
  try {
    const res = await api.get('/customer-appointments');
    
    // Axios already parsed the JSON, just return the data
    return res.data;
  } catch (error) {
    console.error("Error getting customer appointments:", error);
    throw error;
  }
}

/**
 * Reschedule Appointment (Customer only)
 * @param {Object} rescheduleData - { currentSlotId: string, newSlotId: string }
 */
export async function rescheduleAppointment(rescheduleData) {
  try {
    // Axios takes the second argument as the 'body' for PUT/POST requests
    const res = await api.put('/reschedule', {
      currentSlotId: rescheduleData.currentSlotId,
      newSlotId: rescheduleData.newSlotId
    });

    return res.data;
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    throw error;
  }
}

/**
 * Cancel Appointment (Any logged-in user)
 * @param {String} appointmentId - The ID of the booked appointment
 */
export async function cancelAppointment(appointmentId) {
  try {
    // We use .put() because we are updating the status back to 'available'
    const res = await api.put(`/cancel/${appointmentId}`);
    
    return res.data;
  } catch (error) {
    console.error("Error canceling appointment:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════════

/**
 * Get Available Slots for a Nutritionist (Public)
 * @param {String} nutritionistId - The ID of the nutritionist
 */
export async function getAvailableSlots(nutritionistId) {
  try {
    const res = await api.get(`/${nutritionistId}`);
    
    return res.data;
  } catch (error) {
    console.error("Error getting available slots:", error);
    throw error;
  }
}

/**
 * Get Appointment History (Customer)
 * Fetches all 'completed' slots for the logged-in customer
 */
export async function getAppointmentHistory() {
  try {
    const res = await api.get('/history');
    
    // Axios handles the JSON parsing and status checks automatically
    return res.data;
  } catch (error) {
    console.error("Error getting appointment history:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════

/**
 * Get All System Appointments (Admin only)
 * Fetches every single appointment in the entire database
 */
export async function getAllAppointments() {
  try {
    const res = await api.get('/admin/all');
    
    // Axios handles the JSON parsing
    return res.data;
  } catch (error) {
    console.error("Error getting all system appointments:", error);
    throw error;
  }
}