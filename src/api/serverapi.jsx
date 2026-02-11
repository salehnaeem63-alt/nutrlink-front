export async function register(info) {
    try {
        const res = await fetch(
            "http://localhost:5000/nutrlink/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: info.email,
                    username: info.username,
                    password: info.password,
                }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Registration failed");
        }

        return data;

    } catch (error) {
        console.error(error);
        throw error; 
    }
}
