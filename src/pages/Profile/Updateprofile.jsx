import Navbar from "../../component/Navigationbar/Navbar";
import FormField from "../../component/FormField/FormField";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateCustomerProfile, getCustomerProfile } from "../../api/customerapi";
import "../CreateProfile/CreateProfile";
// IMPORTANT: Adjust this path to match where you saved your Swal functions
import { showAlert } from "../../utils/alertService"; 

export const Updateprofile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    allergies: [], 
    primaryGoal: "" 
  });

  /* ── Pre-fill the form with the user's existing profile ── */
  useEffect(() => {
    async function loadProfile() {
      try {
        const p = await getCustomerProfile();
        if (p) {
          setFormData({
            age: p.age ?? "",
            gender: p.gender ?? "",
            height: p.height ?? "",
            currentWeight: p.currentWeight ?? "",
            targetWeight: p.targetWeight ?? "",
            allergies: Array.isArray(p.allergies) ? p.allergies : [],
            primaryGoal: p.primaryGoal ?? "" 
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

  /* ── Toggle handler for pill UI ── */
  const handleAllergyToggle = (allergyValue) => {
    setFormData((prev) => {
      const currentAllergies = prev.allergies || [];
      
      if (currentAllergies.includes(allergyValue)) {
        return { ...prev, allergies: currentAllergies.filter(item => item !== allergyValue) };
      } else {
        return { ...prev, allergies: [...currentAllergies, allergyValue] };
      }
    });
  };

  /* ── Only send fields that have a value ── */
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
      showAlert("No Changes", "Please update at least one field.", "warning");
      setLoading(false);
      return;
    }

    try {
      const result = await updateCustomerProfile(payload);
      console.log(result);
      // Wait for the user to click OK before navigating away
      await showAlert("Success!", "Profile updated successfully.", "success");
      navigate("/profile");
    } catch (error) {
      showAlert("Update Failed", error.message, "error");
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

          <div className="cp-header">
            <div className="cp-icon">✏️</div>
            <h1 className="cp-title">Update Your Profile</h1>
            <p className="cp-subtitle">Change any field you'd like to update</p>
          </div>

          <form onSubmit={handleSubmit} className="cp-form">

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
                  min="12"
                  max="120"
                  required
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

            <FormField
              label="Height (cm)"
              id="height"
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="e.g. 173"
              min="100"
              max="250"
            />

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
                  min="30"
                  max="300"
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
                  min="30"
                  max="300"
                />
              </div>
            </div>

            {/* Primary Goal Select */}
            <div className="cp-field-group" style={{ marginBottom: '15px' }}>
              <label className="cp-label" htmlFor="primaryGoal">Primary Goal</label>
              <select
                id="primaryGoal"
                name="primaryGoal"
                value={formData.primaryGoal}
                onChange={handleChange}
                className="cp-select"
              >
                <option value="" disabled>Select your main goal</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Building">Muscle Building</option>
                <option value="Clinical Nutrition">Clinical Nutrition</option>
                <option value="Sports Nutrition">Sports Nutrition</option>
                <option value="General Health">General Health</option>
                <option value="Diabetic Diet">Diabetic Diet</option>
                <option value="Pregnancy Nutrition">Pregnancy Nutrition</option>
                <option value="Vegan Nutrition">Vegan Nutrition</option>
              </select>
            </div>

            {/* Pill/Box Toggle for Allergies */}
            <div className="cp-field-group" style={{ marginBottom: '20px' }}>
              <label className="cp-label">Allergies</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                
                {['peanuts', 'tree nuts', 'dairy', 'eggs', 'soy', 'wheat', 'gluten', 'fish', 'shellfish', 'sesame'].map((allergy) => {
                  const isSelected = formData.allergies?.includes(allergy);
                  
                  return (
                    <div
                      key={allergy}
                      onClick={() => handleAllergyToggle(allergy)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                        backgroundColor: isSelected ? '#d1fae5' : '#ffffff',
                        color: isSelected ? '#065f46' : '#374151',
                        cursor: 'pointer',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s ease',
                        userSelect: 'none'
                      }}
                    >
                      {allergy}
                    </div>
                  );
                })}

              </div>
            </div>

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