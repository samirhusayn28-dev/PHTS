import { Stethoscope, User } from "lucide-react";

function RoleSwitch({ role, setRole }) {
  return (
    <div className="flex bg-white/5 rounded-xl p-1 mb-8">
      <button
        onClick={() => setRole("doctor")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg ${
          role === "doctor"
            ? "bg-blue-600"
            : "text-slate-300 hover:text-white"
        }`}
      >
        <Stethoscope size={20} />
        Doctor
      </button>

      <button
        onClick={() => setRole("patient")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg ${
          role === "patient"
            ? "bg-blue-600"
            : "text-slate-300 hover:text-white"
        }`}
      >
        <User size={20} />
        Patient
      </button>
    </div>
  );
}

export default RoleSwitch;
