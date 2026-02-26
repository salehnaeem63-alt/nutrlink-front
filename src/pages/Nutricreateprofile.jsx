import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/Navbar";
import { creatProfile } from "../api/nutritionist";
import "./NutriProfile.css";

const SPECIALIZATIONS = [
  "Weight Loss",
  "Muscle Building",
  "Diabetic Diet",
  "Sports Nutrition",
  "General Health",
];

const LANGUAGES = ["Arabic", "English", "Portuguese", "Spanish", "Russian"];

export const NutriCreateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    specialization: [],
    bio: "",
    cardBio: "",
    yearsOfExperience: "",
    languages: [],
    price: "",
  });

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

    if (formData.specialization.length === 0) {
      alert("Please select at least one specialization.");
      return;
    }

    /* ── Convert number fields from string to number ── */
    const payload = {
      ...formData,
      price:             formData.price             !== "" ? Number(formData.price)             : undefined,
      yearsOfExperience: formData.yearsOfExperience !== "" ? Number(formData.yearsOfExperience) : undefined,
    };

    setLoading(true);
    try {
      await creatProfile(payload);
      navigate("/Nprofile");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="np-page">
      <div className="np-wrapper">
        <div className="np-card">

          <div className="np-header">
            <div className="np-icon">🥗</div>
            <h1 className="np-title">Create Your Profile</h1>
            <p className="np-subtitle">Set up your nutritionist profile to start helping clients</p>
          </div>

          <form onSubmit={handleSubmit} className="np-form">

            {/* Specialization */}
            <div className="np-field">
              <label className="np-label">
                Specialization <span className="np-required">*</span>
              </label>
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
                <label className="np-label" htmlFor="yearsOfExperience">
                  Years of Experience
                </label>
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
                <label className="np-label" htmlFor="price">
                  Price ($/hr)
                </label>
                <input
                  className="np-input"
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  max="500"
                  value={formData.price}
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

            {/* Submit */}
            <button type="submit" className="np-btn" disabled={loading}>
              {loading
                ? <span className="np-btn-loading"><span className="np-spinner" /> Saving…</span>
                : "Create Profile"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};