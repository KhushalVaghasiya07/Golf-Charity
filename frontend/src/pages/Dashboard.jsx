import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [scores, setScores] = useState([]);
  const [value, setValue] = useState("");
  const [charity, setCharity] = useState("");

  const fetchScores = async () => {
    const res = await API.get("/scores");
    setScores(res.data);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const addScore = async () => {
    await API.post("/scores/add", { value });
    fetchScores();
  };

  const updateCharity = async () => {
    await API.put("/user/charity", { charity });
    alert("Updated");
  };

  return (
    <div>
      <Navbar />
      <div className="p-5">
        <h2>Scores</h2>
        <ul>
          {scores.map((s, i) => (
            <li key={i}>{s.value}</li>
          ))}
        </ul>

        <input placeholder="Score (1-45)" onChange={e => setValue(e.target.value)} />
        <button onClick={addScore}>Add Score</button>

        <h2>Charity</h2>
        <select onChange={e => setCharity(e.target.value)}>
          <option>Education</option>
          <option>Health</option>
          <option>Food</option>
        </select>
        <button onClick={updateCharity}>Update</button>
      </div>
    </div>
  );
}