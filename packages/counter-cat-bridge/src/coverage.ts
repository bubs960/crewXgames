export type CounterCatLegacyRule = "tilt" | "lane";
export type CounterCatLegacyCompletionType = "game.completed" | "expert.completed";

export interface CounterCatLegacyCase {
  sourceKey: string;
  index: number;
  seed: number;
  rule: CounterCatLegacyRule;
  eventType: CounterCatLegacyCompletionType;
  levelId: string;
}

/*
 * This is a deliberate, source-locked fixture. The arrays are the exact
 * CAT_LEVELS and CAT_EXPERT_LEVELS seeds in waddle-home/index.html. A test
 * verifies both their keys and the known source hash before a legacy or live
 * relay reward can be imported.
 */
export const COUNTER_CAT_LEGACY_SOURCE_SHA256 =
  "e70d3066f0e011c42e5e8cae7410f1972f9925633910c5dfb863f1c22f830246";

const normalLadderSeeds = [
  4128371639, 3266194728, 4122090545, 184758640, 688430021, 3688717103, 317625039, 102578766,
   932455890, 343643712, 2221821833, 641190360, 3714736288, 3374393687, 317625039, 3051698461, 
   3525422635, 1216832415, 1836558203, 3749676457, 294697801, 641190360, 3301239, 2548158600, 
   3327154090, 1166821356, 1166821356, 1705432446, 1332887190, 839327833, 1216832415, 2699474073, 
   1612304869, 4271379259, 2958570904, 3830825023, 343643712, 3618550700, 3409333852, 932455890, 
   1442826479, 784329036, 3830825023, 1496215662, 541912769, 2772315266, 1701923310, 3615041500, 
   1388017123, 1854721120, 245718002, 3519273045, 2807255435, 1037276361, 839327833, 3947945006, 
   1251772548, 2014540392, 2376973988, 3086638618
] as const;

const expertLadderSeeds = [
  3041671974, 1218358241, 3872728466, 1401205463, 147967229, 2323686334, 2232278851, 387285365,
   774513130, 535195506, 2654444465, 2027750596, 3429030043, 2563020598, 3576924824, 683105903, 
   3668348691, 3041671206, 774513386, 535194738, 204452991, 591680756, 4020638095, 21605769, 
   1035510507, 408833534, 3063335855, 1183419624
] as const;

const caseNumber = (index: number) => String(index + 1).padStart(2, "0");

const normalCases: CounterCatLegacyCase[] = normalLadderSeeds.map((seed, index) => ({
  sourceKey: "cat:" + index + ":" + seed + ":tilt",
  index,
  seed,
  rule: "tilt",
  eventType: "game.completed",
  levelId: "case-" + caseNumber(index)
}));

const expertCases: CounterCatLegacyCase[] = expertLadderSeeds.map((seed, index) => ({
  sourceKey: "cat:" + index + ":" + seed + ":lane",
  index,
  seed,
  rule: "lane",
  eventType: "expert.completed",
  levelId: "expert-case-" + caseNumber(index)
}));

export const COUNTER_CAT_LEGACY_CASES = [...normalCases, ...expertCases] as const;

export const CounterCatLegacyCaseByKey = new Map<string, CounterCatLegacyCase>(
  COUNTER_CAT_LEGACY_CASES.map((legacyCase) => [legacyCase.sourceKey, legacyCase])
);
