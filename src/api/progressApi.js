// create log
export async function creatlog(info) {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(
      "http://localhost:5000/nutrlink/api/progress/log",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          waterIntake:info.waterIntake,
          exerciseMinutes:info.exerciseMinutes,
          weight:info.weight
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
//tody log
export async function getlogtoday() {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(
      "http://localhost:5000/nutrlink/api/progress/log/today",
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
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
// get logs for days
//  GET /progress/log/history?days=30
export async function getlogs(info) {
  const token = localStorage.getItem("authToken");
  const s = info ? `?days=${info}` : '';  try {
    const res = await fetch(
      `http://localhost:5000/nutrlink/api/progress/log/history${s}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
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
// get sammury
export async function getsammury() {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(
      "http://localhost:5000/nutrlink/api/progress/summary",
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
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
// creatgoal 
export async function creategoal(info) {
        const token = localStorage.getItem("authToken");

    try {
        const isFormData = info instanceof FormData;

        const res = await fetch(
            "http://localhost:5000/nutrlink/api/customer/goal",
            {
                method: "POST",
                headers: isFormData
                    ? undefined
                    : { "Content-Type": "application/json" ,
                         "Authorization": `Bearer ${token}`
                    },
                body: isFormData
                    ? info
                    : JSON.stringify({  
                        data:info.data
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
//make goal as done
export async function goalDone(info) {
        const token = localStorage.getItem("authToken");

    try {
        const isFormData = info instanceof FormData;

        const res = await fetch(
            "http://localhost:5000/nutrlink/api/customer/goal",
            {
                method: "PUT",
                headers: 
                    { "Content-Type": "application/json" ,
                         "Authorization": `Bearer ${token}`
                    },
                body:
                    JSON.stringify({  
                        goal_id:info.goal_id
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
// delete goal 
export async function deleteGoal(info) {
        const token = localStorage.getItem("authToken");

    try {
        const isFormData = info instanceof FormData;

        const res = await fetch(
            `http://localhost:5000/nutrlink/api/customer/goal/${info}`,
            {
                method: "DELETE",
                headers:  {   "Authorization": `Bearer ${token}`},
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
//get all goals
export async function getGoal() {
        const token = localStorage.getItem("authToken");

    try {
        const res = await fetch(
            "http://localhost:5000/nutrlink/api/customer/goal",
            {
                headers: {    "Authorization": `Bearer ${token}` },
                
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
//get customer dite
export async function getdite(info) {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(
      "http://localhost:5000/nutrlink/api/plan",
      {
        headers: {
          "Authorization": `Bearer ${token}`,
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


export async function getCustomerAppointments() {
    const token = localStorage.getItem("authToken");
 
    try {
        const res = await fetch(
            "http://localhost:5000/nutrlink/api/appointments/customer-appointments",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
 
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
 