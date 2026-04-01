import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../component/Navigationbar/Navbar";
import { getProfile, getProfileById } from "../../api/nutritionist"; 
import { AuthContext } from "../../AuthContext";
import "./NutriProfile.css";

export const NutriProfile = () => {
  const { userId } = useParams();
  const isOwner = !userId;
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // If no ID in URL, get "me". Otherwise, get the specific ID.
        const p = isOwner ? await getProfile() : await getProfileById(userId);
        
        if (!p) setNoProfile(true);
        else setData(p);
      } catch (err) {
        setNoProfile(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, isOwner]);

  if (loading) return <div className="np-loader">Loading...</div>;

  // Show "Create Profile" only if it's YOUR account and you don't have one
  if (noProfile && isOwner) {
    return (
      <div className="np-layout">
        <Navbar />
        <div className="np-empty-card">
          <h2>No Profile Yet</h2>
          <button onClick={() => navigate("/creatNprofile")}>Create Professional Profile</button>
        </div>
      </div>
    );
  }

  // --- RECOVERY LOGIC ---
  // We use "profile" to avoid confusion with the logged-in "authUSer"
  const profile = data || {};
  const targetUser = profile.user || {}; 

  return (
    <div className="np-layout">
      <Navbar />

      <div className="np-master-wrapper">
        {/* 1. FIXED COVER: Use a reliable link. Canva links break constantly. */}
        <div className="np-cover">
          <img
            src="https://marketplace.canva.com/EAEB97jvqIY/5/0/1600w/canva-blue-and-pink-classy-photo-cherry-blossom-inspirational-quotes-facebook-cover-vpnA8PdWGCs.jpg"
            alt="Cover"
          />
        </div>

        <div className="np-header-overlap">
          <div className="np-avatar-container">
            {/* 2. FIXED AVATAR: Use the fetched profile pic first */}
            {targetUser?.profilePic ? (
              <img src={targetUser?.profilePic} alt="Profile" />
            ) : (
              <div className="np-avatar-fallback">
                {targetUser?.username?.charAt(0)?.toUpperCase() || "N"}
              </div>
            )}
          </div>

          <div className="np-header-info">
            <h1>Dr. {targetUser?.username || "Nutritionist"}</h1>
            <p className="np-header-subtitle">{profile.cardBio || "Certified Nutritionist"}</p>
            
            <div className="np-header-badges">
              <span className="np-badge">⭐ {profile.rating || "5.0"}</span>
              <span className="np-badge">✉️ {targetUser?.email}</span>
            </div>
          </div>

          <div className="np-header-actions">
            {/* 3. FIXED BUTTON: Only show Edit for the owner */}
            {isOwner && (
              <button className="np-btn-primary" onClick={() => navigate("/updateprofile")}>
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="np-body-grid">
          <aside className="np-sidebar">
            <div className="np-modern-card">
              <h3>At a Glance</h3>
              <ul className="np-spec-list">
                <li>💰 Rate: ${profile.price || 0}/hr</li>
                <li>🏆 Experience: {profile.yearsOfExperience || 0} yrs</li>
                <li>👥 Clients: {profile.clientServed || 0}+</li>
              </ul>
            </div>
          </aside>

          <main className="np-main">
            <div className="np-modern-card">
              <h3>📝 About Me</h3>
              {/* Show placeholder if bio is empty to prevent design from collapsing */}
              <p className="np-bio-text">{profile.bio || "This professional hasn't written a bio yet."}</p>
            </div>

            <div className="np-modern-card">
              <h3>🎯 Specializations</h3>
              <div className="np-tag-cloud">
                {profile.specialization?.length > 0 ? (
                  profile.specialization.map((s, i) => <span key={i} className="np-tag">{s}</span>)
                ) : (
                  <span>General Health</span>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};