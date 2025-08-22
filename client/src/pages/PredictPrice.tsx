import { useCallback, useMemo, useState } from "react";
import axios from "axios";

type Benefits = {
  mainRoad: boolean;
  guestRoom: boolean;
  basement: boolean;
  hotWaterHeating: boolean;
  airConditioning: boolean;
};

type PropertyInfo = {
  area: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  parking: number;
  benefits: Benefits;
};

type NumericField = "area" | "bedrooms" | "bathrooms" | "stories" | "parking";
type PriceResponse = { price: number };

const API_BASE = import.meta.env.VITE_API || "http://127.0.0.1:5000";
const DEFAULT_FORM: PropertyInfo = {
  area: 500,
  bedrooms: 1,
  bathrooms: 1,
  stories: 1,
  parking: 0,
  benefits: {
    mainRoad: false,
    guestRoom: false,
    basement: false,
    hotWaterHeating: false,
    airConditioning: false,
  },
};

export default function PredictPrice() {
  const [isLoading, setLoading] = useState(false);
  const [output, setOutput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PropertyInfo>(DEFAULT_FORM);
  const [price, setPrice] = useState(0);

  const handleRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as NumericField;
    setFormData((prev) => ({ ...prev, [key]: Number(value) }));
  }, []);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      benefits: { ...prev.benefits, [name]: checked },
    }));
  }, []);

  const handlePredictprice = useCallback(async () => {
    setLoading(true);
    setOutput(false);
    setError(null);
    try {
      const { data } = await axios.post<PriceResponse>(
        `${API_BASE}/predict_price`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      setPrice(data.price);
      setOutput(true);
    } catch (e) {
      console.error(e);
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const currency = useMemo(() =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })
  , []);

  const formatMillionUSD = useCallback((value: number) => {
    const millions = value / 1_000_000;
    return `${currency.format(millions)}M`;
  }, [currency]);

  const RangeField = ({ label, name, min, max, value, onChange }: {
    label: string;
    name: NumericField;
    min: number;
    max: number;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">{value}</span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="w-full accent-blue-600"
      />
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">House Price Predictor</h1>
          <p className="text-slate-600 mt-2">Tune the sliders and options, then get an instant estimate.</p>
        </div>

        <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl ring-1 ring-slate-200 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RangeField label="Area (sqft)" name="area" min={100} max={5000} value={formData.area} onChange={handleRangeChange} />
            <RangeField label="Bedrooms" name="bedrooms" min={1} max={10} value={formData.bedrooms} onChange={handleRangeChange} />
            <RangeField label="Bathrooms" name="bathrooms" min={1} max={10} value={formData.bathrooms} onChange={handleRangeChange} />
            <RangeField label="Stories" name="stories" min={1} max={5} value={formData.stories} onChange={handleRangeChange} />
            <RangeField label="Parking (cars)" name="parking" min={0} max={5} value={formData.parking} onChange={handleRangeChange} />
          </div>

          <div className="mt-8">
            <p className="font-semibold text-slate-800 mb-3">Benefits</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  { name: "mainRoad", label: "Main Road" },
                  { name: "guestRoom", label: "Guest Room" },
                  { name: "basement", label: "Basement" },
                  { name: "hotWaterHeating", label: "Hot Water Heating" },
                  { name: "airConditioning", label: "Air Conditioning" },
                ] as const
              ).map((b) => (
                <label key={b.name} className="inline-flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                  <input
                    type="checkbox"
                    name={b.name}
                    checked={formData.benefits[b.name]}
                    onChange={handleCheckboxChange}
                    className="accent-blue-600"
                  />
                  <span>{b.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handlePredictprice}
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow hover:opacity-95 active:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Predict Price"}
            </button>
          </div>

          {error && (
            <div className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 text-red-900 p-3 text-center shadow-sm">
              {error}
            </div>
          )}

          {output && (
            <div className="mt-6">
              <div className="w-full rounded-lg border border-blue-200 bg-blue-50 text-blue-900 p-4 text-center font-semibold shadow-sm">
                Predicted House Price: {formatMillionUSD(price)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
