import { ShelfPackSchema, type ShelfPack } from "@teammultiply/ecosystem-core";

const petParadeSortPackSource: ShelfPack = {
  schemaVersion: 1,
  packId: "pet-parade-sort.shelf-pack",
  gameId: "pet-parade-sort",
  title: "Pet Parade Sort Shelf Pack",
  entrance: {
    id: "pet-parade-entryway-bench",
    label: "Entryway collar bench — open Pet Parade Sort",
    surface: "floor"
  },
  residents: [
    {
      id: "parade-rescue-visitor",
      displayName: "Rotating rescue visitor",
      traits: ["waits-by-entryway", "inspects-name-tags", "joins-park-photo", "accepts-treat-diplomacy"],
      accessibleLabel: "A rotating rescue visitor waits beside the entryway bench for a completed collar."
    }
  ],
  collectibles: [
    {
      id: "parade-entryway-bench",
      familyId: "pet-parade-entryway",
      displayName: "Entryway bench",
      assetId: "parade-entryway-bench-v1",
      unique: true,
      footprint: { width: 0.32, height: 0.17 },
      validSurfaces: ["floor"],
      tags: ["entryway", "seat", "arrival-route", "wood"],
      unlock: { eventType: "game.completed", gameId: "pet-parade-sort", levelId: "pps-tutorial-01", label: "Complete First Name Tag", classification: "normal" },
      provenanceCopy: "Entryway bench, installed after the first rescue collar left the organizer in working order.",
      accessibleLabel: "A low painted entryway bench with a woven cushion and a clear arrival route.",
      reducedMotionState: "The bench remains still while visitor arrivals are described in text."
    },
    {
      id: "parade-collar-rack",
      familyId: "pet-parade-entryway",
      displayName: "Collar rack",
      assetId: "parade-collar-rack-v1",
      unique: true,
      footprint: { width: 0.25, height: 0.25 },
      validSurfaces: ["shelf", "counter", "floor"],
      tags: ["entryway", "collar", "hanging", "woven"],
      unlock: { eventType: "game.completed", gameId: "pet-parade-sort", levelId: "pps-c1-08", label: "Complete Intake Desk", classification: "normal" },
      provenanceCopy: "Collar rack, issued after Intake Desk Photo Call One. Dogs were ready before installation finished.",
      accessibleLabel: "A small oak collar rack holding coral, teal, and gold woven collars.",
      reducedMotionState: "The collars hang without swaying and retain distinct symbols."
    },
    {
      id: "parade-name-tag-display",
      familyId: "pet-parade-entryway",
      displayName: "Name-tag display",
      assetId: "parade-name-tag-display-v1",
      unique: true,
      footprint: { width: 0.24, height: 0.2 },
      validSurfaces: ["shelf", "counter"],
      tags: ["entryway", "enamel", "shiny", "name-tags"],
      unlock: { eventType: "game.completed", gameId: "pet-parade-sort", levelId: "pps-c3-08", label: "Complete Charm Workshop", classification: "normal" },
      provenanceCopy: "Name-tag display, assembled after the Charm Workshop closed with all linked pairs still linked.",
      accessibleLabel: "A framed display of six enamel owner symbols with distinct shapes and high-contrast borders.",
      reducedMotionState: "The enamel highlights remain static and every owner symbol stays visible."
    },
    {
      id: "parade-visitor-leash",
      familyId: "pet-parade-visitors",
      displayName: "Visitor leash",
      assetId: "parade-visitor-leash-v1",
      unique: true,
      footprint: { width: 0.23, height: 0.11 },
      validSurfaces: ["shelf", "counter", "floor"],
      tags: ["entryway", "visitor", "woven", "arrival-route"],
      unlock: { eventType: "game.completed", gameId: "pet-parade-sort", levelId: "pps-c2-08", label: "Complete Grooming Room", classification: "normal" },
      provenanceCopy: "Visitor leash, returned from the Grooming Room with a note reading already ready.",
      accessibleLabel: "A coiled teal visitor leash with a brass clip and a diamond owner marker.",
      reducedMotionState: "The leash remains coiled beside the visitor route."
    },
    {
      id: "parade-park-photo",
      familyId: "pet-parade-story",
      displayName: "Park photo",
      assetId: "parade-park-photo-v1",
      unique: true,
      footprint: { width: 0.27, height: 0.22 },
      validSurfaces: ["shelf", "counter"],
      tags: ["story", "photo", "rescue-visitors", "entryway"],
      unlock: { eventType: "story.completed", gameId: "pet-parade-sort", beatId: "park-photo-arrives", label: "Complete the Park Gate finale", classification: "story" },
      provenanceCopy: "Park photo, taken after every collar was claimed. Cat cooperation remains unconfirmed.",
      accessibleLabel: "A framed park photo with a ready dog, a note-taking rabbit, and a cat slightly outside formation.",
      reducedMotionState: "The park lineup is shown as a still framed photograph."
    },
    {
      id: "parade-golden-buckle-board",
      familyId: "pet-parade-mastery",
      displayName: "Golden buckle board",
      assetId: "parade-golden-buckle-board-v1",
      unique: true,
      footprint: { width: 0.24, height: 0.2 },
      validSurfaces: ["shelf", "counter"],
      tags: ["mastery", "buckle", "brass", "entryway"],
      unlock: { eventType: "expert.completed", gameId: "pet-parade-sort", levelId: "pps-expert-10", label: "Complete The Collar Club", classification: "expert" },
      provenanceCopy: "Golden buckle board, awarded for resolving The Collar Club after-hours committee.",
      accessibleLabel: "A dark wood mastery board holding one large brushed-gold buckle and six owner symbols.",
      reducedMotionState: "The buckle highlight remains static and high contrast."
    },
    {
      id: "parade-misplaced-bell",
      familyId: "pet-parade-discoveries",
      displayName: "Misplaced bell",
      assetId: "parade-misplaced-bell-v1",
      unique: true,
      footprint: { width: 0.13, height: 0.14 },
      validSurfaces: ["shelf", "counter", "floor"],
      tags: ["discovery", "bell", "rolling", "makes-noise"],
      unlock: { eventType: "discovery.triggered", gameId: "pet-parade-sort", discoveryId: "misplaced-bell", label: "Complete without undo or hint", classification: "discovery" },
      provenanceCopy: "Misplaced bell, found after a clean collar sort. The Shelf cat has declined chain-of-custody questions.",
      accessibleLabel: "A small oversized brass bell with a coral loop, filed as a harmless Shelf discovery.",
      reducedMotionState: "The bell stays still and its soft jingle is represented in text."
    }
  ],
  environmentLayers: [
    { id: "pet-parade-entryway-layer", kind: "architecture", label: "Entryway bench, collar rail, and rescue arrival route" },
    { id: "pet-parade-park-light", kind: "lighting", label: "Leaf-filtered park-photo light at the entryway" }
  ],
  behaviors: [
    {
      id: "visitor-waits-by-bench",
      displayName: "A rescue visitor waits beside the bench",
      actorId: "parade-rescue-visitor",
      priority: 70,
      seedRule: "worldSeed plus entryway placement ids",
      requiredCollectibleIds: ["parade-entryway-bench", "parade-visitor-leash"],
      requiredObjectTags: ["arrival-route", "visitor"],
      requiredSurfaces: ["floor"],
      exclusions: { quietMode: true, reducedMotion: true },
      action: { type: "redirect-toward-object", targetObjectId: "parade-visitor-leash", anchorObjectId: "parade-entryway-bench", offsetX: -0.24, offsetY: 0.08 },
      discovery: { title: "Visitor checked in", copy: "The visitor leash moved beside the bench. Dogs are already ready.", accessibilityNarration: "The visitor leash is placed beside the entryway bench for the arriving rescue pet." }
    },
    {
      id: "shelf-cat-files-bell",
      displayName: "The Shelf cat files the misplaced bell on the floor",
      actorId: "parade-rescue-visitor",
      priority: 95,
      seedRule: "worldSeed plus misplaced bell placement",
      requiredCollectibleIds: ["parade-misplaced-bell"],
      requiredObjectTags: ["bell", "rolling"],
      requiredSurfaces: ["shelf", "counter"],
      exclusions: { quietMode: true, reducedMotion: true },
      action: { type: "move-to-floor", targetObjectId: "parade-misplaced-bell", destination: { x: 0.72, y: 0.28, rotateBy: 90 } },
      discovery: { title: "Bell custody revised", copy: "The misplaced bell is now on the floor. This was apparently the authorized arrangement.", accessibilityNarration: "The Shelf cat moves the brass bell from its surface to the floor." }
    },
    {
      id: "photo-joins-name-tags",
      displayName: "The park photo moves beside the name-tag display",
      actorId: "parade-rescue-visitor",
      priority: 85,
      seedRule: "worldSeed plus photo and display placements",
      requiredCollectibleIds: ["parade-park-photo", "parade-name-tag-display"],
      requiredObjectTags: ["photo", "name-tags"],
      requiredSurfaces: ["shelf", "counter"],
      exclusions: { quietMode: true, reducedMotion: true },
      action: { type: "redirect-toward-object", targetObjectId: "parade-park-photo", anchorObjectId: "parade-name-tag-display", offsetX: 0.28, offsetY: 0.02 },
      discovery: { title: "Names matched to faces", copy: "The park photo now sits beside the name tags. The rabbit considers the filing acceptable.", accessibilityNarration: "The framed park photo is placed beside the name-tag display." }
    },
    {
      id: "collar-rack-meets-bench",
      displayName: "The collar rack shifts toward the entryway bench",
      actorId: "parade-rescue-visitor",
      priority: 65,
      seedRule: "worldSeed plus collar rack and bench placements",
      requiredCollectibleIds: ["parade-collar-rack", "parade-entryway-bench"],
      requiredObjectTags: ["collar", "entryway"],
      requiredSurfaces: ["floor", "counter", "shelf"],
      exclusions: { quietMode: true, reducedMotion: true },
      action: { type: "redirect-toward-object", targetObjectId: "parade-collar-rack", anchorObjectId: "parade-entryway-bench", offsetX: 0.27, offsetY: -0.02 },
      discovery: { title: "Collars near arrivals", copy: "The collar rack moved closer to the bench. Treat-based diplomacy may now proceed.", accessibilityNarration: "The collar rack is arranged near the entryway bench." }
    },
    {
      id: "mastery-photo-review",
      displayName: "The mastery board is arranged beside the park photo",
      actorId: "parade-rescue-visitor",
      priority: 100,
      seedRule: "worldSeed plus mastery and story placements",
      requiredCollectibleIds: ["parade-golden-buckle-board", "parade-park-photo"],
      requiredObjectTags: ["mastery", "photo"],
      requiredSurfaces: ["shelf", "counter"],
      exclusions: { quietMode: true, reducedMotion: true },
      action: { type: "redirect-toward-object", targetObjectId: "parade-park-photo", anchorObjectId: "parade-golden-buckle-board", offsetX: -0.28, offsetY: 0.02 },
      discovery: { title: "Collar Club review", copy: "The mastery buckle and park photo are together. Cooperation remains unconfirmed.", accessibilityNarration: "The park photo is displayed beside the Golden buckle board." }
    }
  ],
  storyBeats: [
    { id: "park-photo-arrives", title: "Park photo in progress", copy: "The entryway opens, the collars are claimed, and the rescue lineup reaches the park. Cats permit an arrangement." }
  ],
  dailyEvents: [
    { id: "daily-parade-report", title: "Daily Parade: Days Helped" }
  ],
  shareScenes: [
    { id: "pet-parade-park-lineup", label: "Rescue pets in the completed park-photo lineup" }
  ],
  accessibility: {
    label: "Pet Parade Sort entryway Shelf Pack",
    reducedMotionCopy: "Visitor arrivals and object shifts are replaced by concise text descriptions and still artwork.",
    contrastMode: "Owner families retain symbols, edge shapes, labels, and high-contrast outlines in addition to color."
  }
};

export const PetParadeSortShelfPack = ShelfPackSchema.parse(petParadeSortPackSource);
