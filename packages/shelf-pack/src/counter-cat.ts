import {
  ShelfPackSchema,
  createInitialLivingShelfState,
  formatZodIssues,
  type LivingShelfState,
  type ShelfPack,
  type UnlockReceipt
} from "@teammultiply/ecosystem-core";

const counterCatPackSource: ShelfPack = {
  schemaVersion: 1,
  packId: "counter-cat.test-pack",
  gameId: "counter-cat",
  title: "Counter Cat test Shelf Pack",
  entrance: {
    id: "counter-cat-entrance",
    label: "Counter Cat kitchen counter",
    surface: "counter"
  },
  residents: [
    {
      id: "counter-cat",
      displayName: "Counter Cat",
      traits: ["seeks-height", "inspects-new-objects", "bats-rolling-objects", "protects-yarn"],
      accessibleLabel: "Counter Cat waits beside the counter, watching any object with poor judgment."
    }
  ],
  collectibles: [
    {
      id: "blue-mug",
      familyId: "counter-cat-evidence",
      displayName: "Blue Mug",
      assetId: "graybox-blue-mug",
      unique: true,
      footprint: { width: 0.15, height: 0.22 },
      validSurfaces: ["shelf", "counter", "floor"],
      tags: ["rolling", "fragile", "shiny"],
      unlock: {
        eventType: "game.completed",
        gameId: "counter-cat",
        levelId: "case-01",
        label: "Clear Counter Cat Case 01",
        classification: "normal"
      },
      provenanceCopy: "Blue Mug, recovered from Counter Cat Case 01. Structural confidence remains low.",
      accessibleLabel: "A blue ceramic mug. Counter Cat considers it a rolling object with paperwork.",
      reducedMotionState: "The mug remains still; its discovery is described in text."
    },
    {
      id: "yarn-ball",
      familyId: "counter-cat-evidence",
      displayName: "Yarn Ball",
      assetId: "graybox-yarn-ball",
      unique: true,
      footprint: { width: 0.16, height: 0.16 },
      validSurfaces: ["shelf", "counter", "floor"],
      tags: ["rolling", "soft", "yarn-related", "protected-by-cat"],
      unlock: {
        eventType: "game.completed",
        gameId: "counter-cat",
        levelId: "case-02",
        label: "Clear Counter Cat Case 02",
        classification: "normal"
      },
      provenanceCopy: "Yarn Ball, claimed by Counter Cat before the appeal process began.",
      accessibleLabel: "A protected ball of blue yarn.",
      reducedMotionState: "The yarn remains in place while Counter Cat's claim is described in text."
    },
    {
      id: "dented-can",
      familyId: "counter-cat-evidence",
      displayName: "Dented Can",
      assetId: "graybox-dented-can",
      unique: true,
      footprint: { width: 0.13, height: 0.18 },
      validSurfaces: ["shelf", "counter", "floor"],
      tags: ["rolling", "makes-noise", "metal"],
      unlock: {
        eventType: "game.completed",
        gameId: "counter-cat",
        levelId: "case-03",
        label: "Clear Counter Cat Case 03",
        classification: "normal"
      },
      provenanceCopy: "Dented Can, a loud survivor of Counter Cat's materials research.",
      accessibleLabel: "A dented metal can that makes a clear noise when moved.",
      reducedMotionState: "The can remains still while its movement is described in text."
    }
  ],
  environmentLayers: [
    {
      id: "counter-cat-kitchen-graybox",
      kind: "surface",
      label: "Kitchen counter, shelf, and floor gray box"
    }
  ],
  behaviors: [
    {
      id: "counter-cat-bats-rolling-object",
      displayName: "Counter Cat bats a rolling object toward the floor",
      actorId: "counter-cat",
      priority: 40,
      seedRule: "worldSeed plus sorted placement ids",
      requiredCollectibleIds: ["blue-mug"],
      requiredObjectTags: ["rolling"],
      requiredSurfaces: ["counter", "shelf"],
      exclusions: {
        quietMode: true,
        reducedMotion: true
      },
      action: {
        type: "move-to-floor",
        targetObjectId: "blue-mug",
        destination: {
          x: 0.62,
          y: 0.3,
          rotateBy: 90
        }
      },
      discovery: {
        title: "Gravity department notified",
        copy: "Counter Cat batted the rolling Blue Mug toward the floor. The mug submitted no rebuttal.",
        accessibilityNarration: "Counter Cat bats the Blue Mug from its surface to the floor."
      }
    },
    {
      id: "counter-cat-protects-yarn",
      displayName: "Counter Cat protects yarn and redirects toward it",
      actorId: "counter-cat",
      priority: 90,
      seedRule: "worldSeed plus sorted placement ids",
      requiredCollectibleIds: ["blue-mug", "yarn-ball"],
      requiredObjectTags: ["rolling"],
      requiredSurfaces: ["counter", "shelf"],
      exclusions: {
        quietMode: true,
        reducedMotion: true
      },
      action: {
        type: "redirect-toward-object",
        targetObjectId: "blue-mug",
        anchorObjectId: "yarn-ball",
        offsetX: -0.2,
        offsetY: 0.12
      },
      discovery: {
        title: "Yarn jurisdiction upheld",
        copy: "Counter Cat redirected the Blue Mug toward the Yarn Ball, then sat where cross-examination would be least effective.",
        accessibilityNarration: "Counter Cat redirects the Blue Mug toward the protected Yarn Ball."
      }
    }
  ],
  storyBeats: [
    {
      id: "counter-cat-jurisdiction",
      title: "Countertop jurisdiction",
      copy: "Counter Cat has posted a rule. It is not a reasonable rule."
    }
  ],
  dailyEvents: [
    {
      id: "counter-cat-mischief-report",
      title: "Counter Cat mischief report"
    }
  ],
  shareScenes: [
    {
      id: "counter-cat-kitchen-proof",
      label: "Kitchen evidence board"
    }
  ],
  accessibility: {
    label: "Counter Cat Living Shelf test pack",
    reducedMotionCopy: "Motion is replaced by a text discovery record.",
    contrastMode: "High-contrast placement outlines remain visible."
  }
};

export const CounterCatShelfPack = ShelfPackSchema.parse(counterCatPackSource);

const clonePack = () => structuredClone(CounterCatShelfPack);

const missingRequiredFields = clonePack() as Record<string, unknown>;
delete missingRequiredFields.title;

const unsupportedSchemaVersion = clonePack();
unsupportedSchemaVersion.schemaVersion = 99;

const duplicateObjectIds = clonePack();
duplicateObjectIds.collectibles[1].id = duplicateObjectIds.collectibles[0].id;

const invalidBehaviorReference = clonePack();
invalidBehaviorReference.behaviors[1].requiredCollectibleIds = ["blue-mug", "not-a-real-object"];

export const CounterCatShelfPackFixtures = {
  valid: CounterCatShelfPack,
  missingRequiredFields,
  unsupportedSchemaVersion,
  duplicateObjectIds,
  invalidBehaviorReference
};

export const validateShelfPack = (input: unknown) => {
  const result = ShelfPackSchema.safeParse(input);
  return result.success
    ? { success: true as const, pack: result.data, error: null }
    : { success: false as const, pack: null, error: formatZodIssues(result.error.issues) };
};

export const createCounterCatFixtureWorld = (
  now = new Date().toISOString()
): LivingShelfState => {
  const starterReceipts: UnlockReceipt[] = [
    {
      receiptId: "receipt:starter:yarn-ball",
      eventId: "starter:counter-cat:yarn-ball",
      objectId: "yarn-ball",
      packId: CounterCatShelfPack.packId,
      receivedAt: now,
      classification: "starter",
      provenance: "Yarn Ball test fixture. Counter Cat began the custody claim before this slice opened."
    },
    {
      receiptId: "receipt:starter:dented-can",
      eventId: "starter:counter-cat:dented-can",
      objectId: "dented-can",
      packId: CounterCatShelfPack.packId,
      receivedAt: now,
      classification: "starter",
      provenance: "Dented Can test fixture. It is present to exercise placement and collision checks."
    }
  ];
  return createInitialLivingShelfState({
    worldId: "counter-cat-local-shelf",
    worldSeed: 170719,
    now,
    inventory: [
      { objectId: "yarn-ball", count: 1 },
      { objectId: "dented-can", count: 1 }
    ],
    receipts: starterReceipts
  });
};
