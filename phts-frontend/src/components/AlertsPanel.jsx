import { AlertTriangle, CheckCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";

function AlertsPanel({ alerts = [] }) {
  return (
    <div className="glass rounded-3xl p-10 lift glow-neutral">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="text-red-400" />
        Health Alerts
      </h3>

      <div className="section-line mb-6" />

      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle />
          <p>No alerts detected. Everything looks good.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {alerts.map((alert, index) => (
            <li
              key={index}
              className={`glass rounded-2xl p-5 lift ${
                alert.status === "critical"
                  ? "glow-danger"
                  : "glow-neutral"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {alert.description}
                  </p>
                </div>

                <StatusBadge status={alert.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AlertsPanel;
