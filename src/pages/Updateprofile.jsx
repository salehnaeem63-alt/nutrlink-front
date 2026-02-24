import Navbar from "../component/Navbar";
import FormField from "../component/FormField";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile, getProfile } from "../api/customerapi";
import "./CreateProfile.css"; /* reuses the same CSS — no new file needed */

export const Updateprofile = () => {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    age:           "",
    gender:        "",
    height:        "",
    currentWeight: "",
    targetWeight:  "",
    allergies:     ""
  });

  /* ── Pre-fill the form with the user's existing profile ── */
  useEffect(() => {
    async function loadProfile() {
      try {
        const p = await getProfile();
        if (p) {
          setFormData({
            age:           p.age           ?? "",
            gender:        p.gender        ?? "",
            height:        p.height        ?? "",
            currentWeight: p.currentWeight ?? "",
            targetWeight:  p.targetWeight  ?? "",
            allergies:     Array.isArray(p.allergies)
                             ? p.allergies[0] ?? ""   // select supports one value
                             : p.allergies    ?? ""
          });
        }
      } catch (err) {
        console.error("Could not load profile for pre-fill:", err);
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ── Only send fields that have a value (backend needs at least one) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {};
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== "" && val !== null && val !== undefined) {
        payload[key] = val;
      }
    });

    if (Object.keys(payload).length === 0) {
      alert("Please update at least one field.");
      setLoading(false);
      return;
    }

    try {
      const result = await updateProfile(payload);
      console.log(result);
      alert("Profile updated successfully");
      navigate("/profile");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="cp-page">
        <Navbar />
        <div className="cp-loader">
          <div className="cp-spinner-lg" />
          <p>Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <Navbar />

      <div className="cp-wrapper">
        <div className="cp-card">

          {/* Header */}
          <div className="cp-header">
            <div className="cp-icon">✏️</div>
            <h1 className="cp-title">Update Your Profile</h1>
            <p className="cp-subtitle">Change any field you'd like to update</p>
          </div>

          <form onSubmit={handleSubmit} className="cp-form">

            {/* Row: Age + Gender */}
            <div className="cp-row">
              <div className="cp-field-group">
                <FormField
                  label="Age"
                  id="age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                />
              </div>

              <div className="cp-field-group">
                <label className="cp-label" htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="cp-select"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Height */}
            <FormField
              label="Height (cm)"
              id="height"
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="e.g. 173"
            />

            {/* Row: Current + Target Weight */}
            <div className="cp-row">
              <div className="cp-field-group">
                <FormField
                  label="Current Weight (kg)"
                  id="currentWeight"
                  type="number"
                  name="currentWeight"
                  value={formData.currentWeight}
                  onChange={handleChange}
                  placeholder="e.g. 85"
                />
              </div>
              <div className="cp-field-group">
                <FormField
                  label="Target Weight (kg)"
                  id="targetWeight"
                  type="number"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleChange}
                  placeholder="e.g. 75"
                />
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="cp-label" htmlFor="allergies">Allergies</label>
              <select
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="cp-select"
              >
                <option value="">No allergies</option>
                <option value="peanuts">Peanuts</option>
                <option value="dairy">Dairy</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="cp-actions">
              <button
                type="button"
                className="cp-btn-cancel"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </button>
              <button type="submit" className="cp-btn" disabled={loading}>
                {loading ? (
                  <span className="cp-btn-loading">
                    <span className="cp-spinner" /> Saving…
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};