import { useState } from "react";

function EditVitalsModal({ record, onSave, onClose }) {
  const [form, setForm] = useState({ ...record });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.5)"
    }}>
      <div style={{
        background: "white", padding: 20, margin: "100px auto", width: 400
      }}>
        <h3>Edit Vitals</h3>

        <input name="HeartRate" value={form.HeartRate} onChange={handleChange} /><br />
        <input name="BloodPressureSys" value={form.BloodPressureSys} onChange={handleChange} /><br />
        <input name="BloodPressureDia" value={form.BloodPressureDia} onChange={handleChange} /><br />
        <input name="OxygenSaturation" value={form.OxygenSaturation} onChange={handleChange} /><br />
        <input name="Notes" value={form.Notes} onChange={handleChange} /><br /><br />

        <button onClick={() => onSave(form)}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default EditVitalsModal;
