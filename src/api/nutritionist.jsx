// create profile
export async function creatProfile(info) {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(
      "http://localhost:5000/nutrlink/api/nutritionist/profile",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          specialization:    info.specialization,
          bio:               info.bio,
          cardBio:           info.cardBio,           // ← was missing
          yearsOfExperience: info.yearsOfExperience,
          languages:         info.languages,
          price:             info.price,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "failed");
    }

    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
}

// get profile
export async function getProfile() {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(
      "http://localhost:5000/nutrlink/api/nutritionist/profile/me",
      {
        headers: { "Authorization": `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "failed");
    }

    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
}

// update profile
export async function updateProfile(info) {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(
      "http://localhost:5000/nutrlink/api/nutritionist/profile/me",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          specialization:    info.specialization,
          bio:               info.bio,
          cardBio:           info.cardBio,           // ← was missing
          yearsOfExperience: info.yearsOfExperience,
          languages:         info.languages,
          price:             info.price,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "failed");
    }

    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
}