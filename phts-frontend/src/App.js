import { useState } from "react";
import Login from "./components/Login";
import PatientDashboard from "./dashboards/PatientDashboard";
import DoctorDashboard from "./dashboards/DoctorDashboard";

export default function App() {
  const [user,setUser]=useState(null);
  if (!user) return <Login onLogin={setUser} />;
  return user.role==="doctor"
    ? <DoctorDashboard user={user} onLogout={()=>setUser(null)} />
    : <PatientDashboard user={user} onLogout={()=>setUser(null)} />;
}
