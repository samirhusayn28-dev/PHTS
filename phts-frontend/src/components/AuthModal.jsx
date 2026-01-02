import { X } from "lucide-react";

function AuthModal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <div className="relative bg-white/5 border border-white/10 rounded-3xl p-12 w-full max-w-xl text-white modal">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X size={26} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default AuthModal;
