import { useEffect, useState } from "react";
import { api } from "../api/client";

const emptyForm = {
  text: "",
  optionsText: "",
  correctAnswer: "",
  category: "Srbija",
  difficulty: "easy",
  grade: 5,
};

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/questions", { params: { limit: 50 } });
      setQuestions(data.questions);
    } catch (err) {
      setError(err?.response?.data?.message || "Greška pri učitavanju pitanja.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuestions(); }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEdit = (q) => {
    setEditingId(q._id);
    setForm({
      text: q.text,
      optionsText: q.options.join("\n"),
      correctAnswer: q.correctAnswer,
      category: q.category,
      difficulty: q.difficulty,
      grade: q.grade,
    });
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => { setEditingId(null); setForm(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const payload = {
      text: form.text,
      options: form.optionsText,
      correctAnswer: form.correctAnswer,
      category: form.category,
      difficulty: form.difficulty,
      grade: Number(form.grade),
    };
    try {
      if (editingId) {
        await api.put(`/admin/questions/${editingId}`, payload);
        setSuccess("Pitanje je ažurirano.");
      } else {
        await api.post("/admin/questions", payload);
        setSuccess("Pitanje je kreirano.");
      }
      resetForm();
      loadQuestions();
    } catch (err) {
      setError(err?.response?.data?.message || "Greška pri snimanju pitanja.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Da li si siguran da želiš da obrišeš ovo pitanje?")) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      setSuccess("Pitanje je obrisano.");
      loadQuestions();
    } catch (err) {
      setError(err?.response?.data?.message || "Greška pri brisanju pitanja.");
    }
  };

  return (
    <section>
      <h1>Upravljanje pitanjima</h1>

      <form className="auth-form admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Izmeni pitanje" : "Novo pitanje"}</h2>

        <input
          type="text"
          name="text"
          placeholder="Tekst pitanja"
          value={form.text}
          onChange={handleChange}
        />

        <textarea
          className="admin-textarea"
          name="optionsText"
          placeholder="Opcije, jedna po liniji"
          rows={5}
          value={form.optionsText}
          onChange={handleChange}
        />

        <input
          type="text"
          name="correctAnswer"
          placeholder="Tačan odgovor"
          value={form.correctAnswer}
          onChange={handleChange}
        />

        <select name="category" value={form.category} onChange={handleChange}>
          <option value="Srbija">Srbija</option>
          <option value="Evropa">Evropa</option>
          <option value="Svet">Svet</option>
          <option value="Priroda i društvo">Priroda i društvo</option>
        </select>

        <select name="difficulty" value={form.difficulty} onChange={handleChange}>
          <option value="easy">Lako</option>
          <option value="medium">Srednje</option>
          <option value="hard">Teško</option>
        </select>

        <input
          type="number"
          name="grade"
          min="5"
          max="8"
          value={form.grade}
          onChange={handleChange}
        />

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <button type="submit">{editingId ? "Sačuvaj izmene" : "Dodaj pitanje"}</button>
        {editingId && <button type="button" onClick={resetForm}>Otkaži</button>}
      </form>

      <hr className="admin-divider" />

      {loading && <p>Učitavanje pitanja...</p>}

      {!loading && questions.map((q) => (
        <article key={q._id} className="question-card">
          <h3>{q.text}</h3>
          <p>{q.category} | {q.difficulty} | {q.grade}. razred</p>
          <p>Tačan odgovor: {q.correctAnswer}</p>
          <div className="admin-actions">
            <button onClick={() => handleEdit(q)}>Izmeni</button>
            <button onClick={() => handleDelete(q._id)}>Obriši</button>
          </div>
        </article>
      ))}
    </section>
  );
}