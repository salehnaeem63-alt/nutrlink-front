import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { getGoal, creategoal, goalDone, deleteGoal } from '../api/customerapi';
import Navbar from '../component/Navbar';

const Dashboard = () => {
  const [goals, setGoals]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [newGoal, setNewGoal]       = useState('');
  const [filter, setFilter]         = useState('all');
  const [loadingId, setLoadingId]   = useState(null);

  /* ── Fetch all goals ──
     Backend returns: { goals: [ { _id, data, status }, ... ] }
     status is either "done" or undefined/pending
  ── */
  const fetchGoals = async () => {
    try {
      const res = await getGoal();
      setGoals(res.goals ?? []);
    } catch (err) {
      console.error('fetchGoals error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  /* ── Create goal ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setSubmitting(true);
    try {
      await creategoal({ data: newGoal.trim() });
      setNewGoal('');
      setShowForm(false);
      await fetchGoals();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Mark as done ──
     Backend expects body: { goal_id: "..." }
     It sets goals.$.status = "done"
  ── */
  const handleDone = async (goal_id) => {
    setLoadingId(goal_id);
    try {
      await goalDone({ goal_id });
      await fetchGoals();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  /* ── Delete goal ──
     Backend expects goal_id as URL param: /goal/:goal_id
  ── */
  const handleDelete = async (goal_id) => {
    if (!window.confirm('Delete this goal?')) return;
    setLoadingId(goal_id);
    try {
      await deleteGoal(goal_id);
      await fetchGoals();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  /* ── Filter using status field from backend ── */
  const isDone = (g) => g.status === 'done';

  const filtered = goals.filter(g => {
    if (filter === 'pending') return !isDone(g);
    if (filter === 'done')    return  isDone(g);
    return true;
  });

  const doneCount    = goals.filter(g =>  isDone(g)).length;
  const pendingCount = goals.filter(g => !isDone(g)).length;

  return (
    <><Navbar></Navbar>
    <div className="db-page">
      <div className="db-container">

        {/* ── Page Title ── */}
        <div className="db-title-row">
          <div>
            <h1 className="db-title">My Goals</h1>
            <p className="db-subtitle">Track and manage your health goals</p>
          </div>
          <button className="db-add-btn" onClick={() => setShowForm(s => !s)}>
            {showForm ? '✕ Cancel' : '+ New Goal'}
          </button>
        </div>

        {/* ── Create Form ── */}
        {showForm && (
          <div className="db-card db-create-card">
            <h3 className="db-card-title">🎯 Add a New Goal</h3>
            <form onSubmit={handleCreate} className="db-create-form">
              <input
                className="db-input"
                type="text"
                placeholder="e.g. Drink 2L of water daily"
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                autoFocus
                required
              />
              <button type="submit" className="db-submit-btn" disabled={submitting}>
                {submitting
                  ? <span className="db-btn-loading"><span className="db-spinner" /> Saving…</span>
                  : 'Save Goal'}
              </button>
            </form>
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="db-summary-row">
          <div className="db-card db-stat-card">
            <span className="db-stat-icon">📋</span>
            <span className="db-stat-label">Total</span>
            <span className="db-stat-value">{goals.length}</span>
          </div>
          <div className="db-card db-stat-card">
            <span className="db-stat-icon">⏳</span>
            <span className="db-stat-label">Pending</span>
            <span className="db-stat-value db-stat-value--pending">{pendingCount}</span>
          </div>
          <div className="db-card db-stat-card">
            <span className="db-stat-icon">✅</span>
            <span className="db-stat-label">Completed</span>
            <span className="db-stat-value db-stat-value--done">{doneCount}</span>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="db-tabs">
          {['all', 'pending', 'done'].map(tab => (
            <button
              key={tab}
              className={`db-tab ${filter === tab ? 'db-tab--active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Goals List ── */}
        {loading ? (
          <div className="db-loader">
            <div className="db-spinner-lg" />
            <p>Loading goals…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="db-card db-empty">
            <div className="db-empty-icon">🎯</div>
            <h3>No {filter !== 'all' ? filter : ''} goals yet</h3>
            <p>
              {filter === 'done'
                ? 'Complete a goal to see it here.'
                : 'Click "+ New Goal" to get started.'}
            </p>
          </div>
        ) : (
          <div className="db-goals-list">
            {filtered.map(goal => {
              const done     = isDone(goal);
              const isActing = loadingId === goal._id;

              return (
                <div
                  key={goal._id}
                  className={`db-card db-goal-card ${done ? 'db-goal-card--done' : ''}`}
                >
                  {/* Status dot */}
                  <div className={`db-goal-dot ${done ? 'db-goal-dot--done' : 'db-goal-dot--pending'}`} />

                  {/* Goal text */}
                  <p className={`db-goal-text ${done ? 'db-goal-text--done' : ''}`}>
                    {goal.data}
                  </p>

                  {/* Badge */}
                  <span className={`db-badge ${done ? 'db-badge--done' : 'db-badge--pending'}`}>
                    {done ? 'Done' : 'Pending'}
                  </span>

                  {/* Actions */}
                  <div className="db-goal-actions">
                    {!done && (
                      <button
                        className="db-action-btn db-action-btn--done"
                        title="Mark as done"
                        disabled={isActing}
                        onClick={() => handleDone(goal._id)}
                      >
                        {isActing
                          ? <span className="db-spinner db-spinner--dark" />
                          : '✓'}
                      </button>
                    )}
                    <button
                      className="db-action-btn db-action-btn--delete"
                      title="Delete goal"
                      disabled={isActing}
                      onClick={() => handleDelete(goal._id)}
                    >
                      {isActing && done
                        ? <span className="db-spinner db-spinner--dark" />
                        : '🗑'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
    </>
  );
};

export default Dashboard;