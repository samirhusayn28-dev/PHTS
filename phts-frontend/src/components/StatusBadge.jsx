function StatusBadge({ status }) {
  const styles = {
    stable: "bg-green-500/20 text-green-400 border-green-400/30",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
    critical: "bg-red-500/20 text-red-400 border-red-400/30"
  };

  const labels = {
    stable: "Stable",
    warning: "Warning",
    critical: "Critical"
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default StatusBadge;
