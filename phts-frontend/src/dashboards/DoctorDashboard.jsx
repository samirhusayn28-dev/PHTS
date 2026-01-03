import { useState, useEffect } from "react";
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  LogOut,
  MessageCircle,
  Link2
} from "lucide-react";
import { API_URL } from "./config";

function DoctorDashboard({ user, onLogout }) {
  const DOCTOR_REF = user.reference;

  const [patientRef, setPatientRef] = useState("");
  const [vitals, setVitals] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [currentPatient, setCurrentPatient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function loadPatient() {
    if (!patientRef.trim()) {
      alert("Please enter a patient reference!");
      return;
    }

    console.log("🔍 Loading patient:", patientRef);
    setLoading(true);
    setError("");

    fetch(`${API_URL}/api/vitals/by-ref/${patientRef}`)
      .then(r => {
        console.log("Response status:", r.status);
        return r.json();
      })
      .then(d => {
        console.log("✅ Patient vitals loaded:", d);
        if (d.length === 0) {
          setError("No vitals found. Patient may not be linked or has no records.");
        }
        setVitals(d);
        setCurrentPatient(patientRef);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Error loading patient:", err);
        setError("Failed to load patient data");
        setLoading(false);
      });
  }

  function linkPatient() {
    if (!patientRef.trim()) {
      alert("Please enter a patient reference!");
      return;
    }

    console.log("🔗 Linking patient:", patientRef, "to doctor:", DOCTOR_REF);

    fetch(`${API_URL}/api/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        DoctorRef: DOCTOR_REF,
        PatientRef: patientRef
      })
    })
      .then(r => r.json())
      .then(data => {
        console.log("✅ Link response:", data);
        if (data.error) {
          alert(data.error);
        } else {
          alert("Patient linked successfully!");
          setTimeout(() => {
            loadPatient();
          }, 500);
        }
      })
      .catch(err => {
        console.error("❌ Error linking patient:", err);
        alert("Failed to link patient");
      });
  }

  function setReaction(vitalId, reaction) {
    console.log("💬 Setting reaction:", vitalId, "->", reaction);

    fetch(`${API_URL}/api/vitals/reaction/${vitalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction })
    })
      .then(r => r.json())
      .then(data => {
        console.log("✅ Reaction updated:", data);
        loadPatient();
      })
      .catch(err => {
        console.error("❌ Error setting reaction:", err);
      });
  }

  function loadMessages() {
    if (!currentPatient) return;
    
    console.log("📬 Loading messages for:", DOCTOR_REF);
    
    fetch(`${API_URL}/api/messages/${DOCTOR_REF}`)
      .then(r => r.json())
      .then(d => {
        console.log("All messages:", d);
        const filtered = d.filter(m =>
          (m.from === currentPatient && m.to === DOCTOR_REF) ||
          (m.from === DOCTOR_REF && m.to === currentPatient)
        );
        console.log("Filtered messages:", filtered);
        setMessages(filtered);
      })
      .catch(err => console.error("Error loading messages:", err));
  }

  function sendMessage() {
    if (!msgText.trim() || !currentPatient) return;
    
    fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: DOCTOR_REF,
        to: currentPatient,
        text: msgText
      })
    })
      .then(r => r.json())
      .then(() => {
        setMsgText("");
        loadMessages();
      })
      .catch(err => console.error("Error sending message:", err));
  }

  useEffect(() => {
    if (showMessages) loadMessages();
  }, [showMessages, currentPatient]);

  const critical = vitals.filter(v =>
    Number(v.HeartRate) > 130 ||
    Number(v.BloodPressureSys) > 140 ||
    Number(v.OxygenSaturation) < 92
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-10">

      {/* HEADER */}
      <div className="flex justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold">Hey Doctor {user.name} 🩺</h1>
          <p className="text-slate-400">
            Doctor Ref: <b className="text-blue-400">{DOCTOR_REF}</b>
          </p>
          {currentPatient && (
            <p className="text-green-400 text-sm mt-1">
              Current Patient: {currentPatient}
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

      {/* LOAD PATIENT */}
      <div className="flex gap-4 mb-10">
        <input
          type="text"
          placeholder="Enter Patient Reference (e.g., PAT-1234)"
          className="flex-1 p-4 rounded-xl bg-white/10 text-white placeholder-slate-400"
          value={patientRef}
          onChange={e => setPatientRef(e.target.value)}
          onKeyPress={e => e.key === "Enter" && loadPatient()}
        />
        <button
          onClick={loadPatient}
          disabled={loading}
          className="bg-blue-600 px-8 py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load Patient"}
        </button>
        <button
          onClick={linkPatient}
          disabled={loading}
          className="bg-green-600 px-8 py-4 rounded-xl hover:bg-green-700 flex gap-2 items-center disabled:opacity-50"
        >
          <Link2 size={18}/> Link Patient
        </button>
      </div>

      {vitals.length > 0 && (
        <button
          onClick={() => setShowMessages(true)}
          className="mb-6 bg-purple-600 px-6 py-3 rounded-xl hover:bg-purple-700 flex gap-2 items-center"
        >
          <MessageCircle size={18}/> Messages with {currentPatient}
        </button>
      )}

      {/* STATS */}
      {vitals.length > 0 && (
        <div className="grid grid-cols-3 gap-6 mb-10">
          <Stat icon={<HeartPulse/>} title="Total Vitals" value={vitals.length}/>
          <Stat icon={<AlertTriangle/>} title="Critical" value={critical}/>
          <Stat icon={<Activity/>} title="Normal" value={vitals.length - critical}/>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="text-center text-slate-400 mb-6">
          <Activity size={32} className="mx-auto mb-2 animate-spin" />
          <p>Loading patient data...</p>
        </div>
      )}

      {/* TABLE */}
      {vitals.length > 0 ? (
        <div className="bg-white/5 rounded-3xl overflow-hidden">
          <div className="bg-white/10 p-4">
            <h2 className="text-xl font-semibold">Patient Vitals - {currentPatient}</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Time</th>
                <th className="p-4 text-center">HR</th>
                <th className="p-4 text-center">BP</th>
                <th className="p-4 text-center">O₂</th>
                <th className="p-4 text-left">Notes</th>
                <th className="p-4 text-center">Current Reaction</th>
                <th className="p-4 text-center">Set Reaction</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((v, idx) => {
                const hrHigh = Number(v.HeartRate) > 100;
                const bpHigh = Number(v.BloodPressureSys) > 130;
                const o2Low = Number(v.OxygenSaturation) < 95;
                
                return (
                  <tr key={v.VitalID || idx} className="border-t border-white/10">
                    <td className="p-4 text-left">{v.RecordedDate}</td>
                    <td className="p-4 text-left">{v.RecordedTime}</td>
                    <td className={`p-4 text-center font-bold ${hrHigh ? "text-red-400" : ""}`}>
                      {v.HeartRate}
                    </td>
                    <td className={`p-4 text-center font-bold ${bpHigh ? "text-red-400" : ""}`}>
                      {v.BloodPressureSys}/{v.BloodPressureDia}
                    </td>
                    <td className={`p-4 text-center font-bold ${o2Low ? "text-red-400" : ""}`}>
                      {v.OxygenSaturation}%
                    </td>
                    <td className="p-4 text-left text-xs">{v.Notes || "-"}</td>
                    <td className="p-4 text-center">
                      {v.DoctorReaction === "IMPROVING" && "😊 Improving"}
                      {v.DoctorReaction === "STABLE" && "😐 Stable"}
                      {v.DoctorReaction === "CRITICAL" && "☹️ Critical"}
                      {!v.DoctorReaction && "⏳ Pending"}
                    </td>
                    <td className="p-4 text-center">
                      <select
                        className="bg-slate-700 p-2 rounded text-white cursor-pointer"
                        value={v.DoctorReaction || ""}
                        onChange={e => setReaction(v.VitalID, e.target.value)}
                      >
                        <option value="">Select Reaction</option>
                        <option value="IMPROVING">😊 Improving</option>
                        <option value="STABLE">😐 Stable</option>
                        <option value="CRITICAL">☹️ Critical</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : !loading && (
        <div className="bg-white/5 rounded-3xl p-10 text-center text-slate-400">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Enter a patient reference and click "Load Patient" to view their vitals</p>
          <p className="text-sm mt-2">Make sure the patient is linked to you first</p>
        </div>
      )}

      {/* MESSAGES MODAL */}
      {showMessages && currentPatient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-3xl w-[500px] max-h-[600px] flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Messages with {currentPatient}</h2>

            <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-[300px]">
              {messages.length > 0 ? (
                messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`p-3 rounded-xl ${
                      m.from === DOCTOR_REF
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

function Stat({ icon, title, value }) {
  return (
    <div className="bg-white/5 p-6 rounded-3xl">
      <div className="text-blue-400 mb-2">{icon}</div>
      <p className="text-slate-400">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}

export default DoctorDashboard;