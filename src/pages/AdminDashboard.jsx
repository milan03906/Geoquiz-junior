import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setStats(data);
      } catch (err) {
        setStats({ recentAttempts: [] });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
    document.title = "Admin | GeoQuiz Junior";
  }, []);

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Učitavanje admin panela...</p>
    </div>
  );
 
  return (
    <section className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin panel</h1>
        <p>Ovde upravljaš pitanjima, korisnicima i porukama sa kontakt forme.</p>
      </header>

      <div className="admin-nav">
        <Link to="/admin/questions" className="nav-card">
          <span className="icon">⚙️</span>
          <h3>Upravljanje pitanjima</h3>
        </Link>
        <Link to="/admin/users" className="nav-card">
          <span className="icon">👤</span>
          <h3>Upravljanje korisnicima</h3>
        </Link>
      </div>

      {stats && (
        <div className="stats-section">
          <h2>Statistika sistema</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <label>Pitanja</label>
              <p className="value">{stats.questionsCount}</p>
            </div>
            <div className="stat-card">
              <label>Korisnici</label>
              <p className="value">{stats.usersCount}</p>
            </div>
            <div className="stat-card">
              <label>Pokušaji kvizova</label>
              <p className="value">{stats.attemptsCount}</p>
            </div>
            <div className="stat-card">
              <label>Kontakt poruke</label>
              <p className="value">{stats.contactsCount}</p>
            </div>
            <div className={`stat-card ${stats.unreadContactsCount > 0 ? "alert" : ""}`}>
              <label>Nepročitane poruke</label>
              <p className="value">{stats.unreadContactsCount}</p>
            </div>
            <div className="stat-card">
              <label>Admini</label>
              <p className="value">{stats.adminsCount}</p>
            </div>
          </div>

          <div className="admin-recent-activity">
            <div className="section-header">
              <h2>Poslednje aktivnosti</h2>
              <Link to="/leaderboard" className="view-all-link">Vidi leaderboard</Link>
            </div>
            <div className="table-container">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Korisnik</th>
                    <th>Kategorija</th>
                    <th>Rezultat</th>
                    <th>Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAttempts?.length > 0 ? (
                    stats.recentAttempts.map((attempt) => (
                      <tr key={attempt._id}>
                        <td><strong>{attempt.user?.name || "Gost"}</strong></td>
                        <td>{attempt.category || "Mešovito"}</td>
                        <td><span className="badge">{attempt.totalPoints ?? 0} poena</span></td>
                        <td>{new Date(attempt.createdAt).toLocaleDateString("sr-RS")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-table-msg">Nema zabeleženih aktivnosti.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}