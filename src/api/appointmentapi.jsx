// ═══════════════════════════════════════════════════════════
// Appointment API - NutriLink
// ═══════════════════════════════════════════════════════════

const API_BASE_URL = "http://localhost:5000/nutrlink/api/appointments";

// ── Helper function to get auth token ──────────────────────
const getAuthToken = () => localStorage.getItem("authToken");

// ═══════════════════════════════════════════════════════════
// NUTRITIONIST ENDPOINTS
// ═══════════════════════════════════════════════════════════

/**
 * Create Available Slot (Nutritionist only)
 * Creates a new open time slot
 * @param {Object} slotData - { date: "2026-03-01", timeSlot: "10:00 AM" }
 */
export async function createSlot(slotData) {
    const token = getAuthToken();

    try {
        const res = await fetch(`${API_BASE_URL}/slot`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                date: slotData.date,
                timeSlot: slotData.timeSlot
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create slot");
        }

        return data;

    } catch (error) {
        console.error("Error creating slot:", error);
        throw error;
    }
}

/**
 * Delete Slot (Nutritionist only)
 * Deletes a slot completely (only if status is 'available')
 * @param {String} slotId - The ID of the appointment slot
 */
export async function deleteSlot(slotId) {
    const token = getAuthToken();

    try {
        const res = await fetch(`${API_BASE_URL}/slot/${slotId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to delete slot");
        }

        return data;

    } catch (error) {
        console.error("Error deleting slot:", error);
        throw error;
    }
}

/**
 * Get Nutritionist Schedule (Nutritionist only)
 * Fetches all upcoming/active slots for the logged-in nutritionist
 * @param {String} status - Optional status filter (e.g., 'booked', 'available')
 */
export async function getNutritionistSchedule(status = null) {
    const token = getAuthToken();

    try {
        const url = status 
            ? `${API_BASE_URL}/schedule?status=${status}`
            : `${API_BASE_URL}/schedule`;

        const res = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to get schedule");
        }

        return data;

    } catch (error) {
        console.error("Error getting schedule:", error);
        throw error;
    }
}

/**
 * Mark Appointment as Completed (Nutritionist only)
 * Changes a 'booked' appointment's status to 'completed'
 * @param {String} appointmentId - The ID of the booked appointment
 */
export async function markCompleted(appointmentId) {
    const token = getAuthToken();

    try {
        const res = await fetch(`${API_BASE_URL}/complete/${appointmentId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to mark as completed");
        }

        return data;

    } catch (error) {
        console.error("Error marking appointment as completed:", error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER ENDPOINTS
// ═══════════════════════════════════════════════════════════

/**
 * Book Appointment (Customer only)
 * Assigns the customer to an 'available' slot and marks it 'booked'
 * @param {String} slotId - The ID of the available slot
 */
export async function bookAppointment(slotId) {
    const token = getAuthToken();

    try {
        const res = await fetch(`${API_BASE_URL}/book/${slotId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to book appointment");
        }

        return data;

    } catch (error) {
        console.error("Error booking appointment:", error);
        throw error;
    }
}

/**
 * Get Customer Appointments (Customer only)
 * Fetches all currently 'booked' (upcoming) appointments for the logged-in customer
 */
export async function getCustomerAppointments() {
    const token = getAuthToken();

    try {
        const res = await fetch(`${API_BASE_URL}/customer-appointments`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to get customer appointments");
        }

        return data;

    } catch (error) {
        console.error("Error getting customer appointments:", error);
        throw error;
    }
}

/**
 * Reschedule Appointment (Customer only)
 * Frees up the old slot and books the customer into the new slot
 * @param {Object} rescheduleData - { currentSlotId: "String", newSlotId: "String" }
 */
export async function rescheduleAppointment(rescheduleData) {
    const token = getAuthToken();

    try {
        const res = await fetch(`${API_BASE_URL}/reschedule`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                currentSlotId: rescheduleData.currentSlotId,
                newSlotId: rescheduleData.newSlotId
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to reschedule appointment");
        }

        return data;

    } catch (error) {
        console.error("Error rescheduling appointment:", error);
        throw error;
    }
}

/**
 * Cancel Appointment (Any logged-in user)
 * Removes the customer from the appointment and resets it to 'available'
 * @param {String} appointmentId - The ID of the booked appointment
 */
export async function cancelAppointment(appointmentId) {
    const token = getAuthToken();

    try {
        const res = await fetch(`${API_BASE_URL}/cancel/${appointmentId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to cancel appointment");
        }

        return data;

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
 * Fetches all 'available' slots for a specific nutritionist
 * @param {String} nutritionistId - The ID of the nutritionist
 */
export async function getAvailableSlots(nutritionistId) {
    try {
        const res = await fetch(`${API_BASE_URL}/${nutritionistId}`);

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to get available slots");
        }

        return data;

    } catch (error) {
        console.error("Error getting available slots:", error);
        throw error;
    }
}

/**
 * Get Appointment History (Customer)
 * Fetches all completed appointments for the logged-in customer
 */
export async function getAppointmentHistory() {
    const token = getAuthToken();

    try {
        const res = await fetch(`${API_BASE_URL}/history`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to get appointment history");
        }

        return data;

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
    const token = getAuthToken();

    try {
        const res = await fetch(`${API_BASE_URL}/admin/all`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to get all appointments");
        }

        return data;

    } catch (error) {
        console.error("Error getting all appointments:", error);
        throw error;
    }
}
