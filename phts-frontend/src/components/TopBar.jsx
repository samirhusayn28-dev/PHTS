import { LogOut, UserCircle } from "lucide-react";

function TopBar({ title, role, onLogout }) {
  return (
    <div className="flex justify-between items-center mb-10">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-slate-400 capitalize">{role} Dashboard</p>
      </div>

      <div className="flex items-center gap-4">
        <UserCircle size={28} className="text-slate-300" />
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default TopBar;
