const API_BASE_URL = "http://localhost:5000/nutrlink/api/appointments";

const getAuthToken = () => localStorage.getItem("authToken");

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
};

export const createSlot = async (slotData) => {
    const res = await fetch(`${API_BASE_URL}/slot`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(slotData)
    });
    return handleResponse(res);
};

export const deleteSlot = async (slotId) => {
    const res = await fetch(`${API_BASE_URL}/slot/${slotId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getAuthToken()}` }
    });
    return handleResponse(res);
};

export const getNutritionistSchedule = async (status = null) => {
    const url = status ? `${API_BASE_URL}/schedule?status=${status}` : `${API_BASE_URL}/schedule`;
    const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${getAuthToken()}` }
    });
    return handleResponse(res);
};

export const markCompleted = async (id) => {
    const res = await fetch(`${API_BASE_URL}/complete/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${getAuthToken()}` }
    });
    return handleResponse(res);
};

export const cancelAppointment = async (id) => {
    const res = await fetch(`${API_BASE_URL}/cancel/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${getAuthToken()}` }
    });
    return handleResponse(res);
};