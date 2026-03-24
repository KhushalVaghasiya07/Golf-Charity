import { useState } from "react";
import API from "../api/axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    const res = await API.post("/auth/login", form);
    localStorage.setItem("token", res.data.token);
    window.location = "/dashboard";
  };

  return (
    <div className="p-10">
      <h2>Login</h2>
      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}