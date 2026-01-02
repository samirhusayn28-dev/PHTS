import { useState } from "react";

function PatientVitalsForm() {
  const [form, setForm] = useState({
    HeartRate: "",
    BloodPressureSys: "",
    BloodPressureDia: "",
    OxygenSaturation: "",
    Notes: ""
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Vitals form data:", form);
    alert("Form submit working (backend next step)");
  }

  return (
    <div className="glass rounded-3xl p-10 max-w-xl">
      <h2 className="text-2xl font-semibold mb-6">
        Update Your Health Vitals
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="HeartRate"
          placeholder="Heart Rate (bpm)"
          value={form.HeartRate}
          onChange={handleChange}
          className="input"
        />

        <div className="flex gap-4">
          <input
            name="BloodPressureSys"
            placeholder="BP Systolic"
            value={form.BloodPressureSys}
            onChange={handleChange}
            className="input"
          />
          <input
            name="BloodPressureDia"
            placeholder="BP Diastolic"
            value={form.BloodPressureDia}
            onChange={handleChange}
            className="input"
          />
        </div>

        <input
          name="OxygenSaturation"
          placeholder="Oxygen Saturation (%)"
          value={form.OxygenSaturation}
          onChange={handleChange}
          className="input"
        />

        <textarea
          name="Notes"
          placeholder="Notes (optional)"
          value={form.Notes}
          onChange={handleChange}
          className="input h-28 resize-none"
        />

        <button
          type="submit"
          className="w-full py-4 bg-blue-600 rounded-2xl lift"
        >
          Save Vitals
        </button>
      </form>
    </div>
  );
}

export default PatientVitalsForm;
