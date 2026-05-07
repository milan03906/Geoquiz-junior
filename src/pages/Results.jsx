import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";

function formatAnswer(answer) {
  if (answer === null || answer === undefined || answer === "") return "Nisi odgovorio/la";
  if (typeof answer === "object") {
    return Object.entries(answer).map(([k, v]) => `${k} → ${v}`).join(", ");
  }
  return String(answer);
}

export default function Results() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Rezultat | GeoQuiz Junior";
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/attempts/${id}`);
        setAttempt(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Greška pri učitavanju rezultata.");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) return <div className="loader">Učitavanje rezultata...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!attempt) return <p>Nema rezultata.</p>;

  return (
    <section className="results-page">
      <h1>Rezultat kviza</h1>

      <div className="stats-container">
        <div className="stat-card">
          <p>Tačnih odgovora</p>
          <strong>{attempt.correctCount ?? 0} / {attempt.totalQuestions ?? 0}</strong>
        </div>
        <div className="stat-card">
          <p>Ukupno poena</p>
          <strong className="score-good">{attempt.totalPoints ?? 0}</strong>
        </div>
        <div className="stat-card">
          <p>Uspešnost</p>
          <strong>{attempt.score ?? 0}%</strong>
        </div>
      </div>

      <div className="results-list">
        <h2>Pregled pitanja:</h2>
        {(attempt.questions || []).map((q, index) => (
          <article key={index} className={`result-card ${q.isCorrect ? "correct" : "wrong"}`}>
            <h3>{index + 1}. {q.questionText}</h3>
            <p>Tvoj odgovor: <strong>{formatAnswer(q.selectedAnswer)}</strong></p>
            <p>Tačan odgovor: <strong>{formatAnswer(q.correctAnswer)}</strong></p>
            <p>Poena osvojeno: <strong>{q.pointsEarned ?? 0}</strong></p>
          </article>
        ))}
      </div>

      <Link to="/quizzes" className="btn-back">Nazad na kvizove</Link>
    </section>
  );
}