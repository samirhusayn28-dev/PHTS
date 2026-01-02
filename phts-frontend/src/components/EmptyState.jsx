import { Info } from "lucide-react";

function EmptyState({ message }) {
  return (
    <div className="glass rounded-3xl p-12 text-center text-slate-400">
      <Info className="mx-auto mb-4 text-blue-400" size={32} />
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
