import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/Navbar";
import { getProfile } from "../api/nutritionist";
import "./NutriProfile.css";

export const NutriProfile = () => {
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const p = await getProfile();
        if (!p) setNoProfile(true);
        else setData(p);
      } catch (err) {
        console.error(err);
        setNoProfile(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="np-page">
        <Navbar />
        <div className="np-loader">
          <div className="np-spinner-lg" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  /* ── No Profile ── */
  if (noProfile) {
    return (
      <div className="np-page">
        <div className="np-view-container">
          <div className="np-page-title">
            <h1>My Profile</h1>
            <p>Your nutritionist profile</p>
          </div>
          <div className="np-card np-empty-card">
            <div className="np-empty-icon">🥗</div>
            <h2 className="np-empty-title">No Profile Yet</h2>
            <p className="np-empty-desc">
              Set up your nutritionist profile so clients can find and book you.
            </p>
            <div className="np-empty-features">
              <div className="np-empty-feature"><span>🎯</span> Showcase your specializations</div>
              <div className="np-empty-feature"><span>💬</span> Share your languages</div>
              <div className="np-empty-feature"><span>⭐</span> Build your reputation</div>
            </div>
            <button className="np-btn" onClick={() => navigate("/creatNprofile")}>
              Create Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    user,
    specialization,
    bio,
    cardBio,
    yearsOfExperience,
    clientServed,
    rating,
    reviewCount,
    languages,
    price,
  } = data;

  return (
    <div className="np-page">
      <Navbar />
      <div className="np-view-container">

        {/* ── Page Title ── */}
        <div className="np-page-title-row">
          <div>
            <h1 className="np-page-title">My Profile</h1>
            <p className="np-page-subtitle">Your nutritionist profile</p>
          </div>
          <button
            className="np-edit-btn"
            onClick={() => navigate("/updateNprofile")}
          >
            ✏️ Edit Profile
          </button>
        </div>

        {/* ── Hero Card ── */}
        <div className="np-card np-hero-card">
          <div className="np-avatar">
            <span>{user?.username?.charAt(0).toUpperCase() ?? "N"}</span>
          </div>
          <div className="np-hero-info">
            <h2 className="np-hero-name">{user?.username}</h2>
            <p className="np-hero-email">{user?.email}</p>
            {cardBio && <p className="np-hero-cardbio">"{cardBio}"</p>}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="np-stats-grid">
          <div className="np-card np-stat-card">
            <span className="np-stat-icon">🏆</span>
            <span className="np-stat-label">Experience</span>
            <span className="np-stat-value">{yearsOfExperience ?? 0}</span>
            <span className="np-stat-unit">years</span>
          </div>
          <div className="np-card np-stat-card">
            <span className="np-stat-icon">👥</span>
            <span className="np-stat-label">Clients Served</span>
            <span className="np-stat-value">{clientServed ?? 0}</span>
            <span className="np-stat-unit">clients</span>
          </div>
          <div className="np-card np-stat-card np-stat-card--green">
            <span className="np-stat-icon">⭐</span>
            <span className="np-stat-label">Rating</span>
            <span className="np-stat-value">{rating?.toFixed(1) ?? "0.0"}</span>
            <span className="np-stat-unit">/ 5 ({reviewCount ?? 0} reviews)</span>
          </div>
          <div className="np-card np-stat-card">
            <span className="np-stat-icon">💰</span>
            <span className="np-stat-label">Price</span>
            <span className="np-stat-value">{price ?? "—"}</span>
            <span className="np-stat-unit">$/hr</span>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="np-bottom-row">

          {/* Specializations */}
          <div className="np-card np-info-card">
            <h3 className="np-info-title">🎯 Specializations</h3>
            <div className="np-tags">
              {specialization?.length > 0
                ? specialization.map((s, i) => (
                    <span key={i} className="np-tag np-tag--green">{s}</span>
                  ))
                : <span className="np-empty-text">Not specified</span>}
            </div>
          </div>

          {/* Languages */}
          <div className="np-card np-info-card">
            <h3 className="np-info-title">💬 Languages</h3>
            <div className="np-tags">
              {languages?.length > 0
                ? languages.map((l, i) => (
                    <span key={i} className="np-tag np-tag--blue">{l}</span>
                  ))
                : <span className="np-empty-text">Not specified</span>}
            </div>
          </div>

        </div>

        {/* ── Full Bio ── */}
        {bio && (
          <div className="np-card np-bio-card">
            <h3 className="np-info-title">📝 About Me</h3>
            <p className="np-bio-text">{bio}</p>
          </div>
        )}

      </div>
    </div>
  );
};