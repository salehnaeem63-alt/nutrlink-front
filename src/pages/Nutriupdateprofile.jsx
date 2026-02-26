import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/Navbar";
import { getProfile, updateProfile } from "../api/nutritionist";
import "./NutriProfile.css";

const SPECIALIZATIONS = [
  "Weight Loss",
  "Muscle Building",
  "Diabetic Diet",
  "Sports Nutrition",
  "General Health",
];

const LANGUAGES = ["Arabic", "English", "Portuguese", "Spanish", "Russian"];

export const NutriUpdateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    specialization: [],
    bio: "",
    cardBio: "",
    yearsOfExperience: "",
    languages: [],
    price: "",
  });

  /* ── Pre-fill with existing data ── */
  useEffect(() => {
    async function load() {
      try {
        const p = await getProfile();
        if (p) {
          setFormData({
            specialization:    p.specialization    ?? [],
            bio:               p.bio               ?? "",
            cardBio:           p.cardBio           ?? "",
            yearsOfExperience: p.yearsOfExperience ?? "",
            languages:         p.languages         ?? [],
            price:             p.price             != null ? p.price : "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

  const toggleItem = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* Only send fields that have a value — convert number fields from string */
    const numberFields = ["price", "yearsOfExperience"];
    const payload = {};
    Object.entries(formData).forEach(([key, val]) => {
      if (Array.isArray(val) && val.length > 0) {
        payload[key] = val;
      } else if (!Array.isArray(val) && val !== "" && val !== null && val !== undefined) {
        payload[key] = numberFields.includes(key) ? Number(val) : val;
      }
    });

    if (Object.keys(payload).length === 0) {
      alert("Please update at least one field.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(payload);
      navigate("/nutri-profile");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="np-page">
        <Navbar />
        <div className="np-loader">
          <div className="np-spinner-lg" />
          <p>Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="np-page">
      <Navbar />
      <div className="np-wrapper">
        <div className="np-card">

          {/* Header */}
          <div className="np-header">
            <div className="np-icon">✏️</div>
            <h1 className="np-title">Update Your Profile</h1>
            <p className="np-subtitle">Change any field you'd like to update</p>
          </div>

          <form onSubmit={handleSubmit} className="np-form">

            {/* Specialization */}
            <div className="np-field">
              <label className="np-label">Specialization</label>
              <p className="np-hint">Select all that apply</p>
              <div className="np-checkbox-grid">
                {SPECIALIZATIONS.map((s) => (
                  <label
                    key={s}
                    className={`np-checkbox-item ${formData.specialization.includes(s) ? "np-checkbox-item--active" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialization.includes(s)}
                      onChange={() => toggleItem("specialization", s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="np-field">
              <label className="np-label">Languages</label>
              <div className="np-checkbox-grid">
                {LANGUAGES.map((l) => (
                  <label
                    key={l}
                    className={`np-checkbox-item ${formData.languages.includes(l) ? "np-checkbox-item--active" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(l)}
                      onChange={() => toggleItem("languages", l)}
                    />
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {/* Years of experience + Price */}
            <div className="np-row">
              <div className="np-field">
                <label className="np-label" htmlFor="yearsOfExperience">Years of Experience</label>
                <input
                  className="np-input"
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                />
              </div>
              <div className="np-field">
                <label className="np-label" htmlFor="price">Price ($/hr)</label>
                <input
                  className="np-input"
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  max="500"
                  value={formData.price ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                />
              </div>
            </div>

            {/* Card Bio */}
            <div className="np-field">
              <label className="np-label" htmlFor="cardBio">
                Short Bio <span className="np-char-count">{formData.cardBio.length}/150</span>
              </label>
              <input
                className="np-input"
                id="cardBio"
                name="cardBio"
                type="text"
                maxLength={150}
                value={formData.cardBio}
                onChange={handleChange}
                placeholder="A short intro shown on your public card"
              />
            </div>

            {/* Full Bio */}
            <div className="np-field">
              <label className="np-label" htmlFor="bio">
                Full Bio <span className="np-char-count">{formData.bio.length}/500</span>
              </label>
              <textarea
                className="np-textarea"
                id="bio"
                name="bio"
                maxLength={500}
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell clients about your background, approach, and expertise…"
              />
            </div>

            {/* Buttons */}
            <div className="np-actions">
              <button
                type="button"
                className="np-btn-cancel"
                onClick={() => navigate("/nutri-profile")}
              >
                Cancel
              </button>
              <button type="submit" className="np-btn" disabled={loading}>
                {loading
                  ? <span className="np-btn-loading"><span className="np-spinner" /> Saving…</span>
                  : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};