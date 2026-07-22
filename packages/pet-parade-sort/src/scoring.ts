import type { PetParadeLevel } from "./model";

export type ParadeMedal = "Park Pass" | "Ribbon Collar" | "Golden Tag";

export interface CompletionScore {
  score: number;
  medals: ParadeMedal[];
  bestThreshold: number;
}

export const scoreCompletion = (level: PetParadeLevel, moves: number, hintsUsed: number): CompletionScore => {
  const [parkPass, ribbon, gold] = level.medalThresholds;
  const medals: ParadeMedal[] = [];
  if (moves <= parkPass) medals.push("Park Pass");
  if (moves <= ribbon) medals.push("Ribbon Collar");
  if (moves <= gold) medals.push("Golden Tag");
  const planningBonus = Math.max(0, gold + 8 - moves) * 70;
  const noHintBonus = hintsUsed === 0 ? 400 : 0;
  return {
    score: Math.max(250, 1000 + planningBonus + noHintBonus - hintsUsed * 80),
    medals,
    bestThreshold: gold
  };
};
