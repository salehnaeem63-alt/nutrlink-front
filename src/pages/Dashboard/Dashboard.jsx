import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import Navbar from '../../component/Navigationbar/Navbar';
import { NutrlinkLogo } from '../../component/Icons';
import {
  getdite, getGoal, goalDone, deleteGoal, creategoal,
  getsammury, getlogs, getlogtoday, creatlog,
  getCustomerAppointments, getClientDashboardStats
} from "../../api/progressApi";
import { getCustomerProfile } from '../../api/customerapi';
import './Dashboard.css';

const Dashboard = ({ clientId }) => {
  const { user } = useContext(AuthContext);
  const [customer, setCustomer] = useState(null);
  const [summary, setSummary] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [goals, setGoals] = useState([]);
  const [dietPlan, setDietPlan] = useState(null);
  const [logHistory, setLogHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newGoal, setNewGoal] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [chartPeriod, setChartPeriod] = useState(30);
  const [showLogForm, setShowLogForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [logForm, setLogForm] = useState({ waterIntake: '', exerciseMinutes: '', weight: '' });


  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Call your API
        const data = await getCustomerProfile();
        setCustomer(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => { fetchDashboardData(); }, [chartPeriod, clientId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (clientId) {
        const peekData = await getClientDashboardStats(clientId, chartPeriod);
        setSummary(peekData.summary);
        setTodayLog(peekData.todayLog || peekData.summary?.todayLog || null);
        setGoals(peekData.goals || []);
        setLogHistory(peekData.logs || []);
        setAppointments(peekData.appointments || []);
        setDietPlan(peekData.activeDiet || peekData.summary?.activeDiet || null);
      } else {
        const [summaryData, todayData, goalsData, logsData, appointmentsData] = await Promise.all([
          getsammury(),
          getlogtoday().catch(() => ({ log: null })),
          getGoal().catch(() => ({ goals: [] })),
          getlogs(chartPeriod).catch(() => ({ logs: [] })),
          getCustomerAppointments().catch(() => ({ appointments: [] }))
        ]);
        setSummary(summaryData.summary);
        setTodayLog(todayData.log || summaryData.summary?.todayLog || null);
        setGoals(goalsData.goals || []);
        setLogHistory(logsData.logs || []);
        setAppointments(appointmentsData.appointments || []);
        try {
          const dietData = await getdite();
          setDietPlan(dietData.diets?.[0] || summaryData.summary?.activeDiet || null);
        } catch {
          setDietPlan(summaryData.summary?.activeDiet || null);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalDone = async (goalId) => {
    try {
      const result = await goalDone({ goal_id: goalId });
      if (result.goals) setGoals(result.goals);
      else fetchDashboardData();
    } catch (error) { console.error(error); }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const result = await deleteGoal(goalId);
      if (result.goals) setGoals(result.goals);
      else fetchDashboardData();
    } catch (error) { console.error(error); }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    try {
      const result = await creategoal({ data: newGoal });
      setNewGoal('');
      setShowGoalInput(false);
      if (result.goals) setGoals(result.goals);
      else fetchDashboardData();
    } catch (error) { console.error(error); }
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
    } catch (error) { console.error(error); }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return 'Unknown';
    const b = parseFloat(bmi);
    if (b < 18.5) return 'Underweight';
    if (b < 25) return 'Normal';
    if (b < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIData = (category) => ({
    'Underweight': { color: '#60a5fa', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', pct: 20 },
    'Normal': { color: '#34d399', gradient: 'linear-gradient(135deg, #10b981, #34d399)', pct: 45 },
    'Overweight': { color: '#fbbf24', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', pct: 68 },
    'Obese': { color: '#f87171', gradient: 'linear-gradient(135deg, #ef4444, #f87171)', pct: 88 },
  }[category] || { color: '#94a3b8', gradient: 'linear-gradient(135deg, #64748b, #94a3b8)', pct: 0 });

  if (loading) {
    return (
      <div className="db-loading">
        {!clientId && <Navbar isLogin={true} onLogout={() => { }} />}
        <div className="db-loading__inner">
          <div className="db-loader">
            <div className="db-loader__ring"></div>
            <div className="db-loader__ring db-loader__ring--2"></div>
            <div className="db-loader__dot"></div>
          </div>
          <p className="db-loading__text">Loading your health data</p>
          <span className="db-loading__sub">Fetching the latest metrics...</span>
        </div>
      </div>
    );
  }

  const profile = summary?.profile || {};
  const weightProgress = summary?.weightProgress || {};
  const goalsSummary = summary?.goalsSummary || {};
  const activeDiet = dietPlan || summary?.activeDiet;
  const currentWeight = weightProgress.current || profile.currentWeight || 0;
  const targetWeight = weightProgress.target || profile.targetWeight || 0;
  const originalWeight = weightProgress.original || currentWeight;
  const remaining = Math.abs(weightProgress.remaining || (currentWeight - targetWeight));
  const bmi = calculateBMI(currentWeight, profile.height);
  const bmiCategory = getBMICategory(bmi);
  const bmiData = getBMIData(bmiCategory);
  const weightPct = Math.min(Math.max(((originalWeight - currentWeight) / (originalWeight - targetWeight)) * 100, 0), 100);
  const username = profile.user?.username || 'User';
  const initial = username.charAt(0).toUpperCase();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '◈' },
    { id: 'activity', label: 'Activity', icon: '◎' },
    { id: 'goals', label: 'Goals', icon: '◇' },
    { id: 'diet', label: 'Diet', icon: '◉' },
  ];

  return (
    <div className="db-root">
      {/* {!clientId && <Navbar isLogin={true} onLogout={() => {}} />} */}

      {/* Ambient Background */}
      <div className="db-ambient">
        <div className="db-ambient__orb db-ambient__orb--1"></div>
        <div className="db-ambient__orb db-ambient__orb--2"></div>
        <div className="db-ambient__orb db-ambient__orb--3"></div>
      </div>

      <div className="db-wrap">

        {/* ── SIDEBAR ── */}
        <aside className="db-sidebar">
          <Link to="/" className="db-sidebar__brand">
            <div className="db-brand-icon">N</div>
            <span className="db-brand-name">Nutrlink</span>
          </Link>

          <div className="db-profile-block">
            <div className="db-profile-avatar">
              <img src={user.profilePic} alt="Profile picture" className='h-100%' />
            </div>
            <div className="db-profile-meta">
              <h3 className="db-profile-name">{user.username}</h3>
              <span className="db-profile-role">{clientId ? 'Client Profile' : 'My Dashboard'}</span>
            </div>
            {profile.gender && (
              <div className={`db-gender-pill db-gender-pill--${profile.gender.toLowerCase()}`}>
                {profile.gender === 'Male' ? '♂' : '♀'}
              </div>
            )}
          </div>

          <nav className="db-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`db-nav__item ${activeTab === tab.id ? 'db-nav__item--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="db-nav__icon">{tab.icon}</span>
                <span className="db-nav__label">{tab.label}</span>
                {activeTab === tab.id && <div className="db-nav__indicator"></div>}
              </button>
            ))}
          </nav>

          {/* Quick Stats in sidebar */}
          <div className="db-sidebar__stats">
            <div className="db-quick-stat">
              <span className="db-quick-stat__label">Age</span>
              <span className="db-quick-stat__val">{customer.age || '—'}<small> yr</small></span>
            </div>
            <div className="db-quick-stat">
              <span className="db-quick-stat__label">Height</span>
              <span className="db-quick-stat__val">{customer.height || '—'}<small> cm</small></span>
            </div>
            <div className="db-quick-stat">
              <span className="db-quick-stat__label">Target</span>
              <span className="db-quick-stat__val">{customer.targetWeight || '—'}<small> kg</small></span>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="db-main">

          {/* ── HEADER BAR ── */}
          <header className="db-topbar">
            <div className="db-topbar__left">
              <h1 className="db-topbar__title">
                {activeTab === 'overview' && 'Health Overview'}
                {activeTab === 'activity' && 'Activity Log'}
                {activeTab === 'goals' && 'My Goals'}
                {activeTab === 'diet' && 'Diet Plan'}
              </h1>
              <p className="db-topbar__date">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {!clientId && activeTab === 'activity' && (
              <button className="db-cta-btn" onClick={() => setShowLogForm(true)}>
                <span>+</span> Log Today
              </button>
            )}
            {!clientId && activeTab === 'goals' && (
              <button className="db-cta-btn" onClick={() => setShowGoalInput(!showGoalInput)}>
                <span>+</span> Add Goal
              </button>
            )}
          </header>

          {/* ════════════════════════════════
               OVERVIEW TAB
          ════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="db-content db-content--overview">

              {/* Weight + BMI Row */}
              <div className="db-row db-row--hero">

                {/* Weight Journey Card */}
                <div className="db-card db-card--weight">
                  <div className="db-card__label">Weight Journey</div>
                  <div className="db-weight-hero">
                    <div className="db-weight-big">
                      <span className="db-weight-num">{currentWeight}</span>
                      <span className="db-weight-unit">kg</span>
                    </div>
                    <div className="db-weight-arrow">→</div>
                    <div className="db-weight-big db-weight-big--target">
                      <span className="db-weight-num">{targetWeight}</span>
                      <span className="db-weight-unit">kg goal</span>
                    </div>
                  </div>
                  <div className="db-weight-track">
                    <div className="db-weight-track__bar">
                      <div className="db-weight-track__fill" style={{ width: `${weightPct}%` }}></div>
                      <div className="db-weight-track__thumb" style={{ left: `${weightPct}%` }}></div>
                    </div>
                    <div className="db-weight-track__info">
                      <span>{weightPct.toFixed(0)}% to goal</span>
                      <span>{remaining.toFixed(1)} kg remaining </span>
                    </div>
                  </div>
                </div>

                {/* BMI Card */}
                <div className="db-card db-card--bmi" style={{ '--bmi-color': bmiData.color, '--bmi-gradient': bmiData.gradient }}>
                  <div className="db-card__label">BMI Index</div>
                  <div className="db-bmi-ring">
                    <svg viewBox="0 0 120 120" className="db-bmi-svg">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke="url(#bmiGrad)" strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(bmiData.pct / 100) * 314} 314`}
                        transform="rotate(-90 60 60)"
                      />
                      <defs>
                        <linearGradient id="bmiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={bmiData.color} stopOpacity="0.6" />
                          <stop offset="100%" stopColor={bmiData.color} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="db-bmi-center">
                      <span className="db-bmi-value">{bmi || '—'}</span>
                      <span className="db-bmi-cat">{bmiCategory}</span>
                    </div>
                  </div>
                  <div className="db-bmi-scale">
                    {['Underweight', 'Normal', 'Overweight', 'Obese'].map(c => (
                      <div key={c} className={`db-bmi-scale__seg ${bmiCategory === c ? 'db-bmi-scale__seg--active' : ''}`}>
                        <div className="db-bmi-scale__dot"></div>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="db-kpi-row">
                {[
                  { icon: '💧', label: "Today's Water", value: todayLog?.waterIntake || '—', unit: 'ml', color: '#60a5fa' },
                  { icon: '🏃', label: 'Exercise', value: todayLog?.exerciseMinutes || '—', unit: 'min', color: '#fbbf24' },
                  { icon: '🎯', label: 'Goals Done', value: goalsSummary.done || 0, unit: `/ ${goalsSummary.total || 0}`, color: '#34d399' },
                  { icon: '📅', label: 'Next Appt', value: appointments[0] ? new Date(appointments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None', unit: '', color: '#c084fc' },
                ].map((kpi, i) => (
                  <div className="db-kpi" key={i} style={{ '--kpi-color': kpi.color }}>
                    <div className="db-kpi__icon">{kpi.icon}</div>
                    <div className="db-kpi__body">
                      <span className="db-kpi__label">{kpi.label}</span>
                      <div className="db-kpi__val-row">
                        <span className="db-kpi__val">{kpi.value}</span>
                        <span className="db-kpi__unit">{kpi.unit}</span>
                      </div>
                    </div>
                    <div className="db-kpi__glow"></div>
                  </div>
                ))}
              </div>

              {/* Next Appointment */}
              {/* Upcoming Appointments */}
              {appointments.length > 0 && (
                <div className="db-card db-card--appt">
                  <div className="db-card__label">Upcoming Appointments</div>

                  {/* Container for the list to add spacing between items if needed */}
                  <div className="db-appt-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {appointments
                      // 1. Filter out canceled appointments first
                      .filter(appt => appt.status?.toLowerCase() !== 'canceled' && appt.status?.toLowerCase() !== 'cancelled')
                      // 2. Then take the next 3 upcoming
                      .slice(0, 3)
                      .map((appt) => {
                        // 3. Apply your robust role logic
                        const isNutri = user.role === 'nutritionist';
                        const targetUser = isNutri ? appt.customerId : appt.nutritionistId;
                        const title = isNutri ? "" : "Dr. ";

                        return (
                          <div className="db-appt" key={appt._id}>
                            <div className="db-appt__avatar">
                              {/* 4. Apply your image fallback logic */}
                              {targetUser?.profilePic ? (
                                <img src={targetUser.profilePic} alt={targetUser?.username} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', borderRadius: '50%', fontWeight: 'bold' }}>
                                  {targetUser?.username?.charAt(0).toUpperCase() || "N"}
                                </div>
                              )}
                            </div>
                            <div className="db-appt__info">
                              <h4>{title}{targetUser?.username || 'Nutritionist'}</h4>
                              <div className="db-appt__meta">
                                <span className="db-appt__date">
                                  📅 {new Date(appt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="db-appt__time">🕐 {appt.timeSlot || 'Time TBD'}</span>
                              </div>
                            </div>
                            <span className={`db-status-pill db-status-pill--${(appt.status || 'booked').toLowerCase()}`}>
                              {appt.status || 'Booked'}
                            </span>
                          </div>
                        );
                      })}
                  </div>

                </div>
              )}

              {/* Active Diet Preview */}
              {activeDiet && (
                <div className="db-card db-card--diet-preview">
                  <div className="db-card__label">Active Diet Plan</div>
                  <div className="db-diet-preview">
                    <div className="db-diet-preview__by">
                      <div className="db-diet-avatar">
                        {activeDiet.nutritionistId?.username?.charAt(0).toUpperCase() || 'N'}
                      </div>
                      <div>
                        <p className="db-diet-nut">{activeDiet.nutritionistId?.username || 'Nutritionist'}</p>
                        <span className={`db-status-pill db-status-pill--${activeDiet.status}`}>{activeDiet.status}</span>
                      </div>
                    </div>
                    <div className="db-diet-meals-preview">
                      {activeDiet.meals?.filter(m => {
                        const mealDate = new Date(m.date);
                        const today = new Date();
                        return mealDate.setUTCHours(0, 0, 0, 0) === today.setUTCHours(0, 0, 0, 0);
                      }).slice(0, 3).map(meal => (
                        <div key={meal._id} className="db-meal-chip">
                          <span className="db-meal-chip__type">{meal.type}</span>
                          <span className="db-meal-chip__name">{meal.name}</span>
                          <span className="db-meal-chip__cal">{meal.calories} kcal</span>
                        </div>
                      ))}
                      {!activeDiet.meals?.some(m => {
                        const today = new Date();
                        return new Date(m.date).setUTCHours(0, 0, 0, 0) === today.setUTCHours(0, 0, 0, 0);
                      }) && <p className="db-empty">No meals scheduled for today</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════
               ACTIVITY TAB
          ════════════════════════════════ */}
          {activeTab === 'activity' && (
            <div className="db-content">

              {/* Log Form Modal */}
              {showLogForm && !clientId && (
                <div className="db-modal-overlay" onClick={() => setShowLogForm(false)}>
                  <div className="db-modal" onClick={e => e.stopPropagation()}>
                    <div className="db-modal__header">
                      <h3>Log Today's Activity</h3>
                      <button className="db-modal__close" onClick={() => setShowLogForm(false)}>✕</button>
                    </div>
                    <form className="db-log-form" onSubmit={handleCreateLog}>
                      {[
                        { key: 'waterIntake', label: 'Water Intake', icon: '💧', unit: 'ml', step: '1' },
                        { key: 'exerciseMinutes', label: 'Exercise Duration', icon: '🏃', unit: 'minutes', step: '1' },
                        { key: 'weight', label: 'Body Weight', icon: '⚖️', unit: 'kg', step: '0.1' },
                      ].map(field => (
                        <div className="db-field" key={field.key}>
                          <label className="db-field__label">{field.icon} {field.label}</label>
                          <div className="db-field__wrap">
                            <input
                              type="number" step={field.step}
                              className="db-field__input"
                              placeholder="0"
                              value={logForm[field.key]}
                              onChange={e => setLogForm({ ...logForm, [field.key]: e.target.value })}
                              required
                            />
                            <span className="db-field__unit">{field.unit}</span>
                          </div>
                        </div>
                      ))}
                      <div className="db-form-actions">
                        <button type="submit" className="db-btn db-btn--primary">Save Log</button>
                        <button type="button" className="db-btn db-btn--ghost" onClick={() => setShowLogForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Today's Stats */}
              <div className="db-card">
                <div className="db-card__label">Today's Activity</div>
                {todayLog ? (
                  <div className="db-today-grid">
                    {[
                      { icon: '💧', label: 'Water', value: todayLog.waterIntake, unit: 'ml', max: 3000, color: '#60a5fa' },
                      { icon: '🏃', label: 'Exercise', value: todayLog.exerciseMinutes, unit: 'min', max: 120, color: '#fbbf24' },
                      { icon: '⚖️', label: 'Weight', value: todayLog.weight, unit: 'kg', max: 150, color: '#34d399' },
                    ].map((item, i) => (
                      <div className="db-today-item" key={i} style={{ '--item-color': item.color }}>
                        <div className="db-today-item__top">
                          <span className="db-today-item__icon">{item.icon}</span>
                          <span className="db-today-item__val">{item.value}<small> {item.unit}</small></span>
                        </div>
                        <div className="db-today-item__label">{item.label}</div>
                        <div className="db-today-item__bar">
                          <div className="db-today-item__fill" style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="db-empty-state">
                    <div className="db-empty-state__icon">📋</div>
                    <p>No activity logged today</p>
                    {!clientId && <button className="db-btn db-btn--primary" onClick={() => setShowLogForm(true)}>Log Now</button>}
                  </div>
                )}
              </div>

              {/* Chart */}
              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card__label" style={{ marginBottom: 0 }}>Progress History</div>
                  <div className="db-period-tabs">
                    {[7, 14, 30, 'monthly'].map(p => (
                      <button key={p} className={`db-period-tab ${chartPeriod === p ? 'db-period-tab--active' : ''}`} onClick={() => setChartPeriod(p)}>
                        {p === 'monthly' ? 'Monthly' : `${p}d`}
                      </button>
                    ))}
                  </div>
                </div>

                {logHistory.length > 0 ? (
                  <div className="db-chart-wrap">
                    <div className="db-chart">
                      {(() => {
                        const logs = (chartPeriod === 'monthly' ? logHistory : logHistory.slice(0, chartPeriod)).slice().reverse();
                        const maxW = Math.max(...logs.map(l => l.waterIntake || 0), 2000);
                        const maxE = Math.max(...logs.map(l => l.exerciseMinutes || 0), 60);
                        const weights = logs.map(l => l.weight || 0).filter(w => w > 0);
                        const maxWt = weights.length ? Math.max(...weights) : 100;
                        const minWt = weights.length ? Math.min(...weights) : 50;
                        const wtRange = maxWt - minWt || 10;
                        return logs.map((log, i) => {
                          const wH = ((log.waterIntake || 0) / maxW) * 100;
                          const eH = ((log.exerciseMinutes || 0) / maxE) * 100;
                          const wtH = log.weight ? ((log.weight - minWt) / wtRange) * 100 : 5;
                          const dateLabel = new Date(log.date).toLocaleDateString('en-US', chartPeriod === 'monthly' ? { month: 'short' } : { month: 'short', day: 'numeric' });
                          return (
                            <div className="db-chart__group" key={log._id || i}>
                              <div className="db-chart__bars">
                                <div className="db-chart__bar db-chart__bar--water" style={{ height: `${Math.max(wH, 4)}%` }} title={`Water: ${log.waterIntake || 0}ml`}>
                                  <span className="db-chart__bar-tip">{log.waterIntake || 0}</span>
                                </div>
                                <div className="db-chart__bar db-chart__bar--exercise" style={{ height: `${Math.max(eH, 4)}%` }} title={`Exercise: ${log.exerciseMinutes || 0}min`}>
                                  <span className="db-chart__bar-tip">{log.exerciseMinutes || 0}</span>
                                </div>
                                <div className="db-chart__bar db-chart__bar--weight" style={{ height: `${Math.max(wtH, 4)}%` }} title={`Weight: ${log.weight || '?'}kg`}>
                                  <span className="db-chart__bar-tip">{log.weight || '?'}</span>
                                </div>
                              </div>
                              <span className="db-chart__label">{dateLabel}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="db-legend">
                      {[['--water', '💧 Water (ml)'], ['--exercise', '🏃 Exercise (min)'], ['--weight', '⚖️ Weight (kg)']].map(([cls, lbl]) => (
                        <div className="db-legend__item" key={cls}>
                          <div className={`db-legend__dot db-legend__dot${cls}`}></div>
                          <span>{lbl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="db-empty-state">
                    <div className="db-empty-state__icon">📊</div>
                    <p>No history available yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════
               GOALS TAB
          ════════════════════════════════ */}
          {activeTab === 'goals' && (
            <div className="db-content">
              {/* Stats bar */}
              <div className="db-goals-stats">
                {[
                  { label: 'Total', val: goalsSummary.total || 0, color: '#94a3b8' },
                  { label: 'Completed', val: goalsSummary.done || 0, color: '#34d399' },
                  { label: 'Pending', val: goalsSummary.pending || 0, color: '#fbbf24' },
                ].map((s, i) => (
                  <div className="db-goals-stat" key={i} style={{ '--s-color': s.color }}>
                    <span className="db-goals-stat__val">{s.val}</span>
                    <span className="db-goals-stat__label">{s.label}</span>
                  </div>
                ))}
                {goalsSummary.total > 0 && (
                  <div className="db-goals-progress">
                    <div className="db-goals-progress__fill" style={{ width: `${((goalsSummary.done || 0) / goalsSummary.total) * 100}%` }}></div>
                  </div>
                )}
              </div>

              {/* Add goal form */}
              {showGoalInput && !clientId && (
                <div className="db-card db-card--form">
                  <form onSubmit={handleCreateGoal} className="db-goal-form">
                    <input
                      type="text"
                      className="db-goal-input"
                      placeholder="Describe your goal..."
                      value={newGoal}
                      onChange={e => setNewGoal(e.target.value)}
                    />
                    <div className="db-form-actions">
                      <button type="submit" className="db-btn db-btn--primary">Add Goal</button>
                      <button type="button" className="db-btn db-btn--ghost" onClick={() => setShowGoalInput(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Goals list */}
              <div className="db-goals-list">
                {goals.length === 0 ? (
                  <div className="db-empty-state">
                    <div className="db-empty-state__icon">🎯</div>
                    <p>No goals set yet</p>
                    {!clientId && <button className="db-btn db-btn--primary" onClick={() => setShowGoalInput(true)}>Add First Goal</button>}
                  </div>
                ) : goals.map(goal => (
                  <div key={goal._id} className={`db-goal-item ${goal.status === 'done' ? 'db-goal-item--done' : ''}`}>
                    <div className="db-goal-item__check">
                      {goal.status === 'done' ? '✓' : '○'}
                    </div>
                    <div className="db-goal-item__body">
                      <span className="db-goal-item__text">{goal.data}</span>
                      <span className={`db-status-pill db-status-pill--${goal.status}`}>{goal.status}</span>
                    </div>
                    {!clientId && (
                      <div className="db-goal-item__actions">
                        {goal.status !== 'done' && (
                          <button className="db-icon-btn db-icon-btn--success" onClick={() => handleGoalDone(goal._id)} title="Mark done">✓</button>
                        )}
                        <button className="db-icon-btn db-icon-btn--danger" onClick={() => handleDeleteGoal(goal._id)} title="Delete">✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════
               DIET TAB
          ════════════════════════════════ */}
          {activeTab === 'diet' && (
            <div className="db-content">
              {activeDiet ? (
                <>
                  <div className="db-card db-card--diet-header">
                    <div className="db-diet-header">
                      <div className="db-diet-avatar-lg">
                        {activeDiet.nutritionistId?.username?.charAt(0).toUpperCase() || 'N'}
                      </div>
                      <div className="db-diet-header__info">
                        <div className="db-card__label" style={{ marginBottom: '0.25rem' }}>Assigned by</div>
                        <h3>{activeDiet.nutritionistId?.username || 'Nutritionist'}</h3>
                        <span className={`db-status-pill db-status-pill--${activeDiet.status}`}>{activeDiet.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="db-meals-grid">
                    {activeDiet.meals?.map(meal => (
                      <div key={meal._id} className="db-meal-card">
                        <div className="db-meal-card__top">
                          <span className="db-meal-type-badge">{meal.type}</span>
                          <span className="db-meal-cal">{meal.calories} kcal</span>
                        </div>
                        <h4 className="db-meal-name">{meal.name}</h4>
                        {meal.description && <p className="db-meal-desc">{meal.description}</p>}
                        <div className="db-meal-card__footer">
                          <span className="db-meal-date">{new Date(meal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          {meal.completed && <span className="db-meal-done">✓ Completed</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="db-empty-state db-empty-state--lg">
                  <div className="db-empty-state__icon">🥗</div>
                  <h3>No Diet Plan Active</h3>
                  <p>Your nutritionist hasn't assigned a diet plan yet.</p>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;