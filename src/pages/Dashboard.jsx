import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function Dashboard() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [message, setMessage] = useState("");

  const userString = localStorage.getItem("user");
  const userData = userString ? JSON.parse(userString) : null;
  
  const userRole = userData?.role || "user";
  const userName = userData?.name || "Korisniče";
  const isPremium = userData?.isPremium || false;

  useEffect(() => {
    document.title = "Dashboard | GeoQuiz Junior";
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/attempts/user/me");
        const attemptsData = data.success ? data.attempts : data;
        setAttempts(Array.isArray(attemptsData) ? attemptsData : []);
      } catch (err) {
        console.error("Greška pri učitavanju dashboarda", err);
      } finally {
        setLoading(false);
      }
    };

    const checkStripeStatus = async () => {
  const query = new URLSearchParams(window.location.search);
  const sessionId = query.get("session_id");
  if (!query.get("success") || !sessionId) return;
  try {
    await api.post("/payment/verify", { session_id: sessionId });
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser) {
      localUser.isPremium = true;
      localStorage.setItem("user", JSON.stringify(localUser));
    }
    setMessage("Čestitamo! Postali ste Premium član. 🎉");
    window.history.replaceState({}, "", "/dashboard");
  } catch (err) {
    setMessage("Greška pri verifikaciji plaćanja.");
  }
};

    fetchDashboard();
    checkStripeStatus();
  }, []);

  const handlePayment = async () => {
    try {
      const { data } = await api.post('/payment/create-checkout-session');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Greška pri Stripe-u:", err);
      alert("Greška pri pokretanju plaćanja.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Da li želiš da obrišeš ovaj rezultat?")) {
      try {
        await api.delete(`/attempts/${id}`);
        setAttempts(attempts.filter((a) => a._id !== id));
      } catch (err) {
        alert("Greška pri brisanju.");
      }
    }
  };

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch = attempt.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === "all" || String(attempt.grade) === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  if (loading) return <div className="loader">Učitavanje podataka...</div>;

 

 return (
  <div className="dashboard-container">
    <header className="dashboard-header">
      <h1>Zdravo, {userName}! {isPremium && "👑"}</h1>
      <p>Dobrodošao na svoju kontrolnu tablu.</p>
    </header>

    {message && <p className="success-msg">{message}</p>}
    {userRole === "admin" && (
      <div className="admin-panel-card">
        <h3 className="admin-card-title">🛡️ Admin Panel</h3>
        <Link to="/admin" className="btn btn-admin">
          Upravljaj sistemom
        </Link>
      </div>
    )}

    {!isPremium ? (
      <div className="premium-banner">
        <h3>Postani Premium Član 🌍</h3>
        <p>Podrži projekat i otključaj sve mogućnosti za samo 10€.</p>
        <button className="premium-btn" onClick={handlePayment}>
          Kupi Sada
        </button>
      </div>
    ) : (
      <div className="premium-status-badge">
        Sve premium pogodnosti su aktivne! 👑
      </div>
    )}


    <div className="filters-section">
      <input
        type="text"
        className="filter-input"
        placeholder="Pretraži kategoriju..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
        className="filter-select"
        value={gradeFilter}
        onChange={(e) => setGradeFilter(e.target.value)}
      >
        <option value="all">Svi razredi</option>
        <option value="5">5. razred</option>
        <option value="6">6. razred</option>
        <option value="7">7. razred</option>
        <option value="8">8. razred</option>
      </select>
    </div>

    {attempts.length === 0 ? (
      <div className="no-data-box">
        <p>Nemaš sačuvanih rezultata. Vreme je za prvi kviz!</p>
        <Link to="/quizzes" className="btn btn-primary">Započni kviz</Link>
      </div>
    ) : (
      <div className="attempts-list">
        <div className="table-header">
          <span>Kategorija</span>
          <span>Uspeh</span>
          <span>Datum</span>
          <span className="text-right">Akcije</span>
        </div>

        {filteredAttempts.map((attempt) => (
          <div key={attempt._id} className="attempt-row">
            <div className="attempt-category-info">
              <strong>{attempt.category === 'all' ? 'Opšte znanje' : attempt.category}</strong>
              <div className="attempt-grade-sub">{attempt.grade ? `${attempt.grade}. razred` : 'Svi razredi'}</div>
            </div>
            
            <div className={attempt.correctCount / attempt.totalQuestions >= 0.5 ? "score-good" : "score-bad"}>
              {attempt.correctCount}/{attempt.totalQuestions} ({Math.round((attempt.correctCount / attempt.totalQuestions) * 100)}%)
            </div>

            <div className="attempt-date">
              {new Date(attempt.createdAt).toLocaleDateString("sr-RS")}
            </div>

            <div className="attempt-actions">
              <Link to={`/results/${attempt._id}`} className="details-link">Detalji</Link>
              <button onClick={() => handleDelete(attempt._id)} className="delete-btn">Obriši</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
