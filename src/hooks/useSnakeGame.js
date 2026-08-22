/**
 * @file useSnakeGame.js
 * @description Hook principal del juego Snake Quiz.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getNextQuestion } from "../utils/questionStore";
import { soundEngine } from "../utils/SoundEngine";
import { generateMission } from "../data/missions";

export const GRID_SIZE = 20;

export const POWERUP_CONFIG = {
  common_double_points: { id: "common_double_points", name: "Puntos Dobles", description: "Multiplica por 2 todos los puntos ganados por 20 segundos.", rarity: "common", color: "#10b981", icon: "⭐", iconId: "Star", type: "time", duration: 20000, despawn: 10000, weight: 40 },
  common_super_apple: { id: "common_super_apple", name: "Súper Manzana", description: "Te otorga el equivalente a comer 3 manzanas de golpe.", rarity: "common", color: "#10b981", icon: "🍎", iconId: "Apple", type: "instant", despawn: 10000, weight: 40 },
  common_heal: { id: "common_heal", name: "Poción Curativa", description: "Recuperas 1 vida perdida, o +50pts si estás al máximo.", rarity: "common", color: "#10b981", icon: "❤️", iconId: "Heart", type: "instant", despawn: 10000, weight: 40 },
  common_point_burst: { id: "common_point_burst", name: "Ráfaga de Puntos", description: "Suma directamente 100 puntos a tu marcador.", rarity: "common", color: "#10b981", icon: "⚡", iconId: "Zap", type: "instant", despawn: 10000, weight: 40 },
  common_extra_time: { id: "common_extra_time", name: "Tiempo Extra", description: "En tu próximo quiz, el temporizador irá un 30% más lento.", rarity: "common", color: "#10b981", icon: "⌛", iconId: "Hourglass", type: "passive", despawn: 10000, weight: 40 },

  rare_shrink: { id: "rare_shrink", name: "Encogedor", description: "Reduce el tamaño de tu serpiente a la mitad al instante.", rarity: "rare", color: "#3b82f6", icon: "✂️", iconId: "Minimize2", type: "instant", despawn: 8000, weight: 30 },
  rare_magnet: { id: "rare_magnet", name: "Imán Magnético", description: "Atrae las comidas hacia ti si pasas cerca por 15 segundos.", rarity: "rare", color: "#3b82f6", icon: "🧲", iconId: "Magnet", type: "time", duration: 15000, despawn: 8000, weight: 30 },
  rare_teleport: { id: "rare_teleport", name: "Salto Cuántico", description: "Teletransporta tu cabeza a una posición aleatoria segura del mapa.", rarity: "rare", color: "#3b82f6", icon: "✨", iconId: "Sparkles", type: "instant", despawn: 8000, weight: 30 },
  rare_streak_boost: { id: "rare_streak_boost", name: "Impulso de Racha", description: "Aumenta tu racha actual en +2 de forma automática.", rarity: "rare", color: "#3b82f6", icon: "🔥", iconId: "Flame", type: "instant", despawn: 8000, weight: 30 },
  rare_invincible: { id: "rare_invincible", name: "Invencibilidad", description: "Por 5 segundos, chocar contra paredes o contra ti mismo no te mata.", rarity: "rare", color: "#3b82f6", icon: "🛡️", iconId: "Shield", type: "time", duration: 5000, despawn: 8000, weight: 30 },

  epic_slowmo: { id: "epic_slowmo", name: "Cámara Lenta", description: "Reduce drásticamente la velocidad del juego por 10 segundos.", rarity: "epic", color: "#a855f7", icon: "⏱️", iconId: "Clock", type: "time", duration: 10000, despawn: 7000, weight: 15 },
  epic_ghost: { id: "epic_ghost", name: "Fantasma", description: "Vuelve tu cuerpo intangible, permitiéndote atravesarte a ti mismo por 10 segundos.", rarity: "epic", color: "#a855f7", icon: "👻", iconId: "Ghost", type: "time", duration: 10000, despawn: 7000, weight: 15 },
  epic_wall_breaker: { id: "epic_wall_breaker", name: "Destructor de Muros", description: "Durante 15s, atraviesas las paredes saliendo por el otro lado pacíficamente.", rarity: "epic", color: "#a855f7", icon: "🔨", iconId: "Hammer", type: "time", duration: 15000, despawn: 7000, weight: 15 },
  epic_black_hole: { id: "epic_black_hole", name: "Agujero Negro", description: "Absorbe mágicamente 3 comidas al instante, engordando tu serpiente.", rarity: "epic", color: "#a855f7", icon: "🕳️", iconId: "CircleDashed", type: "instant", despawn: 7000, weight: 15 },
  epic_quiz_master: { id: "epic_quiz_master", name: "Quiz Maestro", description: "Acierta tu próximo quiz y ganarás el triple de puntos de lo normal.", rarity: "epic", color: "#a855f7", icon: "🧠", iconId: "Brain", type: "passive", despawn: 7000, weight: 15 },

  legendary_bouncer: { id: "legendary_bouncer", name: "Rebotador", description: "Chocar con las paredes en modo difícil te hará rebotar en lugar de matarte.", rarity: "legendary", color: "#eab308", icon: "🧱", iconId: "Activity", type: "time", duration: 15000, despawn: 6000, weight: 10, hardOnly: true },
  legendary_xray: { id: "legendary_xray", name: "Rayos X", description: "Filtra 2 opciones incorrectas de tu próxima pregunta de quiz.", rarity: "legendary", color: "#eab308", icon: "👁️", iconId: "ScanEye", type: "passive", despawn: 6000, weight: 10 },
  mythic_streak_saver: { id: "mythic_streak_saver", name: "Escudo Protector", description: "Te protege de perder una vida y la racha al equivocarte en un quiz.", rarity: "mythic", color: "#ef4444", icon: "🛡️", iconId: "ShieldAlert", type: "passive", despawn: 5000, weight: 5 },
  mythic_freeze: { id: "mythic_freeze", name: "Congelador de Tiempo", description: "Pausa el temporizador en la próxima pregunta de quiz.", rarity: "mythic", color: "#ef4444", icon: "⏳", iconId: "Snowflake", type: "passive", despawn: 5000, weight: 5, hardOnly: true },
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

const getNewThreshold = (difficulty = "easy", answerCount = 4) => {
  let min = 50;
  let max = 150;
  if (difficulty === "hard") {
    if (answerCount === 4) { min = 75; max = 200; } // Difícil
    else if (answerCount === 5) { min = 100; max = 250; } // Pro
    else if (answerCount === 6) { min = 125; max = 300; } // Pro Max
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

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
    pointsPerFood: (level) => 10 + level * 5,
    pointsPerQuiz: (level) => 100 + level * 25,
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
    pointsPerFood: (level) => Math.floor(5 + level * 2.5),
    pointsPerQuiz: (level) => Math.floor(50 + level * 12.5),
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
    biomeIndex: 0,
    levelsUntilBiomeChange: Math.floor(Math.random() * 3) + 3,
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
    boardCoin: null,
    sessionCoins: 0,
    activePowerups: [],
    passivePowerups: [],
    scoreSinceLastPowerup: 0,
    powerupScoreThreshold: getNewThreshold(difficulty, answerCount),
    lastPowerupSpawnedId: null,
    slowmoRecoveryTicks: 0,
    activeMission: generateMission("common"),
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
      const extraTimeIndex = nextPassivePowerups.findIndex(p => p.id === "common_extra_time");
      if (extraTimeIndex !== -1) nextPassivePowerups.splice(extraTimeIndex, 1);
      
      let quizMasterMultiplier = 1;
      const quizMasterIndex = nextPassivePowerups.findIndex(p => p.id === "epic_quiz_master");
      if (quizMasterIndex !== -1) {
         if (isCorrect || usedStreakSaver) quizMasterMultiplier = 3;
         nextPassivePowerups.splice(quizMasterIndex, 1);
      }

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
      const bonusPoints = actuallyCorrect ? Math.floor(pts * streakM * quizMasterMultiplier) : 0;
      const newScore = prev.score + bonusPoints;
      const newLevel = Math.floor(prev.foodEaten / 10) + 1;
      const gameOver = finalLives <= 0;

      let quizMissionCompleted = false;
      let missionAddedCoins = 0;
      let nextMission = prev.activeMission;
      let missionPowerupSpawn = null;
      
      if (actuallyCorrect && nextMission && nextMission.type === "answer_quiz") {
        nextMission = { ...nextMission, progress: nextMission.progress + 1 };
        if (nextMission.progress >= nextMission.target) {
          quizMissionCompleted = true;
          missionAddedCoins = nextMission.reward.coins;
          missionPowerupSpawn = nextMission.reward.powerup;
          soundEngine.playLevelUp();
          nextMission = generateMission();
        }
      }

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
        sessionCoins: prev.sessionCoins + missionAddedCoins,
        activeMission: nextMission,
        boardPowerup: missionPowerupSpawn !== null && missionPowerupSpawn !== "random" ? 
            { ...POWERUP_CONFIG[missionPowerupSpawn], x: prev.food.x, y: prev.food.y, remainingDespawn: 15000 } :
            missionPowerupSpawn === "random" ? 
            { ...POWERUP_CONFIG[Object.keys(POWERUP_CONFIG)[Math.floor(Math.random() * Object.keys(POWERUP_CONFIG).length)]], x: prev.food.x, y: prev.food.y, remainingDespawn: 15000 } :
            prev.boardPowerup
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
      let newBoardCoin = prev.boardCoin;
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

      const hasInvincible = newActivePowerups.some(p => p.id === "rare_invincible");
      const hasWallBreaker = newActivePowerups.some(p => p.id === "epic_wall_breaker");

      if (localCfg.wallsKill && !hasWallBreaker && !hasInvincible) {
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
      const selfCollision = !hasGhost && !hasInvincible && prev.snake.some((s) => s.x === newHead.x && s.y === newHead.y);
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
      let extraLives = 0;
      let addConsecutive = 0;
      let shouldTeleport = false;
      let addedSessionCoins = 0;
      const hasDoublePoints = newActivePowerups.some(p => p.id === "common_double_points");

      // Handle coin collection
      if (newBoardCoin && newHead.x === newBoardCoin.x && newHead.y === newBoardCoin.y) {
        newBoardCoin = null;
        addedSessionCoins += 1;
        if (hasDoublePoints) {
          addedSessionCoins += 1;
        }
        soundEngine.playCoin();
      }

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
            scoreBonus += 50;
          } else if (pickedUp.id === "rare_shrink") {
            nextSnake = nextSnake.slice(0, Math.max(3, Math.floor(nextSnake.length / 2)));
            if (hasDoublePoints) scoreBonus += 100;
            else scoreBonus += 50;
          } else if (pickedUp.id === "epic_ghost") {
            scoreBonus += 150;
          } else if (pickedUp.id === "epic_slowmo") {
            newRecoveryTicks = 15;
          } else if (pickedUp.id === "legendary_magnet") {
            scoreBonus += 50;
          } else if (pickedUp.id === "common_heal") {
            if (prev.lives < 5) extraLives = 1;
            else scoreBonus += 50;
          } else if (pickedUp.id === "common_point_burst") {
            scoreBonus += 100;
          } else if (pickedUp.id === "rare_teleport") {
            shouldTeleport = true;
          } else if (pickedUp.id === "rare_streak_boost") {
            addConsecutive = 2;
          } else if (pickedUp.id === "epic_black_hole") {
            addFoodEaten = 3;
            scoreBonus += 150;
            if (!actuallyAteFood) {
              actuallyAteFood = true;
              nextSnake = [newHead, ...prev.snake];
            }
          } else if (pickedUp.id === "mythic_wall_breaker") {
            scoreBonus += 50;
          } else if (pickedUp.id === "common_double_points") {
             scoreBonus += 15;
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
             scoreBonus += 25;
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
        nextFood = randomCell(nextSnake, [newBoardPowerup, newBoardCoin].filter(Boolean));
        triggerQuiz = newFoodEaten % localCfg.quizEvery === 0;

        // 20% chance to spawn a coin when eating food
        if (!newBoardCoin && Math.random() < 0.2) {
          newBoardCoin = randomCell(nextSnake, [nextFood, newBoardPowerup].filter(Boolean));
        }
      } else {
        newScoreSinceLastPowerup += scoreBonus;
      }

      let nextThreshold = prev.powerupScoreThreshold;
      let nextLastPowerupId = prev.lastPowerupSpawnedId;
      if (!newBoardPowerup && newScoreSinceLastPowerup >= nextThreshold) {
         const newPowerup = getRandomPowerup(nextLastPowerupId, prev.difficulty === "hard");
         const spawnPos = randomCell(nextSnake, [nextFood, newBoardCoin].filter(Boolean));
         newBoardPowerup = { ...newPowerup, x: spawnPos.x, y: spawnPos.y, remainingDespawn: newPowerup.despawn };
         newScoreSinceLastPowerup = 0;
         nextThreshold = getNewThreshold(prev.difficulty, prev.answerCount);
         nextLastPowerupId = newPowerup.id;
         soundEngine.powerupAppear();
      }

      const newLevel = Math.floor(newFoodEaten / 10) + 1;
      let newBiomeIndex = prev.biomeIndex;
      let newLevelsUntilBiomeChange = prev.levelsUntilBiomeChange;

      if (newLevel > prev.level) {
        soundEngine.playLevelUp();
        if (newLevel > 100) {
          newBiomeIndex = 10; // Matrix
        } else {
          newLevelsUntilBiomeChange -= 1;
          if (newLevelsUntilBiomeChange <= 0) {
            newBiomeIndex = (newBiomeIndex + 1) % 10; // Ciclo 0-9
            newLevelsUntilBiomeChange = Math.floor(Math.random() * 3) + 3; // 3, 4 o 5
          }
        }
      }

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

      if (shouldTeleport) {
         const newPos = randomCell(nextSnake, [nextFood, newBoardPowerup, newBoardCoin].filter(Boolean));
         nextSnake[0] = newPos;
      }

      let nextMission = prev.activeMission;
      let missionPowerupSpawn = null;
      if (nextMission) {
        let p = nextMission.progress;
        if (nextMission.type === "eat_food" && actuallyAteFood) p += 1;
        if (nextMission.type === "eat_powerup" && pickedUp) p += 1;
        if (nextMission.type === "reach_score") p = newScore;
        
        if (p > nextMission.progress) {
          nextMission = { ...nextMission, progress: p };
        }
        
        if (nextMission.progress >= nextMission.target) {
          addedSessionCoins += nextMission.reward.coins;
          soundEngine.playLevelUp(); // Mission complete sound
          missionPowerupSpawn = nextMission.reward.powerup;
          nextMission = generateMission();
        }
      }
      
      if (missionPowerupSpawn !== null) {
          const powerupId = missionPowerupSpawn === "random" ? Object.keys(POWERUP_CONFIG)[Math.floor(Math.random() * Object.keys(POWERUP_CONFIG).length)] : missionPowerupSpawn;
          const spawnPos = randomCell(nextSnake, [nextFood, newBoardCoin].filter(Boolean));
          newBoardPowerup = { ...POWERUP_CONFIG[powerupId], x: spawnPos.x, y: spawnPos.y, remainingDespawn: 15000 };
      }

      return {
        ...prev,
        dir,
        snake: nextSnake,
        food: nextFood,
        score: newScore,
        foodEaten: newFoodEaten,
        lives: Math.min(5, prev.lives + extraLives),
        consecutiveCorrect: prev.consecutiveCorrect + addConsecutive,
        level: newLevel,
        biomeIndex: newBiomeIndex,
        levelsUntilBiomeChange: newLevelsUntilBiomeChange,
        currentSpeed: newCurrentSpeed,
        slowmoRecoveryTicks: newRecoveryTicks,
        activePowerups: newActivePowerups,
        boardPowerup: newBoardPowerup,
        boardCoin: newBoardCoin,
        sessionCoins: prev.sessionCoins + addedSessionCoins,
        passivePowerups: nextPassivePowerups,
        scoreSinceLastPowerup: newScoreSinceLastPowerup,
        powerupScoreThreshold: nextThreshold,
        lastPowerupSpawnedId: nextLastPowerupId,
        activeMission: nextMission,
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
