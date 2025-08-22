import { useState } from "react";
import axios from "axios";

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

  const fetchPrediction = async () => {
    if (!handle) return;
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API || "http://127.0.0.1:5000";
      const res = await axios.get(`${base}/predict`, {
        params: { handle, target },
      });
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching prediction");
    }
    setLoading(false);
  };

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
    </div>
  );
}
