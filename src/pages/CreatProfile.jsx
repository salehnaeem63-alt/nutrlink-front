import Navbar from "../component/Navbar";
import FormField from "../component/FormField";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { creatProfile } from "../api/customerapi";
import "./createProfile.css";

export const CreatProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    allergies: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await creatProfile(formData);
      console.log(result);
      alert("Profile saved successfully");
      navigate("/profile");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-page">
      <Navbar />

      <div className="cp-wrapper">
        <div className="cp-card">

          {/* Header */}
          <div className="cp-header">
            <div className="cp-icon">👤</div>
            <h1 className="cp-title">Create Your Profile</h1>
            <p className="cp-subtitle">Tell us about yourself so we can personalize your plan</p>
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
                  required
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

            {/* Submit */}
            <button type="submit" className="cp-btn" disabled={loading}>
              {loading ? (
                <span className="cp-btn-loading">
                  <span className="cp-spinner" /> Saving…
                </span>
              ) : (
                "Save Profile"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};