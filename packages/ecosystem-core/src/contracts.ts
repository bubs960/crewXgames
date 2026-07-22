import { z } from "zod";

export const CONTENT_SCHEMA_VERSION = 1;
export const WORLD_SCHEMA_VERSION = 2;

const IdentifierSchema = z
  .string()
  .min(1, "An id is required.")
  .max(120, "Ids must be 120 characters or fewer.")
  .regex(/^[a-z0-9][a-z0-9._:-]*$/i, "Use letters, numbers, dots, colons, dashes, or underscores in ids.");

const IsoDateSchema = z.string().datetime({ offset: true });
const TagSchema = z.string().min(1).max(80);

export const SurfaceIdSchema = z.enum(["shelf", "counter", "floor"]);
export type SurfaceId = z.infer<typeof SurfaceIdSchema>;

export const PlacementFootprintSchema = z.object({
  width: z.number().positive().max(0.8),
  height: z.number().positive().max(0.8)
});
export type PlacementFootprint = z.infer<typeof PlacementFootprintSchema>;

const UnlockRuleBaseSchema = z.object({
  eventType: z.enum(["game.completed", "expert.completed", "daily.completed", "discovery.triggered", "story.completed"]),
  gameId: IdentifierSchema,
  levelId: IdentifierSchema.optional(),
  discoveryId: IdentifierSchema.optional(),
  beatId: IdentifierSchema.optional(),
  label: z.string().min(1),
  classification: z.enum(["normal", "daily", "expert", "discovery", "story", "starter"])
});

export const UnlockRuleSchema = UnlockRuleBaseSchema.superRefine((rule, context) => {
  if (rule.eventType === "discovery.triggered" && !rule.discoveryId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["discoveryId"], message: "Discovery unlocks need a discovery id." });
  }
  if (rule.eventType !== "discovery.triggered" && rule.discoveryId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["discoveryId"], message: "Only discovery unlocks may declare a discovery id." });
  }
  if (rule.eventType === "story.completed" && !rule.beatId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["beatId"], message: "Story unlocks need a story beat id." });
  }
  if (rule.eventType !== "story.completed" && rule.beatId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["beatId"], message: "Only story unlocks may declare a story beat id." });
  }
  if (rule.levelId && rule.eventType !== "game.completed" && rule.eventType !== "expert.completed") {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["levelId"], message: "Only level completion unlocks may declare a level id." });
  }
});
export type UnlockRule = z.infer<typeof UnlockRuleSchema>;

export const CollectibleDefinitionSchema = z.object({
  id: IdentifierSchema,
  familyId: IdentifierSchema,
  displayName: z.string().min(1),
  assetId: IdentifierSchema,
  unique: z.boolean(),
  footprint: PlacementFootprintSchema,
  validSurfaces: z.array(SurfaceIdSchema).min(1),
  tags: z.array(TagSchema).min(1),
  unlock: UnlockRuleSchema,
  provenanceCopy: z.string().min(1),
  accessibleLabel: z.string().min(1),
  reducedMotionState: z.string().min(1).optional()
});
export type CollectibleDefinition = z.infer<typeof CollectibleDefinitionSchema>;

export const ResidentDefinitionSchema = z.object({
  id: IdentifierSchema,
  displayName: z.string().min(1),
  traits: z.array(TagSchema).min(1),
  accessibleLabel: z.string().min(1)
});
export type ResidentDefinition = z.infer<typeof ResidentDefinitionSchema>;

export const BehaviorRecipeSchema = z.object({
  id: IdentifierSchema,
  displayName: z.string().min(1),
  actorId: IdentifierSchema,
  priority: z.number().int().min(0).max(1000),
  seedRule: z.string().min(1),
  requiredCollectibleIds: z.array(IdentifierSchema).min(1),
  requiredObjectTags: z.array(TagSchema).min(1),
  requiredSurfaces: z.array(SurfaceIdSchema).min(1),
  exclusions: z.object({
    quietMode: z.boolean().optional(),
    reducedMotion: z.boolean().optional()
  }),
  action: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("move-to-floor"),
      targetObjectId: IdentifierSchema,
      destination: z.object({
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        rotateBy: z.number().int().min(-360).max(360)
      })
    }),
    z.object({
      type: z.literal("redirect-toward-object"),
      targetObjectId: IdentifierSchema,
      anchorObjectId: IdentifierSchema,
      offsetX: z.number().min(-0.8).max(0.8),
      offsetY: z.number().min(-0.8).max(0.8)
    })
  ]),
  discovery: z.object({
    title: z.string().min(1),
    copy: z.string().min(1),
    accessibilityNarration: z.string().min(1)
  })
});
export type BehaviorRecipe = z.infer<typeof BehaviorRecipeSchema>;

const EntranceDefinitionSchema = z.object({
  id: IdentifierSchema,
  label: z.string().min(1),
  surface: SurfaceIdSchema
});

const EnvironmentLayerSchema = z.object({
  id: IdentifierSchema,
  kind: z.enum(["architecture", "surface", "lighting", "ambience"]),
  label: z.string().min(1)
});

const StoryBeatSchema = z.object({
  id: IdentifierSchema,
  title: z.string().min(1),
  copy: z.string().min(1)
});

const DailyEventSchema = z.object({
  id: IdentifierSchema,
  title: z.string().min(1)
});

const ShareSceneSchema = z.object({
  id: IdentifierSchema,
  label: z.string().min(1)
});

const ShelfPackBaseSchema = z.object({
  schemaVersion: z.number().int(),
  packId: IdentifierSchema,
  gameId: IdentifierSchema,
  title: z.string().min(1),
  entrance: EntranceDefinitionSchema,
  residents: z.array(ResidentDefinitionSchema).min(1),
  collectibles: z.array(CollectibleDefinitionSchema).min(1),
  environmentLayers: z.array(EnvironmentLayerSchema).min(1),
  behaviors: z.array(BehaviorRecipeSchema).min(1),
  storyBeats: z.array(StoryBeatSchema).min(1),
  dailyEvents: z.array(DailyEventSchema).min(1),
  shareScenes: z.array(ShareSceneSchema).min(1),
  accessibility: z.object({
    label: z.string().min(1),
    reducedMotionCopy: z.string().min(1),
    contrastMode: z.string().min(1)
  })
});

export const ShelfPackSchema = ShelfPackBaseSchema.superRefine((pack, context) => {
  if (pack.schemaVersion !== CONTENT_SCHEMA_VERSION) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["schemaVersion"],
      message:
        "Unsupported Shelf Pack schema version " +
        pack.schemaVersion +
        ". This build supports version " +
        CONTENT_SCHEMA_VERSION +
        "."
    });
  }

  const collectibleIds = new Set<string>();
  for (const [index, collectible] of pack.collectibles.entries()) {
    if (collectibleIds.has(collectible.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["collectibles", index, "id"],
        message: 'Duplicate collectible id "' + collectible.id + '".'
      });
    }
    collectibleIds.add(collectible.id);
  }

  const residentIds = new Set(pack.residents.map((resident) => resident.id));
  for (const [index, behavior] of pack.behaviors.entries()) {
    if (!residentIds.has(behavior.actorId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["behaviors", index, "actorId"],
        message: 'Behavior "' + behavior.id + '" references missing resident "' + behavior.actorId + '".'
      });
    }

    for (const objectId of behavior.requiredCollectibleIds) {
      if (!collectibleIds.has(objectId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["behaviors", index, "requiredCollectibleIds"],
          message: 'Behavior "' + behavior.id + '" references missing collectible "' + objectId + '".'
        });
      }
    }

    const actionObjectIds =
      behavior.action.type === "redirect-toward-object"
        ? [behavior.action.targetObjectId, behavior.action.anchorObjectId]
        : [behavior.action.targetObjectId];
    for (const objectId of actionObjectIds) {
      if (!collectibleIds.has(objectId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["behaviors", index, "action"],
          message: 'Behavior "' + behavior.id + '" action references missing collectible "' + objectId + '".'
        });
      }
    }
  }
});
export type ShelfPack = z.infer<typeof ShelfPackSchema>;

export const ResultSummarySchema = z.object({
  score: z.number().finite().nonnegative(),
  moves: z.number().int().nonnegative(),
  completedAt: IsoDateSchema
});
export type ResultSummary = z.infer<typeof ResultSummarySchema>;

export const EcosystemEventSchema = z.discriminatedUnion("type", [
  z.object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    eventId: IdentifierSchema,
    type: z.literal("game.completed"),
    gameId: IdentifierSchema,
    levelId: IdentifierSchema,
    occurredAt: IsoDateSchema,
    result: ResultSummarySchema
  }),
  z.object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    eventId: IdentifierSchema,
    type: z.literal("expert.completed"),
    gameId: IdentifierSchema,
    levelId: IdentifierSchema,
    occurredAt: IsoDateSchema,
    result: ResultSummarySchema
  }),
  z.object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    eventId: IdentifierSchema,
    type: z.literal("daily.completed"),
    gameId: IdentifierSchema,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    occurredAt: IsoDateSchema,
    result: ResultSummarySchema
  }),
  z.object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    eventId: IdentifierSchema,
    type: z.literal("discovery.triggered"),
    gameId: IdentifierSchema,
    discoveryId: IdentifierSchema,
    occurredAt: IsoDateSchema
  }),
  z.object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    eventId: IdentifierSchema,
    type: z.literal("story.completed"),
    gameId: IdentifierSchema,
    beatId: IdentifierSchema,
    occurredAt: IsoDateSchema
  })
]);
export type EcosystemEvent = z.infer<typeof EcosystemEventSchema>;

export const InventoryEntrySchema = z.object({
  objectId: IdentifierSchema,
  count: z.number().int().positive()
});
export type InventoryEntry = z.infer<typeof InventoryEntrySchema>;

export const PlacementStateSchema = z.object({
  placementId: IdentifierSchema,
  objectId: IdentifierSchema,
  surfaceId: SurfaceIdSchema,
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  rotation: z.number().min(0).max(359)
});
export type PlacementState = z.infer<typeof PlacementStateSchema>;

export const UnlockReceiptSchema = z.object({
  receiptId: IdentifierSchema,
  eventId: IdentifierSchema,
  objectId: IdentifierSchema,
  packId: IdentifierSchema,
  receivedAt: IsoDateSchema,
  classification: z.enum(["normal", "daily", "expert", "discovery", "story", "starter"]),
  provenance: z.string().min(1)
});
export type UnlockReceipt = z.infer<typeof UnlockReceiptSchema>;

export const DiscoveryRecordSchema = z.object({
  discoveryId: IdentifierSchema,
  behaviorId: IdentifierSchema,
  discoveredAt: IsoDateSchema,
  title: z.string().min(1),
  copy: z.string().min(1),
  accessibilityNarration: z.string().min(1)
});
export type DiscoveryRecord = z.infer<typeof DiscoveryRecordSchema>;

export const AppliedEventRecordSchema = z.object({
  eventId: IdentifierSchema,
  type: z.string().min(1),
  appliedAt: IsoDateSchema,
  rewardedObjectIds: z.array(IdentifierSchema)
});
export type AppliedEventRecord = z.infer<typeof AppliedEventRecordSchema>;

export const WorldSettingsSchema = z.object({
  quietMode: z.boolean(),
  reducedMotion: z.boolean()
});
export type WorldSettings = z.infer<typeof WorldSettingsSchema>;

export const LivingShelfStateSchema = z
  .object({
    schemaVersion: z.literal(WORLD_SCHEMA_VERSION),
    worldId: IdentifierSchema,
    worldSeed: z.number().int().nonnegative(),
    createdAt: IsoDateSchema,
    updatedAt: IsoDateSchema,
    unlockedPacks: z.array(IdentifierSchema),
    inventory: z.array(InventoryEntrySchema),
    placements: z.array(PlacementStateSchema),
    receipts: z.array(UnlockReceiptSchema),
    discoveries: z.array(DiscoveryRecordSchema),
    eventLog: z.array(AppliedEventRecordSchema),
    appliedEventIds: z.array(IdentifierSchema),
    settings: WorldSettingsSchema
  })
  .superRefine((state, context) => {
    const seenPlacements = new Set<string>();
    for (const [index, placement] of state.placements.entries()) {
      if (seenPlacements.has(placement.placementId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["placements", index, "placementId"],
          message: 'Duplicate placement id "' + placement.placementId + '".'
        });
      }
      seenPlacements.add(placement.placementId);
    }

    const seenEvents = new Set<string>();
    for (const [index, eventId] of state.appliedEventIds.entries()) {
      if (seenEvents.has(eventId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["appliedEventIds", index],
          message: 'Duplicate applied event id "' + eventId + '".'
        });
      }
      seenEvents.add(eventId);
    }
  });
export type LivingShelfState = z.infer<typeof LivingShelfStateSchema>;

export const formatZodIssues = (issues: z.ZodIssue[]) =>
  issues.map((issue) => (issue.path.length ? issue.path.join(".") : "root") + ": " + issue.message).join(" ");
