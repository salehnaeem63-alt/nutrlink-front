import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api/customerapi";
import "./profile.css";
import Navbar from "../component/Navbar";

export const Profile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function profileData() {
      try {
        const p = await getProfile();
        if (!p) {
          setNoProfile(true);
        } else {
          setData(p);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    profileData();
  }, []);

  if (loading) {
    return (
      <div className="profile-loader">
        <div className="loader-spinner" />
        <p>Loading profile…</p>
      </div>
    );
  }

  /* ── NO PROFILE STATE ── */
  if (noProfile) {
    return (
        
      <div className="profile-page">
        <div className="profile-container">

          <div className="page-title"> 
              <Navbar></Navbar>
            <h1>My Profile</h1>
            <p>View your personal health information</p>
          </div>

          <div className="card no-profile-card">
            <div className="no-profile-icon">🧍</div>
            <h2 className="no-profile-title">No Profile Yet</h2>
            <p className="no-profile-desc">
              You haven't set up your health profile yet. Create one to start
              tracking your weight, BMI, and nutrition goals.
            </p>

            <div className="no-profile-features">
              <div className="no-profile-feature">
                <span className="nf-icon">⚖️</span>
                <span>Track your weight journey</span>
              </div>
              <div className="no-profile-feature">
                <span className="nf-icon">📊</span>
                <span>Monitor your BMI</span>
              </div>
              <div className="no-profile-feature">
                <span className="nf-icon">🎯</span>
                <span>Set personalized health goals</span>
              </div>
            </div>

            <button
              className="no-profile-btn"
              onClick={() => navigate("/createprofile")}
            >
              Create Profile
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="profile-error">
        <span>⚠️</span> Failed to load profile.
      </div>
    );
  }

  const { user, age, gender, height, currentWeight, targetWeight, allergies } = data;

  const bmi = (currentWeight / ((height / 100) ** 2)).toFixed(1);
  const getBmiInfo = (b) => {
    const val = parseFloat(b);
    if (val < 18.5) return { label: "Underweight", color: "#3b82f6" };
    if (val < 25)   return { label: "Normal",      color: "#22c55e" };
    if (val < 30)   return { label: "Overweight",  color: "#f59e0b" };
    return               { label: "Obese",         color: "#ef4444" };
  };
  const bmiInfo = getBmiInfo(bmi);

  const weightDiff = currentWeight - targetWeight;
  const progressPct = weightDiff > 0
    ? Math.max(4, Math.min(96, ((0) / weightDiff) * 100))
    : 100;
const ctaClick=()=>{
  navigate("/updateprofile")}
  return (
    <><Navbar ctaLabel="update profile"onCtaClick={ctaClick}></Navbar>
    
    <div className="profile-page">
         

      <div className="profile-container">

        <div className="page-title">
          <h1>My Profile</h1>
          <p>View your personal health information</p>
        </div>

        <div className="card hero-card">
          <div className="hero-avatar">
            <span>{user.username.charAt(0).toUpperCase()}</span>
          </div>
          <div className="hero-details">
            <h2 className="hero-name">{user.username}</h2>
            <p className="hero-email">{user.email}</p>
            <span className={`badge badge--${gender.toLowerCase()}`}>
              {gender === "Male" ? "♂" : "♀"}&nbsp;{gender}
            </span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-icon">🎂</div>
            <span className="stat-label">Age</span>
            <span className="stat-value">{age}</span>
            <span className="stat-unit">years</span>
          </div>
          <div className="card stat-card">
            <div className="stat-icon">📏</div>
            <span className="stat-label">Height</span>
            <span className="stat-value">{height}</span>
            <span className="stat-unit">cm</span>
          </div>
          <div className="card stat-card">
            <div className="stat-icon">⚖️</div>
            <span className="stat-label">Current Weight</span>
            <span className="stat-value">{currentWeight}</span>
            <span className="stat-unit">kg</span>
          </div>
          <div className="card stat-card stat-card--green">
            <div className="stat-icon">🎯</div>
            <span className="stat-label">Target Weight</span>
            <span className="stat-value">{targetWeight}</span>
            <span className="stat-unit">kg</span>
          </div>
        </div>

        <div className="bottom-row">
          <div className="card bmi-card">
            <h3 className="card-title">BMI</h3>
            <div className="bmi-score" style={{ color: bmiInfo.color }}>{bmi}</div>
            <span className="bmi-label" style={{ color: bmiInfo.color }}>{bmiInfo.label}</span>
            <div className="bmi-bar-track">
              <div
                className="bmi-bar-fill"
                style={{
                  width: `${Math.min(100, ((parseFloat(bmi) - 10) / 30) * 100)}%`,
                  backgroundColor: bmiInfo.color,
                }}
              />
            </div>
            <div className="bmi-scale-labels">
              <span>Thin</span>
              <span>Normal</span>
              <span>Heavy</span>
            </div>
          </div>

          <div className="card journey-card">
            <h3 className="card-title">Weight Journey</h3>
            <div className="journey-numbers">
              <div className="journey-num">
                <span className="journey-num-value">{currentWeight}</span>
                <span className="journey-num-label">Current (kg)</span>
              </div>
              <div className="journey-arrow">→</div>
              <div className="journey-num journey-num--target">
                <span className="journey-num-value">{targetWeight}</span>
                <span className="journey-num-label">Target (kg)</span>
              </div>
            </div>
            <div className="journey-track">
              <div className="journey-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="journey-note">
              {weightDiff > 0
                ? `${weightDiff} kg remaining to reach your goal`
                : weightDiff < 0
                ? `Gain ${Math.abs(weightDiff)} kg to reach your goal`
                : "🎉 You've reached your target weight!"}
            </p>
          </div>
        </div>

        {allergies && allergies.length > 0 && (
          <div className="card allergies-card">
            <h3 className="card-title">⚠️ Allergies &amp; Restrictions</h3>
            <div className="allergies-list">
              {allergies.map((a, i) => (
                <span key={i} className="allergy-tag">{a}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
};