import { useMemo, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, TimeScale, Title, Tooltip, Legend);

export default function CodeforcesPredictor() {
  const [handle, setHandle] = useState("Nisikto");
  const [target, setTarget] = useState<number>(1600);
  type PredictionResponse = {
    handle: string;
    current_rating: number;
    target_rating: number;
    predicted_date: string; // YYYY-MM-DD
  };
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<{ timestamps: number[]; ratings: number[] } | null>(null);

  const API_BASE = import.meta.env.VITE_API || "http://127.0.0.1:5000";

  const fetchPrediction = async () => {
    if (!handle) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/predict`, {
        params: { handle, target },
      });
      setPrediction(res.data);

      const ratingsRes = await axios.get(`${API_BASE}/ratings`, { params: { handle } });
      setSeries({ timestamps: ratingsRes.data.timestamps, ratings: ratingsRes.data.ratings });
    } catch (err) {
      console.error(err);
      alert("Error fetching prediction");
    }
    setLoading(false);
  };

  const chartData = useMemo(() => {
    if (!series) return null;
    const ts = series.timestamps.map((t) => t * 1000); // to ms
    const y = series.ratings;
    if (ts.length < 2) return null;

    // Linear regression over time (ms)
    const n = ts.length;
    const sumX = ts.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = ts.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = ts.reduce((acc, xi) => acc + xi * xi, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = sumY / n - (slope * sumX) / n;

    const trend = ts.map((xi) => intercept + slope * xi);
    const expert = 1600;
    const candidateMaster = 1900;

    return {
      labels: ts,
      datasets: [
        {
          label: "Actual Ratings",
          data: ts.map((t, i) => ({ x: t, y: y[i] })),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          tension: 0.2,
          pointRadius: 2,
          fill: false,
        },
        {
          label: "Trend Line",
          data: ts.map((t, i) => ({ x: t, y: trend[i] })),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          borderDash: [6, 6],
          pointRadius: 0,
          fill: false,
        },
        {
          label: "Expert (1600)",
          data: ts.map((t) => ({ x: t, y: expert })),
          borderColor: "#16a34a",
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        },
        {
          label: "Candidate Master (1900)",
          data: ts.map((t) => ({ x: t, y: candidateMaster })),
          borderColor: "#ef4444",
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  }, [series]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const, labels: { usePointStyle: true } },
      title: { display: true, text: `Rating Prediction for ${handle || "User"}` },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      x: {
        type: "time" as const,
        time: { unit: "month" as const, tooltipFormat: "yyyy-MM-dd" },
        title: { display: true, text: "Date" },
        ticks: { maxRotation: 0, autoSkip: true },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        title: { display: true, text: "Rating" },
        suggestedMin: 800,
        suggestedMax: 2000,
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  }), [handle]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Codeforces Rating Predictor</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter Codeforces handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          min={800}
          max={3000}
          step={100}
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 w-28"
          title="Target rating"
        />
        <button
          onClick={fetchPrediction}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Predict"}
        </button>
      </div>
      {prediction && (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-2">Prediction Result</h2>
          <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-auto">
            {JSON.stringify(prediction, null, 2)}
          </pre>
        </div>
      )}

      {chartData && (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-5xl mt-6">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
