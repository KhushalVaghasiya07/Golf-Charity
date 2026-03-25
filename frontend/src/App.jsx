import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import SubscribePage from "./pages/SubscribePage";
import WinningsPage from "./pages/WinningsPage";
import { useEffect, useState } from "react";

// 🔒 Private Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};


const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN:", token);

  if (!token) {
    console.log("NO TOKEN");
    return <Navigate to="/" />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    console.log("PAYLOAD:", payload);
    console.log("ROLE CHECK:", payload.role === "admin");

    if (payload.role === "admin") {
      return children;
    } else {
      console.log("NOT ADMIN → REDIRECT");
      return <Navigate to="/dashboard" />;
    }

  } catch (err) {
    console.log("ERROR:", err);
    return <Navigate to="/" />;
  }
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/subscribe"
          element={
            <PrivateRoute>
              <SubscribePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/winnings"
          element={
            <PrivateRoute>
              <WinningsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}