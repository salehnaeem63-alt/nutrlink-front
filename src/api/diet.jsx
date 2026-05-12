const BASE = "http://localhost:5000/nutrlink/api";

// ── helper: attach token from localStorage ────────────────────────────────────
function authHeaders() {
    const token = localStorage.getItem("authToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ── helper: parse response, throw readable error if not ok ───────────────────
async function handleRes(res) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// DIET PLAN — CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /plan
 * Nutritionist → gets all diet plans they created
 * Customer     → gets their own diet plan(s)
 */
export async function getDiets() {
    try {
        const res = await fetch(`${BASE}/plan`, {
            method: "GET",
            headers: authHeaders(),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("getDiets:", error);
        throw error;
    }
}

/**
 * POST /plan
 * Body: { customerId, startDate, endDate, meals? }
 * Nutritionist only
 */
export async function createDiet({ customerId, startDate, endDate, meals = [] }) {
    try {
        const res = await fetch(`${BASE}/plan`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ customerId, startDate, endDate, meals }),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("createDiet:", error);
        throw error;
    }
}

/**
 * PUT /plan/:id
 * Body: any diet fields to update e.g. { status, startDate, endDate }
 * Nutritionist only
 */
export async function updateDiet(dietId, updates) {
    try {
        const res = await fetch(`${BASE}/plan/${dietId}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(updates),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("updateDiet:", error);
        throw error;
    }
}

/**
 * DELETE /plan/:id
 * Nutritionist only
 */
export async function deleteDiet(dietId) {
    try {
        const res = await fetch(`${BASE}/plan/${dietId}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("deleteDiet:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MEALS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /plan/:id/meals
 * Body: { date, type, name, description, calories }
 * Nutritionist only
 */
export async function addMealToDiet(dietId, meal) {
    try {
        const res = await fetch(`${BASE}/plan/${dietId}/meals`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(meal),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("addMealToDiet:", error);
        throw error;
    }
}

/**
 * PATCH /plan/:dietId/meals/:mealId
 * Body: { name?, calories?, type?, description? }
 * Nutritionist only
 */
export async function updateMealInDiet(dietId, mealId, updates) {
    try {
        const res = await fetch(`${BASE}/plan/${dietId}/meals/${mealId}`, {
            method: "PATCH",
            headers: authHeaders(),
            body: JSON.stringify(updates),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("updateMealInDiet:", error);
        throw error;
    }
}

/**
 * DELETE /plan/:id/meals/:mealId
 * Nutritionist only
 */
export async function removeMealFromDiet(dietId, mealId) {
    try {
        const res = await fetch(`${BASE}/plan/${dietId}/meals/${mealId}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("removeMealFromDiet:", error);
        throw error;
    }
}

/**
 * PATCH /plan/:dietId/meals/:mealId/status   ← FIX: was /done, now /status
 * Toggles isCompleted on the meal + recalculates diet progress %
 * Customer only
 */
export async function markMealAsDone(dietId, mealId) {
    try {
        const res = await fetch(`${BASE}/plan/${dietId}/meals/${mealId}/status`, {
            method: "PATCH",
            headers: authHeaders(),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("markMealAsDone:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXERCISES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /plan/:id/exercises
 * Body: { name, category, dayOfWeek, gymVersion, homeVersion, durationMinutes?, caloriesBurned?, notes? }
 * Nutritionist only
 */
export async function addExerciseToDiet(dietId, exercise) {
    try {
        const res = await fetch(`${BASE}/plan/${dietId}/exercises`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(exercise),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("addExerciseToDiet:", error);
        throw error;
    }
}

/**
 * PATCH /plan/:dietId/exercises/:exerciseId
 * Body: any exercise fields to update
 * Nutritionist only
 */
export async function updateExerciseInDiet(dietId, exerciseId, updates) {
    try {
        const res = await fetch(`${BASE}/plan/${dietId}/exercises/${exerciseId}`, {
            method: "PATCH",
            headers: authHeaders(),
            body: JSON.stringify(updates),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("updateExerciseInDiet:", error);
        throw error;
    }
}

/**
 * DELETE /plan/:id/exercises/:exerciseId
 * Nutritionist only
 */
export async function removeExerciseFromDiet(dietId, exerciseId) {
    try {
        const res = await fetch(`${BASE}/plan/${dietId}/exercises/${exerciseId}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("removeExerciseFromDiet:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NUTRITIONIST — customer list for diet plan dashboard
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /plan/my-customers
 * Returns all customers who booked a session with this nutritionist,
 * with their profile info (goals, weight, allergies) + existing diet plan if any.
 * Nutritionist only
 */
export async function getNutritionistCustomers() {
    try {
        const res = await fetch(`${BASE}/plan/my-customers`, {
            method: "GET",
            headers: authHeaders(),
        });
        return await handleRes(res);
    } catch (error) {
        console.error("getNutritionistCustomers:", error);
        throw error;
    }
}