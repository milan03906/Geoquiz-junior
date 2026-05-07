import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("weekly");
  const [timeLeft, setTimeLeft] = useState("");
  const [targetDate, setTargetDate] = useState(null);

  useEffect(() => {
    document.title = "Rang lista | GeoQuiz Junior";
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/attempts/leaderboard?type=${filter}&t=${Date.now()}`);
        setLeaders(data?.leaderboard ?? (Array.isArray(data) ? data : []));
        setTargetDate(data?.nextReset ?? null);
      } catch {
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filter]);

  useEffect(() => {
    if (!targetDate || filter !== "weekly") return setTimeLeft("");
    const interval = setInterval(() => {
      const diff = new Date(targetDate) - Date.now();
      if (diff < 0) return setTimeLeft("Resetovanje...");
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, filter]);

  return (
    <section className="leaderboard-container">
      <h1>🏆 Rang Lista</h1>

      <div className="filter-group">
        {["weekly", "all-time"].map((f) => (
          <button
            key={f}
            className={`btn-filter ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "weekly" ? "Ove nedelje" : "Sve vreme"}
          </button>
        ))}
      </div>

      {filter === "weekly" && timeLeft && (
        <div className="timer-section">
          ⏱️ Resetuje se za: <strong>{timeLeft}</strong>
        </div>
      )}

      {loading ? (
        <p>Učitavanje...</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Igrač</th>
              <th>Poeni</th>
              <th>Kvizovi</th>
            </tr>
          </thead>
          <tbody>
            {leaders.length > 0 ? leaders.map((user, i) => (
              <tr key={user._id || i} className={i === 0 ? "top-player" : ""}>
                <td>{MEDALS[i] ?? `${i + 1}.`}</td>
                <td>{user.username || "Nepoznat igrač"}</td>
                <td><strong>{Math.round(user.totalScore)}</strong></td>
                <td>{user.attemptsCount}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="no-data">Nema rezultata za ovaj period.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <Link to="/quizzes" className="btn-primary-leaderboard">Igraj i ti!</Link>
    </section>
  );
}