import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bg-black text-white p-4 flex gap-4">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/admin">Admin</Link>
      <button onClick={() => {
        localStorage.removeItem("token");
        window.location = "/";
      }}>Logout</button>
    </div>
  );
}