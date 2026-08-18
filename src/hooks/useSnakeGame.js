/**
 * @file useSnakeGame.js
 * @description Hook principal del juego Snake Quiz.
 *
 * Recibe un objeto `config` con la dificultad seleccionada:
 *   difficulty: "easy" | "hard"
 *
 * MODO FÁCIL:
 *   - Las paredes son traspasables (wrapping)
 *   - Velocidad inicial: 150ms
 *   - Quiz cada 3 comidas, 15s por pregunta
 *   - Multiplicador: ×1
 *
 * MODO DIFÍCIL:
 *   - Las paredes quitan 1 vida (sin wrapping)
 *   - Velocidad inicial: 110ms, mínimo 45ms
 *   - Quiz cada 2 comidas, 10s por pregunta
 *   - Multiplicador de puntos: ×2
 *   - Bonus vida cada 15 correctas (en vez de 10)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getRandomQuestion } from "../data/questions";

// ── Constantes del tablero ─────────────────────────────────────────────────
export const GRID_SIZE = 20;

// ── Configuración por dificultad ───────────────────────────────────────────
export const DIFFICULTY_CONFIG = {
  easy: {
    label: "Fácil",
    initialSpeed: 150,
    minSpeed: 60,
    speedStep: 10,
    quizEvery: 3,
    quizTimeLimit: 15,
    scoreMultiplier: 1,
    bonusLifeAt: 10,     // correctas consecutivas para bonus vida
    wallsKill: false,    // paredes traspasables
    pointsPerFood: (level) => 10 + level * 5,
    pointsPerQuiz: (level) => 150 + level * 25,
    color: { snake: "#00ff88", snakeDim: "#00cc6a", food: "#ff4d6d", boardBg: "#0d0d1a", accent: "#00ff88" },
  },
  hard: {
    label: "Difícil",
    initialSpeed: 110,
    minSpeed: 45,
    speedStep: 12,
    quizEvery: 2,
    quizTimeLimit: 10,
    scoreMultiplier: 2,
    bonusLifeAt: 15,
    wallsKill: true,     // paredes quitan 1 vida
    pointsPerFood: (level) => (10 + level * 5) * 2,
    pointsPerQuiz: (level) => (150 + level * 25) * 2,
    color: { snake: "#ff6b35", snakeDim: "#cc4a1a", food: "#ff004d", boardBg: "#1a0a0a", accent: "#ff6b35" },
  },
};

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9,  y: 10 },
  { x: 8,  y: 10 },
];
const INITIAL_DIR = { x: 1, y: 0 };

// ── Utilidades ─────────────────────────────────────────────────────────────
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

const buildInitialState = (difficulty = "easy") => {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  return {
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
    consecutiveCorrect: 0,
    livesLostSinceLastBonus: 0,
    speed: cfg.initialSpeed,
    running: false,
    gameOver: false,
    showQuiz: false,
    currentQuestion: null,
    usedQuestionIds: [],
    lastAnswerCorrect: null,
    showAnswerFeedback: false,
    flashEffect: null,
    difficulty,
  };
};

// ── Hook ───────────────────────────────────────────────────────────────────
export default function useSnakeGame(difficulty = "easy") {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const [state, setState] = useState(() => buildInitialState(difficulty));
  const stateRef = useRef(state);
  const intervalRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  useEffect(() => { stateRef.current = state; }, [state]);

  // ── Iniciar / reiniciar ────────────────────────────────────────────────
  const startGame = useCallback(() => {
    setState({
      ...buildInitialState(difficulty),
      food: randomCell(INITIAL_SNAKE),
      running: true,
    });
  }, [difficulty]);

  // ── Pausa ──────────────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    setState((prev) => {
      if (prev.gameOver || prev.showQuiz) return prev;
      return { ...prev, running: !prev.running };
    });
  }, []);

  // ── Teclado ────────────────────────────────────────────────────────────
  useEffect(() => {
    const DIRS = {
      ArrowUp:    { x: 0, y: -1 },
      ArrowDown:  { x: 0, y:  1 },
      ArrowLeft:  { x: -1, y: 0 },
      ArrowRight: { x:  1, y: 0 },
      w: { x: 0, y: -1 },
      s: { x: 0, y:  1 },
      a: { x: -1, y: 0 },
      d: { x:  1, y: 0 },
    };
    const onKey = (e) => {
      const newDir = DIRS[e.key];
      if (newDir) {
        e.preventDefault();
        setState((prev) => {
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

  // ── Responder quiz ─────────────────────────────────────────────────────
  const answerQuestion = useCallback((answerIndex) => {
    setState((prev) => {
      if (!prev.showQuiz || !prev.currentQuestion) return prev;
      const localCfg = DIFFICULTY_CONFIG[prev.difficulty];

      const isCorrect = answerIndex === prev.currentQuestion.answer;
      const newQuestionsAnswered = prev.questionsAnswered + 1;
      const newQuestionsCorrect  = isCorrect ? prev.questionsCorrect + 1 : prev.questionsCorrect;
      const newConsecutive = isCorrect ? prev.consecutiveCorrect + 1 : prev.consecutiveCorrect;
      const newLivesLost = isCorrect ? prev.livesLostSinceLastBonus : prev.livesLostSinceLastBonus + 1;

      // Bonus vida
      let bonusLife = false;
      let finalLives = isCorrect ? prev.lives : Math.max(0, prev.lives - 1);
      if (
        isCorrect &&
        newConsecutive % localCfg.bonusLifeAt === 0 &&
        newConsecutive > 0 &&
        prev.livesLostSinceLastBonus === 0 &&
        finalLives < 5
      ) {
        finalLives += 1;
        bonusLife = true;
      }

      // Velocidad: aumenta cada 5 preguntas contestadas
      let newSpeed = prev.speed;
      if (newQuestionsAnswered % 5 === 0) {
        newSpeed = Math.max(localCfg.minSpeed, prev.speed - localCfg.speedStep);
      }

      const bonusPoints = isCorrect ? localCfg.pointsPerQuiz(prev.level) : 0;
      const newScore = prev.score + bonusPoints;
      const newLevel = Math.floor(prev.foodEaten / 10) + 1;
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
        consecutiveCorrect: newConsecutive,
        livesLostSinceLastBonus: bonusLife ? 0 : newLivesLost,
        speed: newSpeed,
        running: !gameOver,
        gameOver,
        lastAnswerCorrect: isCorrect,
        showAnswerFeedback: true,
        flashEffect: bonusLife ? "bonus-life" : isCorrect ? "correct" : "wrong",
      };
    });

    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        showAnswerFeedback: false,
        lastAnswerCorrect: null,
        flashEffect: null,
      }));
    }, 1500);
  }, []);

  // ── Tick del juego ─────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.running || prev.showQuiz || prev.gameOver) return prev;
      const localCfg = DIFFICULTY_CONFIG[prev.difficulty];

      const dir = prev.nextDir;
      const head = prev.snake[0];

      // Calcular nueva posición de la cabeza
      const rawX = head.x + dir.x;
      const rawY = head.y + dir.y;

      // ── Colisión con pared ──────────────────────────────────────────
      if (localCfg.wallsKill) {
        // Modo DIFÍCIL: las paredes quitan vida
        if (rawX < 0 || rawX >= GRID_SIZE || rawY < 0 || rawY >= GRID_SIZE) {
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
          // Respawn manteniendo score
          return {
            ...prev,
            lives: newLives,
            snake: INITIAL_SNAKE,
            dir: INITIAL_DIR,
            nextDir: INITIAL_DIR,
            food: randomCell(INITIAL_SNAKE),
            livesLostSinceLastBonus: prev.livesLostSinceLastBonus + 1,
            consecutiveCorrect: 0, // reinicia racha en modo difícil
            flashEffect: "wrong",
          };
        }
      }

      // Modo FÁCIL: wrapping (traspasa paredes)
      const newHead = {
        x: ((rawX % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
        y: ((rawY % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
      };

      // ── Colisión consigo mismo ──────────────────────────────────────
      const selfCollision = prev.snake.some(
        (s) => s.x === newHead.x && s.y === newHead.y
      );
      if (selfCollision) {
        const newLives = prev.lives - 1;
        if (newLives <= 0) {
          return { ...prev, lives: 0, running: false, gameOver: true, flashEffect: "wrong" };
        }
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

      if (!ateFood) return { ...prev, dir, snake: newSnake };

      // ── Comió ──────────────────────────────────────────────────────
      const newFoodEaten = prev.foodEaten + 1;
      const newScore = prev.score + localCfg.pointsPerFood(prev.level);
      const newLevel = Math.floor(newFoodEaten / 10) + 1;
      const newFood = randomCell(newSnake);

      // Quiz cada N comidas según dificultad
      const triggerQuiz = newFoodEaten % localCfg.quizEvery === 0;
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

  // ── Intervalo ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (state.running && !state.showQuiz && !state.gameOver) {
      intervalRef.current = setInterval(tick, state.speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [state.running, state.showQuiz, state.gameOver, state.speed, tick]);

  // ── Dirección táctil ───────────────────────────────────────────────────
  const setDirection = useCallback((dir) => {
    setState((prev) => {
      if (dir.x === -prev.dir.x && dir.y === -prev.dir.y) return prev;
      return { ...prev, nextDir: dir };
    });
  }, []);

  return { state, startGame, togglePause, answerQuestion, setDirection };
}
