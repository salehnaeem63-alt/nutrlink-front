import axios from 'axios';

// We declare the Base URL ONCE here.
const api = axios.create({
  baseURL: "http://localhost:5000/nutrlink/api/nutritionist"
});

// We also handle the Token ONCE here using an Interceptor.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// create profile
export async function createProfile(info) {
  const { specialization, bio, cardBio, yearsOfExperience, languages, price } = info;

  try {
    const response = await api.post("/profile", {
      specialization,
      bio,
      cardBio,
      yearsOfExperience,
      languages,
      price
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error";
    throw new Error(message);
  }
}

// get profile
export async function getProfile() {
  try {
    // Relative path; headers (token) are handled by the interceptor automatically
    const response = await api.get("/profile/me");

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Could not fetch profile";
    console.error("Fetch Profile Error:", message);
    throw new Error(message);
  }
}

export const getProfileById = async (userId) => {
  const { data } = await api.get(`/profile/${userId}`)
  return data 
}

// update profile
export async function updateProfile(info) {
  // 1. Extract only the allowed fields from the info object
  const { specialization, bio, cardBio, yearsOfExperience, languages, price } = info;

  try {
    // 2. Pass the extracted variables directly
    const response = await api.put("/profile/me", {
      specialization,
      bio,
      cardBio,
      yearsOfExperience,
      languages,
      price
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Update failed";
    console.error("Profile Update Error:", message);
    throw new Error(message);
  }
}

export async function getFilteredCards(filters = {}) {
  try {
    // Convert filter object to query string: { maxPrice: 50 } -> ?maxPrice=50
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/cards?${params}`);
    
    return response.data; // Returns { count, cards }
  } catch (error) {
    const message = error.response?.data?.message || "Could not fetch cards";
    throw new Error(message);
  }
}

export const getRecommendedExperts = async() => {
  const response = await api.get('/recommended')
  return response.data
}