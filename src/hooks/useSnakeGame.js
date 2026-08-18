/**
 * @file useSnakeGame.js
 * @description Hook principal que maneja toda la lógica del juego Snake Quiz.
 *
 * Reglas:
 *  - La serpiente crece al comer.
 *  - Cada 3 comidas → aparece un quiz.
 *  - Si responde correcto → +bonus puntos.
 *  - Si responde incorrecto → -1 vida.
 *  - Si no ha perdido ninguna vida cada 10 preguntas acertadas → +1 vida (máx 5).
 *  - La velocidad aumenta cada 5 preguntas contestadas (correcto o incorrecto).
 *  - 3 vidas al inicio.
 *  - Colisión con pared o propio cuerpo → -1 vida (respawn) o Game Over si quedan 0.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getRandomQuestion } from "../data/questions";

// ── Constantes del tablero ────────────────────────────────────────────────────
export const GRID_SIZE = 20; // 20x20 celdas
const INITIAL_SPEED = 150; // ms por tick
const MIN_SPEED = 60; // ms mínimos
const SPEED_STEP = 10; // ms que se restan cada 5 preguntas
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
const INITIAL_DIR = { x: 1, y: 0 };

// ── Utilidades ────────────────────────────────────────────────────────────────
const randomCell = (snake = []) => {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
};

// ── Estado inicial ────────────────────────────────────────────────────────────
const buildInitialState = () => ({
  snake: INITIAL_SNAKE,
  dir: INITIAL_DIR,
  nextDir: INITIAL_DIR,
  food: { x: 15, y: 10 },
  score: 0,
  lives: 3,
  level: 1,
  foodEaten: 0,
  questionsAnswered: 0,
  questionsCorrect: 0,
  consecutiveCorrect: 0, // para el bonus de vida
  livesLostSinceLastBonus: 0,
  speed: INITIAL_SPEED,
  running: false,
  gameOver: false,
  showQuiz: false,
  currentQuestion: null,
  usedQuestionIds: [],
  lastAnswerCorrect: null, // null | true | false
  showAnswerFeedback: false,
  flashEffect: null, // "correct" | "wrong" | "bonus-life" | "speed-up"
});

// ── Hook ──────────────────────────────────────────────────────────────────────
export default function useSnakeGame() {
  const [state, setState] = useState(buildInitialState);
  const stateRef = useRef(state);
  const intervalRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  // Sincronizar ref con state para usar en callbacks sin stale closures
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── Iniciar / reiniciar juego ─────────────────────────────────────────────
  const startGame = useCallback(() => {
    setState((prev) => ({
      ...buildInitialState(),
      food: randomCell(INITIAL_SNAKE),
      running: true,
    }));
  }, []);

  // ── Pausa ────────────────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    setState((prev) => {
      if (prev.gameOver || prev.showQuiz) return prev;
      return { ...prev, running: !prev.running };
    });
  }, []);

  // ── Manejo del teclado ────────────────────────────────────────────────────
  useEffect(() => {
    const DIRS = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
    };

    const onKey = (e) => {
      const newDir = DIRS[e.key];
      if (newDir) {
        e.preventDefault();
        setState((prev) => {
          // Evita dar media vuelta inmediata
          if (newDir.x === -prev.dir.x && newDir.y === -prev.dir.y) return prev;
          return { ...prev, nextDir: newDir };
        });
      }
      if (e.key === "p" || e.key === "P" || e.key === " ") {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePause]);

  // ── Mostrar efecto flash temporalmente ───────────────────────────────────
  const triggerFlash = useCallback((type, duration = 1200) => {
    setState((prev) => ({ ...prev, flashEffect: type }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, flashEffect: null }));
    }, duration);
  }, []);

  // ── Responder quiz ────────────────────────────────────────────────────────
  const answerQuestion = useCallback(
    (answerIndex) => {
      setState((prev) => {
        if (!prev.showQuiz || !prev.currentQuestion) return prev;

        const isCorrect = answerIndex === prev.currentQuestion.answer;
        const newQuestionsAnswered = prev.questionsAnswered + 1;
        const newQuestionsCorrect = isCorrect
          ? prev.questionsCorrect + 1
          : prev.questionsCorrect;
        const newConsecutiveCorrect = isCorrect
          ? prev.consecutiveCorrect + 1
          : prev.consecutiveCorrect;
        const newLivesLost = isCorrect
          ? prev.livesLostSinceLastBonus
          : prev.livesLostSinceLastBonus + 1;

        // Bonus: cada 10 correctas SIN perder vidas → +1 vida (máx 5)
        let bonusLife = false;
        let resetConsecutive = newConsecutiveCorrect;
        let finalLives = isCorrect ? prev.lives : Math.max(0, prev.lives - 1);

        if (isCorrect && newConsecutiveCorrect % 10 === 0 && prev.livesLostSinceLastBonus === 0) {
          if (finalLives < 5) {
            finalLives = finalLives + 1;
            bonusLife = true;
          }
        }

        // Velocidad: aumenta cada 5 preguntas contestadas
        let newSpeed = prev.speed;
        if (newQuestionsAnswered % 5 === 0) {
          newSpeed = Math.max(MIN_SPEED, prev.speed - SPEED_STEP);
        }

        // Puntuación
        const bonusPoints = isCorrect
          ? 150 + prev.level * 25
          : 0;
        const newScore = prev.score + bonusPoints;

        // Nivel: sube cada 10 comidas
        const newLevel = Math.floor(prev.foodEaten / 10) + 1;

        // Si se quedó sin vidas → game over
        const gameOver = finalLives <= 0;

        return {
          ...prev,
          showQuiz: false,
          currentQuestion: null,
          lives: finalLives,
          score: newScore,
          level: newLevel,
          questionsAnswered: newQuestionsAnswered,
          questionsCorrect: newQuestionsCorrect,
          consecutiveCorrect: resetConsecutive,
          livesLostSinceLastBonus: bonusLife ? 0 : newLivesLost,
          speed: newSpeed,
          running: !gameOver,
          gameOver,
          lastAnswerCorrect: isCorrect,
          showAnswerFeedback: true,
          flashEffect: bonusLife
            ? "bonus-life"
            : isCorrect
            ? "correct"
            : "wrong",
        };
      });

      // Limpiar feedback después de 1.5s
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          showAnswerFeedback: false,
          lastAnswerCorrect: null,
          flashEffect: null,
        }));
      }, 1500);
    },
    []
  );

  // ── Tick del juego ────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.running || prev.showQuiz || prev.gameOver) return prev;

      const dir = prev.nextDir;
      const head = prev.snake[0];
      const newHead = {
        x: (head.x + dir.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + dir.y + GRID_SIZE) % GRID_SIZE,
      };

      // Colisión con sí mismo
      const selfCollision = prev.snake.some(
        (s) => s.x === newHead.x && s.y === newHead.y
      );

      if (selfCollision) {
        const newLives = prev.lives - 1;
        if (newLives <= 0) {
          return {
            ...prev,
            lives: 0,
            running: false,
            gameOver: true,
            flashEffect: "wrong",
          };
        }
        // Respawn: mantiene score pero reinicia serpiente
        return {
          ...prev,
          lives: newLives,
          snake: INITIAL_SNAKE,
          dir: INITIAL_DIR,
          nextDir: INITIAL_DIR,
          food: randomCell(INITIAL_SNAKE),
          livesLostSinceLastBonus: prev.livesLostSinceLastBonus + 1,
          flashEffect: "wrong",
        };
      }

      const ateFood = newHead.x === prev.food.x && newHead.y === prev.food.y;
      const newSnake = ateFood
        ? [newHead, ...prev.snake]
        : [newHead, ...prev.snake.slice(0, -1)];

      if (!ateFood) {
        return { ...prev, dir, snake: newSnake };
      }

      // Comió
      const newFoodEaten = prev.foodEaten + 1;
      const pointsForFood = 10 + prev.level * 5;
      const newScore = prev.score + pointsForFood;
      const newLevel = Math.floor(newFoodEaten / 10) + 1;
      const newFood = randomCell(newSnake);

      // ¿Toca quiz? Cada 3 comidas
      const triggerQuiz = newFoodEaten % 3 === 0;
      let quizState = {};
      if (triggerQuiz) {
        const question = getRandomQuestion(prev.usedQuestionIds);
        quizState = {
          showQuiz: true,
          running: false,
          currentQuestion: question,
          usedQuestionIds: [...prev.usedQuestionIds, question.id],
        };
      }

      return {
        ...prev,
        dir,
        snake: newSnake,
        food: newFood,
        score: newScore,
        foodEaten: newFoodEaten,
        level: newLevel,
        ...quizState,
      };
    });
  }, []);

  // ── Intervalo del juego ───────────────────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (state.running && !state.showQuiz && !state.gameOver) {
      intervalRef.current = setInterval(tick, state.speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [state.running, state.showQuiz, state.gameOver, state.speed, tick]);

  // ── Controles táctiles / botones de dirección ────────────────────────────
  const setDirection = useCallback((dir) => {
    setState((prev) => {
      if (dir.x === -prev.dir.x && dir.y === -prev.dir.y) return prev;
      return { ...prev, nextDir: dir };
    });
  }, []);

  return {
    state,
    startGame,
    togglePause,
    answerQuestion,
    setDirection,
  };
}
