import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [draw, setDraw] = useState(null);

  const fetchUsers = async () => {
    const res = await API.get("/admin/users");
    setUsers(res.data);
  };

  const runDraw = async () => {
    const res = await API.get("/admin/draw");
    setDraw(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-5">
        <button onClick={runDraw}>Run Draw</button>

        {draw && (
          <div>
            <p>Numbers: {draw.drawNumbers.join(", ")}</p>
            <p>Winners: {JSON.stringify(draw.winners)}</p>
          </div>
        )}

        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Charity</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td>{u.email}</td>
                <td>{u.charity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}