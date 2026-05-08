import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => { document.title = "Registracija | GeoQuiz Junior"; }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 2) return setError("Ime je prekratko.");
    if (!form.email.includes("@") || !form.email.includes(".")) return setError("Unesi validnu email adresu.");
    if (form.password.length < 8) return setError("Lozinka mora imati bar 8 karaktera.");

    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Neuspešna registracija.");
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Registracija</h1>

        <input
          type="text"
          name="name"
          placeholder="Ime"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Lozinka"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit">Registruj se</button>

        <p>Već imaš nalog? <Link to="/login">Uloguj se</Link></p>
      </form>
    </section>
  );
}