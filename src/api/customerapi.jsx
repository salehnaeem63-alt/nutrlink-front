//creat profile
export async function creatProfile(info) {
        const token = localStorage.getItem("authToken");

    try {
        const isFormData = info instanceof FormData;

        const res = await fetch(
            "http://localhost:5000/nutrlink/api/customer/profile",
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
                        age: info.age,
                        gender: info.gender,
                        height: info.height,
                        currentWeight: info.currentWeight,
                        targetWeight: info.targetWeight,
                        allergies: info.allergies
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
//get the profile
export async function getProfile() {
        const token = localStorage.getItem("authToken");

    try {

        const res = await fetch(
            "http://localhost:5000/nutrlink/api/customer/profile/me",
           { headers:  { "Authorization": `Bearer ${token}` }}
           
        );
        
            if (res.status === 404) {
                    return null;}
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "failed to get the profile");
        }

        return data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}
//update profile
export async function updateProfile(info) {
        const token = localStorage.getItem("authToken");

    try {
        const isFormData = info instanceof FormData;

        const res = await fetch(
            "http://localhost:5000/nutrlink/api/customer/profile/me",
            {
                method: "PUT",
                headers: isFormData
                    ? undefined
                    : { "Content-Type": "application/json" ,
                         "Authorization": `Bearer ${token}`
                    },
                body: isFormData
                    ? info
                    : JSON.stringify({  
                        age: info.age,
                        gender: info.gender,
                        height: info.height,
                        currentWeight: info.currentWeight,
                        targetWeight: info.targetWeight,
                        allergies: info.allergies
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