import {
  EcosystemEventSchema,
  applyEcosystemEvent,
  formatZodIssues,
  type EventApplication,
  type LivingShelfState,
  type ShelfPack
} from "@teammultiply/ecosystem-core";

export type GameEventResult =
  | {
      ok: true;
      application: EventApplication;
    }
  | {
      ok: false;
      error: string;
    };

export const receiveGameEvent = (
  state: LivingShelfState,
  eventInput: unknown,
  packs: ShelfPack[],
  appliedAt = new Date().toISOString()
): GameEventResult => {
  const parsed = EcosystemEventSchema.safeParse(eventInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Game event rejected. " + formatZodIssues(parsed.error.issues)
    };
  }

  return {
    ok: true,
    application: applyEcosystemEvent(state, parsed.data, packs, appliedAt)
  };
};
