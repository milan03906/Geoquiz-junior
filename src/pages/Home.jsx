import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

const slides = [
  {
    badge: "Srbija",
    title: "Uči geografiju kroz interaktivan kviz",
    text: "Glavni gradovi, reke, planine i prirodne oblasti Srbije kroz zabavne izazove.",
    stat: "30 pitanja po kvizu",
    color: "linear-gradient(135deg, #0f766e, #14b8a6)",
  },
  {
    badge: "Evropa",
    title: "Prepoznaj države i njihove prestonice",
    text: "Vežbaj mapu Evrope kroz pitanja, map click izazove i povezivanje parova.",
    stat: "Map click bonus nivo",
    color: "linear-gradient(135deg, #2563eb, #60a5fa)",
  },
  {
    badge: "Svet",
    title: "Istraži kontinente, okeane i najveće države",
    text: "Kviz prilagođen osnovcima, sa random izborom pitanja i preglednim rezultatima.",
    stat: "Random pitanja svaki put",
    color: "linear-gradient(135deg, #7c3aed, #c084fc)",
  },
  {
    badge: "Napredni nivo",
    title: "Drag & drop i mapa sa klikom",
    text: "Spoji države i gradove, klikni tačan grad na mapi i osvoji dodatne poene.",
    stat: "Interaktivni tipovi pitanja",
    color: "linear-gradient(135deg, #ea580c, #fb923c)",
  },
];

const features = [
  {
    title: "Random kviz",
    text: "Svaki novi kviz bira druga pitanja iz baze.",
  },
  {
    title: "Drag & drop",
    text: "Povezivanje država i glavnih gradova kroz povuci i pusti zadatke.",
  },
  {
    title: "Map click",
    text: "Klikni pravi grad na mapi i pokaži da znaš geografiju.",
  },
  {
    title: "Rezultati i statistika",
    text: "Odmah vidi tačne odgovore, procenat uspeha i napredak.",
  },
];

export default function Home() {
  const { user } = useAuth(); 
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    document.title = "Početna | GeoQuiz Junior";
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(id);
  }, []);

  const current = slides[activeSlide];


  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">GeoQuiz Junior</span>
          <h1>Geografija za osnovce, ali moderno, zabavno i interaktivno.</h1>
          <p>
            Uči Srbiju, Evropu, svet i prirodu kroz kvizove, drag & drop izazove i
            pitanja sa mapom.
          </p>

          
          <div className="hero-actions">
            {user ? (
              
              <>
                <Link to="/quizzes" className="btn btn-primary">
                  Nastavi na kvizove
                </Link>
                <Link to="/dashboard" className="btn btn-secondary">
                  Moj Dashboard
                </Link>
              </>
            ) : (
              
              <>
                <Link to="/register" className="btn btn-primary">
                  Registruj se
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Prijavi se
                </Link>
              </>
            )}
          </div>

          <div className="hero-stats">
            <div>
              <strong>30+</strong>
              <span>pitanja po kvizu</span>
            </div>
            <div>
              <strong>3 tipa</strong>
              <span>pitanja</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>responsive dizajn</span>
            </div>
          </div>
        </div>

        <div className="carousel">
          <div className="carousel-card" key={activeSlide} style={{ background: current.color }}>
            <span className="carousel-badge">{current.badge}</span>
            <h2>{current.title}</h2>
            <p>{current.text}</p>
            <div className="carousel-stat">{current.stat}</div>
          </div>

          <div className="carousel-controls">
            <button
              type="button"
              onClick={() =>
                setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)
              }
            >
              ←
            </button>

            <div className="carousel-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === activeSlide ? "dot active" : "dot"}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
            >
              →
            </button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-heading">
          <span className="section-label">Zašto GeoQuiz Junior?</span>
          <h2>Napravljen da izgleda kao prava edukativna platforma</h2>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      
      {user && !user.isPremium && (
        <section className="premium-upsell-box">
          <h3>Postani Premium član 👑</h3>
          <p>Otključaj 7. i 8. razred i podrži razvoj platforme.</p>
          <Link to="/dashboard" className="upsell-link">Pogledaj ponudu</Link>
        </section>
      )}

      <section className="home-bottom">
        <div className="bottom-card">
          <h3>Kategorije</h3>
          <p>Srbija, Evropa, Svet, Priroda i društvo</p>
        </div>
        <div className="bottom-card">
          <h3>Napredni nivoi</h3>
          <p>Drag & drop i map click pitanja za dodatni izazov</p>
        </div>
        <div className="bottom-card">
          <h3>Rezultati</h3>
          <p>Pregled tačnih odgovora i procenat uspeha odmah po završetku</p>
        </div>
      </section>
    </div>
  );
}