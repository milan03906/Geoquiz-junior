import McqQuestion from "./McqQuestion";
import DragDropQuestion from "./DragDropQuestion";
import MapClickQuestion from "./MapClickQuestion";

const typeLabels = {
  mcq: "Standardno pitanje",
  drag_drop: "Drag & Drop",
  map_click: "Mapa / klik",
};

// Dodajemo isChallenge prop koji ćemo slati iz Quiz.jsx
export default function QuestionRenderer({ question, index, value, onChange, isChallenge }) {
  const type = question.type || "mcq";

  return (
    <article className={`quiz-question ${isChallenge ? "challenge-mode" : ""}`}>
      {/* Prikazujemo bedž samo ako je ovo Boss Level / Challenge */}
      {isChallenge && (
        <div className="challenge-banner">
          <span className="challenge-icon">🛡️</span>
          EXPERT MAP CHALLENGE (+20 POENA)
        </div>
      )}

      <div className="quiz-question-head">
        <div>
          <span className="question-type-badge">
            {isChallenge ? "BOSS LEVEL" : (typeLabels[type] || "Pitanje")}
          </span>
          <h3 className={isChallenge ? "challenge-text" : ""}>
            {index + 1}. {question.text}
          </h3>
        </div>

        <p className="question-meta">
          {question.category} | {isChallenge ? "Expert" : question.difficulty} | {question.grade}. razred
        </p>
      </div>

      <div className="question-content">
        {type === "drag_drop" ? (
          <DragDropQuestion
            question={question}
            value={value || {}}
            onChange={onChange}
          />
        ) : type === "map_click" ? (
          <MapClickQuestion
            question={question}
            value={value || ""}
            onChange={onChange}
            hideHints={isChallenge} 
          />
        ) : (
          <McqQuestion
            question={question}
            value={value || ""}
            onChange={onChange}
          />
        )}
      </div>

      {isChallenge && (
        <div className="challenge-footer">
          <p>Pažnja: Na ovom nivou nemaš ponuđene odgovore. Srećno!</p>
        </div>
      )}
    </article>
  );
}