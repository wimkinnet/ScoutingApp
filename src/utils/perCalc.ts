import type { PlayerStats } from "../app/types";

export const calculateCustomIndexPerMinute = (stats: PlayerStats): number => {
  const minutes = stats.secondsPlayed / 60;
  
  // Voorkom delen door nul als een speler (nog) niet heeft gespeeld
  if (minutes === 0) return 0;

  // Pas de weging toe
  const totalCBI =
    stats.points +
    1.5 * stats.assists +
    1.2 * stats.offensiveRebounds +
    0.8 * stats.defensiveRebounds +
    2.0 * stats.steals +
    1.7 * stats.blocks -
    2.0 * stats.turnovers -
    0.8 * stats.missedShots;

  // Bereken per minuut en rond af op twee decimalen
  const cbiPerMinute = totalCBI / minutes;
  return Math.round(cbiPerMinute * 100) / 100;
};