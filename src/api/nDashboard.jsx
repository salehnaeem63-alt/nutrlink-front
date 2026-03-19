// Nutritionist Chart Data 
export async function nutritionistChartData(info) {
        const token = localStorage.getItem("authToken");

    try {
        const res = await fetch(
            "http://localhost:5000/nutrlink/api/dashboard/chart",
            {
                headers:
                     { 
                         "Authorization": `Bearer ${token}`
                    },
                
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
// Nutritionist Dashboard Stats 
export async function nutritionistDashboardStats(info) {
        const token = localStorage.getItem("authToken");

    try {
        const res = await fetch(
            "http://localhost:5000/nutrlink/api/dashboard/stats",
            {
                headers:
                     { 
                         "Authorization": `Bearer ${token}`
                    },
                
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
// 
export async function getNutritionistSchedule() {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(
      "http://localhost:5000/nutrlink/api/appointments/schedule",
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

