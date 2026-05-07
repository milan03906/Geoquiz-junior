import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser"; 

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    
    if (form.name.trim().length < 2) return setError("Ime je prekratko.");
    if (form.message.trim().length < 10) return setError("Poruka mora imati bar 10 karaktera.");
    if (form.name.trim().length < 2) return setError("Ime je prekratko.");
    if (!form.email.includes("@") || !form.email.includes(".")) return setError("Unesi validnu email adresu.");
    if (form.subject.trim().length < 3) return setError("Naslov je prekratak.");
    if (form.message.trim().length > 1000) return setError("Poruka ne sme biti duža od 1000 karaktera.");

    try {
      setLoading(true);
      const templateParams = {
        name: form.name,
        email: form.email,
        title: form.subject,
        message: form.message,
      };

      await emailjs.send(
        "service_jotkvwh",   
        "template_hfkerjd",  
        templateParams,
        "oMAa_PLHoEGWoMD4z"    
      );

      setSuccess("Poruka je uspešno poslata! Proveri svoj poseban mejl. 📧");
      setForm(initialForm);
    } catch (err) {
      console.error("EmailJS greška:", err);
      setError("Došlo je do greške pri slanju. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  document.title = "Kontakt | GeoQuiz Junior";
}, []);

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Kontaktiraj nas</h1>
        <p>Piši nam i odgovorićemo ti na poseban mejl.</p>

        <input type="text" name="name" placeholder="Ime" value={form.name} onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input type="text" name="subject" placeholder="Naslov" value={form.subject} onChange={handleChange} />
        
       <textarea 
          className="contact-textarea"
          name="message" 
          placeholder="Tvoja poruka..." 
          value={form.message} 
          onChange={handleChange} 
          rows={6} 
          minLength={10}
          maxLength={1000}
          required />

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Slanje..." : "Pošalji poruku"}
        </button>
      </form>
    </section>
  );
}