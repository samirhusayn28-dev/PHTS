import StatusBadge from "./StatusBadge";

function PatientCard({ name, age, status, lastUpdate }) {
  return (
    <div className="glass rounded-3xl p-6 lift glow-neutral">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-slate-400 text-sm">
            Age: {age}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Last update: {lastUpdate}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

export default PatientCard;
