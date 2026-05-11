import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import {
    getDiets,
    createDiet,
    addMealToDiet,
    updateMealInDiet,
    removeMealFromDiet,
    addExerciseToDiet,
    updateExerciseInDiet,
    removeExerciseFromDiet,
    getNutritionistCustomers,
} from "../../api/diet";
import "./NutritionistDietPage.css";

// 🚦 MAKE SURE THIS PATH MATCHES YOUR PROJECT STRUCTURE!
import Dashboard from "../Dashboard/Dashboard"; 

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const MEAL_TYPES = ["Breakfast","Lunch","Dinner","Snack"];
const EXERCISE_CATEGORIES = ["Cardio","Strength","Flexibility","Balance","HIIT","Other"];

const emptyMeal = () => ({ name:"", type:"Breakfast", date:"", calories:"", description:"" });
const emptyExercise = () => ({
    name:"", category:"Strength", dayOfWeek:"Monday",
    durationMinutes:"", caloriesBurned:"", notes:"",
    gymVersion:  { equipment:"", sets:"", reps:"", instructions:"" },
    homeVersion: { sets:"", reps:"", instructions:"" }
});

function CustomerCard({ customer, selected, onClick }) {
    const initials = customer.username?.slice(0,2).toUpperCase() || "??";
    return (
        <button className={`ndp-customer-card ${selected ? "active":""}`} onClick={onClick}>
            <div className="ndp-avatar">{initials}</div>
            <div className="ndp-customer-info">
                <span className="ndp-customer-name">{customer.username}</span>
                <span className="ndp-customer-email">{customer.email}</span>
                <div className="ndp-customer-tags">
                    {customer.existingDiet
                        ? <span className={`ndp-tag tag-${customer.existingDiet.status?.replace(" ","-")}`}>
                            {customer.existingDiet.status} · {customer.existingDiet.progress}%
                          </span>
                        : <span className="ndp-tag tag-none">No plan yet</span>
                    }
                </div>
            </div>
        </button>
    );
}

function Stat({ label, value }) {
    return (
        <div className="ndp-stat">
            <span className="ndp-stat-value">{value}</span>
            <span className="ndp-stat-label">{label}</span>
        </div>
    );
}

function CustomerProfile({ customer }) {
    const pendingGoals = customer.goals?.filter(g => g.status === "pending") || [];
    return (
        <div className="ndp-profile-panel">
            <h3 className="ndp-panel-title"><span>👤</span> Client Profile</h3>
            <div className="ndp-stats-grid">
                {customer.age            && <Stat label="Age"      value={`${customer.age} yrs`} />}
                {customer.gender         && <Stat label="Gender"   value={customer.gender} />}
                {customer.height         && <Stat label="Height"   value={`${customer.height} cm`} />}
                {customer.currentWeight  && <Stat label="Weight"   value={`${customer.currentWeight} kg`} />}
                {customer.targetWeight   && <Stat label="Target"   value={`${customer.targetWeight} kg`} />}
                {customer.startingWeight && <Stat label="Start wt" value={`${customer.startingWeight} kg`} />}
            </div>
            {customer.allergies?.length > 0 && (
                <div className="ndp-info-block">
                    <span className="ndp-info-label">⚠️ Allergies</span>
                    <div className="ndp-tag-list">
                        {customer.allergies.map((a,i) => <span key={i} className="ndp-tag tag-allergy">{a}</span>)}
                    </div>
                </div>
            )}
            {pendingGoals.length > 0 && (
                <div className="ndp-info-block">
                    <span className="ndp-info-label">🎯 Goals</span>
                    <ul className="ndp-goal-list">
                        {pendingGoals.map((g,i) => <li key={i}>{g.data}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function NutritionistDietPage() {
    const { user } = useContext(AuthContext);

    const [customers,       setCustomers]       = useState([]);
    const [selected,        setSelected]        = useState(null);
    const [diet,            setDiet]            = useState(null);
    const [loading,         setLoading]         = useState(true);
    const [saving,          setSaving]          = useState(false);
    const [error,           setError]           = useState("");
    const [activeTab,       setActiveTab]       = useState("dashboard"); // Default to Dashboard tab!
    const [showCreateDiet,  setShowCreateDiet]  = useState(false);
    const [showMealModal,   setShowMealModal]   = useState(false);
    const [showExModal,     setShowExModal]     = useState(false);
    const [editingMeal,     setEditingMeal]     = useState(null);
    const [editingEx,       setEditingEx]       = useState(null);
    const [mealForm,        setMealForm]        = useState(emptyMeal());
    const [exForm,          setExForm]          = useState(emptyExercise());
    const [dietForm,        setDietForm]        = useState({ startDate:"", endDate:"" });

    useEffect(() => {
        if (user?.role !== 'nutritionist') {
            setLoading(false);
            return;
        }

        getNutritionistCustomers()
            .then(data => {
                const clientList = Array.isArray(data) ? data : (data.customers || []);
                const normalizedClients = clientList.map(client => ({
                    ...client,
                    customerProfileId: client._id,
                    userId: client.user?._id,
                    username: client.user?.username || "Unknown",
                    email: client.user?.email,
                    profilePic: client.user?.profilePic
                }));
                setCustomers(normalizedClients);
            })
            .catch(() => setError("Failed to load customers"))
            .finally(() => setLoading(false));
    }, [user]);

    const loadDiet = useCallback(async (customer) => {
        if (!customer.existingDiet) { setDiet(null); return; }
        try {
            const r = await getDiets();
            const found = r.diets?.find(d =>
                d.customerId?._id === customer.customerProfileId ||
                d._id === customer.existingDiet._id
            );
            setDiet(found || null);
        } catch { setDiet(null); }
    }, []);

    const selectCustomer = (c) => { setSelected(c); setError(""); loadDiet(c); };

    const handleCreateDiet = async () => {
        if (!dietForm.startDate || !dietForm.endDate) return setError("Fill in both dates.");
        setSaving(true);
        try {
            const r = await createDiet({
                customerId: selected.customerProfileId,
                startDate:  dietForm.startDate,
                endDate:    dietForm.endDate,
                meals: []
            });
            setDiet(r.diet);
            setCustomers(prev => prev.map(c =>
                c.userId === selected.userId
                    ? { ...c, existingDiet: { _id: r.diet._id, status:"pending", progress:0 } }
                    : c
            ));
            setSelected(prev => ({ ...prev, existingDiet: { _id:r.diet._id, status:"pending", progress:0 } }));
            setShowCreateDiet(false);
            setDietForm({ startDate:"", endDate:"" });
        } catch(e) { setError(e.message || "Failed to create diet plan"); }
        finally { setSaving(false); }
    };

    const openAddMeal  = () => { setMealForm(emptyMeal()); setEditingMeal(null); setShowMealModal(true); };
    const openEditMeal = (m)  => { setMealForm({...m, date: m.date?.slice(0,10)}); setEditingMeal(m._id); setShowMealModal(true); };

    const saveMeal = async () => {
        if (!mealForm.name || !mealForm.date || !mealForm.calories || !mealForm.description)
            return setError("Fill all meal fields.");
        setSaving(true);
        try {
            if (editingMeal) {
                const r = await updateMealInDiet(diet._id, editingMeal, mealForm);
                setDiet(prev => ({ ...prev, meals: prev.meals.map(m => m._id === editingMeal ? r.meal : m) }));
            } else {
                const r = await addMealToDiet(diet._id, mealForm);
                setDiet(prev => ({ ...prev, meals: [...(prev.meals||[]), r.meal] }));
            }
            setShowMealModal(false);
        } catch(e) { setError(e.message || "Failed to save meal"); }
        finally { setSaving(false); }
    };

    const deleteMeal = async (mealId) => {
        if (!window.confirm("Remove this meal?")) return;
        try {
            await removeMealFromDiet(diet._id, mealId);
            setDiet(prev => ({ ...prev, meals: prev.meals.filter(m => m._id !== mealId) }));
        } catch(e) { setError(e.message || "Failed to delete meal"); }
    };

    const openAddEx  = () => { setExForm(emptyExercise()); setEditingEx(null); setShowExModal(true); };
    const openEditEx = (ex) => { setExForm(ex); setEditingEx(ex._id); setShowExModal(true); };

    const saveEx = async () => {
        if (!exForm.name || !exForm.dayOfWeek) return setError("Exercise name and day required.");
        setSaving(true);
        try {
            if (editingEx) {
                const r = await updateExerciseInDiet(diet._id, editingEx, exForm);
                setDiet(prev => ({ ...prev, exercises: prev.exercises.map(e => e._id === editingEx ? r.exercise : e) }));
            } else {
                const r = await addExerciseToDiet(diet._id, exForm);
                setDiet(prev => ({ ...prev, exercises: [...(prev.exercises||[]), r.exercise] }));
            }
            setShowExModal(false);
        } catch(e) { setError(e.message || "Failed to save exercise"); }
        finally { setSaving(false); }
    };

    const deleteEx = async (exId) => {
        if (!window.confirm("Remove this exercise?")) return;
        try {
            await removeExerciseFromDiet(diet._id, exId);
            setDiet(prev => ({ ...prev, exercises: prev.exercises.filter(e => e._id !== exId) }));
        } catch(e) { setError(e.message || "Failed to delete exercise"); }
    };

    const mealsByDate = (diet?.meals||[]).reduce((acc,m) => {
        const d = m.date?.slice(0,10)||"unknown"; if(!acc[d]) acc[d]=[]; acc[d].push(m); return acc;
    }, {});

    const exByDay = (diet?.exercises||[]).reduce((acc,e) => {
        if(!acc[e.dayOfWeek]) acc[e.dayOfWeek]=[]; acc[e.dayOfWeek].push(e); return acc;
    }, {});

    return (
        <div className="ndp-root">
            <aside className="ndp-sidebar">
                <div className="ndp-sidebar-header">
                    <h2>My Clients</h2>
                    <span className="ndp-count">{customers.length}</span>
                </div>
                {loading ? <div className="ndp-loading">Loading clients…</div>
                : customers.length === 0 ? <div className="ndp-empty-state">No booked clients yet.</div>
                : <div className="ndp-customer-list">
                    {customers.map(c => (
                        <CustomerCard key={c.userId} customer={c}
                            selected={selected?.userId === c.userId}
                            onClick={() => selectCustomer(c)} />
                    ))}
                  </div>
                }
            </aside>

            <main className="ndp-main">
                {error && <div className="ndp-error" onClick={() => setError("")}>⚠️ {error} <span className="ndp-error-close">✕</span></div>}

                {!selected ? (
                    <div className="ndp-welcome">
                        <div className="ndp-welcome-icon">🥗</div>
                        <h2>Select a client to manage their diet plan</h2>
                        <p>All your booked clients appear in the sidebar.</p>
                    </div>
                ) : (
                    <>
                        <div className="ndp-client-header">
                            <div className="ndp-client-avatar">{selected.username?.slice(0,2).toUpperCase()}</div>
                            <div><h2>{selected.username}</h2><span>{selected.email}</span></div>
                            {!diet && (
                                <button className="ndp-btn ndp-btn-primary ndp-ml-auto" onClick={() => setShowCreateDiet(true)}>
                                    + Create Diet Plan
                                </button>
                            )}
                            {diet && (
                                <div className="ndp-diet-status ndp-ml-auto">
                                    <span className={`ndp-status-badge status-${diet.status?.replace(" ","-")}`}>{diet.status}</span>
                                    <div className="ndp-progress-bar">
                                        <div className="ndp-progress-fill" style={{ width:`${diet.progress||0}%` }} />
                                    </div>
                                    <span className="ndp-progress-text">{diet.progress||0}% complete</span>
                                </div>
                            )}
                        </div>

                        <CustomerProfile customer={selected} />

                        {/* 🛠 TABS ARE ALWAYS VISIBLE NOW */}
                        <div className="ndp-tabs" style={{ marginTop: '20px' }}>
                            <button className={`ndp-tab ${activeTab==="dashboard"?"active":""}`} onClick={() => setActiveTab("dashboard")}>📊 Dashboard</button>
                            <button className={`ndp-tab ${activeTab==="meals"?"active":""}`} onClick={() => setActiveTab("meals")}>🍽 Meals</button>
                            <button className={`ndp-tab ${activeTab==="exercises"?"active":""}`} onClick={() => setActiveTab("exercises")}>🏋️ Exercises</button>
                        </div>

                        {/* DASHBOARD TAB (Always visible if client is selected) */}
                        {activeTab === "dashboard" && (
                            <div className="ndp-tab-content">
                                <div className="ndp-customer-dashboard-view" style={{ minHeight: '400px', backgroundColor: '#fff', borderRadius: '12px', padding: '10px' }}>
                                    {/* <Dashboard clientId={selected.userId} /> */}
                                </div>
                            </div>
                        )}

                        {/* MEALS & EXERCISES TABS (Only show if diet plan exists) */}
                        {(activeTab === "meals" || activeTab === "exercises") && (
                            diet ? (
                                <>
                                    <div className="ndp-diet-dates">
                                        <span>📅 {new Date(diet.startDate).toLocaleDateString()} → {new Date(diet.endDate).toLocaleDateString()}</span>
                                        <span className="ndp-meal-count">{diet.meals?.length||0} meals · {diet.exercises?.length||0} exercises</span>
                                    </div>

                                    {activeTab === "meals" && (
                                        <div className="ndp-tab-content">
                                            <div className="ndp-tab-header">
                                                <h3>Meal Plan</h3>
                                                <button className="ndp-btn ndp-btn-primary" onClick={openAddMeal}>+ Add Meal</button>
                                            </div>
                                            {Object.keys(mealsByDate).length === 0
                                                ? <div className="ndp-empty-state">No meals yet. Click "+ Add Meal" to start.</div>
                                                : Object.entries(mealsByDate).sort().map(([date, meals]) => (
                                                    <div key={date} className="ndp-day-group">
                                                        <div className="ndp-day-label">
                                                            {new Date(date).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}
                                                        </div>
                                                        <div className="ndp-meals-grid">
                                                            {meals.map(meal => (
                                                                <div key={meal._id} className={`ndp-meal-card type-${meal.type?.toLowerCase()}`}>
                                                                    <div className="ndp-meal-header">
                                                                        <span className="ndp-meal-type">{meal.type}</span>
                                                                        <span className={`ndp-meal-done ${meal.isCompleted?"done":""}`}>
                                                                            {meal.isCompleted ? "✓ Done" : "Pending"}
                                                                        </span>
                                                                    </div>
                                                                    <h4>{meal.name}</h4>
                                                                    <p>{meal.description}</p>
                                                                    <div className="ndp-meal-footer">
                                                                        <span className="ndp-calories">🔥 {meal.calories} kcal</span>
                                                                        <div className="ndp-meal-actions">
                                                                            <button className="ndp-icon-btn" onClick={() => openEditMeal(meal)}>✏️</button>
                                                                            <button className="ndp-icon-btn danger" onClick={() => deleteMeal(meal._id)}>🗑</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )}

                                    {activeTab === "exercises" && (
                                        <div className="ndp-tab-content">
                                            <div className="ndp-tab-header">
                                                <h3>Exercise Plan</h3>
                                                <button className="ndp-btn ndp-btn-primary" onClick={openAddEx}>+ Add Exercise</button>
                                            </div>
                                            {Object.keys(exByDay).length === 0
                                                ? <div className="ndp-empty-state">No exercises yet. Click "+ Add Exercise" to start.</div>
                                                : DAYS.filter(d => exByDay[d]).map(day => (
                                                    <div key={day} className="ndp-day-group">
                                                        <div className="ndp-day-label">{day}</div>
                                                        <div className="ndp-exercises-list">
                                                            {exByDay[day].map(ex => (
                                                                <div key={ex._id} className="ndp-exercise-card">
                                                                    <div className="ndp-ex-left">
                                                                        <span className="ndp-ex-category">{ex.category}</span>
                                                                        <h4>{ex.name}</h4>
                                                                        {ex.durationMinutes && <span className="ndp-ex-meta">⏱ {ex.durationMinutes} min</span>}
                                                                        {ex.caloriesBurned  && <span className="ndp-ex-meta">🔥 {ex.caloriesBurned} kcal</span>}
                                                                    </div>
                                                                    <div className="ndp-ex-versions">
                                                                        {ex.gymVersion?.instructions && (
                                                                            <div className="ndp-version gym">
                                                                                <span className="ndp-version-label">🏋️ Gym</span>
                                                                                {ex.gymVersion.equipment && <p><b>Equipment:</b> {ex.gymVersion.equipment}</p>}
                                                                                {ex.gymVersion.sets && <p><b>Sets/Reps:</b> {ex.gymVersion.sets} × {ex.gymVersion.reps}</p>}
                                                                                <p>{ex.gymVersion.instructions}</p>
                                                                            </div>
                                                                        )}
                                                                        {ex.homeVersion?.instructions && (
                                                                            <div className="ndp-version home">
                                                                                <span className="ndp-version-label">🏠 Home</span>
                                                                                {ex.homeVersion.sets && <p><b>Sets/Reps:</b> {ex.homeVersion.sets} × {ex.homeVersion.reps}</p>}
                                                                                <p>{ex.homeVersion.instructions}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {ex.notes && <p className="ndp-ex-notes">📝 {ex.notes}</p>}
                                                                    <div className="ndp-ex-actions">
                                                                        <button className="ndp-icon-btn" onClick={() => openEditEx(ex)}>✏️</button>
                                                                        <button className="ndp-icon-btn danger" onClick={() => deleteEx(ex._id)}>🗑</button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="ndp-no-plan" style={{ marginTop: '20px' }}>
                                    <div className="ndp-no-plan-icon">📋</div>
                                    <p>No diet plan created yet for this client.</p>
                                    <button className="ndp-btn ndp-btn-primary" onClick={() => setShowCreateDiet(true)}>
                                        Create Diet Plan
                                    </button>
                                </div>
                            )
                        )}
                    </>
                )}
            </main>

            {/* Modals... */}
            {showCreateDiet && (
                <div className="ndp-modal-overlay" onClick={() => setShowCreateDiet(false)}>
                    <div className="ndp-modal" onClick={e => e.stopPropagation()}>
                        <h3>Create Diet Plan for {selected?.username}</h3>
                        <div className="ndp-form-row">
                            <label>Start Date<input type="date" value={dietForm.startDate} onChange={e => setDietForm(p=>({...p,startDate:e.target.value}))} /></label>
                            <label>End Date<input type="date" value={dietForm.endDate} onChange={e => setDietForm(p=>({...p,endDate:e.target.value}))} /></label>
                        </div>
                        <div className="ndp-modal-footer">
                            <button className="ndp-btn ndp-btn-ghost" onClick={() => setShowCreateDiet(false)}>Cancel</button>
                            <button className="ndp-btn ndp-btn-primary" onClick={handleCreateDiet} disabled={saving}>{saving?"Creating…":"Create Plan"}</button>
                        </div>
                    </div>
                </div>
            )}

            {showMealModal && (
                <div className="ndp-modal-overlay" onClick={() => setShowMealModal(false)}>
                    <div className="ndp-modal ndp-modal-lg" onClick={e => e.stopPropagation()}>
                        <h3>{editingMeal ? "Edit Meal" : "Add Meal"}</h3>
                        <div className="ndp-form-row">
                            <label>Meal Name<input type="text" placeholder="e.g. Grilled Chicken" value={mealForm.name} onChange={e=>setMealForm(p=>({...p,name:e.target.value}))} /></label>
                            <label>Type<select value={mealForm.type} onChange={e=>setMealForm(p=>({...p,type:e.target.value}))}>{MEAL_TYPES.map(t=><option key={t}>{t}</option>)}</select></label>
                        </div>
                        <div className="ndp-form-row">
                            <label>Date<input type="date" value={mealForm.date} onChange={e=>setMealForm(p=>({...p,date:e.target.value}))} /></label>
                            <label>Calories (kcal)<input type="number" placeholder="450" value={mealForm.calories} onChange={e=>setMealForm(p=>({...p,calories:e.target.value}))} /></label>
                        </div>
                        <label>Description / Ingredients
                            <textarea rows={3} placeholder="e.g. 200g grilled chicken, 1 cup rice…" value={mealForm.description} onChange={e=>setMealForm(p=>({...p,description:e.target.value}))} />
                        </label>
                        <div className="ndp-modal-footer">
                            <button className="ndp-btn ndp-btn-ghost" onClick={() => setShowMealModal(false)}>Cancel</button>
                            <button className="ndp-btn ndp-btn-primary" onClick={saveMeal} disabled={saving}>{saving?"Saving…":editingMeal?"Update Meal":"Add Meal"}</button>
                        </div>
                    </div>
                </div>
            )}

            {showExModal && (
                <div className="ndp-modal-overlay" onClick={() => setShowExModal(false)}>
                    <div className="ndp-modal ndp-modal-xl" onClick={e => e.stopPropagation()}>
                        <h3>{editingEx ? "Edit Exercise" : "Add Exercise"}</h3>
                        <div className="ndp-form-row">
                            <label>Exercise Name<input type="text" placeholder="e.g. Squat" value={exForm.name} onChange={e=>setExForm(p=>({...p,name:e.target.value}))} /></label>
                            <label>Category<select value={exForm.category} onChange={e=>setExForm(p=>({...p,category:e.target.value}))}>{EXERCISE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
                            <label>Day of Week<select value={exForm.dayOfWeek} onChange={e=>setExForm(p=>({...p,dayOfWeek:e.target.value}))}>{DAYS.map(d=><option key={d}>{d}</option>)}</select></label>
                        </div>
                        <div className="ndp-form-row">
                            <label>Duration (min)<input type="number" placeholder="30" value={exForm.durationMinutes} onChange={e=>setExForm(p=>({...p,durationMinutes:e.target.value}))} /></label>
                            <label>Calories Burned<input type="number" placeholder="200" value={exForm.caloriesBurned} onChange={e=>setExForm(p=>({...p,caloriesBurned:e.target.value}))} /></label>
                        </div>
                        <div className="ndp-versions-grid">
                            <div className="ndp-version-section">
                                <h4>🏋️ Gym Version</h4>
                                <label>Equipment<input type="text" placeholder="Barbell, Dumbbell…" value={exForm.gymVersion.equipment} onChange={e=>setExForm(p=>({...p,gymVersion:{...p.gymVersion,equipment:e.target.value}}))} /></label>
                                <div className="ndp-form-row">
                                    <label>Sets<input type="number" placeholder="4" value={exForm.gymVersion.sets} onChange={e=>setExForm(p=>({...p,gymVersion:{...p.gymVersion,sets:e.target.value}}))} /></label>
                                    <label>Reps<input type="text" placeholder="10-12" value={exForm.gymVersion.reps} onChange={e=>setExForm(p=>({...p,gymVersion:{...p.gymVersion,reps:e.target.value}}))} /></label>
                                </div>
                                <label>Instructions<textarea rows={2} value={exForm.gymVersion.instructions} onChange={e=>setExForm(p=>({...p,gymVersion:{...p.gymVersion,instructions:e.target.value}}))} /></label>
                            </div>
                            <div className="ndp-version-section">
                                <h4>🏠 Home Version</h4>
                                <div className="ndp-form-row">
                                    <label>Sets<input type="number" placeholder="4" value={exForm.homeVersion.sets} onChange={e=>setExForm(p=>({...p,homeVersion:{...p.homeVersion,sets:e.target.value}}))} /></label>
                                    <label>Reps<input type="text" placeholder="15" value={exForm.homeVersion.reps} onChange={e=>setExForm(p=>({...p,homeVersion:{...p.homeVersion,reps:e.target.value}}))} /></label>
                                </div>
                                <label>Instructions<textarea rows={2} value={exForm.homeVersion.instructions} onChange={e=>setExForm(p=>({...p,homeVersion:{...p.homeVersion,instructions:e.target.value}}))} /></label>
                            </div>
                        </div>
                        <label>Notes<textarea rows={2} placeholder="Extra tips…" value={exForm.notes} onChange={e=>setExForm(p=>({...p,notes:e.target.value}))} /></label>
                        <div className="ndp-modal-footer">
                            <button className="ndp-btn ndp-btn-ghost" onClick={() => setShowExModal(false)}>Cancel</button>
                            <button className="ndp-btn ndp-btn-primary" onClick={saveEx} disabled={saving}>{saving?"Saving…":editingEx?"Update Exercise":"Add Exercise"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}