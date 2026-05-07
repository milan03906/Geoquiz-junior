import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const initialFilters = { search: "", category: "all", difficulty: "all", grade: "all" };

export default function Quizzes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [questions, setQuestions] = useState([]);
  const [pageData, setPageData] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Kvizovi | GeoQuiz Junior";
    fetchQuestions(1, appliedFilters);
  }, [appliedFilters]);

  const fetchQuestions = async (page = 1, currentFilters = appliedFilters) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/questions", {
        params: { page, limit: 6, ...currentFilters },
      });
      setQuestions(data.questions);
      setPageData({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      setError(err?.response?.data?.message || "Greška pri učitavanju pitanja.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); setAppliedFilters(filters); };

  const startQuiz = () => {
    if (["7", "8"].includes(appliedFilters.grade) && !user?.isPremium) {
      alert("Kvizovi za 7. i 8. razred su dostupni samo Premium članovima! 👑");
      navigate("/dashboard");
      return;
    }
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([k, v]) => {
      if (v && v !== "all") params.set(k, v);
    });
    params.set("limit", "30");
    navigate(`/quiz?${params.toString()}`);
  };

  return (
    <section className="quizzes-page">
      <h1>Spisak pitanja</h1>
      <p>Filtriraj pitanja i pokreni random kviz sa 30 pitanja.</p>

      <form onSubmit={handleSubmit} className="filter-form">
        <input
          type="text"
          name="search"
          placeholder="Pretraga po tekstu"
          value={filters.search}
          onChange={handleChange}
        />

        <select name="category" value={filters.category} onChange={handleChange}>
          <option value="all">Sve kategorije</option>
          <option value="Srbija">Srbija</option>
          <option value="Evropa">Evropa</option>
          <option value="Svet">Svet</option>
          <option value="Priroda i društvo">Priroda i društvo</option>
        </select>

        <select name="difficulty" value={filters.difficulty} onChange={handleChange}>
          <option value="all">Svi nivoi</option>
          <option value="easy">Lako</option>
          <option value="medium">Srednje</option>
          <option value="hard">Teško</option>
        </select>

        <select name="grade" value={filters.grade} onChange={handleChange}>
          <option value="all">Svi razredi</option>
          {[5,6].map(g => (
            <option key={g} value={g}>{g}. razred</option>
          ))}
          <option value="7">7. razred 👑</option>
          <option value="8">8. razred 👑</option>
        </select>

        <button type="submit">Primeni filtere</button>
        <button type="button" onClick={startQuiz} className="btn-primary">
          Pokreni kviz
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <div className="question-list">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : !error && (
        <>
          {questions.length > 0 ? (
            <>
              <p>Ukupno pitanja: <strong>{pageData.total}</strong></p>

              <div className="question-list">
                {questions.map((q) => {
                  const isLocked = [7, 8].includes(q.grade) && !user?.isPremium;
                  return (
                    <article key={q._id} className={`question-card ${isLocked ? "is-locked" : ""}`}>
                      {isLocked && <div className="lock-badge">🔒 Premium</div>}
                      <h3>{isLocked ? "Sadržaj dostupan Premium članovima" : q.text}</h3>
                      <p>{q.category} | {q.difficulty} | {q.grade}. razred</p>
                      {isLocked && (
                        <button onClick={() => navigate("/dashboard")} className="btn-small">
                          Otključaj 👑
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>

              <div className="pagination">
                <button disabled={pageData.page <= 1} onClick={() => fetchQuestions(pageData.page - 1, appliedFilters)}>
                  Prethodna
                </button>
                <span>Strana {pageData.page} / {pageData.totalPages}</span>
                <button disabled={pageData.page >= pageData.totalPages} onClick={() => fetchQuestions(pageData.page + 1, appliedFilters)}>
                  Sledeća
                </button>
              </div>
            </>
          ) : (
            <div className="empty-results">
              <h3>Nema pronađenih pitanja</h3>
              <p>Pokušaj da izmeniš filtere.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}