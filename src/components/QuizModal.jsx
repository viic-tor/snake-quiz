/**
 * @file QuizModal.jsx
 * @description Modal que aparece cada 3 comidas con una pregunta de quiz.
 * Muestra la pregunta, 4 opciones y retroalimentación inmediata.
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

export default function QuizModal({ question, onAnswer, questionsAnswered, questionsCorrect }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  // Reset al cambiar de pregunta
  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setTimeLeft(15);
  }, [question?.id]);

  // Temporizador de 15 segundos por pregunta
  useEffect(() => {
    if (revealed) return;
    if (timeLeft <= 0) {
      // Tiempo agotado → respuesta incorrecta automática
      handleSelect(-1);
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, revealed]);

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const isCorrect = idx === question.answer;
    // Espera 1.8s para que el usuario vea la respuesta antes de continuar
    setTimeout(() => {
      onAnswer(idx);
    }, 1800);
  };

  if (!question) return null;

  const catColor = CATEGORY_COLORS[question.category] || "#00ff88";
  const timerPct = (timeLeft / 15) * 100;
  const timerColor = timeLeft > 8 ? "#00ff88" : timeLeft > 4 ? "#ffd700" : "#ff4d6d";

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal" role="dialog" aria-modal="true" aria-label="Pregunta de quiz">
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
                }}
              />
            </div>
          </div>
        </div>

        {/* Estadísticas mini */}
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
              else if (i === selected && i !== question.answer) cls += " wrong";
              else cls += " dim";
            } else if (selected === i) {
              cls += " selected";
            }
            return (
              <button
                key={i}
                id={`quiz-option-${i}`}
                className={cls}
                onClick={() => handleSelect(i)}
                disabled={revealed}
              >
                <span className="quiz-option-letter">
                  {["A", "B", "C", "D"][i]}
                </span>
                <span className="quiz-option-text">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Explicación tras responder */}
        {revealed && (
          <div
            className={`quiz-explanation ${selected === question.answer ? "correct-exp" : "wrong-exp"}`}
          >
            <span className="quiz-exp-icon">
              {selected === question.answer ? "✅" : "❌"}
            </span>
            <span>{question.explanation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
