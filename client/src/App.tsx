import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PredictPrice from "./pages/PredictPrice";
import CodeforcesPredictor from "./pages/CodeforcesPredictor";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/price" element={<PredictPrice />} />
        <Route path="/codeforces" element={<CodeforcesPredictor />} />
      </Routes>
    </BrowserRouter>
  );
}
