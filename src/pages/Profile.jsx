import Navbar from "../component/Navbar"
import FormField from "../component/FormField"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { creatProfile } from "../api/customerapi";

export const Profile = () => {
  const navigat=useNavigate()
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    allergies: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await creatProfile(formData);
      console.log(result);
      alert("Profile saved successfully");
      navigat("/profile")
    } catch (error) {
      alert(error.message);
    }
  };
return (
  <div>
    <Navbar />

    <form onSubmit={handleSubmit}>

      <FormField
        label="Age"
        id="age"
        type="number"
        name="age"
        value={formData.age}
        onChange={handleChange}
        placeholder="Enter your age"
      />

      <label htmlFor="gender">Gender</label>
      <select
        id="gender"
        name="gender"
        value={formData.gender}
        onChange={handleChange}
      >
        <option value="">Select gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <FormField
        label="Height (cm)"
        id="height"
        type="number"
        name="height"
        value={formData.height}
        onChange={handleChange}
        placeholder="Enter your height"
      />

      <FormField
        label="Current Weight (kg)"
        id="currentWeight"
        type="number"
        name="currentWeight"
        value={formData.currentWeight}
        onChange={handleChange}
        placeholder="Enter current weight"
      />

      <FormField
        label="Target Weight (kg)"
        id="targetWeight"
        type="number"
        name="targetWeight"
        value={formData.targetWeight}
        onChange={handleChange}
        placeholder="Enter target weight"
      />

      <label htmlFor="allergies">Allergies</label>
      <select
        id="allergies"
        name="allergies"
        value={formData.allergies}
        onChange={handleChange}
      >
        <option value="">Select allergy</option>
        <option value="peanuts">Peanuts</option>
        <option value="dairy">Dairy</option>
      </select>

      <button type="submit">Save</button>

    </form>
  </div>
);}