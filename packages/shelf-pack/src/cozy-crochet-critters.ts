import {
  ShelfPackSchema,
  type LivingShelfState,
  type ShelfPack
} from "@teammultiply/ecosystem-core";

const cozyCrochetCrittersPackSource: ShelfPack = {
  schemaVersion: 1,
  packId: "cozy-crochet-critters.shelf-pack",
  gameId: "cozy-crochet-critters",
  title: "Cozy Crochet Critters Shelf Pack",
  entrance: {
    id: "cozy-crochet-craft-basket",
    label: "Craft basket — open Cozy Crochet Critters",
    surface: "counter"
  },
  residents: [
    {
      id: "craft-room-kitten",
      displayName: "Mallow, craft-room kitten",
      traits: ["inspects-fibers", "guards-hooks", "welcomes-handmade-residents", "quiet-napper"],
      accessibleLabel: "Mallow, a craft-room kitten, watches the yarn basket with alert but entirely unhelpful focus."
    }
  ],
  collectibles: [
    {
      id: "crochet-yarn-basket",
      familyId: "cozy-crochet-props",
      displayName: "Yarn basket",
      assetId: "crochet-yarn-basket-v1",
      unique: true,
      footprint: { width: 0.21, height: 0.18 },
      validSurfaces: ["shelf", "counter", "floor"],
      tags: ["fiber", "soft", "yarn-source", "craft-corner"],
      unlock: { eventType: "game.completed", gameId: "cozy-crochet-critters", levelId: "ccc-kitten-01", label: "Complete First Square", classification: "normal" },
      provenanceCopy: "Yarn basket, set out after the first Kitten Square became structurally recognizable.",
      accessibleLabel: "A woven yarn basket holding visible coral, teal, gold, leaf green, and ink yarn.",
      reducedMotionState: "The basket is still; its yarn colors remain clearly labeled."
    },
    {
      id: "crochet-mat",
      familyId: "cozy-crochet-props",
      displayName: "Crochet mat",
      assetId: "crochet-mat-v1",
      unique: true,
      footprint: { width: 0.28, height: 0.16 },
      validSurfaces: ["shelf", "counter"],
      tags: ["fiber", "work-surface", "soft", "craft-corner"],
      unlock: { eventType: "game.completed", gameId: "cozy-crochet-critters", levelId: "ccc-kitten-08", label: "Wake the Kitten", classification: "normal" },
      provenanceCopy: "Crochet mat, earned when the first handmade kitten woke and inspected its own paws.",
      accessibleLabel: "A teal crochet mat with a high-contrast stitched border.",
      reducedMotionState: "The crochet mat stays flat and its border remains high contrast."
    },
    {
      id: "crochet-pin-cushion",
      familyId: "cozy-crochet-props",
      displayName: "Pin cushion",
      assetId: "crochet-pin-cushion-v1",
      unique: true,
      footprint: { width: 0.15, height: 0.15 },
      validSurfaces: ["shelf", "counter"],
      tags: ["pin", "fiber", "route-planning", "craft-corner"],
      unlock: { eventType: "game.completed", gameId: "cozy-crochet-critters", levelId: "ccc-puppy-01", label: "Complete Patch Placement", classification: "normal" },
      provenanceCopy: "Pin cushion, issued after the first Puppy Patch route passed inspection without a knot.",
      accessibleLabel: "A coral pin cushion with metal pins visible as separate high-contrast points.",
      reducedMotionState: "Pins remain still and are described as a fixed planning tool."
    },
    {
      id: "crochet-oversized-hook",
      familyId: "cozy-crochet-props",
      displayName: "Oversized crochet hook",
      assetId: "crochet-oversized-hook-v1",
      unique: true,
      footprint: { width: 0.31, height: 0.08 },
      validSurfaces: ["shelf", "counter"],
      tags: ["hook", "metal", "fiber", "craft-corner"],
      unlock: { eventType: "game.completed", gameId: "cozy-crochet-critters", levelId: "ccc-bunny-04", label: "Complete Ink Loop", classification: "normal" },
      provenanceCopy: "Oversized crochet hook, reclaimed from the Bunny Loops bench after a very tidy tension check.",
      accessibleLabel: "A polished gold crochet hook with a dark, high-contrast grip.",
      reducedMotionState: "The hook is still with its tip and grip clearly outlined."
    },
    {
      id: "crochet-handmade-fox",
      familyId: "cozy-crochet-residents",
      displayName: "Handmade fox",
      assetId: "crochet-handmade-fox-v1",
      unique: true,
      footprint: { width: 0.2, height: 0.26 },
      validSurfaces: ["shelf", "counter", "floor"],
      tags: ["handmade-resident", "fiber", "fox", "craft-corner"],
      unlock: { eventType: "game.completed", gameId: "cozy-crochet-critters", levelId: "ccc-bunny-08", label: "Wake the Bunny", classification: "normal" },
      provenanceCopy: "Handmade fox, welcomed after the craft corner opened and its first soft residents began appearing.",
      accessibleLabel: "A handmade orange fox with a cream muzzle, leaf-green scarf, and visible crochet stitch texture.",
      reducedMotionState: "The handmade fox remains curled and its waking reaction is narrated in text."
    },
    {
      id: "perfect-stitch-sampler",
      familyId: "cozy-crochet-mastery",
      displayName: "Perfect Stitch sampler",
      assetId: "perfect-stitch-sampler-v1",
      unique: true,
      footprint: { width: 0.23, height: 0.2 },
      validSurfaces: ["shelf", "counter"],
      tags: ["mastery", "fiber", "sampler", "craft-corner"],
      unlock: { eventType: "expert.completed", gameId: "cozy-crochet-critters", levelId: "ccc-expert-06", label: "Complete Perfect Stitch", classification: "expert" },
      provenanceCopy: "Perfect Stitch sampler, awarded for completing the final expert remix without any booster or purchase.",
      accessibleLabel: "A framed sampler showing a high-contrast coral, teal, gold, leaf green, and ink stitch sequence.",
      reducedMotionState: "The sampler remains a readable static pattern."
    },
    {
      id: "unauthorized-yarn-nest",
      familyId: "cozy-crochet-discoveries",
      displayName: "Unauthorized yarn nest",
      assetId: "unauthorized-yarn-nest-v1",
      unique: true,
      footprint: { width: 0.2, height: 0.17 },
      validSurfaces: ["shelf", "counter", "floor"],
      tags: ["discovery", "fiber", "mischief", "craft-corner"],
      unlock: { eventType: "discovery.triggered", gameId: "cozy-crochet-critters", discoveryId: "unauthorized-yarn-nest", label: "Finish a route with no undo", classification: "discovery" },
      provenanceCopy: "Unauthorized yarn nest, discovered when a clean finish gave Mallow enough confidence to rearrange exactly one harmless strand.",
      accessibleLabel: "A deliberately tangled multicolor yarn nest, tagged as a discovery rather than a required puzzle object.",
      reducedMotionState: "The yarn nest is still; its discovery is explained in text."
    }
  ],
  environmentLayers: [
    { id: "cozy-crochet-craft-corner", kind: "architecture", label: "Craft corner with a low worktable, pinboard, and task-lighting rail" },
    { id: "cozy-crochet-task-lighting", kind: "lighting", label: "Warm task lighting focused on the crochet table" }
  ],
  behaviors: [
    {
      id: "mallow-guards-yarn-basket",
      displayName: "Mallow redirects the handmade fox toward the yarn basket",
      actorId: "craft-room-kitten",
      priority: 80,
      seedRule: "worldSeed plus sorted craft-corner placements",
      requiredCollectibleIds: ["crochet-yarn-basket", "crochet-handmade-fox"],
      requiredObjectTags: ["fiber", "handmade-resident"],
      requiredSurfaces: ["shelf", "counter"],
      exclusions: { quietMode: true, reducedMotion: true },
      action: { type: "redirect-toward-object", targetObjectId: "crochet-handmade-fox", anchorObjectId: "crochet-yarn-basket", offsetX: 0.26, offsetY: 0.04 },
      discovery: { title: "Fiber supervision", copy: "Mallow redirected the handmade fox toward the yarn basket, then pretended that was not exactly the point.", accessibilityNarration: "Mallow guides the handmade fox beside the yarn basket." }
    },
    {
      id: "mallow-saves-the-hook",
      displayName: "Mallow moves the oversized hook away from the floor",
      actorId: "craft-room-kitten",
      priority: 90,
      seedRule: "worldSeed plus hook placement",
      requiredCollectibleIds: ["crochet-oversized-hook", "crochet-mat"],
      requiredObjectTags: ["hook", "work-surface"],
      requiredSurfaces: ["counter", "floor"],
      exclusions: { quietMode: true, reducedMotion: true },
      action: { type: "move-to-floor", targetObjectId: "crochet-oversized-hook", destination: { x: 0.63, y: 0.28, rotateBy: 90 } },
      discovery: { title: "Hook relocated", copy: "Mallow performed a safety inspection that somehow ended with the hook in a more photogenic spot.", accessibilityNarration: "Mallow moves the oversized crochet hook to a clear resting spot." }
    },
    {
      id: "mallow-inspects-pin-cushion",
      displayName: "Mallow nudges the pin cushion toward the crochet mat",
      actorId: "craft-room-kitten",
      priority: 70,
      seedRule: "worldSeed plus pin cushion and mat placements",
      requiredCollectibleIds: ["crochet-pin-cushion", "crochet-mat"],
      requiredObjectTags: ["pin", "work-surface"],
      requiredSurfaces: ["shelf", "counter"],
      exclusions: { quietMode: true, reducedMotion: true },
      action: { type: "redirect-toward-object", targetObjectId: "crochet-pin-cushion", anchorObjectId: "crochet-mat", offsetX: -0.24, offsetY: 0.08 },
      discovery: { title: "Pin audit", copy: "Mallow inspected the pin cushion from a respectful distance of one whisker.", accessibilityNarration: "Mallow moves the pin cushion beside the crochet mat." }
    },
    {
      id: "fox-finds-yarn-nest",
      displayName: "The handmade fox gathers the yarn nest by the basket",
      actorId: "craft-room-kitten",
      priority: 60,
      seedRule: "worldSeed plus discovery placement",
      requiredCollectibleIds: ["unauthorized-yarn-nest", "crochet-yarn-basket"],
      requiredObjectTags: ["discovery", "fiber"],
      requiredSurfaces: ["shelf", "counter", "floor"],
      exclusions: { quietMode: true, reducedMotion: true },
      action: { type: "redirect-toward-object", targetObjectId: "unauthorized-yarn-nest", anchorObjectId: "crochet-yarn-basket", offsetX: -0.24, offsetY: 0.12 },
      discovery: { title: "Nest rehomed", copy: "The unauthorized yarn nest has been placed near the basket, where its paperwork can be ignored together.", accessibilityNarration: "The yarn nest rests beside the yarn basket." }
    },
    {
      id: "mallow-displays-sampler",
      displayName: "Mallow places the mastery sampler where the fox can see it",
      actorId: "craft-room-kitten",
      priority: 100,
      seedRule: "worldSeed plus mastery placement",
      requiredCollectibleIds: ["perfect-stitch-sampler", "crochet-handmade-fox"],
      requiredObjectTags: ["mastery", "handmade-resident"],
      requiredSurfaces: ["shelf", "counter"],
      exclusions: { quietMode: true, reducedMotion: true },
      action: { type: "redirect-toward-object", targetObjectId: "crochet-handmade-fox", anchorObjectId: "perfect-stitch-sampler", offsetX: 0.28, offsetY: 0.02 },
      discovery: { title: "Sampler approval", copy: "Mallow arranged a tiny viewing of the Perfect Stitch sampler. Attendance was mandatory for the fox and optional for everyone else.", accessibilityNarration: "The handmade fox is positioned beside the Perfect Stitch sampler." }
    }
  ],
  storyBeats: [
    { id: "craft-corner-opens", title: "The craft corner opens", copy: "The task light clicks on. A crochet mat appears. Handmade residents begin arriving with impeccable timing and no visible invoices." }
  ],
  dailyEvents: [
    { id: "unraveled-overnight", title: "Unraveled Overnight" }
  ],
  shareScenes: [
    { id: "cozy-crochet-critter-wakes", label: "Completed critter wakes on the craft table" }
  ],
  accessibility: {
    label: "Cozy Crochet Critters craft-corner Shelf Pack",
    reducedMotionCopy: "Fiber movement and animal wake-up motions are replaced by clear text descriptions and still high-contrast art.",
    contrastMode: "Every yarn color also has a symbol, texture, and high-contrast outline."
  }
};

export const CozyCrochetCrittersShelfPack = ShelfPackSchema.parse(cozyCrochetCrittersPackSource);

export const createCozyCrochetFixtureWorld = (state: LivingShelfState) => ({
  ...structuredClone(state),
  unlockedPacks: [...new Set([...state.unlockedPacks, CozyCrochetCrittersShelfPack.packId])]
});
