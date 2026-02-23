
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
