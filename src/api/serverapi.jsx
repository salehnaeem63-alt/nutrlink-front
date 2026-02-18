export async function register(info) {
    try {
        const isFormData = info instanceof FormData;

        const res = await fetch(
            "http://localhost:5000/nutrlink/api/auth/register",
            {
                method: "POST",
                // When sending FormData, do NOT set Content-Type manually.
                // The browser sets it automatically with the correct multipart boundary.
                headers: isFormData
                    ? undefined
                    : { "Content-Type": "application/json" },
                body: isFormData
                    ? info
                    : JSON.stringify({
                          email:    info.email,
                          username: info.username,
                          password: info.password,
                          role:     info.role ?? "customer",
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

// login
export async function login(info) {
    try {
        const dat = { password: info.password };
        if (info.email)    dat.email    = info.email;
        if (info.username) dat.username = info.username;

        const res = await fetch(
            "http://localhost:5000/nutrlink/api/auth/login",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dat),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Login failed");
        }

        return data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function loginWithGoogle({ token, role }) {
    try {
        const res = await fetch("http://localhost:5000/nutrlink/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, role }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Google login failed");
        }

        return data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}