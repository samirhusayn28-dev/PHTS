import { useState, useEffect } from "react";
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  LogOut,
  MessageCircle,
  Link2
} from "lucide-react";

// ✅ FIXED: Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

    console.log("🔍 DOCTOR - Loading patient:", patientRef);
    console.log("🌐 Using API URL:", API_URL);
    setLoading(true);
    setError("");

    fetch(`${API_URL}/api/vitals/by-ref/${patientRef}`)
      .then(r => {
        console.log("🔍 DOCTOR - Response status:", r.status);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        console.log("✅ DOCTOR - Patient vitals loaded:", d);
        if (d.length === 0) {
          setError("No vitals found. Patient may not be linked or has no records.");
        }
        setVitals(d);
        setCurrentPatient(patientRef);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ DOCTOR - Error loading patient:", err);
        setError(`Failed to load patient data: ${err.message}`);
        setLoading(false);
      });
  }

  function linkPatient() {
    if (!patientRef.trim()) {
      alert("Please enter a patient reference!");
      return;
    }

    console.log("🔗 DOCTOR - Linking patient:", patientRef, "to doctor:", DOCTOR_REF);

    fetch(`${API_URL}/api/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        DoctorRef: DOCTOR_REF,
        PatientRef: patientRef
      })
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log("✅ DOCTOR - Link response:", data);
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
        console.error("❌ DOCTOR - Error linking patient:", err);
        alert(`Failed to link patient: ${err.message}`);
      });
  }

  function setReaction(vitalId, reaction) {
    console.log("💬 DOCTOR - Setting reaction:", vitalId, "->", reaction);

    fetch(`${API_URL}/api/vitals/reaction/${vitalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction })
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log("✅ DOCTOR - Reaction updated:", data);
        loadPatient();
      })
      .catch(err => {
        console.error("❌ DOCTOR - Error setting reaction:", err);
        alert(`Failed to update reaction: ${err.message}`);
      });
  }

  function loadMessages() {
    if (!currentPatient) {
      console.log("⚠️ DOCTOR - No current patient selected");
      setMessages([]);
      return;
    }
    
    console.log("📬 DOCTOR - Loading messages for doctor:", DOCTOR_REF);
    console.log("📬 DOCTOR - Current patient:", currentPatient);
    
    fetch(`${API_URL}/api/messages/${DOCTOR_REF}`)
      .then(r => {
        console.log("📬 DOCTOR - Response status:", r.status);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        console.log("📬 DOCTOR - Raw messages from server:", d);
        console.log("📬 DOCTOR - Number of messages:", d.length);
        
        const filtered = d.filter(m => {
          const isFromPatient = m.from === currentPatient && m.to === DOCTOR_REF;
          const isFromDoctor = m.from === DOCTOR_REF && m.to === currentPatient;
          console.log(`📬 Message ${m.id}: from=${m.from}, to=${m.to}, match=${isFromPatient || isFromDoctor}`);
          return isFromPatient || isFromDoctor;
        });
        
        console.log("📬 DOCTOR - Filtered messages:", filtered);
        console.log("📬 DOCTOR - Setting", filtered.length, "messages");
        setMessages(filtered);
      })
      .catch(err => {
        console.error("❌ DOCTOR - Error loading messages:", err);
        setMessages([]);
      });
  }

  function sendMessage() {
    if (!msgText.trim()) {
      console.log("⚠️ DOCTOR - Empty message text");
      return;
    }
    if (!currentPatient) {
      console.log("⚠️ DOCTOR - No current patient");
      return;
    }
    
    const payload = {
      from: DOCTOR_REF,
      to: currentPatient,
      text: msgText
    };
    
    console.log("📤 DOCTOR - Sending message:", payload);
    
    fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => {
        console.log("📤 DOCTOR - Send response status:", r.status);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log("📤 DOCTOR - Message sent successfully:", data);
        setMsgText("");
        setTimeout(() => {
          console.log("🔄 DOCTOR - Reloading messages after send");
          loadMessages();
        }, 300);
      })
      .catch(err => {
        console.error("❌ DOCTOR - Error sending message:", err);
        alert(`Failed to send message: ${err.message}`);
      });
  }

  useEffect(() => {
    console.log("🚀 DOCTOR - Component mounted");
    console.log("🌐 API_URL:", API_URL);
  }, []);

  useEffect(() => {
    if (showMessages && currentPatient) {
      console.log("🔄 DOCTOR - Messages modal opened, loading messages");
      loadMessages();
    }
  }, [showMessages, currentPatient]);

  const critical = vitals.filter(v =>
    Number(v.HeartRate) > 130 ||
    Number(v.BloodPressureSys) > 140 ||
    Number(v.OxygenSaturation) < 92
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-4 sm:p-6 lg:p-10">

      {/* HEADER - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Hey Doctor {user.name} 🩺</h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Doctor Ref: <b className="text-blue-400">{DOCTOR_REF}</b>
          </p>
          <p className="text-slate-500 text-xs mt-1">
            API: {API_URL}
          </p>
          {currentPatient && (
            <p className="text-green-400 text-xs sm:text-sm mt-1">
              ✅ Current Patient: {currentPatient}
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
          <p className="text-red-300 text-sm sm:text-base">⚠️ {error}</p>
        </div>
      )}

      {/* LOAD PATIENT - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-10">
        <input
          type="text"
          placeholder="Enter Patient Reference (e.g., PAT-1234)"
          className="flex-1 p-3 sm:p-4 rounded-xl bg-white/10 text-white placeholder-slate-400 text-sm sm:text-base"
          value={patientRef}
          onChange={e => setPatientRef(e.target.value)}
          onKeyPress={e => e.key === "Enter" && loadPatient()}
        />
        <button
          onClick={loadPatient}
          disabled={loading}
          className="bg-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
        >
          {loading ? "Loading..." : "Load Patient"}
        </button>
        <button
          onClick={linkPatient}
          disabled={loading}
          className="bg-green-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-green-700 flex gap-2 items-center justify-center disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
        >
          <Link2 size={18}/> Link Patient
        </button>
      </div>

      {vitals.length > 0 && (
        <button
          onClick={() => {
            console.log("🔘 DOCTOR - Opening messages modal");
            setShowMessages(true);
          }}
          className="mb-4 sm:mb-6 bg-purple-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-purple-700 flex gap-2 items-center text-sm sm:text-base"
        >
          <MessageCircle size={18}/> Messages with {currentPatient}
        </button>
      )}

      {/* STATS - Responsive Grid */}
      {vitals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
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

      {/* TABLE - Responsive with horizontal scroll */}
      {vitals.length > 0 ? (
        <div className="bg-white/5 rounded-3xl overflow-hidden">
          <div className="bg-white/10 p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-semibold">Patient Vitals - {currentPatient}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[800px]">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-2 sm:p-4 text-left">Date</th>
                  <th className="p-2 sm:p-4 text-left">Time</th>
                  <th className="p-2 sm:p-4 text-center">HR</th>
                  <th className="p-2 sm:p-4 text-center">BP</th>
                  <th className="p-2 sm:p-4 text-center">O₂</th>
                  <th className="p-2 sm:p-4 text-left">Notes</th>
                  <th className="p-2 sm:p-4 text-center">Current</th>
                  <th className="p-2 sm:p-4 text-center">Set Reaction</th>
                </tr>
              </thead>
              <tbody>
                {vitals.map((v, idx) => {
                  const hrHigh = Number(v.HeartRate) > 100;
                  const bpHigh = Number(v.BloodPressureSys) > 130;
                  const o2Low = Number(v.OxygenSaturation) < 95;
                  
                  return (
                    <tr key={v.VitalID || idx} className="border-t border-white/10">
                      <td className="p-2 sm:p-4 text-left">{v.RecordedDate}</td>
                      <td className="p-2 sm:p-4 text-left">{v.RecordedTime}</td>
                      <td className={`p-2 sm:p-4 text-center font-bold ${hrHigh ? "text-red-400" : ""}`}>
                        {v.HeartRate}
                      </td>
                      <td className={`p-2 sm:p-4 text-center font-bold ${bpHigh ? "text-red-400" : ""}`}>
                        {v.BloodPressureSys}/{v.BloodPressureDia}
                      </td>
                      <td className={`p-2 sm:p-4 text-center font-bold ${o2Low ? "text-red-400" : ""}`}>
                        {v.OxygenSaturation}%
                      </td>
                      <td className="p-2 sm:p-4 text-left text-xs">{v.Notes || "-"}</td>
                      <td className="p-2 sm:p-4 text-center whitespace-nowrap">
                        {v.DoctorReaction === "IMPROVING" && "😊"}
                        {v.DoctorReaction === "STABLE" && "😐"}
                        {v.DoctorReaction === "CRITICAL" && "☹️"}
                        {!v.DoctorReaction && "⏳"}
                      </td>
                      <td className="p-2 sm:p-4 text-center">
                        <select
                          className="bg-slate-700 p-2 rounded text-white cursor-pointer text-xs sm:text-sm"
                          value={v.DoctorReaction || ""}
                          onChange={e => setReaction(v.VitalID, e.target.value)}
                        >
                          <option value="">Select</option>
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
        </div>
      ) : !loading && (
        <div className="bg-white/5 rounded-3xl p-6 sm:p-10 text-center text-slate-400">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-base sm:text-lg">Enter a patient reference and click "Load Patient"</p>
          <p className="text-xs sm:text-sm mt-2">Make sure the patient is linked to you first</p>
        </div>
      )}

      {/* MESSAGES MODAL - Responsive */}
      {showMessages && currentPatient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl w-full max-w-[500px] max-h-[90vh] sm:max-h-[600px] flex flex-col">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              💬 Messages with {currentPatient}
            </h2>

            <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-[200px] sm:min-h-[300px] bg-black/20 rounded-xl p-4">
              {messages.length > 0 ? (
                messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`p-3 rounded-xl text-sm ${
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
              onClick={() => {
                console.log("🔘 DOCTOR - Closing messages modal");
                setShowMessages(false);
              }}
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

function Stat({ icon, title, value }) {
  return (
    <div className="bg-white/5 p-4 sm:p-6 rounded-3xl">
      <div className="text-blue-400 mb-2">{icon}</div>
      <p className="text-slate-400 text-sm sm:text-base">{title}</p>
      <h2 className="text-2xl sm:text-3xl font-bold">{value}</h2>
    </div>
  );
}

export default DoctorDashboard;