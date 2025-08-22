import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded ${isActive ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-50"}`;
  return (
    <nav className="w-full bg-white shadow">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold">Predict Suite</Link>
        <div className="flex gap-2">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/price" className={linkClass}>Predict Price</NavLink>
          <NavLink to="/codeforces" className={linkClass}>Codeforces</NavLink>
        </div>
      </div>
    </nav>
  );
}
