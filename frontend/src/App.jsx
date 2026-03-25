import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import SubscribePage from "./pages/SubscribePage";
import WinningsPage from "./pages/WinningsPage";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import DrawHistory from "./pages/DrawHistory";
import Winners from "./pages/Winners";
import Users from "./pages/Users";

// 🔒 Private Route — any logged-in user
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

// 🔒 Admin Route — only role === "admin"
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "admin" ? children : <Navigate to="/dashboard" />;
  } catch {
    return <Navigate to="/" />;
  }
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* User Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/subscribe" element={<PrivateRoute><SubscribePage /></PrivateRoute>} />
        <Route path="/winnings" element={<PrivateRoute><WinningsPage /></PrivateRoute>} />

        {/* Legacy Admin (old single page) */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* New Admin Panel Pages */}
        <Route path="/admin/draws" element={<AdminRoute><DrawHistory /></AdminRoute>} />
        <Route path="/admin/winners" element={<AdminRoute><Winners /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
