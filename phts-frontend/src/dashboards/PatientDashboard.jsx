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

// Update this to your actual API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    setError("");
    
    fetch(`${API_URL}/api/vitals/${USER_ID}`)
      .then(r => {
        console.log("Response status:", r.status);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        console.log("✅ Vitals loaded:", d);
        setVitals(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Error loading vitals:", err);
        setError(`Failed to load vitals: ${err.message}`);
        setLoading(false);
      });
  }

  /* ================= LOAD LINKED DOCTOR ================= */
  function loadLinkedDoctor() {
    console.log("🔍 Loading linked doctor for patient:", PATIENT_REF);
    fetch(`${API_URL}/api/link/doctor/${PATIENT_REF}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log("✅ Linked doctor:", data);
        setLinkedDoctor(data);
      })
      .catch(err => {
        console.error("❌ Error loading doctor:", err);
        setLinkedDoctor(null);
      });
  }

  /* ================= LOAD MESSAGES ================= */
  function loadMessages() {
    if (!linkedDoctor) {
      console.log("⚠️ PATIENT - No linked doctor, cannot load messages");
      setMessages([]);
      return;
    }
    
    console.log("📬 PATIENT - Loading messages for:", PATIENT_REF);
    
    fetch(`${API_URL}/api/messages/${PATIENT_REF}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        console.log("📬 PATIENT - Messages received:", d.length);
        
        const filtered = d.filter(m => {
          const isFromPatient = m.from === PATIENT_REF && m.to === linkedDoctor.DoctorRef;
          const isFromDoctor = m.from === linkedDoctor.DoctorRef && m.to === PATIENT_REF;
          return isFromPatient || isFromDoctor;
        });
        
        console.log("📬 PATIENT - Filtered messages:", filtered.length);
        setMessages(filtered);
      })
      .catch(err => {
        console.error("❌ PATIENT - Error loading messages:", err);
        setMessages([]);
      });
  }

  /* ================= UNLINK DOCTOR ================= */
  function unlinkDoctor() {
    if (!window.confirm("Are you sure you want to unlink from your doctor?")) return;
    
    console.log("🔗 Unlinking doctor:", linkedDoctor.DoctorRef);
    
    fetch(`${API_URL}/api/link/${PATIENT_REF}`, {
      method: "DELETE"
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(() => {
        console.log("✅ Doctor unlinked successfully");
        setLinkedDoctor(null);
        setMessages([]);
        alert("Doctor unlinked successfully!");
      })
      .catch(err => {
        console.error("❌ Error unlinking doctor:", err);
        alert(`Failed to unlink doctor: ${err.message}`);
      });
  }

  /* ================= SEND MESSAGE ================= */
  function sendMessage() {
    if (!msgText.trim()) {
      console.log("⚠️ PATIENT - Empty message text");
      return;
    }
    if (!linkedDoctor) {
      console.log("⚠️ PATIENT - No linked doctor");
      return;
    }
    
    const payload = {
      from: PATIENT_REF,
      to: linkedDoctor.DoctorRef,
      text: msgText
    };
    
    console.log("📤 PATIENT - Sending message:", payload);
    
    fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log("📤 PATIENT - Message sent successfully:", data);
        setMsgText("");
        setTimeout(() => loadMessages(), 300);
      })
      .catch(err => {
        console.error("❌ PATIENT - Error sending message:", err);
        alert(`Failed to send message: ${err.message}`);
      });
  }

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    console.log("🚀 PATIENT - Initial load");
    console.log("🌐 API_URL:", API_URL);
    loadVitals();
    loadLinkedDoctor();
  }, []);

  /* ================= LOAD MESSAGES WHEN DOCTOR IS LINKED ================= */
  useEffect(() => {
    if (linkedDoctor) {
      console.log("🔄 PATIENT - Doctor linked, loading messages");
      loadMessages();
    }
  }, [linkedDoctor]);

  /* ================= RELOAD MESSAGES WHEN MODAL OPENS ================= */
  useEffect(() => {
    if (showMessages && linkedDoctor) {
      console.log("🔄 PATIENT - Messages modal opened, reloading");
      loadMessages();
    }
  }, [showMessages]);

  /* ================= SAVE VITAL ================= */
  function saveVital() {
    console.log("💾 Attempting to save vital...");
    console.log("🌐 API URL:", API_URL);
    
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
    console.log("📤 Full URL:", `${API_URL}/api/vitals`);
    
    setLoading(true);
    setError("");

    fetch(`${API_URL}/api/vitals`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(r => {
        console.log("📡 Response status:", r.status);
        console.log("📡 Response ok:", r.ok);
        console.log("📡 Response headers:", Object.fromEntries(r.headers.entries()));
        
        if (!r.ok) {
          return r.text().then(text => {
            console.error("❌ Response body:", text);
            throw new Error(`HTTP ${r.status}: ${text}`);
          });
        }
        return r.json();
      })
      .then(data => {
        console.log("✅ Server response:", data);
        setShowForm(false);
        setForm(EMPTY_VITAL);
        setLoading(false);
        alert("Vital saved successfully!");
        setTimeout(() => {
          console.log("🔄 Reloading vitals after save...");
          loadVitals();
        }, 500);
      })
      .catch(err => {
        console.error("❌ Error saving vital:", err);
        console.error("❌ Error name:", err.name);
        console.error("❌ Error message:", err.message);
        console.error("❌ Error stack:", err.stack);
        setLoading(false);
        
        let errorMsg = "Failed to save vital.\n\n";
        
        if (err.message.includes("Failed to fetch")) {
          errorMsg += "❌ Cannot connect to server!\n\n";
          errorMsg += `Check:\n`;
          errorMsg += `1. Backend running on ${API_URL}?\n`;
          errorMsg += `2. CORS enabled?\n`;
          errorMsg += `3. Network tab in DevTools\n`;
          errorMsg += `4. Try: curl ${API_URL}/\n`;
        } else if (err.message.includes("HTTP")) {
          errorMsg += `Server error: ${err.message}`;
        } else {
          errorMsg += err.message;
        }
        
        setError(errorMsg);
        alert(errorMsg);
      });
  }

  const avgHR =
    vitals.length === 0
      ? 0
      : Math.round(
          vitals.reduce((a, b) => a + Number(b.HeartRate || 0), 0) / vitals.length
        );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-4 sm:p-6 lg:p-10">

      {/* HEADER - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Hey {user.name} 👋</h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Patient Ref: <b className="text-blue-400">{PATIENT_REF}</b>
          </p>
          <p className="text-slate-400 text-xs sm:text-sm">
            User ID: <b className="text-blue-400">{USER_ID}</b>
          </p>
          <p className="text-slate-500 text-xs mt-1">
            API: {API_URL}
          </p>
          {linkedDoctor && (
            <p className="text-green-400 text-xs sm:text-sm mt-1">
              ✅ Linked to Doctor: {linkedDoctor.DoctorRef}
            </p>
          )}
        </div>
        <button onClick={onLogout} className="flex gap-2 text-red-400 hover:text-red-300">
          <LogOut size={18}/> Logout
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
          <p className="text-red-300 text-sm sm:text-base whitespace-pre-wrap">⚠️ {error}</p>
        </div>
      )}

      {/* STATS - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
        <Bento icon={<HeartPulse/>} label="Average HR" value={`${avgHR} bpm`} />
        <Bento icon={<Activity/>} label="Total Records" value={vitals.length} />
        <Bento icon={<ClipboardList/>} label="Status" value={avgHR > 100 ? "Needs Care" : "Stable"} />
      </div>

      {/* ACTIONS - Responsive Buttons */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button
          onClick={() => setShowForm(true)}
          disabled={loading}
          className="flex gap-2 bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
        >
          <Plus size={18}/> Add Vital
        </button>

        <button
          onClick={loadVitals}
          disabled={loading}
          className="flex gap-2 bg-green-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
        >
          <Activity size={18}/> Refresh
        </button>

        <a
          href={`${API_URL}/api/vitals/download/all`}
          className="flex gap-2 bg-slate-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-slate-600 text-sm sm:text-base"
        >
          <Download size={18}/> Download
        </a>

        {linkedDoctor && (
          <>
            <button
              onClick={() => setShowMessages(true)}
              className="flex gap-2 bg-purple-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-purple-700 text-sm sm:text-base"
            >
              <MessageCircle size={18}/> Messages
            </button>
            <button
              onClick={unlinkDoctor}
              className="flex gap-2 bg-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-red-700 text-sm sm:text-base"
            >
              <UserX size={18}/> Unlink
            </button>
          </>
        )}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center text-slate-400 mb-6">
          <Activity size={32} className="mx-auto mb-2 animate-spin" />
          <p>Loading...</p>
        </div>
      )}

      {/* TABLE - Responsive with horizontal scroll */}
      {vitals.length > 0 ? (
        <div className="bg-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[600px]">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-2 sm:p-4 text-left">Date</th>
                  <th className="p-2 sm:p-4 text-left">Time</th>
                  <th className="p-2 sm:p-4 text-center">HR</th>
                  <th className="p-2 sm:p-4 text-center">BP</th>
                  <th className="p-2 sm:p-4 text-center">O₂</th>
                  <th className="p-2 sm:p-4 text-left">Notes</th>
                  <th className="p-2 sm:p-4 text-center">Reaction</th>
                </tr>
              </thead>
              <tbody>
                {vitals.map((v, idx) => (
                  <tr key={v.VitalID || idx} className="border-t border-white/10">
                    <td className="p-2 sm:p-4 text-left">{v.RecordedDate}</td>
                    <td className="p-2 sm:p-4 text-left">{v.RecordedTime}</td>
                    <td className="p-2 sm:p-4 text-center">{v.HeartRate}</td>
                    <td className="p-2 sm:p-4 text-center">{v.BloodPressureSys}/{v.BloodPressureDia}</td>
                    <td className="p-2 sm:p-4 text-center">{v.OxygenSaturation}%</td>
                    <td className="p-2 sm:p-4 text-left text-xs">{v.Notes || "-"}</td>
                    <td className="p-2 sm:p-4 text-center whitespace-nowrap">
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
        </div>
      ) : !loading && (
        <div className="bg-white/5 rounded-3xl p-6 sm:p-10 text-center text-slate-400">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-base sm:text-lg">No vitals recorded yet. Add your first vital!</p>
          <p className="text-xs sm:text-sm mt-2">Click "Add Vital" button above to get started</p>
        </div>
      )}

      {/* ADD VITAL MODAL - Responsive */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl w-full max-w-[420px]">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Add Vital Signs</h2>

            <div className="space-y-3">
              <input
                type="number"
                placeholder="Heart Rate (bpm) *"
                className="w-full p-3 rounded bg-black/30 text-white text-sm sm:text-base"
                value={form.HeartRate}
                onChange={e => setForm({ ...form, HeartRate: e.target.value })}
              />
              <input
                type="number"
                placeholder="Blood Pressure Systolic *"
                className="w-full p-3 rounded bg-black/30 text-white text-sm sm:text-base"
                value={form.BloodPressureSys}
                onChange={e => setForm({ ...form, BloodPressureSys: e.target.value })}
              />
              <input
                type="number"
                placeholder="Blood Pressure Diastolic *"
                className="w-full p-3 rounded bg-black/30 text-white text-sm sm:text-base"
                value={form.BloodPressureDia}
                onChange={e => setForm({ ...form, BloodPressureDia: e.target.value })}
              />
              <input
                type="number"
                placeholder="Oxygen Saturation (%) *"
                className="w-full p-3 rounded bg-black/30 text-white text-sm sm:text-base"
                value={form.OxygenSaturation}
                onChange={e => setForm({ ...form, OxygenSaturation: e.target.value })}
              />
              <textarea
                placeholder="Notes (optional)"
                className="w-full p-3 rounded bg-black/30 text-white text-sm sm:text-base"
                rows={3}
                value={form.Notes}
                onChange={e => setForm({ ...form, Notes: e.target.value })}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button 
                onClick={saveVital} 
                disabled={loading}
                className="flex-1 bg-green-600 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? "Saving..." : "Save Vital"}
              </button>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }} 
                disabled={loading}
                className="flex-1 bg-red-600 py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGES MODAL - Responsive */}
      {showMessages && linkedDoctor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl w-full max-w-[500px] max-h-[90vh] sm:max-h-[600px] flex flex-col">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              💬 Messages with {linkedDoctor.DoctorRef}
            </h2>

            <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-[200px] sm:min-h-[300px] bg-black/20 rounded-xl p-4">
              {messages.length > 0 ? (
                messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`p-3 rounded-xl text-sm ${
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
                className="flex-1 p-3 rounded bg-black/30 text-white text-sm"
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyPress={e => e.key === "Enter" && sendMessage()}
              />
              <button 
                onClick={sendMessage} 
                className="bg-blue-600 px-4 sm:px-6 py-3 rounded hover:bg-blue-700 text-sm"
                disabled={!msgText.trim()}
              >
                Send
              </button>
            </div>

            <button
              onClick={() => setShowMessages(false)}
              className="mt-4 bg-red-600 py-2 rounded-xl hover:bg-red-700 text-sm"
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
    <div className="bg-white/5 p-4 sm:p-6 rounded-3xl">
      <div className="text-blue-400 mb-2">{icon}</div>
      <p className="text-slate-400 text-sm sm:text-base">{label}</p>
      <h2 className="text-2xl sm:text-3xl font-bold">{value}</h2>
    </div>
  );
}

export default PatientDashboard;