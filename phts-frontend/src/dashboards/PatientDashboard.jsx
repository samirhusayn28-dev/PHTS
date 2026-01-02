import { useEffect, useState } from "react";
import {
  Plus,
  Download,
  LogOut,
  HeartPulse,
  Activity,
  ClipboardList,
  MessageCircle,
  UserX
} from "lucide-react";

const EMPTY_VITAL = {
  HeartRate: "",
  BloodPressureSys: "",
  BloodPressureDia: "",
  OxygenSaturation: "",
  Notes: ""
};

function PatientDashboard({ user, onLogout }) {
  const USER_ID = user.id;
  const PATIENT_REF = user.reference;

  const [vitals, setVitals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_VITAL);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [linkedDoctor, setLinkedDoctor] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOAD VITALS ================= */
  function loadVitals() {
    console.log("🔄 Loading vitals for UserID:", USER_ID);
    setLoading(true);
    fetch(`http://localhost:5000/api/vitals/${USER_ID}`)
      .then(r => {
        console.log("Response status:", r.status);
        return r.json();
      })
      .then(d => {
        console.log("✅ Vitals loaded:", d);
        setVitals(d);
        setError("");
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Error loading vitals:", err);
        setError("Failed to load vitals");
        setLoading(false);
      });
  }

  /* ================= LOAD LINKED DOCTOR ================= */
  function loadLinkedDoctor() {
    fetch(`http://localhost:5000/api/link/doctor/${PATIENT_REF}`)
      .then(r => r.json())
      .then(data => {
        console.log("Linked doctor:", data);
        setLinkedDoctor(data);
      })
      .catch(err => console.error("Error loading doctor:", err));
  }

  /* ================= LOAD MESSAGES ================= */
  function loadMessages() {
    fetch(`http://localhost:5000/api/messages/${PATIENT_REF}`)
      .then(r => r.json())
      .then(d => {
        console.log("Messages loaded:", d);
        setMessages(d);
      })
      .catch(err => console.error("Error loading messages:", err));
  }

  /* ================= UNLINK DOCTOR ================= */
  function unlinkDoctor() {
    if (!window.confirm("Are you sure you want to unlink from your doctor?")) return;
    fetch(`http://localhost:5000/api/link/${PATIENT_REF}`, {
      method: "DELETE"
    }).then(() => {
      setLinkedDoctor(null);
      window.alert("Doctor unlinked successfully!");
    });
  }

  /* ================= SEND MESSAGE ================= */
  function sendMessage() {
    if (!msgText.trim() || !linkedDoctor) return;
    fetch("http://localhost:5000/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: PATIENT_REF,
        to: linkedDoctor.DoctorRef,
        text: msgText
      })
    }).then(() => {
      setMsgText("");
      loadMessages();
    });
  }

  useEffect(() => {
    loadVitals();
    loadLinkedDoctor();
    loadMessages();
  }, []);

  /* ================= SAVE VITAL ================= */
  function saveVital() {
    console.log("💾 Attempting to save vital...");
    
    // Validation
    if (!form.HeartRate || !form.BloodPressureSys || !form.BloodPressureDia || !form.OxygenSaturation) {
      alert("Please fill all required fields!");
      return;
    }

    const payload = {
      UserID: USER_ID,
      HeartRate: Number(form.HeartRate),
      BloodPressureSys: Number(form.BloodPressureSys),
      BloodPressureDia: Number(form.BloodPressureDia),
      OxygenSaturation: Number(form.OxygenSaturation),
      Notes: form.Notes || "",
      DoctorReaction: "",
      RecordedDate: new Date().toLocaleDateString(),
      RecordedTime: new Date().toLocaleTimeString()
    };

    console.log("📤 Sending payload:", payload);

    fetch("http://localhost:5000/api/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => {
        console.log("Response status:", r.status);
        return r.json();
      })
      .then(data => {
        console.log("✅ Server response:", data);
        setShowForm(false);
        setForm(EMPTY_VITAL);
        alert("Vital saved successfully!");
        // Reload vitals after 500ms
        setTimeout(() => {
          console.log("🔄 Reloading vitals after save...");
          loadVitals();
        }, 500);
      })
      .catch(err => {
        console.error("❌ Error saving vital:", err);
        alert("Failed to save vital. Check console for details.");
      });
  }

  const avgHR =
    vitals.length === 0
      ? 0
      : Math.round(
          vitals.reduce((a, b) => a + Number(b.HeartRate || 0), 0) / vitals.length
        );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-10">

      {/* HEADER */}
      <div className="flex justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold">Hey {user.name} 👋</h1>
          <p className="text-slate-400">
            Patient Ref: <b className="text-blue-400">{PATIENT_REF}</b>
          </p>
          <p className="text-slate-400 text-sm">
            User ID: <b className="text-blue-400">{USER_ID}</b>
          </p>
          {linkedDoctor && (
            <p className="text-green-400 text-sm mt-1">
              Linked to Doctor: {linkedDoctor.DoctorRef}
            </p>
          )}
        </div>
        <button onClick={onLogout} className="flex gap-2 text-red-400 hover:text-red-300">
          <LogOut size={18}/> Logout
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 p-4 rounded-xl mb-6">
          <p className="text-red-300">⚠️ {error}</p>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <Bento icon={<HeartPulse/>} label="Average HR" value={`${avgHR} bpm`} />
        <Bento icon={<Activity/>} label="Total Records" value={vitals.length} />
        <Bento icon={<ClipboardList/>} label="Status" value={avgHR > 100 ? "Needs Care" : "Stable"} />
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setShowForm(true)}
          className="flex gap-2 bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-700"
        >
          <Plus size={18}/> Add Vital
        </button>

        <button
          onClick={loadVitals}
          className="flex gap-2 bg-green-600 px-6 py-3 rounded-xl hover:bg-green-700"
        >
          <Activity size={18}/> Refresh Data
        </button>

        <a
          href="http://localhost:5000/api/vitals/download/all"
          className="flex gap-2 bg-slate-700 px-6 py-3 rounded-xl hover:bg-slate-600"
        >
          <Download size={18}/> Download History
        </a>

        {linkedDoctor && (
          <>
            <button
              onClick={() => setShowMessages(true)}
              className="flex gap-2 bg-purple-600 px-6 py-3 rounded-xl hover:bg-purple-700"
            >
              <MessageCircle size={18}/> Messages
            </button>
            <button
              onClick={unlinkDoctor}
              className="flex gap-2 bg-red-600 px-6 py-3 rounded-xl hover:bg-red-700"
            >
              <UserX size={18}/> Unlink Doctor
            </button>
          </>
        )}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center text-slate-400 mb-6">
          <Activity size={32} className="mx-auto mb-2 animate-spin" />
          <p>Loading vitals...</p>
        </div>
      )}

      {/* TABLE */}
      {vitals.length > 0 ? (
        <div className="bg-white/5 rounded-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Time</th>
                <th className="p-4 text-center">HR</th>
                <th className="p-4 text-center">BP</th>
                <th className="p-4 text-center">O₂</th>
                <th className="p-4 text-left">Notes</th>
                <th className="p-4 text-center">Reaction</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((v, idx) => (
                <tr key={v.VitalID || idx} className="border-t border-white/10">
                  <td className="p-4 text-left">{v.RecordedDate}</td>
                  <td className="p-4 text-left">{v.RecordedTime}</td>
                  <td className="p-4 text-center">{v.HeartRate}</td>
                  <td className="p-4 text-center">{v.BloodPressureSys}/{v.BloodPressureDia}</td>
                  <td className="p-4 text-center">{v.OxygenSaturation}%</td>
                  <td className="p-4 text-left text-xs">{v.Notes || "-"}</td>
                  <td className="p-4 text-center">
                    {v.DoctorReaction === "IMPROVING" && "😊 Improving"}
                    {v.DoctorReaction === "STABLE" && "😐 Stable"}
                    {v.DoctorReaction === "CRITICAL" && "☹️ Needs Care"}
                    {!v.DoctorReaction && "⏳ Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white/5 rounded-3xl p-10 text-center text-slate-400">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No vitals recorded yet. Add your first vital!</p>
          <p className="text-sm mt-2">Click "Add Vital" button above to get started</p>
        </div>
      )}

      {/* ADD VITAL MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-3xl w-[420px]">
            <h2 className="text-2xl font-semibold mb-6">Add Vital Signs</h2>

            <div className="space-y-3">
              <input
                type="number"
                placeholder="Heart Rate (bpm) *"
                className="w-full p-3 rounded bg-black/30 text-white"
                value={form.HeartRate}
                onChange={e => setForm({ ...form, HeartRate: e.target.value })}
              />
              <input
                type="number"
                placeholder="Blood Pressure Systolic *"
                className="w-full p-3 rounded bg-black/30 text-white"
                value={form.BloodPressureSys}
                onChange={e => setForm({ ...form, BloodPressureSys: e.target.value })}
              />
              <input
                type="number"
                placeholder="Blood Pressure Diastolic *"
                className="w-full p-3 rounded bg-black/30 text-white"
                value={form.BloodPressureDia}
                onChange={e => setForm({ ...form, BloodPressureDia: e.target.value })}
              />
              <input
                type="number"
                placeholder="Oxygen Saturation (%) *"
                className="w-full p-3 rounded bg-black/30 text-white"
                value={form.OxygenSaturation}
                onChange={e => setForm({ ...form, OxygenSaturation: e.target.value })}
              />
              <textarea
                placeholder="Notes (optional)"
                className="w-full p-3 rounded bg-black/30 text-white"
                rows={3}
                value={form.Notes}
                onChange={e => setForm({ ...form, Notes: e.target.value })}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={saveVital} className="flex-1 bg-green-600 py-3 rounded-xl hover:bg-green-700">
                Save Vital
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-red-600 py-3 rounded-xl hover:bg-red-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGES MODAL */}
      {showMessages && linkedDoctor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-3xl w-[500px] max-h-[600px] flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Messages with {linkedDoctor.DoctorRef}</h2>

            <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-[300px]">
              {messages.length > 0 ? (
                messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`p-3 rounded-xl ${
                      m.from === PATIENT_REF
                        ? "bg-blue-600 ml-auto max-w-[80%]"
                        : "bg-slate-700 mr-auto max-w-[80%]"
                    }`}
                  >
                    <p className="text-sm">{m.text}</p>
                    <p className="text-xs text-slate-400 mt-1">{m.date} {m.time}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 mt-10">
                  <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Start a conversation!</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-3 rounded bg-black/30 text-white"
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyPress={e => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700">
                Send
              </button>
            </div>

            <button
              onClick={() => setShowMessages(false)}
              className="mt-4 bg-red-600 py-2 rounded-xl hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function Bento({ icon, label, value }) {
  return (
    <div className="bg-white/5 p-6 rounded-3xl">
      <div className="text-blue-400 mb-2">{icon}</div>
      <p className="text-slate-400">{label}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}

export default PatientDashboard;