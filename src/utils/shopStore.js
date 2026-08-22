/**
 * @file shopStore.js
 * @description Gestor local y remoto de la economía del juego (monedas y skins).
 */
import { SUPABASE_ENABLED, updatePlayerProfile } from "./supabase";

const DEFAULT_SKINS = ["google"];

export const SKIN_CATALOG = [
  { id: "google", name: "Clásica", price: 0, desc: "La serpiente verde retro de Google." },
  { id: "pixel", name: "Píxel", price: 500, desc: "Estilo 8-bits de la vieja escuela." },
  { id: "rainbow", name: "Arcoíris", price: 1000, desc: "Multicolor y radiante." },
  { id: "cosmic", name: "Cósmica", price: 2500, desc: "Una nebulosa de estrellas en tu cuerpo." },
  { id: "blackhole", name: "Agujero Negro", desc: "La singularidad misma", price: 5000 },
  { id: "dragon", name: "Dragón", desc: "Escamas de fuego y cuernos", price: 10000 },
  { id: "cyborg", name: "Cyborg", desc: "Ojo robótico y circuitos", price: 15000 },
  { id: "cat", name: "Gato", desc: "Orejas suaves y bigotes", price: 20000 }
];

export function getPlayerEconomy(playerName) {
  const defaults = { coins: 0, unlockedSkins: DEFAULT_SKINS, baseColor: "#4ade80" };
  if (!playerName) return defaults;
  const raw = localStorage.getItem(`snake-quiz-economy-${playerName}`);
  if (raw) {
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  }
  return defaults;
}

export function savePlayerEconomy(playerName, economy) {
  if (!playerName) return;
  localStorage.setItem(`snake-quiz-economy-${playerName}`, JSON.stringify(economy));
  // Si Supabase está habilitado, intentar sincronizar
  if (SUPABASE_ENABLED) {
    updatePlayerProfile(playerName, economy.coins, economy.unlockedSkins, economy.baseColor).catch(console.warn);
  }
}

export function addCoins(playerName, amount) {
  const economy = getPlayerEconomy(playerName);
  economy.coins += amount;
  savePlayerEconomy(playerName, economy);
  return economy.coins;
}

export function buySkin(playerName, skinId, price) {
  const economy = getPlayerEconomy(playerName);
  if (economy.coins >= price && !economy.unlockedSkins.includes(skinId)) {
    economy.coins -= price;
    economy.unlockedSkins.push(skinId);
    savePlayerEconomy(playerName, economy);
    return true;
  }
  return false;
}
