import json
import re

with open('src/hooks/useSnakeGame.js', 'r', encoding='utf-8') as f:
    code = f.read()

# We will just write a new script to completely replace it locally and then write it out.
# This avoids any regex issues.

new_code = """/**
 * @file useSnakeGame.js
 * @description Hook principal del juego Snake Quiz.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getNextQuestion } from "../utils/questionStore";
import { soundEngine } from "../utils/SoundEngine";

export const GRID_SIZE = 20;

export const POWERUP_CONFIG = {
  common_double_points: { id: "common_double_points", rarity: "common", color: "#10b981", icon: "⭐", type: "time", duration: 20000, despawn: 10000, weight: 40 },
  common_super_apple: { id: "common_super_apple", rarity: "common", color: "#10b981", icon: "🍎", type: "instant", despawn: 10000, weight: 40 },
  rare_shrink: { id: "rare_shrink", rarity: "rare", color: "#3b82f6", icon: "✂️", type: "instant", despawn: 8000, weight: 30 },
  rare_magnet: { id: "rare_magnet", rarity: "rare", color: "#3b82f6", icon: "🧲", type: "time", duration: 15000, despawn: 8000, weight: 30 },
  epic_slowmo: { id: "epic_slowmo", rarity: "epic", color: "#a855f7", icon: "⏱️", type: "time", duration: 10000, despawn: 7000, weight: 15 },
  epic_ghost: { id: "epic_ghost", rarity: "epic", color: "#a855f7", icon: "👻", type: "time", duration: 10000, despawn: 7000, weight: 15 },
  legendary_bouncer: { id: "legendary_bouncer", rarity: "legendary", color: "#eab308", icon: "🧱", type: "time", duration: 15000, despawn: 6000, weight: 10, hardOnly: true },
  legendary_xray: { id: "legendary_xray", rarity: "legendary", color: "#eab308", icon: "👁️", type: "passive", despawn: 6000, weight: 10 },
  mythic_streak_saver: { id: "mythic_streak_saver", rarity: "mythic", color: "#ef4444", icon: "🛡️", type: "passive", despawn: 5000, weight: 5 },
  mythic_freeze: { id: "mythic_freeze", rarity: "mythic", color: "#ef4444", icon: "⏳", type: "passive", despawn: 5000, weight: 5, hardOnly: true },
};

const getRandomPowerup = (lastId, isHard) => {
  let options = Object.values(POWERUP_CONFIG).filter(p => (!p.hardOnly || isHard) && p.id !== lastId);
  const totalWeight = options.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * totalWeight;
  for (let p of options) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return options[0];
};

const getNewThreshold = () => Math.floor(Math.random() * (1500 - 300 + 1)) + 300;

export const DIFFICULTY_CONFIG = {
  easy: {
    label: "Fácil",
    initialSpeed: 150,
    minSpeed: 60,
    speedStep: 10,
    quizEvery: 3,
    quizTimeLimit: 15,
    scoreMultiplier: 1,
    bonusLifeAt: 10,
    wallsKill: false,
    streakMultiplier: (consecutive) => {
      if (consecutive >= 6) return 2;
      if (consecutive >= 3) return 1.5;
      return 1;
    },
    pointsPerFood: (level) => 20 + level * 10,
    pointsPerQuiz: (level) => 200 + level * 50,
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
    wallsKill: true,
    streakMultiplier: (consecutive, count = 4) => {
      if (consecutive < 3) return 1;
      const baseM = count === 6 ? 4 : count === 5 ? 3 : 2;
      if (consecutive >= 6) return baseM * 2;
      return baseM;
    },
    pointsPerFood: (level) => Math.floor(10 + level * 5),
    pointsPerQuiz: (level) => Math.floor(100 + level * 25),
    color: { snake: "#ff6b35", snakeDim: "#cc4a1a", food: "#ff004d", boardBg: "#1a0a0a", accent: "#ff6b35" },
  },
};

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9,  y: 10 },
  { x: 8,  y: 10 },
];
const INITIAL_DIR = { x: 1, y: 0 };

const randomCell = (snake = [], otherThings = []) => {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (
    snake.some((s) => s.x === pos.x && s.y === pos.y) || 
    otherThings.some(t => t && t.x === pos.x && t.y === pos.y)
  );
  return pos;
};

const buildInitialState = (difficulty = "easy", answerCount = 4) => {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  let speed = cfg.initialSpeed;
  if (difficulty === "hard") {
    if (answerCount === 5) speed = 90;
    if (answerCount === 6) speed = 70;
  }
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
    maxStreak: 0,
    livesLostSinceLastBonus: 0,
    speed: speed,
    currentSpeed: speed,
    answerCount: answerCount,
    running: false,
    gameOver: false,
    showQuiz: false,
    currentQuestion: null,
    usedQuestionIds: [],
    lastAnswerCorrect: null,
    showAnswerFeedback: false,
    flashEffect: null,
    difficulty,
    boardPowerup: null,
    activePowerups: [],
    passivePowerups: [],
    scoreSinceLastPowerup: 0,
    powerupScoreThreshold: getNewThreshold(),
    lastPowerupSpawnedId: null,
    slowmoRecoveryTicks: 0,
  };
};

export default function useSnakeGame(difficulty = "easy", answerCount = 4) {
  const [state, setState] = useState(() => buildInitialState(difficulty, answerCount));
  const stateRef = useRef(state);
  const intervalRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  useEffect(() => { stateRef.current = state; }, [state]);

  const startGame = useCallback(() => {
    setState({
      ...buildInitialState(difficulty, answerCount),
      food: randomCell(INITIAL_SNAKE),
      running: true,
    });
  }, [difficulty, answerCount]);

  const togglePause = useCallback(() => {
    setState((prev) => {
      if (prev.gameOver || prev.showQuiz) return prev;
      return { ...prev, running: !prev.running };
    });
  }, []);

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

  const answerQuestion = useCallback((answerIndex) => {
    setState((prev) => {
      if (!prev.showQuiz || !prev.currentQuestion) return prev;
      const localCfg = DIFFICULTY_CONFIG[prev.difficulty];

      const isCorrect = answerIndex === prev.currentQuestion.answer;
      
      let finalLives = prev.lives;
      let nextPassivePowerups = [...prev.passivePowerups];
      let usedStreakSaver = false;
      
      if (!isCorrect) {
        const streakSaverIndex = nextPassivePowerups.findIndex(p => p.id === "mythic_streak_saver");
        if (streakSaverIndex !== -1) {
           usedStreakSaver = true;
           nextPassivePowerups.splice(streakSaverIndex, 1);
           soundEngine.shieldBreak();
        } else {
           soundEngine.playWrong();
           finalLives = Math.max(0, finalLives - 1);
        }
      } else {
        soundEngine.playCorrect();
      }

      const xrayIndex = nextPassivePowerups.findIndex(p => p.id === "legendary_xray");
      if (xrayIndex !== -1) nextPassivePowerups.splice(xrayIndex, 1);
      const freezeIndex = nextPassivePowerups.findIndex(p => p.id === "mythic_freeze");
      if (freezeIndex !== -1) nextPassivePowerups.splice(freezeIndex, 1);

      const actuallyCorrect = isCorrect || usedStreakSaver;

      const newQuestionsAnswered = prev.questionsAnswered + 1;
      const newQuestionsCorrect  = actuallyCorrect ? prev.questionsCorrect + 1 : prev.questionsCorrect;
      const newConsecutive = actuallyCorrect ? prev.consecutiveCorrect + 1 : 0;
      const newMaxStreak = Math.max(prev.maxStreak || 0, newConsecutive);
      const newLivesLost = actuallyCorrect ? prev.livesLostSinceLastBonus : prev.livesLostSinceLastBonus + 1;

      let bonusLife = false;
      if (
        actuallyCorrect &&
        newConsecutive % localCfg.bonusLifeAt === 0 &&
        newConsecutive > 0 &&
        prev.livesLostSinceLastBonus === 0 &&
        finalLives < 5
      ) {
        finalLives += 1;
        bonusLife = true;
      }

      let newSpeed = prev.speed;
      if (newQuestionsAnswered % 5 === 0) {
        newSpeed = Math.max(localCfg.minSpeed, prev.speed - localCfg.speedStep);
      }
      
      let newCurrentSpeed = newSpeed;
      if (prev.activePowerups.some(p => p.id === "epic_slowmo")) {
         newCurrentSpeed = 250;
      } else if (prev.slowmoRecoveryTicks > 0) {
         newCurrentSpeed = newSpeed + Math.floor((250 - newSpeed) * (prev.slowmoRecoveryTicks / 15));
      }

      const pts = localCfg.pointsPerQuiz(prev.level, prev.answerCount);
      const streakM = localCfg.streakMultiplier ? localCfg.streakMultiplier(newConsecutive, prev.answerCount) : 1;
      const bonusPoints = actuallyCorrect ? Math.floor(pts * streakM) : 0;
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
        maxStreak: newMaxStreak,
        livesLostSinceLastBonus: bonusLife ? 0 : newLivesLost,
        speed: newSpeed,
        currentSpeed: newCurrentSpeed,
        running: !gameOver,
        gameOver,
        lastAnswerCorrect: isCorrect,
        showAnswerFeedback: true,
        flashEffect: bonusLife ? "bonus-life" : (usedStreakSaver ? "streak-saved" : (isCorrect ? "correct" : "wrong")),
        passivePowerups: nextPassivePowerups,
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

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.running || prev.showQuiz || prev.gameOver) return prev;
      const localCfg = DIFFICULTY_CONFIG[prev.difficulty];
      const dir = prev.nextDir;
      const head = prev.snake[0];

      let newBoardPowerup = prev.boardPowerup;
      if (newBoardPowerup) {
        newBoardPowerup = { ...newBoardPowerup, remainingDespawn: newBoardPowerup.remainingDespawn - prev.currentSpeed };
        if (newBoardPowerup.remainingDespawn <= 0) {
          newBoardPowerup = null;
        }
      }

      let slowmoJustEnded = false;
      let newActivePowerups = prev.activePowerups.map(p => ({
        ...p, remainingDuration: p.remainingDuration - prev.currentSpeed
      })).filter(p => {
        if (p.remainingDuration <= 0) {
          if (p.id === "epic_slowmo") slowmoJustEnded = true;
          return false;
        }
        return true;
      });

      let newRecoveryTicks = prev.slowmoRecoveryTicks;
      const hasSlowmo = newActivePowerups.some(p => p.id === "epic_slowmo");
      if (slowmoJustEnded) {
        newRecoveryTicks = 15;
        soundEngine.slowMoEnd();
      } else if (!hasSlowmo && newRecoveryTicks > 0) {
        newRecoveryTicks -= 1;
      }

      let newCurrentSpeed = prev.speed;
      if (hasSlowmo) {
        newCurrentSpeed = 250;
      } else if (newRecoveryTicks > 0) {
        newCurrentSpeed = prev.speed + Math.floor((250 - prev.speed) * (newRecoveryTicks / 15));
      }

      const rawX = head.x + dir.x;
      const rawY = head.y + dir.y;

      if (localCfg.wallsKill) {
        if (rawX < 0 || rawX >= GRID_SIZE || rawY < 0 || rawY >= GRID_SIZE) {
          const hasBouncer = newActivePowerups.some(p => p.id === "legendary_bouncer");
          if (hasBouncer) {
            soundEngine.powerupBounce();
            const bounceDir = { x: -dir.x, y: -dir.y };
            return {
              ...prev, dir: bounceDir, nextDir: bounceDir, currentSpeed: newCurrentSpeed,
              activePowerups: newActivePowerups, boardPowerup: newBoardPowerup, slowmoRecoveryTicks: newRecoveryTicks
            };
          }
          soundEngine.playCrash();
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            return { ...prev, lives: 0, running: false, gameOver: true, flashEffect: "wrong" };
          }
          return {
            ...prev, lives: newLives, snake: INITIAL_SNAKE, dir: INITIAL_DIR, nextDir: INITIAL_DIR,
            food: randomCell(INITIAL_SNAKE, newBoardPowerup ? [newBoardPowerup] : []),
            livesLostSinceLastBonus: prev.livesLostSinceLastBonus + 1, consecutiveCorrect: 0, flashEffect: "wrong",
            activePowerups: [], currentSpeed: prev.speed, slowmoRecoveryTicks: 0 // reset powers on death
          };
        }
      }

      const newHead = {
        x: ((rawX % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
        y: ((rawY % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
      };

      const hasGhost = newActivePowerups.some(p => p.id === "epic_ghost");
      const selfCollision = !hasGhost && prev.snake.some((s) => s.x === newHead.x && s.y === newHead.y);
      if (selfCollision) {
        soundEngine.playCrash();
        const newLives = prev.lives - 1;
        if (newLives <= 0) {
          return { ...prev, lives: 0, running: false, gameOver: true, flashEffect: "wrong" };
        }
        return {
          ...prev, lives: newLives, snake: INITIAL_SNAKE, dir: INITIAL_DIR, nextDir: INITIAL_DIR,
          food: randomCell(INITIAL_SNAKE, newBoardPowerup ? [newBoardPowerup] : []),
          livesLostSinceLastBonus: prev.livesLostSinceLastBonus + 1, consecutiveCorrect: 0, flashEffect: "wrong",
          activePowerups: [], currentSpeed: prev.speed, slowmoRecoveryTicks: 0
        };
      }

      let actuallyAteFood = newHead.x === prev.food.x && newHead.y === prev.food.y;
      const hasMagnet = newActivePowerups.some(p => p.id === "rare_magnet");
      if (hasMagnet && !actuallyAteFood) {
        const dist = Math.abs(newHead.x - prev.food.x) + Math.abs(newHead.y - prev.food.y);
        if (dist <= 3) {
          actuallyAteFood = true;
        }
      }

      let nextSnake = actuallyAteFood ? [newHead, ...prev.snake] : [newHead, ...prev.snake.slice(0, -1)];
      let nextPassivePowerups = [...prev.passivePowerups];
      let scoreBonus = 0;
      let addFoodEaten = 0;

      let pickedUp = null;
      if (newBoardPowerup && newHead.x === newBoardPowerup.x && newHead.y === newBoardPowerup.y) {
        pickedUp = newBoardPowerup;
        newBoardPowerup = null;
        const RarityC = pickedUp.rarity.charAt(0).toUpperCase() + pickedUp.rarity.slice(1);
        if (soundEngine[`powerupCollect${RarityC}`]) soundEngine[`powerupCollect${RarityC}`]();
        if (pickedUp.id === "epic_slowmo") soundEngine.slowMoStart();
      }

      if (pickedUp) {
        if (pickedUp.type === "instant") {
          if (pickedUp.id === "common_super_apple") {
            addFoodEaten = 3;
            scoreBonus += 100;
          } else if (pickedUp.id === "rare_shrink") {
            nextSnake = nextSnake.slice(0, Math.max(3, Math.floor(nextSnake.length / 2)));
          }
        } else if (pickedUp.type === "time") {
          newActivePowerups = newActivePowerups.filter(p => p.rarity !== pickedUp.rarity);
          newActivePowerups.push({ ...pickedUp, remainingDuration: pickedUp.duration });
          if (pickedUp.id === "epic_slowmo") {
             newCurrentSpeed = 250;
             newRecoveryTicks = 0;
          }
        } else if (pickedUp.type === "passive" || pickedUp.type === "passive_quiz") {
          if (nextPassivePowerups.some(p => p.id === pickedUp.id)) {
             scoreBonus += 50;
          } else {
             nextPassivePowerups = nextPassivePowerups.filter(p => p.rarity !== pickedUp.rarity);
             nextPassivePowerups.push(pickedUp);
          }
        }
      }

      let newScoreSinceLastPowerup = prev.scoreSinceLastPowerup;
      let newScore = prev.score + scoreBonus;
      let newFoodEaten = prev.foodEaten + addFoodEaten;
      let nextFood = prev.food;
      let triggerQuiz = false;

      if (actuallyAteFood) {
        soundEngine.playEat();
        newFoodEaten += 1;
        const pts = localCfg.pointsPerFood(prev.level, prev.answerCount);
        const streakM = localCfg.streakMultiplier ? localCfg.streakMultiplier(prev.consecutiveCorrect, prev.answerCount) : 1;
        const hasDoublePoints = newActivePowerups.some(p => p.id === "common_double_points");
        const powerupM = hasDoublePoints ? 2 : 1;
        
        const earnedPoints = Math.floor(pts * streakM * powerupM);
        newScore += earnedPoints;
        newScoreSinceLastPowerup += earnedPoints;
        nextFood = randomCell(nextSnake, newBoardPowerup ? [newBoardPowerup] : []);
        triggerQuiz = newFoodEaten % localCfg.quizEvery === 0;
      } else {
        newScoreSinceLastPowerup += scoreBonus;
      }

      let nextThreshold = prev.powerupScoreThreshold;
      let nextLastPowerupId = prev.lastPowerupSpawnedId;
      if (!newBoardPowerup && newScoreSinceLastPowerup >= nextThreshold) {
         const newPowerup = getRandomPowerup(nextLastPowerupId, prev.difficulty === "hard");
         const spawnPos = randomCell(nextSnake, [nextFood]);
         newBoardPowerup = { ...newPowerup, x: spawnPos.x, y: spawnPos.y, remainingDespawn: newPowerup.despawn };
         newScoreSinceLastPowerup = 0;
         nextThreshold = getNewThreshold();
         nextLastPowerupId = newPowerup.id;
         soundEngine.powerupAppear();
      }

      const newLevel = Math.floor(newFoodEaten / 10) + 1;
      if (newLevel > prev.level) soundEngine.playLevelUp();

      let quizState = {};
      if (triggerQuiz) {
        const question = getNextQuestion(prev.usedQuestionIds, prev.answerCount);
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
        snake: nextSnake,
        food: nextFood,
        score: newScore,
        foodEaten: newFoodEaten,
        level: newLevel,
        currentSpeed: newCurrentSpeed,
        slowmoRecoveryTicks: newRecoveryTicks,
        activePowerups: newActivePowerups,
        boardPowerup: newBoardPowerup,
        passivePowerups: nextPassivePowerups,
        scoreSinceLastPowerup: newScoreSinceLastPowerup,
        powerupScoreThreshold: nextThreshold,
        lastPowerupSpawnedId: nextLastPowerupId,
        ...quizState,
      };
    });
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (state.running && !state.showQuiz && !state.gameOver) {
      intervalRef.current = setInterval(tick, state.currentSpeed);
    }
    return () => clearInterval(intervalRef.current);
  }, [state.running, state.showQuiz, state.gameOver, state.currentSpeed, tick]);

  const setDirection = useCallback((dir) => {
    setState((prev) => {
      if (dir.x === -prev.dir.x && dir.y === -prev.dir.y) return prev;
      return { ...prev, nextDir: dir };
    });
  }, []);

  return { state, startGame, togglePause, answerQuestion, setDirection };
}
"""

with open('src/hooks/useSnakeGame.js', 'w', encoding='utf-8') as f:
    f.write(new_code)
