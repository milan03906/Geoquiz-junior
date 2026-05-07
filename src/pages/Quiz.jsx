import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import QuestionRenderer from "../components/quiz/QuestionRenderer";

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);

  const category = searchParams.get("category") || "all";
  const difficulty = searchParams.get("difficulty") || "all";
  const grade = searchParams.get("grade") || "all";
  const search = searchParams.get("search") || "";
  const limit = searchParams.get("limit") || "30";

  const autoSubmit = useCallback(async () => {
    if (submitting || questions.length === 0) return;
    try {
      setSubmitting(true);
      const payload = {
        answers: questions.map((q) => ({
          questionId: q._id,
          selectedAnswer: answers[q._id] ?? null,
        })),
        category,
        difficulty,
        grade: grade === "all" ? null : Number(grade),
        timeElapsed: 600 - timeLeft,
      };
      const { data } = await api.post("/attempts/submit", payload);
      navigate(`/results/${data._id}`);
    } catch {
      setError("Greška pri slanju.");
      setSubmitting(false);
    }
  }, [questions, answers, category, difficulty, grade, navigate, submitting, timeLeft]);

  useEffect(() => {
    if (loading || submitting || questions.length === 0) return;
    if (timeLeft === 0) { autoSubmit(); return; }
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, submitting, questions.length, autoSubmit]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/questions/quiz", {
          params: { category, difficulty, grade, search, limit },
        });
        setQuestions(data.questions);
        setAnswers({});
      } catch (err) {
        setError(err?.response?.data?.message || "Greška pri učitavanju kviza.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [category, difficulty, grade, search, limit]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    autoSubmit();
  };

  const answeredCount = Object.keys(answers).filter(
    (key) => answers[key] !== null && answers[key] !== ""
  ).length;

  const progressPercentage = questions.length > 0
    ? (answeredCount / questions.length) * 100
    : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) return <div className="main"><p>Učitavanje kviza...</p></div>;
  if (error) return <div className="main"><p className="error-text">{error}</p></div>;

  return (
    <section className="quiz-page-container">
      <div className="quiz-progress-wrapper">
        <div className="quiz-progress-bar" style={{ width: `${progressPercentage}%` }} />
      </div>

      <div className="quiz-sticky-header">
        <h1>Kviz</h1>
        <div className="quiz-stats-group">
          <div className={`quiz-timer-box ${timeLeft < 30 ? "urgent" : ""}`}>
            <span>Preostalo vreme:</span>
            <strong>{formatTime(timeLeft)}</strong>
          </div>
        </div>
      </div>

      <p className="quiz-meta-info">
        Kategorija: <strong>{category}</strong> | Težina: <strong>{difficulty}</strong> | Pitanja: <strong>{questions.length}</strong>
      </p>

      {questions.length === 0 ? (
        <p>Nema pitanja za izabrani filter.</p>
      ) : (
        <form onSubmit={handleSubmit} className="quiz-form">
          {questions.map((question, index) => {
            const isChallenge = (index + 1) % 5 === 0 && question.type === "map_click";
            return (
              <QuestionRenderer
                key={question._id}
                question={question}
                index={index}
                value={answers[question._id]}
                onChange={(value) => handleAnswerChange(question._id, value)}
                isChallenge={isChallenge}
              />
            );
          })}

          <div className="quiz-footer">
            <p>Odgovoreno: <strong>{answeredCount}</strong> / {questions.length}</p>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Šaljem..." : "Završi kviz"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}