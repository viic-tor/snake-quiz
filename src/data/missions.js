// Define a pool of mission templates.
// We will generate concrete missions based on these templates.
export const MISSION_TIERS = {
  common: { name: "Común", color: "#10b981", coins: 5, targetMultiplier: 1 },
  rare: { name: "Raro", color: "#3b82f6", coins: 15, targetMultiplier: 1.5 },
  epic: { name: "Épico", color: "#a855f7", coins: 50, targetMultiplier: 2.5 },
  legendary: { name: "Legendario", color: "#f59e0b", coins: 100, targetMultiplier: 4 }
};

export const MISSION_TEMPLATES = [
  {
    id: "eat_food",
    description: (target) => `Come ${target} manzanas.`,
    baseTarget: 5,
    type: "eat_food",
  },
  {
    id: "answer_quiz",
    description: (target) => `Responde correctamente ${target} quizzes.`,
    baseTarget: 2,
    type: "answer_quiz",
  },
  {
    id: "reach_score",
    description: (target) => `Gana ${target} puntos sin morir.`,
    baseTarget: 500,
    type: "reach_score",
  },
  {
    id: "eat_powerup",
    description: (target) => `Recoge ${target} potenciadores.`,
    baseTarget: 2,
    type: "eat_powerup",
  }
];

export const generateMission = (tierKey = "common") => {
  const tier = MISSION_TIERS[tierKey];
  const template = MISSION_TEMPLATES[Math.floor(Math.random() * MISSION_TEMPLATES.length)];
  const target = Math.floor(template.baseTarget * tier.targetMultiplier);
  
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    type: template.type,
    tier: tierKey,
    target: target,
    progress: 0,
    description: template.description(target),
    reward: {
      coins: tier.coins,
      powerup: "random" // Replaced by useSnakeGame logic
    }
  };
};
