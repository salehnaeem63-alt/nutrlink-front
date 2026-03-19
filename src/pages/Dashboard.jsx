import { useState, useEffect } from 'react';
import Navbar from '../component/Navbar';
import {
  getdite,
  getGoal,
  goalDone,
  deleteGoal,
  creategoal,
  getsammury,
  getlogs,
  getlogtoday,
  creatlog,
  getCustomerAppointments
} from "../api/progressApi";
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [goals, setGoals] = useState([]);
  const [dietPlan, setDietPlan] = useState(null);
  const [logHistory, setLogHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  
  // Chart time period state - can be 7, 14, 30, or 'monthly'
  const [chartPeriod, setChartPeriod] = useState(30);

  // New log form state
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({
    waterIntake: '',
    exerciseMinutes: '',
    weight: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, [chartPeriod]); // Re-fetch when chart period changes

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [summaryData, todayData, goalsData, logsData, appointmentsData] = await Promise.all([
        getsammury(),
        getlogtoday().catch(() => ({ log: null })),
        getGoal().catch(() => ({ goals: [] })),
        getlogs(chartPeriod).catch(() => ({ logs: [] })), // Use selected period
        getCustomerAppointments().catch(() => ({ appointments: [] }))
      ]);

      console.log('Summary Data:', summaryData); // Debug
      console.log('Appointments Data:', appointmentsData); // Debug
      setSummary(summaryData.summary);
      setTodayLog(todayData.log || summaryData.summary?.todayLog || null);
      setGoals(goalsData.goals || []);
      setLogHistory(logsData.logs || []);
      setAppointments(appointmentsData.appointments || []);
      
      // Get diet plan if available
      try {
        const dietData = await getdite();
        setDietPlan(dietData.diets?.[0] || summaryData.summary?.activeDiet || null);
      } catch (error) {
        setDietPlan(summaryData.summary?.activeDiet || null);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChartPeriod = (days) => {
    setChartPeriod(days);
  };

  const handleGoalDone = async (goalId) => {
    try {
      const result = await goalDone({ goal_id: goalId });
      // Update goals directly from response
      if (result.goals) {
        setGoals(result.goals);
      } else {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error marking goal as done:', error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const result = await deleteGoal(goalId);
      // Update goals directly from response
      if (result.goals) {
        setGoals(result.goals);
      } else {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    try {
      const result = await creategoal({ data: newGoal });
      setNewGoal('');
      setShowGoalInput(false);
      
      // Update goals directly from response instead of refetching
      if (result.goals) {
        setGoals(result.goals);
      } else {
        // Fallback: refresh data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleCreateLog = async (e) => {
    e.preventDefault();
    try {
      await creatlog({
        waterIntake: Number(logForm.waterIntake),
        exerciseMinutes: Number(logForm.exerciseMinutes),
        weight: Number(logForm.weight)
      });
      setLogForm({ waterIntake: '', exerciseMinutes: '', weight: '' });
      setShowLogForm(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating log:', error);
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return 'Unknown';
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return 'Underweight';
    if (bmiNum < 25) return 'Normal';
    if (bmiNum < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = (category) => {
    const colors = {
      'Underweight': '#3b82f6',
      'Normal': '#10b981',
      'Overweight': '#f59e0b',
      'Obese': '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  if (loading) {
    return (
      <>
        <Navbar isLogin={true} onLogout={() => {/* handle logout */}} />
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </>
    );
  }

  const profile = summary?.profile || {};
  const weightProgress = summary?.weightProgress || {};
  const goalsSummary = summary?.goalsSummary || {};
  const activeDiet = dietPlan || summary?.activeDiet;

  const currentWeight = weightProgress.current || profile.currentWeight || 0;
  const targetWeight = weightProgress.target || profile.targetWeight || 0;
  const remaining = weightProgress.remaining || (currentWeight - targetWeight);
  const originalWeight = weightProgress.original || currentWeight;

  const bmi = calculateBMI(currentWeight, profile.height);
  const bmiCategory = getBMICategory(bmi);
  const bmiColor = getBMIColor(bmiCategory);

  return (
    <>
      <Navbar isLogin={true} onLogout={() => {/* handle logout */}} />
      
      <div className="dashboard">
        <div className="dashboard__container">
          
          {/* Header */}
          <div className="dashboard__header">
            <h1>My Dashboard</h1>
            <p>View your personal health information and track your progress</p>
          </div>

          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-card__header">
              <div className="profile-avatar">
                {profile.user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="profile-info">
                <h2>{profile.user?.username || 'User'}</h2>
              </div>
              {profile.gender && (
                <span className="gender-badge">
                  {profile.gender === 'Male' ? '♂' : '♀'} {profile.gender.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎂</div>
              <div className="stat-content">
                <span className="stat-label">AGE</span>
                <span className="stat-value">{profile.age || '-'} <small>years</small></span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📏</div>
              <div className="stat-content">
                <span className="stat-label">HEIGHT</span>
                <span className="stat-value">{profile.height || '-'} <small>cm</small></span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚖️</div>
              <div className="stat-content">
                <span className="stat-label">CURRENT WEIGHT</span>
                <span className="stat-value">{currentWeight} <small>kg</small></span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <span className="stat-label">TARGET WEIGHT</span>
                <span className="stat-value">{targetWeight} <small>kg</small></span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="dashboard__grid">
            
            {/* Row 1: BMI, Weight Journey, Next Appointment */}
            <div className="dashboard__card bmi-card">
              <h2>BMI</h2>
              <div className="bmi-display">
                <div className="bmi-value" style={{ color: bmiColor }}>
                  {bmi || 'N/A'}
                </div>
                <div className="bmi-category" style={{ color: bmiColor }}>
                  {bmiCategory}
                </div>
              </div>
              {bmi && (
                <div className="bmi-scale">
                  <div className="bmi-scale__bar">
                    <div className="bmi-scale__marker" style={{ 
                      left: `${Math.min(Math.max((parseFloat(bmi) / 40) * 100, 0), 100)}%` 
                    }}></div>
                  </div>
                  <div className="bmi-scale__labels">
                    <span>Thin</span>
                    <span>Normal</span>
                    <span>Heavy</span>
                  </div>
                </div>
              )}
            </div>

            {/* Weight Journey */}
            <div className="dashboard__card weight-journey-card">
              <h2>Weight Journey</h2>
              <div className="weight-journey">
                <div className="weight-journey__stats">
                  <div className="journey-stat">
                    <span className="journey-value">{currentWeight}</span>
                    <span className="journey-label">CURRENT (KG)</span>
                  </div>
                  <div className="journey-arrow">→</div>
                  <div className="journey-stat journey-stat--target">
                    <span className="journey-value">{targetWeight}</span>
                    <span className="journey-label">TARGET (KG)</span>
                  </div>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-bar__fill" 
                    style={{ 
                      width: `${Math.min(Math.max(((originalWeight - currentWeight) / (originalWeight - targetWeight)) * 100, 0), 100)}%` 
                    }}
                  ></div>
                </div>
                
                <p className="weight-remaining">
                  {Math.abs(remaining).toFixed(1)} kg remaining to reach your goal
                </p>
              </div>
            </div>

            {/* Next Appointment */}
            <div className="dashboard__card next-appointment-card">
              <h2>Next Appointment</h2>
              {appointments && appointments.length > 0 ? (
                <div className="appointment-details">
                  <div className="appointment-nutritionist">
                    <div className="nutritionist-avatar nutritionist-avatar--small">
                      {appointments[0].nutritionistId?.username?.charAt(0).toUpperCase() || 'N'}
                    </div>
                    <div>
                      <p className="appointment-name">
                        {appointments[0].nutritionistId?.username || 'Nutritionist'}
                      </p>
                      <span className={`appointment-status appointment-status--${appointments[0].status?.toLowerCase() || 'booked'}`}>
                        {appointments[0].status || 'Booked'}
                      </span>
                    </div>
                  </div>
                  <div className="appointment-datetime">
                    <div className="appointment-date">
                      <span className="appointment-icon">📅</span>
                      <span>{new Date(appointments[0].date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <div className="appointment-time">
                      <span className="appointment-icon">🕐</span>
                      <span>{appointments[0].timeSlot || 'Time TBD'}</span>
                    </div>
                  </div>
                  {appointments.length > 1 && (
                    <div className="appointment-count">
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.75rem 0 0 0', textAlign: 'center' }}>
                        + {appointments.length - 1} more appointment{appointments.length - 1 > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <p>📅 No upcoming appointments</p>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    Schedule a consultation with your nutritionist
                  </p>
                </div>
              )}
            </div>

            {/* Combined Progress Charts */}
            <div className="dashboard__card dashboard__card--full progress-charts">
              <div className="card-header">
                <h2>📊 Progress History</h2>
                <div className="chart-period-selector">
                  <button 
                    className={`period-btn ${chartPeriod === 7 ? 'active' : ''}`}
                    onClick={() => updateChartPeriod(7)}
                  >
                    7 Days
                  </button>
                  <button 
                    className={`period-btn ${chartPeriod === 14 ? 'active' : ''}`}
                    onClick={() => updateChartPeriod(14)}
                  >
                    14 Days
                  </button>
                  <button 
                    className={`period-btn ${chartPeriod === 30 ? 'active' : ''}`}
                    onClick={() => updateChartPeriod(30)}
                  >
                    30 Days
                  </button>
                  <button 
                    className={`period-btn ${chartPeriod === 'monthly' ? 'active' : ''}`}
                    onClick={() => updateChartPeriod('monthly')}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              
              {logHistory.length > 0 ? (
                <div className="combined-chart-container">
                  <div className="combined-chart-scroll">
                    {(() => {
                      // Determine which logs to display
                      const logsToDisplay = chartPeriod === 'monthly' 
                        ? logHistory 
                        : logHistory.slice(0, chartPeriod);
                      
                      return logsToDisplay.reverse().map((log, index) => {
                        // Calculate heights for each metric
                        const dataToUse = chartPeriod === 'monthly' ? logHistory : logHistory.slice(0, chartPeriod);
                        const maxWater = Math.max(...dataToUse.map(l => l.waterIntake || 0), 2000);
                        const maxExercise = Math.max(...dataToUse.map(l => l.exerciseMinutes || 0), 60);
                        const allWeights = dataToUse.map(l => l.weight || 0).filter(w => w > 0);
                        const maxWeight = allWeights.length > 0 ? Math.max(...allWeights) : 100;
                        const minWeight = allWeights.length > 0 ? Math.min(...allWeights) : 50;
                        const weightRange = maxWeight - minWeight || 10;
                        
                        const waterHeight = ((log.waterIntake || 0) / maxWater) * 100;
                        const exerciseHeight = ((log.exerciseMinutes || 0) / maxExercise) * 100;
                        const weightHeight = log.weight ? ((log.weight - minWeight) / weightRange) * 100 : 0;
                        
                        // Format date based on view mode
                        const dateObj = new Date(log.date);
                        const dateLabel = chartPeriod === 'monthly' 
                          ? dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        
                        return (
                          <div key={log._id || index} className="combined-bar-group">
                            <span className="bar-group__date bar-group__date--top">
                              {dateLabel}
                            </span>
                            
                            <div className="bar-group-container">
                              {/* Water Bar */}
                              <div className="mini-bar-container">
                                <span className="mini-bar__icon">💧</span>
                                <div 
                                  className="mini-bar mini-bar--water"
                                  style={{ height: `${Math.max(waterHeight, 5)}%` }}
                                  title={`Water: ${log.waterIntake || 0}ml on ${dateObj.toLocaleDateString()}`}
                                >
                                  <span className="mini-bar__value">{log.waterIntake || 0}</span>
                                </div>
                              </div>
                              
                              {/* Exercise Bar */}
                              <div className="mini-bar-container">
                                <span className="mini-bar__icon">🏃</span>
                                <div 
                                  className="mini-bar mini-bar--exercise"
                                  style={{ height: `${Math.max(exerciseHeight, 5)}%` }}
                                  title={`Exercise: ${log.exerciseMinutes || 0} min on ${dateObj.toLocaleDateString()}`}
                                >
                                  <span className="mini-bar__value">{log.exerciseMinutes || 0}</span>
                                </div>
                              </div>
                              
                              {/* Weight Bar */}
                              <div className="mini-bar-container">
                                <span className="mini-bar__icon">⚖️</span>
                                <div 
                                  className="mini-bar mini-bar--weight"
                                  style={{ height: `${Math.max(weightHeight, 5)}%` }}
                                  title={`Weight: ${log.weight || 'N/A'}kg on ${dateObj.toLocaleDateString()}`}
                                >
                                  <span className="mini-bar__value">{log.weight || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  {/* Legend */}
                  <div className="chart-legend">
                    <div className="legend-item">
                      <span className="legend-color legend-color--water"></span>
                      <span>💧 Water (ml)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color legend-color--exercise"></span>
                      <span>🏃 Exercise (min)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color legend-color--weight"></span>
                      <span>⚖️ Weight (kg)</span>
                    </div>
                    {chartPeriod === 'monthly' && (
                      <div className="legend-note">
                        <span>📅 Showing last day of each month</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>📊 No progress data available yet</p>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    Start logging your daily activities to see your progress here!
                  </p>
                </div>
              )}
            </div>

            {/* Row 2: Log Today's Activity, My Goals, Active Diet Plan */}
            
            {/* Log Today's Activity */}
            <div className="dashboard__card">
              <div className="card-header">
                <h2>Log Today's Activity</h2>
              </div>

              {showLogForm ? (
                <form className="log-form" onSubmit={handleCreateLog}>
                  <div className="form-group">
                    <label>💧 Water Intake (ml)</label>
                    <input
                      type="number"
                      value={logForm.waterIntake}
                      onChange={(e) => setLogForm({...logForm, waterIntake: e.target.value})}
                      placeholder="e.g., 2000"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>🏃 Exercise (minutes)</label>
                    <input
                      type="number"
                      value={logForm.exerciseMinutes}
                      onChange={(e) => setLogForm({...logForm, exerciseMinutes: e.target.value})}
                      placeholder="e.g., 30"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>⚖️ Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={logForm.weight}
                      onChange={(e) => setLogForm({...logForm, weight: e.target.value})}
                      placeholder="e.g., 75.5"
                      required
                    />
                  </div>
                  <div className="log-form__actions">
                    <button type="submit" className="btn btn--primary">Save Log</button>
                    <button 
                      type="button" 
                      className="btn btn--secondary"
                      onClick={() => {
                        setShowLogForm(false);
                        setLogForm({ waterIntake: '', exerciseMinutes: '', weight: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  {todayLog ? (
                    <div className="activity-grid">
                      <div className="activity-item">
                        <div className="activity-icon">💧</div>
                        <div className="activity-details">
                          <span className="activity-value">{todayLog.waterIntake}</span>
                          <span className="activity-label">ml water</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">🏃</div>
                        <div className="activity-details">
                          <span className="activity-value">{todayLog.exerciseMinutes}</span>
                          <span className="activity-label">min exercise</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">⚖️</div>
                        <div className="activity-details">
                          <span className="activity-value">{todayLog.weight}</span>
                          <span className="activity-label">kg weight</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="empty-state">No activity logged today</p>
                  )}
                  <button 
                    className="btn btn--primary btn--full"
                    onClick={() => setShowLogForm(true)}
                    style={{ marginTop: '1rem' }}
                  >
                    + Add Today's Log
                  </button>
                </div>
              )}
            </div>

            {/* Goals Section */}
            <div className="dashboard__card">
              <div className="card-header">
                <h2>My Goals</h2>
                <button 
                  className="btn btn--small btn--primary"
                  onClick={() => setShowGoalInput(!showGoalInput)}
                >
                  + Add
                </button>
              </div>

              {showGoalInput && (
                <form className="goal-form" onSubmit={handleCreateGoal}>
                  <input
                    type="text"
                    placeholder="Enter your goal..."
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="goal-input"
                  />
                  <div className="goal-form__actions">
                    <button type="submit" className="btn btn--primary">Add</button>
                    <button 
                      type="button" 
                      className="btn btn--secondary"
                      onClick={() => {
                        setShowGoalInput(false);
                        setNewGoal('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="goals-summary">
                <span className="goals-summary__stat">Total: {goalsSummary.total || 0}</span>
                <span className="goals-summary__stat goals-summary__stat--done">
                  Done: {goalsSummary.done || 0}
                </span>
                <span className="goals-summary__stat goals-summary__stat--pending">
                  Pending: {goalsSummary.pending || 0}
                </span>
              </div>

              <div className="goals-list">
                {goals.length === 0 ? (
                  <p className="empty-state">No goals yet. Set your first goal!</p>
                ) : (
                  goals.slice(0, 3).map((goal) => (
                    <div key={goal._id} className={`goal-item ${goal.status === 'done' ? 'goal-item--done' : ''}`}>
                      <div className="goal-item__content">
                        <span className="goal-item__text">{goal.data}</span>
                        <span className={`goal-item__status goal-item__status--${goal.status}`}>
                          {goal.status}
                        </span>
                      </div>
                      <div className="goal-item__actions">
                        {goal.status !== 'done' && (
                          <button
                            className="btn-icon btn-icon--success"
                            onClick={() => handleGoalDone(goal._id)}
                            title="Mark as done"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          className="btn-icon btn-icon--danger"
                          onClick={() => handleDeleteGoal(goal._id)}
                          title="Delete goal"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Diet Plan - Compact Version */}
            {activeDiet && (
              <div className="dashboard__card diet-plan-compact">
                <h2>Active Diet Plan</h2>
                <div className="diet-compact-info">
                  <div className="diet-compact-header">
                    <div className="nutritionist-avatar nutritionist-avatar--small">
                      {activeDiet.nutritionistId?.username?.charAt(0).toUpperCase() || 'N'}
                    </div>
                    <div className="diet-compact-details">
                      <p className="nutritionist-name">
                        {activeDiet.nutritionistId?.username || 'Nutritionist'}
                      </p>
                      <span className={`diet-status diet-status--${activeDiet.status}`}>
                        {activeDiet.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="diet-compact-meals">
                    <p className="diet-compact-label">Today's Meals</p>
                    {activeDiet.meals && activeDiet.meals.filter(m => {
                      const mealDate = new Date(m.date);
                      const today = new Date();
                      mealDate.setUTCHours(0, 0, 0, 0);
                      today.setUTCHours(0, 0, 0, 0);
                      return mealDate.getTime() === today.getTime();
                    }).length > 0 ? (
                      <div className="compact-meal-list">
                        {activeDiet.meals
                          .filter(m => {
                            const mealDate = new Date(m.date);
                            const today = new Date();
                            mealDate.setUTCHours(0, 0, 0, 0);
                            today.setUTCHours(0, 0, 0, 0);
                            return mealDate.getTime() === today.getTime();
                          })
                          .slice(0, 3)
                          .map((meal) => (
                            <div key={meal._id} className="compact-meal-item">
                              <span className="compact-meal-type">{meal.type}</span>
                              <span className="compact-meal-name">{meal.name}</span>
                              <span className="compact-meal-cal">{meal.calories} cal</span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="empty-state">No meals for today</p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;