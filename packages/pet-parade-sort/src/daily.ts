import { campaignLevels, chapterChallengeSource, expertLevels } from "./content";
import type { PetParadeLevel } from "./model";

const normalizeDate = (date: string | Date) => {
  const value = typeof date === "string" ? date : date.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Daily Parade dates use YYYY-MM-DD.");
  return value;
};

export const dateSeed = (date: string | Date) => {
  const value = normalizeDate(date).replaceAll("-", "");
  let seed = 2166136261;
  for (const character of value) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
};

const rotate = <T,>(values: T[], amount: number) => {
  if (!values.length) return [];
  const offset = ((amount % values.length) + values.length) % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
};

export const createDailyParade = (dateInput: string | Date): PetParadeLevel => {
  const date = normalizeDate(dateInput);
  const seed = dateSeed(date);
  const pool = [...campaignLevels.slice(16), ...expertLevels.slice(0, 6)];
  const source = pool[seed % pool.length];
  const level = structuredClone(source);
  level.id = `pps-daily-${date.replaceAll("-", "")}`;
  level.title = `Daily Parade · ${date}`;
  level.mode = "daily";
  level.chapter = "Daily Parade";
  level.chapterNumber = 7;
  level.setting = "Date-stamped park photo pavilion";
  level.intro = "Same collars for everyone today. No streak breaks. No mystery reshuffle.";
  level.posts = rotate(level.posts, seed % level.posts.length);
  level.generatedFrom = source.id;
  level.curationNote = `Deterministically selected from solver-verified ${source.id}; only presentation order changes.`;
  return level;
};

export const createChapterChallenge = (chapterNumber: number): PetParadeLevel => {
  const source = chapterChallengeSource(chapterNumber);
  if (!source) throw new Error(`Unknown Pet Parade chapter ${chapterNumber}.`);
  const level = structuredClone(source);
  level.id = `pps-challenge-${chapterNumber}`;
  level.title = `${source.chapter} · Club Challenge`;
  level.mode = "challenge";
  level.parMoves = Math.max(1, source.parMoves - 1);
  level.medalThresholds = [source.medalThresholds[0], source.medalThresholds[1], Math.max(1, source.medalThresholds[2] - 1)];
  level.generatedFrom = source.id;
  level.intro = "The same visible board returns with a tighter photo-call record.";
  level.curationNote = `Replay challenge based on curated chapter finale ${source.id}.`;
  return level;
};
