import type { EcosystemEvent } from "@teammultiply/ecosystem-core";
import type { CrochetLevel } from "./model";

export interface CompletionFacts {
  completedAt: string;
  moves: number;
  score: number;
  usedUndo: boolean;
  date?: string;
}

const result = (facts: CompletionFacts) => ({
  score: facts.score,
  moves: facts.moves,
  completedAt: facts.completedAt
});

export const dailyDateFromLevelId = (levelId: string) => {
  const match = /^ccc-daily-(\d{8})$/.exec(levelId);
  return match ? match[1].slice(0, 4) + "-" + match[1].slice(4, 6) + "-" + match[1].slice(6, 8) : undefined;
};

export const createCompletionEvents = (level: CrochetLevel, facts: CompletionFacts): EcosystemEvent[] => {
  const base = {
    schemaVersion: 1 as const,
    gameId: "cozy-crochet-critters",
    occurredAt: facts.completedAt
  };
  const events: EcosystemEvent[] = [];
  if (level.mode === "daily") {
    const date = dailyDateFromLevelId(level.id) ?? facts.date ?? facts.completedAt.slice(0, 10);
    events.push({ ...base, eventId: "cozy-crochet-critters:daily:" + date, type: "daily.completed", date, result: result(facts) });
  } else if (level.mode === "expert") {
    events.push({ ...base, eventId: "cozy-crochet-critters:expert:" + level.id, type: "expert.completed", levelId: level.id, result: result(facts) });
  } else {
    events.push({ ...base, eventId: "cozy-crochet-critters:campaign:" + level.id, type: "game.completed", levelId: level.id, result: result(facts) });
  }
  if (!facts.usedUndo) {
    events.push({
      ...base,
      eventId: "cozy-crochet-critters:discovery:unauthorized-yarn-nest",
      type: "discovery.triggered",
      discoveryId: "unauthorized-yarn-nest"
    });
  }
  if (level.id === "ccc-bunny-08") {
    events.push({
      ...base,
      eventId: "cozy-crochet-critters:story:craft-corner-opens",
      type: "story.completed",
      beatId: "craft-corner-opens"
    });
  }
  return events;
};
