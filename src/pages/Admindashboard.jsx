import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingNutritionists, setPendingNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Track which user is being processed

  useEffect(() => {
    fetchPendingNutritionists();
  }, []);

  const fetchPendingNutritionists = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:5000/nutrlink/api/admin/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch pending nutritionists');
      }

      const data = await res.json();
      setPendingNutritionists(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this nutritionist?')) {
      return;
    }

    try {
      setActionLoading(userId);
      const token = localStorage.getItem('authToken');

      const res = await fetch(`http://localhost:5000/nutrlink/api/admin/approve/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to approve user');
      }

      // Remove from pending list
      setPendingNutritionists((prev) => prev.filter((user) => user._id !== userId));
      alert('Nutritionist approved successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this application? This will revoke their approval.')) {
      return;
    }

    try {
      setActionLoading(userId);
      const token = localStorage.getItem('authToken');

      const res = await fetch(`http://localhost:5000/nutrlink/api/admin/reject/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reject user');
      }

      // Remove from pending list
      setPendingNutritionists((prev) => prev.filter((user) => user._id !== userId));
      alert('Application rejected.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading pending applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchPendingNutritionists} className="admin-retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>🩺 Admin Dashboard</h1>
        <p className="admin-subtitle">Review Nutritionist Applications</p>
      </header>

      {pendingNutritionists.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">✅</div>
          <h2>All caught up!</h2>
          <p>There are no pending nutritionist applications at the moment.</p>
          <button onClick={fetchPendingNutritionists} className="admin-refresh-btn">
            Refresh
          </button>
        </div>
      ) : (
        <div className="admin-applications">
          <div className="admin-count">
            {pendingNutritionists.length} pending application{pendingNutritionists.length !== 1 ? 's' : ''}
          </div>

          <div className="admin-grid">
            {pendingNutritionists.map((user) => (
              <div key={user._id} className="admin-card">
                {/* User Info */}
                <div className="admin-card-header">
                  <img
                    src={user.profilePic}
                    alt={user.username}
                    className="admin-avatar"
                  />
                  <div className="admin-user-info">
                    <h3 className="admin-username">{user.username}</h3>
                    <p className="admin-email">{user.email}</p>
                    <span className="admin-badge">Nutritionist</span>
                  </div>
                </div>

                {/* Credential Image */}
                <div className="admin-credential-section">
                  <label className="admin-credential-label">
                    Credential / Certificate:
                  </label>
                  {user.credentialImage ? (
                    <div className="admin-credential-preview">
                      <img
                        src={user.credentialImage}
                        alt="Credential"
                        className="admin-credential-img"
                        onClick={() => openImageInNewTab(user.credentialImage)}
                      />
                      <button
                        className="admin-view-full-btn"
                        onClick={() => openImageInNewTab(user.credentialImage)}
                      >
                        🔍 View Full Size
                      </button>
                    </div>
                  ) : (
                    <p className="admin-no-credential">No credential uploaded</p>
                  )}
                </div>

                {/* Registration Date */}
                <div className="admin-meta">
                  <span className="admin-date">
                    Applied: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="admin-actions">
                  <button
                    onClick={() => handleApprove(user._id)}
                    disabled={actionLoading === user._id}
                    className="admin-approve-btn"
                  >
                    {actionLoading === user._id ? '...' : '✓ Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(user._id)}
                    disabled={actionLoading === user._id}
                    className="admin-reject-btn"
                  >
                    {actionLoading === user._id ? '...' : '✕ Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;