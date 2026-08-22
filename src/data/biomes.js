export const BIOMES = [
  { name: "Bosque", boardBg: "#0d0d1a", food: "#ff4d6d", grid: "rgba(255,255,255,0.03)", gridHard: "rgba(255,100,50,0.05)", borderHard: "255,50,50" }, // Lvl 1-10
  { name: "Desierto", boardBg: "#1a1610", food: "#ffb703", grid: "rgba(251,133,0,0.05)", gridHard: "rgba(251,133,0,0.1)", borderHard: "251,133,0" }, // Lvl 11-20
  { name: "Océano", boardBg: "#001233", food: "#00b4d8", grid: "rgba(144,224,239,0.05)", gridHard: "rgba(0,180,216,0.1)", borderHard: "0,119,182" }, // Lvl 21-30
  { name: "Volcán", boardBg: "#2a0800", food: "#d00000", grid: "rgba(220,47,2,0.05)", gridHard: "rgba(157,2,8,0.1)", borderHard: "106,4,15" }, // Lvl 31-40
  { name: "Pantano", boardBg: "#101f14", food: "#70e000", grid: "rgba(56,176,0,0.05)", gridHard: "rgba(0,128,0,0.1)", borderHard: "0,114,0" }, // Lvl 41-50
  { name: "Tundra", boardBg: "#0b132b", food: "#00ffff", grid: "rgba(91,192,190,0.05)", gridHard: "rgba(111,255,233,0.1)", borderHard: "111,255,233" }, // Lvl 51-60
  { name: "Ciudad Neón", boardBg: "#0f0524", food: "#f72585", grid: "rgba(114,9,183,0.08)", gridHard: "rgba(67,97,238,0.15)", borderHard: "76,201,240" }, // Lvl 61-70
  { name: "Espacio", boardBg: "#000000", food: "#ff9f1c", grid: "rgba(255,255,255,0.02)", gridHard: "rgba(255,255,255,0.05)", borderHard: "255,255,255" }, // Lvl 71-80
  { name: "Fantasma", boardBg: "#1c1c1c", food: "#9d4edd", grid: "rgba(123,44,191,0.05)", gridHard: "rgba(90,24,154,0.1)", borderHard: "60,9,108" }, // Lvl 81-90
  { name: "El Olimpo", boardBg: "#1a1a10", food: "#ffd700", grid: "rgba(255,215,0,0.08)", gridHard: "rgba(218,165,32,0.15)", borderHard: "218,165,32" }, // Lvl 91-100
  { name: "La Matrix", boardBg: "#001100", food: "#00ff00", grid: "rgba(0,255,0,0.1)", gridHard: "rgba(0,255,0,0.2)", borderHard: "0,255,0", isMatrix: true } // Lvl > 100
];

export const getBiomeForLevel = (level) => {
  if (level > 100) return BIOMES[10]; // Matrix
  const index = Math.max(0, Math.ceil(level / 10) - 1);
  return BIOMES[index];
};
