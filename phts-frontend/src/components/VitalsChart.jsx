import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function VitalsChart({ vitals }) {
  if (!vitals || vitals.length === 0) return null;

  const data = {
    labels: vitals.map(v => v.RecordedDate),
    datasets: [
      {
        label: "Heart Rate",
        data: vitals.map(v => Number(v.HeartRate)),
        borderColor: "#3b82f6",
        tension: 0.3
      },
      {
        label: "Oxygen %",
        data: vitals.map(v => Number(v.OxygenSaturation)),
        borderColor: "#22c55e",
        tension: 0.3
      }
    ]
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Vitals Trend</h2>
      <Line data={data} />
    </div>
  );
}

export default VitalsChart;
