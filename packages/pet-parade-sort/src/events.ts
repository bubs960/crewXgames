import type { EcosystemEvent } from "@teammultiply/ecosystem-core";
import type { PetParadeLevel } from "./model";

export interface ParadeCompletionFacts {
  completedAt: string;
  moves: number;
  score: number;
  hintsUsed: number;
  usedUndo: boolean;
  date?: string;
}

const resultFor = (facts: ParadeCompletionFacts) => ({
  score: facts.score,
  moves: facts.moves,
  completedAt: facts.completedAt
});

export const dailyDateFromParadeId = (levelId: string) => {
  const match = /^pps-daily-(\d{8})$/.exec(levelId);
  return match ? `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}` : undefined;
};

export const createParadeCompletionEvents = (
  level: PetParadeLevel,
  facts: ParadeCompletionFacts
): EcosystemEvent[] => {
  const base = {
    schemaVersion: 1 as const,
    gameId: "pet-parade-sort",
    occurredAt: facts.completedAt
  };
  const events: EcosystemEvent[] = [];
  if (level.mode === "daily") {
    const date = dailyDateFromParadeId(level.id) ?? facts.date ?? facts.completedAt.slice(0, 10);
    events.push({ ...base, eventId: `pet-parade-sort:daily:${date}`, type: "daily.completed", date, result: resultFor(facts) });
  } else if (level.mode === "expert") {
    events.push({ ...base, eventId: `pet-parade-sort:expert:${level.id}`, type: "expert.completed", levelId: level.id, result: resultFor(facts) });
  } else {
    events.push({ ...base, eventId: `pet-parade-sort:game:${level.id}`, type: "game.completed", levelId: level.id, result: resultFor(facts) });
  }
  if (!facts.usedUndo && facts.hintsUsed === 0) {
    events.push({
      ...base,
      eventId: "pet-parade-sort:discovery:misplaced-bell",
      type: "discovery.triggered",
      discoveryId: "misplaced-bell"
    });
  }
  if (level.id === "pps-c5-08") {
    events.push({
      ...base,
      eventId: "pet-parade-sort:story:park-photo-arrives",
      type: "story.completed",
      beatId: "park-photo-arrives"
    });
  }
  return events;
};
