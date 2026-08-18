/**
 * @file QuizModal.jsx
 * @description Modal de preguntas con soporte para límite de tiempo configurable.
 * En modo difícil el tiempo límite es 10s; en fácil, 15s.
 */

import { useState, useEffect } from "react";

const CATEGORY_LABELS = {
  sistemas: "🖥️ Teoría de Sistemas",
  prog: "💻 Programación",
};

const CATEGORY_COLORS = {
  sistemas: "#4facfe",
  prog: "#a855f7",
};

export default function QuizModal({
  question,
  onAnswer,
  questionsAnswered,
  questionsCorrect,
  timeLimit = 15,   // ← 15s fácil, 10s difícil
  difficulty = "easy",
}) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Reset al cambiar pregunta
  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setTimeLeft(timeLimit);
  }, [question?.id, timeLimit]);

  // Temporizador
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

  const catColor = CATEGORY_COLORS[question.category] || "#00ff88";
  const timerPct = (timeLeft / timeLimit) * 100;
  const timerColor = timerPct > 50 ? "#00ff88" : timerPct > 25 ? "#ffd700" : "#ff4d6d";
  const isHard = difficulty === "hard";

  return (
    <div className={`quiz-overlay ${isHard ? "quiz-overlay-hard" : ""}`}>
      <div className="quiz-modal" role="dialog" aria-modal="true" aria-label="Pregunta de quiz">

        {/* Badge de dificultad */}
        {isHard && (
          <div className="quiz-diff-badge">🔴 MODO DIFÍCIL — Puntos ×2</div>
        )}

        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-badge" style={{ borderColor: catColor, color: catColor }}>
            {CATEGORY_LABELS[question.category]}
          </div>
          <div className="quiz-timer-wrap">
            <span className="quiz-timer-num" style={{ color: timerColor }}>
              {timeLeft}s
            </span>
            <div className="quiz-timer-bar">
              <div
                className="quiz-timer-fill"
                style={{
                  width: `${timerPct}%`,
                  background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)`,
                  transition: "width 1s linear, background 0.3s",
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats mini */}
        <div className="quiz-stats-row">
          <span>Preguntas: <b>{questionsAnswered}</b></span>
          <span>Correctas: <b style={{ color: "#00ff88" }}>{questionsCorrect}</b></span>
        </div>

        {/* Pregunta */}
        <h2 className="quiz-question">{question.question}</h2>

        {/* Opciones */}
        <div className="quiz-options">
          {question.options.map((opt, i) => {
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
                <span className="quiz-option-letter">{["A","B","C","D"][i]}</span>
                <span className="quiz-option-text">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Explicación */}
        {revealed && (
          <div className={`quiz-explanation ${selected === question.answer ? "correct-exp" : "wrong-exp"}`}>
            <span className="quiz-exp-icon">{selected === question.answer ? "✅" : "❌"}</span>
            <span>{question.explanation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
