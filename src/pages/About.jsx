import { useEffect } from "react";
export default function About() {
  useEffect(() => {
  document.title = "O nama | GeoQuiz Junior";
}, []);
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>O projektu GeoQuiz Junior</h1>
        <p>GeoQuiz Junior je interaktivna platforma namenjena učenicima osnovnih škola za lakše i zabavnije učenje geografije.</p>
      </section>

      <section className="about-grid">
        <div className="about-card">
          <h3>📚 Obuhvaćeno gradivo</h3>
          <p>Pitanja su pažljivo birana i prilagođena planu i programu za 5, 6, 7. i 8. razred osnovne škole.</p>
        </div>
        <div className="about-card">
          <h3>🎮 Igra</h3>
          <p>Kroz sakupljanje poena, praćenje progresa na Dashboard-u i rang liste, učenje postaje igra.</p>
        </div>
        <div className="about-card">
          <h3>💎 Premium pristup</h3>
          <p>Premium članovi dobijaju pristup specijalnim kategorijama i detaljnoj analitici svojih rezultata.</p>
        </div>
      </section>

      <section className="tech-stack">
        <h2>Tehnologije</h2>
        <p>Projekat je razvijen koristeći moderne web tehnologije: <strong>React, Node.js, Express i MongoDB Atlas.</strong></p>
      </section>

      <section className="about-mission">
        <h2>Naša Misija</h2>
        <p>
          Verujemo da geografija nije samo učenje glavnih gradova napamet, već razumevanje sveta oko nas. 
          Naš cilj je da digitalnim alatima motivišemo učenike da istražuju planetu kroz interakciju i igru.
        </p>
      </section>
    </div>
  );
}