import { useState } from "react";
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

export default function PredictPrice() {
  const [isloading, setLoading] = useState<boolean>(false);
  const [output, setOutput] = useState<boolean>(false);
  const [formData, setFormData] = useState<PropertyInfo>({
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
  });
  const [Price, setPrice] = useState<number>(0);

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        [name]: checked,
      },
    }));
  };

  async function handlePredictprice() {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API}/predict_price`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setPrice(response.data.price);
      setLoading(false);
      setOutput(true);
    } catch (error) {
      console.log(error);
    }
  }

  const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const RangeField = ({
    label,
    name,
    min,
    max,
    value,
    onChange,
  }: {
    label: string;
    name: keyof PropertyInfo;
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
        name={name as string}
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
              <label className="inline-flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                <input type="checkbox" name="mainRoad" checked={formData.benefits.mainRoad} onChange={handleCheckboxChange} className="accent-blue-600" />
                <span>Main Road</span>
              </label>
              <label className="inline-flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                <input type="checkbox" name="guestRoom" checked={formData.benefits.guestRoom} onChange={handleCheckboxChange} className="accent-blue-600" />
                <span>Guest Room</span>
              </label>
              <label className="inline-flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                <input type="checkbox" name="basement" checked={formData.benefits.basement} onChange={handleCheckboxChange} className="accent-blue-600" />
                <span>Basement</span>
              </label>
              <label className="inline-flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                <input type="checkbox" name="hotWaterHeating" checked={formData.benefits.hotWaterHeating} onChange={handleCheckboxChange} className="accent-blue-600" />
                <span>Hot Water Heating</span>
              </label>
              <label className="inline-flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                <input type="checkbox" name="airConditioning" checked={formData.benefits.airConditioning} onChange={handleCheckboxChange} className="accent-blue-600" />
                <span>Air Conditioning</span>
              </label>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handlePredictprice}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow hover:opacity-95 active:opacity-90 transition"
            >
              {isloading ? "Processing..." : "Predict Price"}
            </button>
          </div>

          {output && (
            <div className="mt-6">
              <div className="w-full rounded-lg border border-blue-200 bg-blue-50 text-blue-900 p-4 text-center font-semibold shadow-sm">
                Predicted House Price: {currency.format(Price)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
