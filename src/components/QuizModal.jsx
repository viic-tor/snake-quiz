/**
 * @file QuizModal.jsx
 * @description Modal de quiz con soporte para 4, 5 o 6 opciones de respuesta.
 */

import { useState, useEffect } from "react";

const CATEGORY_LABELS = {
  sistemas: "🖥️ Teoría de Sistemas",
  prog: "💻 Programación",
  custom: "📂 Banco Personalizado",
};

const CATEGORY_COLORS = {
  sistemas: "#4facfe",
  prog: "#a855f7",
  custom: "#ffd700",
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuizModal({
  question,
  onAnswer,
  questionsAnswered,
  questionsCorrect,
  timeLimit = 15,
  difficulty = "easy",
}) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setTimeLeft(timeLimit);
  }, [question?.id, timeLimit]);

  useEffect(() => {
    if (revealed) return;
    if (timeLeft <= 0) { handleSelect(-1); return; }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, revealed]);

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    setTimeout(() => onAnswer(idx), 1800);
  };

  if (!question) return null;

  const options = question.options || [];
  const isHard = difficulty === "hard";
  const catColor = CATEGORY_COLORS[question.category] || "#00ff88";
  const timerPct = (timeLeft / timeLimit) * 100;
  const timerColor = timerPct > 50 ? "#00ff88" : timerPct > 25 ? "#ffd700" : "#ff4d6d";

  return (
    <div className={`quiz-overlay ${isHard ? "quiz-overlay-hard" : ""}`}>
      <div className={`quiz-modal quiz-modal-${options.length}opts`} role="dialog" aria-modal="true">

        {/* Badge difícil */}
        {isHard && <div className="quiz-diff-badge">🔴 MODO DIFÍCIL — Puntos ×2</div>}

        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-badge" style={{ borderColor: catColor, color: catColor }}>
            {CATEGORY_LABELS[question.category] || `📂 ${question.category}`}
          </div>
          <div className="quiz-timer-wrap">
            <span className="quiz-timer-num" style={{ color: timerColor }}>{timeLeft}s</span>
            <div className="quiz-timer-bar">
              <div
                className="quiz-timer-fill"
                style={{
                  width: `${timerPct}%`,
                  background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)`,
                  transition: "width 1s linear",
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats mini */}
        <div className="quiz-stats-row">
          <span>Preguntas: <b>{questionsAnswered}</b></span>
          <span>Correctas: <b style={{ color: "#00ff88" }}>{questionsCorrect}</b></span>
          <span className="quiz-opts-count">{options.length} opciones</span>
        </div>

        {/* Pregunta */}
        <h2 className="quiz-question">{question.question}</h2>

        {/* Opciones: 4, 5 o 6 */}
        <div className={`quiz-options quiz-options-${options.length}`}>
          {options.map((opt, i) => {
            let cls = "quiz-option";
            if (revealed) {
              if (i === question.answer) cls += " correct";
              else if (i === selected) cls += " wrong";
              else cls += " dim";
            } else if (selected === i) cls += " selected";
            return (
              <button
                key={i}
                id={`quiz-option-${i}`}
                className={cls}
                onClick={() => handleSelect(i)}
                disabled={revealed}
              >
                <span className="quiz-option-letter">{LETTERS[i]}</span>
                <span className="quiz-option-text">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Explicación */}
        {revealed && question.explanation && (
          <div className={`quiz-explanation ${selected === question.answer ? "correct-exp" : "wrong-exp"}`}>
            <span className="quiz-exp-icon">{selected === question.answer ? "✅" : "❌"}</span>
            <span>{question.explanation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
