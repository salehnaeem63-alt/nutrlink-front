import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- Added import
import { getDiets, markMealAsDone } from "../../api/diet";
import "./CustomerDietPage.css";
import Navbar from '../../component/Navigationbar/Navbar';

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function ProgressRing({ percent }) {
    const r = 44, c = 2 * Math.PI * r;
    const filled = c - (percent / 100) * c;
    return (
        <div className="cdp-ring-wrap">
            <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="55" cy="55" r={r} fill="none"
                    stroke="url(#grd)" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={c}
                    strokeDashoffset={filled}
                    transform="rotate(-90 55 55)"
                    style={{ transition:"stroke-dashoffset .6s ease" }} />
                <defs>
                    <linearGradient id="grd" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="cdp-ring-label">
                <span className="cdp-ring-pct">{percent}%</span>
                <span className="cdp-ring-sub">done</span>
            </div>
        </div>
    );
}

function MealCard({ meal, dietId, onToggle }) {
    const [toggling, setToggling] = useState(false);

    const handleToggle = async () => {
        setToggling(true);
        try {
            const r = await markMealAsDone(dietId, meal._id);
            onToggle(meal._id, r.progress, r.dietStatus);
        } catch(e) { console.error(e); }
        finally { setToggling(false); }
    };

    return (
        <div className={`cdp-meal-card type-${meal.type?.toLowerCase()} ${meal.isCompleted?"completed":""}`}>
            <div className="cdp-meal-header">
                <span className="cdp-meal-type">{meal.type}</span>
                <span className="cdp-meal-cal">🔥 {meal.calories} kcal</span>
            </div>
            <h4>{meal.name}</h4>
            <p>{meal.description}</p>
            <button
                className={`cdp-done-btn ${meal.isCompleted?"is-done":""}`}
                onClick={handleToggle}
                disabled={toggling}
            >
                {toggling ? "…" : meal.isCompleted ? "✓ Completed" : "Mark as done"}
            </button>
        </div>
    );
}

function ExerciseCard({ exercise }) {
    const [mode, setMode] = useState("gym");
    const hasGym  = !!exercise.gymVersion?.instructions;
    const hasHome = !!exercise.homeVersion?.instructions;
    const ver = mode === "gym" ? exercise.gymVersion : exercise.homeVersion;

    return (
        <div className="cdp-exercise-card">
            <div className="cdp-ex-top">
                <div>
                    <span className="cdp-ex-cat">{exercise.category}</span>
                    <h4>{exercise.name}</h4>
                    <div className="cdp-ex-metas">
                        {exercise.durationMinutes && <span>⏱ {exercise.durationMinutes} min</span>}
                        {exercise.caloriesBurned  && <span>🔥 {exercise.caloriesBurned} kcal</span>}
                    </div>
                </div>
                {(hasGym || hasHome) && (
                    <div className="cdp-mode-toggle">
                        {hasGym  && <button className={mode==="gym"  ?"active":""} onClick={() => setMode("gym" )}>🏋️ Gym</button>}
                        {hasHome && <button className={mode==="home" ?"active":""} onClick={() => setMode("home")}>🏠 Home</button>}
                    </div>
                )}
            </div>
            {ver && (
                <div className={`cdp-ex-instructions mode-${mode}`}>
                    {mode === "gym" && exercise.gymVersion?.equipment && (
                        <div className="cdp-ex-detail"><b>Equipment:</b> {exercise.gymVersion.equipment}</div>
                    )}
                    {ver.sets && <div className="cdp-ex-detail"><b>Sets × Reps:</b> {ver.sets} × {ver.reps}</div>}
                    <div className="cdp-ex-detail cdp-ex-instr">{ver.instructions}</div>
                </div>
            )}
            {exercise.notes && <p className="cdp-ex-notes">💡 {exercise.notes}</p>}
        </div>
    );
}

export default function CustomerDietPage() {
    const navigate = useNavigate(); // <-- Initialize navigate
    
    const [diet,         setDiet]       = useState(null);
    const [loading,      setLoading]    = useState(true);
    const [error,        setError]      = useState("");
    const [needsProfile, setNeedsProfile] = useState(false); // <-- Track if profile is missing
    const [activeTab,    setActiveTab]  = useState("meals");
    const [activeDay,    setActiveDay]  = useState(null);

    useEffect(() => {
        getDiets()
            .then(r => setDiet(r.diets?.[0] || null))
            .catch(err => {
                // <-- Check exactly what the backend said
                if (err.message === "Customer profile not found.") {
                    setNeedsProfile(true);
                } else {
                    setError("Failed to load your diet plan.");
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleMealToggle = (mealId, progressStr, status) => {
        const progress = parseInt(progressStr) || 0;
        setDiet(prev => ({
            ...prev, progress, status,
            meals: prev.meals.map(m => m._id === mealId ? {...m, isCompleted: !m.isCompleted} : m)
        }));
    };

    const mealsByDate = (diet?.meals||[]).reduce((acc,m) => {
        const d = m.date?.slice(0,10)||"unknown"; if(!acc[d]) acc[d]=[]; acc[d].push(m); return acc;
    }, {});
    const sortedDates = Object.keys(mealsByDate).sort();

    const exByDay = (diet?.exercises||[]).reduce((acc,e) => {
        if(!acc[e.dayOfWeek]) acc[e.dayOfWeek]=[]; acc[e.dayOfWeek].push(e); return acc;
    }, {});
    const exerciseDays = DAYS.filter(d => exByDay[d]);

    useEffect(() => {
        if (exerciseDays.length > 0 && !activeDay) setActiveDay(exerciseDays[0]);
    }, [exerciseDays.length]);

    const todayStr   = new Date().toISOString().slice(0,10);
    const todayMeals = mealsByDate[todayStr] || [];
    const todayDone  = todayMeals.filter(m => m.isCompleted).length;
    const totalCal   = (diet?.meals||[]).reduce((s,m) => s + (m.calories||0), 0);
    const doneCal    = (diet?.meals||[]).filter(m => m.isCompleted).reduce((s,m) => s + (m.calories||0), 0);

    if (loading) return (
        <div className="cdp-loading-screen">
            <div className="cdp-spinner" />
            <p>Loading your diet plan…</p>
        </div>
    );
    
    // <-- INTERCEPT: Show the "Create Profile" button if they are missing a profile
    if (needsProfile) return (
        <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'sans-serif' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '15px', color: '#333' }}>⚠️ Profile Required</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '25px' }}>
                You need to complete your customer profile before you can receive a diet plan.
            </p>
            <button 
                onClick={() => navigate('/createprofile')} 
                style={{ 
                    padding: '12px 28px', 
                    backgroundColor: '#22c55e', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    fontSize: '1.05rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                Create My Profile Now
            </button>
        </div>
    );

    if (error) return (
        <div className="cdp-error-screen"><span>⚠️</span><p>{error}</p></div>
    );
    
    if (!diet) return (
        <div className="cdp-no-plan-screen">
            <div className="cdp-no-plan-icon">🥗</div>
            <h2>No diet plan yet</h2>
            <p>Book a session with a nutritionist to get your personalised diet & exercise plan.</p>
        </div>
    );

    return (
        <div className="cdp-root">
            <div className="cdp-hero">
                <div className="cdp-hero-text">
                    <h1>Your Diet Plan</h1>
                    <p>
                        {new Date(diet.startDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                        {" → "}
                        {new Date(diet.endDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                    </p>
                </div>
                <ProgressRing percent={diet.progress || 0} />
            </div>

            <div className="cdp-summary-grid">
                <div className="cdp-summary-card">
                    <span className="cdp-sum-icon">🍽</span>
                    <div><span className="cdp-sum-label">Total Meals</span><span className="cdp-sum-val">{diet.meals?.length||0}</span></div>
                </div>
                <div className="cdp-summary-card">
                    <span className="cdp-sum-icon">✅</span>
                    <div><span className="cdp-sum-label">Today Done</span><span className="cdp-sum-val">{todayDone} / {todayMeals.length}</span></div>
                </div>
                <div className="cdp-summary-card">
                    <span className="cdp-sum-icon">🔥</span>
                    <div><span className="cdp-sum-label">Calories Consumed</span><span className="cdp-sum-val">{doneCal.toLocaleString()} / {totalCal.toLocaleString()}</span></div>
                </div>
                <div className="cdp-summary-card">
                    <span className="cdp-sum-icon">🏋️</span>
                    <div><span className="cdp-sum-label">Exercises</span><span className="cdp-sum-val">{diet.exercises?.length||0}</span></div>
                </div>
            </div>

            <div className="cdp-tabs">
                <button className={`cdp-tab ${activeTab==="meals"?"active":""}`} onClick={() => setActiveTab("meals")}>🍽 Meal Plan</button>
                <button className={`cdp-tab ${activeTab==="exercises"?"active":""}`} onClick={() => setActiveTab("exercises")}>🏋️ Exercise Plan</button>
            </div>

            {activeTab === "meals" && (
                <div className="cdp-tab-content">
                    {sortedDates.length === 0
                        ? <div className="cdp-empty">No meals have been added to your plan yet.</div>
                        : sortedDates.map(date => {
                            const isToday = date === todayStr;
                            const meals   = mealsByDate[date];
                            const doneCt  = meals.filter(m => m.isCompleted).length;
                            return (
                                <div key={date} className={`cdp-day-block ${isToday?"today":""}`}>
                                    <div className="cdp-day-label">
                                        <div className="cdp-day-left">
                                            {isToday && <span className="cdp-today-badge">Today</span>}
                                            {new Date(date).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}
                                        </div>
                                        <span className="cdp-day-progress">{doneCt}/{meals.length} done</span>
                                    </div>
                                    <div className="cdp-meals-row">
                                        {meals.map(meal => (
                                            <MealCard key={meal._id} meal={meal} dietId={diet._id} onToggle={handleMealToggle} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            )}

            {activeTab === "exercises" && (
                <div className="cdp-tab-content">
                    {exerciseDays.length === 0
                        ? <div className="cdp-empty">No exercises have been added to your plan yet.</div>
                        : <>
                            <div className="cdp-day-pills">
                                {exerciseDays.map(day => (
                                    <button key={day}
                                        className={`cdp-day-pill ${activeDay===day?"active":""}`}
                                        onClick={() => setActiveDay(day)}>
                                        {day.slice(0,3)}
                                        <span className="cdp-pill-count">{exByDay[day].length}</span>
                                    </button>
                                ))}
                            </div>
                            {activeDay && (
                                <div className="cdp-ex-grid">
                                    {exByDay[activeDay].map(ex => <ExerciseCard key={ex._id} exercise={ex} />)}
                                </div>
                            )}
                          </>
                    }
                </div>
            )}
        </div>
    );
}