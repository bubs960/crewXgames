import { lazy, Suspense, useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { EcosystemEvent } from "@teammultiply/ecosystem-core";
import {
  acknowledgeCounterCatLiveRelay,
  COUNTER_CAT_LIVE_RELAY_STORAGE_KEY,
  importCounterCatLegacyProgress,
  readCounterCatLiveRelay,
  snapshotCounterCatLegacyStorage,
  summarizeCounterCatLegacyImport,
  type CounterCatLiveRelayReport,
  type CounterCatLegacyImportReport
} from "@teammultiply/counter-cat-bridge";
import {
  availableInventoryCount,
  copyWorld,
  isPlacementValid,
  normalizeRotation,
  runPrimaryBehavior,
  withUpdatedPlacement,
  type LivingShelfState,
  type PlacementState
} from "@teammultiply/ecosystem-core";
import { receiveGameEvent } from "@teammultiply/game-bridge";
import { ShelfStorage, serializeWorld } from "@teammultiply/save-data";
import {
  CounterCatShelfPack,
  CozyCrochetCrittersShelfPack,
  PetParadeSortShelfPack,
  createCounterCatFixtureWorld
} from "@teammultiply/shelf-pack";
import {
  commitCounterCatEventBatch,
  commitCounterCatLegacyImport
} from "./counterCatLegacyImport";

const ShelfScene = lazy(async () => {
  const module = await import("./ShelfScene");
  return { default: module.ShelfScene };
});

const CozyCrochetGame = lazy(async () => {
  const module = await import("./CozyCrochetGame");
  return { default: module.CozyCrochetGame };
});

const PetParadeGame = lazy(async () => {
  const module = await import("./PetParadeGame");
  return { default: module.PetParadeGame };
});

type ShelfMode = "arrange" | "live";
type AppView = "shelf" | "crochet" | "pet-parade";
type CounterCatImportOutcome =
  | {
      kind: "imported";
      acceptedEventCount: number;
      rewardCount: number;
    }
  | {
      kind: "already-recorded";
    };

type CounterCatRelayOutcome =
  | {
      kind: "imported";
      acceptedEventCount: number;
      rewardCount: number;
    }
  | {
      kind: "already-recorded";
      eventCount: number;
    };

const SHELF_PACKS = [CounterCatShelfPack, CozyCrochetCrittersShelfPack, PetParadeSortShelfPack];
const SHELF_COLLECTIBLES = SHELF_PACKS.flatMap((pack) => pack.collectibles);
const viewFromLocation = (): AppView => {
  if (typeof window === "undefined") return "shelf";
  if (window.location.hash === "#cozy-crochet") return "crochet";
  if (window.location.hash === "#pet-parade-sort") return "pet-parade";
  return "shelf";
};

const now = () => new Date().toISOString();

const describeCounterCatReview = (report: CounterCatLegacyImportReport) => {
  const summary = summarizeCounterCatLegacyImport(report);
  if (report.events.length && report.fallbacks.length) {
    return {
      title: "Some Counter Cat progress is ready to import",
      message:
        report.events.length +
        " verified completion" +
        (report.events.length === 1 ? " is" : "s are") +
        " ready to import. " +
        report.fallbacks.length +
        " unclear saved record" +
        (report.fallbacks.length === 1 ? " stays" : "s stay") +
        " untouched."
    };
  }
  if (report.events.length) {
    return {
      title: "Verified Counter Cat progress found",
      message:
        report.events.length +
        " exact completion" +
        (report.events.length === 1 ? " is" : "s are") +
        " ready to import with original case identity."
    };
  }
  return summary;
};

const describeCounterCatRelay = (report: CounterCatLiveRelayReport) => {
  if (report.events.length && report.fallbacks.length) {
    return {
      title: "Counter Cat cases are ready for review",
      message:
        report.events.length +
        " exact completed case" +
        (report.events.length === 1 ? " is" : "s are") +
        " ready to add to this Shelf. " +
        report.fallbacks.length +
        " unclear handoff record" +
        (report.fallbacks.length === 1 ? " stays" : "s stay") +
        " untouched."
    };
  }
  if (report.events.length) {
    return {
      title: "A Counter Cat case is ready",
      message:
        report.events.length +
        " exact completed case" +
        (report.events.length === 1 ? " is" : "s are") +
        " ready to add to this Shelf with its original case identity."
    };
  }
  return {
    title: "Counter Cat handoff needs a check",
    message:
      "No exact Counter Cat completion could be confirmed from this handoff. No Shelf reward was added."
  };
};

const counterCatRelayEventLabel = (event: EcosystemEvent) => {
  if (event.type === "daily.completed") return "Cat Duty " + event.date;
  if (event.type === "expert.completed") {
    return "Expert Case " + event.levelId.replace("expert-case-", "").padStart(2, "0");
  }
  if (event.type === "game.completed") {
    return "Counter Cat Case " + event.levelId.replace("case-", "").padStart(2, "0");
  }
  return "Counter Cat case";
};

const counterCatRelayEventMoves = (event: EcosystemEvent) =>
  "result" in event ? event.result.moves : 0;

const newPlacementId = () =>
  "placement:" +
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now()) + "-" + String(Math.random()).slice(2));

const objectMark = (objectId: string) => {
  if (objectId === "blue-mug") return "◒";
  if (objectId === "yarn-ball" || objectId.includes("yarn")) return "◌";
  if (objectId.includes("hook")) return "⌇";
  if (objectId.includes("pin")) return "✦";
  if (objectId.includes("fox")) return "◇";
  if (objectId.includes("mat") || objectId.includes("sampler")) return "▧";
  if (objectId.includes("bell")) return "◍";
  if (objectId.includes("collar") || objectId.includes("leash")) return "⌁";
  if (objectId.includes("bench")) return "▰";
  if (objectId.includes("photo") || objectId.includes("display") || objectId.includes("board")) return "▣";
  return "▣";
};

export const LivingShelfApp = () => {
  const storage = useMemo(() => new ShelfStorage(), []);
  const [world, setWorld] = useState<LivingShelfState | null>(null);
  const [view, setView] = useState<AppView>(viewFromLocation);
  const [mode, setMode] = useState<ShelfMode>("arrange");
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [activePlacementId, setActivePlacementId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PlacementState | null>(null);
  const [undoStack, setUndoStack] = useState<LivingShelfState[]>([]);
  const [redoStack, setRedoStack] = useState<LivingShelfState[]>([]);
  const [notice, setNotice] = useState("Opening the local Shelf record…");
  const [saveStatus, setSaveStatus] = useState("Local-first storage");
  const [behaviorToken, setBehaviorToken] = useState(0);
  const [counterCatImportReport, setCounterCatImportReport] =
    useState<CounterCatLegacyImportReport | null>(null);
  const [counterCatImportOutcome, setCounterCatImportOutcome] =
    useState<CounterCatImportOutcome | null>(null);
  const [counterCatImporting, setCounterCatImporting] = useState(false);
  const [counterCatRelayReport, setCounterCatRelayReport] =
    useState<CounterCatLiveRelayReport | null>(null);
  const [counterCatRelayOutcome, setCounterCatRelayOutcome] =
    useState<CounterCatRelayOutcome | null>(null);
  const [counterCatRelayImporting, setCounterCatRelayImporting] = useState(false);

  useEffect(() => {
    const syncView = () => setView(viewFromLocation());
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  useEffect(() => {
    const isCrochet = view === "crochet";
    const isPetParade = view === "pet-parade";
    const title = isCrochet ? "Cozy Crochet Critters | CrewMultiply Play" : isPetParade ? "Pet Parade Sort: The Collar Club | CrewMultiply Play" : "Living Shelf | CrewMultiply Play";
    const description = isCrochet
      ? "Route yarn through visible stitches, keep tension readable, and wake a handmade resident."
      : isPetParade
        ? "Sort tactile pet ID tags, assemble rescue collars, and bring every pet to the park photo."
        : "Arrange locally saved collectibles and explore CrewMultiply Play's Living Shelf prototype.";
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", "https://play.crewmultiply.com/shelf/");
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", "https://play.crewmultiply.com/shelf/");
  }, [view]);

  const openCrochet = () => {
    window.location.hash = "cozy-crochet";
    setView("crochet");
  };

  const openPetParade = () => {
    window.location.hash = "pet-parade-sort";
    setView("pet-parade");
  };

  const openShelf = () => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setView("shelf");
  };

  useEffect(() => {
    let active = true;
    storage
      .loadOrCreate(() => createCounterCatFixtureWorld())
      .then((state) => {
        if (!active) return;
        setWorld(state);
        setNotice("Living Shelf is ready. Review this browser's Counter Cat record to bring forward exact completed cases.");
        setSaveStatus("Saved locally");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setNotice("The local Shelf record could not open: " + (error instanceof Error ? error.message : "Unknown error"));
        setSaveStatus("Save unavailable");
      });
    return () => {
      active = false;
    };
  }, [storage]);

  const persist = async (next: LivingShelfState): Promise<boolean> => {
    setSaveStatus("Saving locally…");
    try {
      await storage.save(next);
      setSaveStatus("Saved locally");
      return true;
    } catch (error) {
      setSaveStatus("Save failed");
      setNotice("The last stable Shelf state is still in memory: " + (error instanceof Error ? error.message : "Unknown error"));
      return false;
    }
  };

  const reviewCounterCatRelay = (resetOutcome = true) => {
    try {
      const report = readCounterCatLiveRelay(window.localStorage);
      setCounterCatRelayReport(report.events.length || report.fallbacks.length ? report : null);
      if (resetOutcome) setCounterCatRelayOutcome(null);
      return report;
    } catch (error) {
      setCounterCatRelayReport(null);
      if (resetOutcome) setCounterCatRelayOutcome(null);
      setNotice(
        "Counter Cat's live handoff could not be read in this browser: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      return null;
    }
  };

  useEffect(() => {
    if (!world) return;
    const syncRelay = () => {
      try {
        const report = readCounterCatLiveRelay(window.localStorage);
        setCounterCatRelayReport(report.events.length || report.fallbacks.length ? report : null);
      } catch {
        setCounterCatRelayReport(null);
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage && event.key === COUNTER_CAT_LIVE_RELAY_STORAGE_KEY) {
        syncRelay();
        setCounterCatRelayOutcome(null);
      }
    };
    syncRelay();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [world]);

  const commitStable = (next: LivingShelfState) => {
    if (!world) return;
    setUndoStack((history) => [...history.slice(-24), copyWorld(world)]);
    setRedoStack([]);
    setWorld(next);
    setPreview(null);
    void persist(next);
  };

  const commitPlacement = (candidate: PlacementState) => {
    if (!world) return;
    const normalized = {
      ...candidate,
      rotation: normalizeRotation(candidate.rotation)
    };
    const validation = isPlacementValid(world, SHELF_PACKS, normalized);
    if (!validation.valid) {
      setPreview(null);
      setNotice(validation.reason ?? "That placement is not valid.");
      return;
    }
    const next = withUpdatedPlacement(world, normalized, now());
    setActivePlacementId(normalized.placementId);
    setSelectedObjectId(normalized.objectId);
    setNotice("Placed " + (SHELF_COLLECTIBLES.find((item) => item.id === normalized.objectId)?.displayName ?? "object") + ".");
    commitStable(next);
  };

  const storeActiveObject = () => {
    if (!world || !activePlacementId) {
      setNotice("Select a placed object before storing it.");
      return;
    }
    const target = world.placements.find((placement) => placement.placementId === activePlacementId);
    if (!target) return;
    const next = copyWorld(world);
    next.placements = next.placements.filter((placement) => placement.placementId !== activePlacementId);
    next.updatedAt = now();
    setActivePlacementId(null);
    setSelectedObjectId(target.objectId);
    setNotice("Stored " + (SHELF_COLLECTIBLES.find((item) => item.id === target.objectId)?.displayName ?? "object") + " back in inventory.");
    commitStable(next);
  };

  const nudgeActiveObject = (xDelta: number, yDelta: number, rotationDelta = 0) => {
    if (!world || !activePlacementId || mode !== "arrange") return;
    const current = world.placements.find((placement) => placement.placementId === activePlacementId);
    if (!current) return;
    const candidate: PlacementState = {
      ...current,
      x: Math.max(0, Math.min(1, current.x + xDelta)),
      y: Math.max(0, Math.min(1, current.y + yDelta)),
      rotation: normalizeRotation(current.rotation + rotationDelta)
    };
    const validation = isPlacementValid(world, SHELF_PACKS, candidate);
    if (!validation.valid) {
      setNotice(validation.reason ?? "That move is not valid.");
      return;
    }
    setNotice(rotationDelta ? "Rotated selected object." : "Moved selected object.");
    commitStable(withUpdatedPlacement(world, candidate, now()));
  };

  const undo = () => {
    if (!world || undoStack.length === 0) {
      setNotice("Nothing to undo.");
      return;
    }
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((history) => history.slice(0, -1));
    setRedoStack((history) => [...history, copyWorld(world)]);
    setWorld(previous);
    setPreview(null);
    void persist(previous);
    setNotice("Last stable Shelf action undone.");
  };

  const redo = () => {
    if (!world || redoStack.length === 0) {
      setNotice("Nothing to redo.");
      return;
    }
    const next = redoStack[redoStack.length - 1];
    setRedoStack((history) => history.slice(0, -1));
    setUndoStack((history) => [...history, copyWorld(world)]);
    setWorld(next);
    setPreview(null);
    void persist(next);
    setNotice("Shelf action restored.");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input:not([type=checkbox]), textarea, select")) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudgeActiveObject(-0.03, 0);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        nudgeActiveObject(0.03, 0);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        nudgeActiveObject(0, -0.03);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        nudgeActiveObject(0, 0.03);
      } else if (event.key.toLowerCase() === "r") {
        nudgeActiveObject(0, 0, 90);
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        storeActiveObject();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const reviewCounterCatProgress = () => {
    try {
      const snapshot = snapshotCounterCatLegacyStorage(window.localStorage);
      const report = importCounterCatLegacyProgress(snapshot, now());
      setCounterCatImportReport(report);
      setCounterCatImportOutcome(null);
      setNotice(describeCounterCatReview(report).message);
    } catch (error) {
      setCounterCatImportReport(null);
      setCounterCatImportOutcome(null);
      setNotice(
        "Counter Cat progress could not be reviewed in this browser: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const importReviewedCounterCatProgress = async () => {
    if (!world || !counterCatImportReport) return;
    setCounterCatImporting(true);
    setSaveStatus("Saving locally…");
    try {
      const result = await commitCounterCatLegacyImport(
        storage,
        world,
        counterCatImportReport,
        SHELF_PACKS,
        now()
      );
      if (!result.ok) {
        setSaveStatus("Save failed");
        setNotice(result.error);
        return;
      }

      const { application } = result;
      if (application.acceptedEventIds.length === 0) {
        setSaveStatus("Saved locally");
        setCounterCatImportOutcome(
          application.duplicateEventIds.length ? { kind: "already-recorded" } : null
        );
        setNotice(
          application.duplicateEventIds.length
            ? "Those verified Counter Cat cases are already in this Shelf record. No reward was duplicated."
            : "No provable Counter Cat completion was available to import."
        );
        return;
      }

      setUndoStack((history) => [...history.slice(-24), copyWorld(world)]);
      setRedoStack([]);
      setWorld(application.state);
      setPreview(null);
      setSaveStatus("Saved locally");
      setCounterCatImportOutcome({
        kind: "imported",
        acceptedEventCount: application.acceptedEventIds.length,
        rewardCount: application.rewardedObjectIds.length
      });
      if (application.rewardedObjectIds.includes("blue-mug")) {
        setSelectedObjectId("blue-mug");
      }
      setNotice(
        application.acceptedEventIds.length +
          " verified Counter Cat completion" +
          (application.acceptedEventIds.length === 1 ? " was" : "s were") +
          " added to this Shelf record. " +
          application.rewardedObjectIds.length +
          " Shelf reward" +
          (application.rewardedObjectIds.length === 1 ? " was" : "s were") +
          " added with provenance." +
          (counterCatImportReport.fallbacks.length
            ? " " +
              counterCatImportReport.fallbacks.length +
              " unclear saved record" +
              (counterCatImportReport.fallbacks.length === 1 ? " remains" : "s remain") +
              " untouched."
            : "")
      );
    } finally {
      setCounterCatImporting(false);
    }
  };

  const importRelayedCounterCatProgress = async () => {
    if (!world || !counterCatRelayReport) return;
    setCounterCatRelayImporting(true);
    setSaveStatus("Saving locally…");
    try {
      const result = await commitCounterCatEventBatch(
        storage,
        world,
        counterCatRelayReport,
        SHELF_PACKS,
        now()
      );
      if (!result.ok) {
        setSaveStatus("Save failed");
        setNotice(result.error);
        return;
      }

      const { application } = result;
      const processedEventIds = [
        ...application.acceptedEventIds,
        ...application.duplicateEventIds
      ];
      let handoffAcknowledged = true;
      if (processedEventIds.length) {
        try {
          handoffAcknowledged = acknowledgeCounterCatLiveRelay(
            window.localStorage,
            processedEventIds
          );
        } catch {
          handoffAcknowledged = false;
        }
      }

      if (application.acceptedEventIds.length === 0) {
        setSaveStatus("Saved locally");
        setCounterCatRelayOutcome(
          application.duplicateEventIds.length
            ? {
                kind: "already-recorded",
                eventCount: application.duplicateEventIds.length
              }
            : null
        );
        setNotice(
          application.duplicateEventIds.length
            ? "That Counter Cat case already has a Shelf receipt. No reward was duplicated." +
              (handoffAcknowledged ? "" : " The handoff remains queued, but replay stays safe.")
            : "No provable Counter Cat completion was available to add."
        );
        reviewCounterCatRelay(false);
        return;
      }

      setUndoStack((history) => [...history.slice(-24), copyWorld(world)]);
      setRedoStack([]);
      setWorld(application.state);
      setPreview(null);
      setSaveStatus("Saved locally");
      setCounterCatRelayOutcome({
        kind: "imported",
        acceptedEventCount: application.acceptedEventIds.length,
        rewardCount: application.rewardedObjectIds.length
      });
      if (application.rewardedObjectIds.includes("blue-mug")) {
        setSelectedObjectId("blue-mug");
      }
      setNotice(
        application.acceptedEventIds.length +
          " Counter Cat completion" +
          (application.acceptedEventIds.length === 1 ? " was" : "s were") +
          " added to this Shelf record. " +
          application.rewardedObjectIds.length +
          " Shelf reward" +
          (application.rewardedObjectIds.length === 1 ? " was" : "s were") +
          " added with provenance." +
          (handoffAcknowledged ? "" : " The handoff remains queued, but replay stays safe.")
      );
      reviewCounterCatRelay(false);
    } finally {
      setCounterCatRelayImporting(false);
    }
  };

  const runShelfBehavior = () => {
    if (!world) return;
    const result = runPrimaryBehavior(world, SHELF_PACKS, now());
    if (result.suppressed === "quiet-mode") {
      setNotice("Quiet mode holds Shelf residents still. No autonomous behavior ran.");
      return;
    }
    if (result.suppressed === "reduced-motion") {
      setNotice("Reduced motion records no animated interaction. Turn it off to run a Shelf behavior.");
      return;
    }
    if (!result.run) {
      setNotice("Arrange the required props together on a valid surface to give a Shelf resident a visible reason to act.");
      return;
    }
    commitStable(result.state);
    setBehaviorToken((token) => token + 1);
    setNotice(
      result.run.title +
        ": " +
        result.run.copy +
        (result.run.discoveryAdded ? " Discovery recorded." : " Existing discovery replayed.")
    );
  };

  const setQuietMode = (quietMode: boolean) => {
    if (!world) return;
    const next = {
      ...copyWorld(world),
      updatedAt: now(),
      settings: {
        ...world.settings,
        quietMode
      }
    };
    commitStable(next);
      setNotice(quietMode ? "Quiet mode on. Shelf residents will not rearrange the Shelf." : "Quiet mode off. Live behavior can run again.");
  };

  const setReducedMotion = (reducedMotion: boolean) => {
    if (!world) return;
    const next = {
      ...copyWorld(world),
      updatedAt: now(),
      settings: {
        ...world.settings,
        reducedMotion
      }
    };
    commitStable(next);
    setNotice(reducedMotion ? "Reduced motion on. The Shelf remains still and behavior is described instead." : "Reduced motion off.");
  };

  const receiveGameEvents = async (events: EcosystemEvent[]): Promise<boolean> => {
    if (!world) return false;
    let next = world;
    let accepted = 0;
    let receipts = 0;
    for (const event of events) {
      const result = receiveGameEvent(next, event, SHELF_PACKS, now());
      if (!result.ok) {
        setNotice(result.error);
        return false;
      }
      accepted += result.application.duplicate ? 0 : 1;
      receipts += result.application.rewardedObjectIds.length;
      next = result.application.state;
    }
    if (accepted) {
      const saved = await persist(next);
      if (!saved) return false;
      setUndoStack((history) => [...history.slice(-24), copyWorld(world)]);
      setRedoStack([]);
      setWorld(next);
      setPreview(null);
      setNotice("The game sent " + accepted + " validated event" + (accepted === 1 ? "" : "s") + ". " + receipts + " Shelf reward" + (receipts === 1 ? " was" : "s were") + " added with provenance; duplicate events remain harmless.");
    } else {
      setNotice("Those event receipts were already recorded, so no unique Shelf reward was duplicated.");
    }
    return true;
  };

  const placeSelectedObject = () => {
    if (!world || !selectedObjectId || activePlacementId || mode !== "arrange") {
      setNotice("Select an available inventory object before placing it.");
      return;
    }
    const definition = SHELF_COLLECTIBLES.find((item) => item.id === selectedObjectId);
    if (!definition || availableInventoryCount(world, definition.id) < 1) {
      setNotice("That object is not available in inventory.");
      return;
    }
    const surfaces = ["counter", "shelf", "floor"].filter((surface) => definition.validSurfaces.includes(surface as PlacementState["surfaceId"])) as PlacementState["surfaceId"][];
    const anchors = [
      [0.5, 0.5],
      [0.25, 0.5],
      [0.75, 0.5],
      [0.5, 0.25],
      [0.5, 0.75]
    ] as const;
    for (const surfaceId of surfaces) {
      for (const [x, y] of anchors) {
        const candidate: PlacementState = {
          placementId: newPlacementId(),
          objectId: definition.id,
          surfaceId,
          x,
          y,
          rotation: 0
        };
        if (isPlacementValid(world, SHELF_PACKS, candidate).valid) {
          commitPlacement(candidate);
          return;
        }
      }
    }
    setNotice("No clear valid position is available for that object. Store or move another object, then try again.");
  };

  const exportSave = () => {
    if (!world) return;
    const file = new Blob([serializeWorld(world)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "living-shelf-save.json";
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice("Exported the current local Shelf save.");
  };

  const importSave = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const imported = await storage.importJson(await file.text());
      setWorld(imported);
      setUndoStack([]);
      setRedoStack([]);
      setPreview(null);
      setNotice("Imported and validated a local Shelf save.");
      setSaveStatus("Saved locally");
    } catch (error) {
      setNotice("Import rejected: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  if (!world) {
    return (
      <main className="loading-shell">
        <p>Preparing the Living Shelf…</p>
      </main>
    );
  }

  if (view === "crochet") {
    return (
      <Suspense
        fallback={
          <main className="loading-shell" role="status">
            <p>Winding the yarn…</p>
          </main>
        }
      >
        <CozyCrochetGame onBackToShelf={openShelf} onGameEvents={receiveGameEvents} />
      </Suspense>
    );
  }

  if (view === "pet-parade") {
    return (
      <Suspense
        fallback={
          <main className="loading-shell" role="status">
            <p>Opening the collar organizer…</p>
          </main>
        }
      >
        <PetParadeGame onBackToShelf={openShelf} onGameEvents={receiveGameEvents} />
      </Suspense>
    );
  }

  const selectedObject = SHELF_COLLECTIBLES.find((item) => item.id === selectedObjectId);
  const activePlacement = world.placements.find((placement) => placement.placementId === activePlacementId);
  const cozyPackUnlocked = world.unlockedPacks.includes(CozyCrochetCrittersShelfPack.packId);
  const counterCatImportSummary = counterCatImportReport
    ? describeCounterCatReview(counterCatImportReport)
    : null;
  const counterCatPanelTitle = counterCatImportOutcome?.kind === "imported"
    ? "Counter Cat progress imported"
    : counterCatImportOutcome?.kind === "already-recorded"
      ? "Counter Cat progress is already on this Shelf"
      : counterCatImportSummary?.title;
  const counterCatPanelMessage = counterCatImportOutcome?.kind === "imported"
    ? counterCatImportOutcome.acceptedEventCount +
      " verified completion" +
      (counterCatImportOutcome.acceptedEventCount === 1 ? " was" : "s were") +
      " added to this Shelf record. " +
      counterCatImportOutcome.rewardCount +
      " Shelf reward" +
      (counterCatImportOutcome.rewardCount === 1 ? " was" : "s were") +
      " added with provenance."
    : counterCatImportOutcome?.kind === "already-recorded"
      ? "Those verified cases already have event receipts in this Shelf record. Nothing was duplicated."
      : counterCatImportSummary?.message;
  const counterCatRelaySummary = counterCatRelayReport
    ? describeCounterCatRelay(counterCatRelayReport)
    : null;
  const counterCatRelayPanelTitle = counterCatRelayOutcome?.kind === "imported"
    ? "Counter Cat case added to Shelf"
    : counterCatRelayOutcome?.kind === "already-recorded"
      ? "Counter Cat case already recorded"
      : counterCatRelaySummary?.title;
  const counterCatRelayPanelMessage = counterCatRelayOutcome?.kind === "imported"
    ? counterCatRelayOutcome.acceptedEventCount +
      " Counter Cat completion" +
      (counterCatRelayOutcome.acceptedEventCount === 1 ? " was" : "s were") +
      " added to this Shelf record. " +
      counterCatRelayOutcome.rewardCount +
      " Shelf reward" +
      (counterCatRelayOutcome.rewardCount === 1 ? " was" : "s were") +
      " added with provenance."
    : counterCatRelayOutcome?.kind === "already-recorded"
      ? counterCatRelayOutcome.eventCount +
        " Counter Cat completion" +
        (counterCatRelayOutcome.eventCount === 1 ? " already has" : "s already have") +
        " Shelf receipts. Nothing was duplicated."
      : counterCatRelaySummary?.message;
  const selectedReceipt = selectedObject
    ? world.receipts.find((receipt) => receipt.objectId === selectedObject.id)
    : undefined;

  return (
    <main className={"app-shell" + (world.settings.reducedMotion ? " reduce-motion" : "")}>
      <header className="app-header">
        <div>
          <p className="eyebrow">CrewMultiply Play · Living Shelf</p>
          <h1>Living Shelf</h1>
        </div>
        <div className="header-status">
          <span className="status-dot" aria-hidden="true" />
          <span>{saveStatus}</span>
          <button type="button" onClick={() => window.location.assign("/")}>Play home</button>
          <button type="button" onClick={openCrochet}>Open craft basket</button>
          <button type="button" onClick={openPetParade}>Open collar organizer</button>
        </div>
      </header>

      {counterCatRelayPanelTitle && counterCatRelayPanelMessage ? (
        <section className="legacy-import-panel" aria-labelledby="counter-cat-relay-title" role="status">
          <div className="legacy-import-copy">
            <p className="panel-kicker">Counter Cat live handoff</p>
            <h2 id="counter-cat-relay-title">{counterCatRelayPanelTitle}</h2>
            <p>{counterCatRelayPanelMessage}</p>
            <p className="legacy-import-assurance">Counter Cat sent an exact same-browser case note. Adding it here never changes the original game result or its save.</p>
          </div>
          <dl className="legacy-import-metrics">
            <div>
              <dt>Ready</dt>
              <dd>{counterCatRelayReport?.events.length ?? 0}</dd>
            </div>
            <div>
              <dt>Needs review</dt>
              <dd>{counterCatRelayReport?.fallbacks.length ?? 0}</dd>
            </div>
          </dl>
          <div className="legacy-import-actions">
            {counterCatRelayReport?.events.length && !counterCatRelayOutcome ? (
              <button
                className="primary-button"
                type="button"
                onClick={importRelayedCounterCatProgress}
                disabled={counterCatRelayImporting}
              >
                {counterCatRelayImporting
                  ? "Adding completed case…"
                  : "Add " +
                    counterCatRelayReport.events.length +
                    " completed case" +
                    (counterCatRelayReport.events.length === 1 ? "" : "s") +
                    " to Shelf"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => reviewCounterCatRelay()}
              disabled={counterCatRelayImporting}
            >
              Check for Counter Cat cases
            </button>
          </div>
          {counterCatRelayReport?.events.length ? (
            <details className="legacy-import-details">
              <summary>
                {counterCatRelayReport.events.length} completed case
                {counterCatRelayReport.events.length === 1 ? " in" : "s in"} this handoff
              </summary>
              <ul>
                {counterCatRelayReport.events.map((event) => (
                  <li key={event.eventId}>
                    {counterCatRelayEventLabel(event)} · {counterCatRelayEventMoves(event)} swat
                    {counterCatRelayEventMoves(event) === 1 ? "" : "s"}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          {counterCatRelayReport?.fallbacks.length ? (
            <details className="legacy-import-details">
              <summary>
                {counterCatRelayReport.fallbacks.length} handoff record
                {counterCatRelayReport.fallbacks.length === 1 ? " needs" : "s need"} a check
              </summary>
              <ul>
                {counterCatRelayReport.fallbacks.map((fallback, index) => (
                  <li key={fallback.reason + ":" + index}>{fallback.message}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ) : null}

      <section className="proof-bar" aria-label="Living Shelf event proof">
        <div>
          <strong>Bring Counter Cat forward</strong>
          <span>Review exact Counter Cat proof saved by this browser and site. We never write back to the legacy game; unclear progress remains untouched.</span>
        </div>
        <button className="primary-button" type="button" onClick={reviewCounterCatProgress}>
          Review Counter Cat progress
        </button>
      </section>

      {counterCatImportReport && counterCatImportSummary ? (
        <section className="legacy-import-panel" aria-labelledby="counter-cat-import-title">
          <div className="legacy-import-copy">
            <p className="panel-kicker">Counter Cat legacy record</p>
            <h2 id="counter-cat-import-title">{counterCatPanelTitle}</h2>
            <p>{counterCatPanelMessage}</p>
            <p className="legacy-import-assurance">Only this same-browser Counter Cat snapshot was read. The old game and its save remain unchanged.</p>
          </div>
          <dl className="legacy-import-metrics">
            <div>
              <dt>Verified</dt>
              <dd>{counterCatImportReport.events.length}</dd>
            </div>
            <div>
              <dt>Needs review</dt>
              <dd>{counterCatImportReport.fallbacks.length}</dd>
            </div>
          </dl>
          <div className="legacy-import-actions">
            {counterCatImportReport.events.length ? (
              <button
                className="primary-button"
                type="button"
                onClick={importReviewedCounterCatProgress}
                disabled={counterCatImporting || Boolean(counterCatImportOutcome)}
              >
                {counterCatImportOutcome?.kind === "imported"
                  ? "Imported to this Shelf"
                  : counterCatImportOutcome?.kind === "already-recorded"
                    ? "Already in this Shelf"
                    : counterCatImporting
                  ? "Importing verified progress…"
                  : "Import " +
                    counterCatImportReport.events.length +
                    " verified completion" +
                    (counterCatImportReport.events.length === 1 ? "" : "s")}
              </button>
            ) : null}
            <button type="button" onClick={reviewCounterCatProgress} disabled={counterCatImporting}>
              Review again
            </button>
          </div>
          {counterCatImportReport.fallbacks.length ? (
            <details className="legacy-import-details">
              <summary>
                {counterCatImportReport.fallbacks.length} saved record
                {counterCatImportReport.fallbacks.length === 1 ? " needs" : "s need"} a check
              </summary>
              <ul>
                {counterCatImportReport.fallbacks.map((fallback, index) => (
                  <li key={fallback.storageKey + ":" + fallback.legacyKey + ":" + index}>
                    {fallback.message}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ) : null}

      <section className="mode-bar" aria-label="Shelf mode controls">
        <div className="mode-buttons" role="group" aria-label="Shelf mode">
          <button
            type="button"
            className={mode === "arrange" ? "active" : ""}
            aria-pressed={mode === "arrange"}
            onClick={() => setMode("arrange")}
          >
            Arrange mode
          </button>
          <button
            type="button"
            className={mode === "live" ? "active" : ""}
            aria-pressed={mode === "live"}
            onClick={() => setMode("live")}
          >
            Live mode
          </button>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={world.settings.quietMode}
            onChange={(event) => setQuietMode(event.target.checked)}
          />
          Quiet mode
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={world.settings.reducedMotion}
            onChange={(event) => setReducedMotion(event.target.checked)}
          />
          Reduced motion
        </label>
        <button type="button" onClick={runShelfBehavior} disabled={mode !== "live"}>
          Run Shelf interaction
        </button>
      </section>

      <section className="workbench">
        <aside className="panel inventory-panel" aria-label="Inventory tray">
          <p className="panel-kicker">Inventory tray</p>
          <h2>Owned objects</h2>
          <p className="help-text">Select an available object, then mouse- or touch-drag it onto a green preview, or use Place selected object.</p>
          <div className="inventory-list">
            {SHELF_COLLECTIBLES.map((item) => {
              const available = availableInventoryCount(world, item.id);
              const total = world.inventory.find((entry) => entry.objectId === item.id)?.count ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={"inventory-item" + (selectedObjectId === item.id ? " selected" : "")}
                  disabled={available < 1}
                  aria-pressed={selectedObjectId === item.id}
                  onClick={() => {
                    setSelectedObjectId(item.id);
                    setActivePlacementId(null);
                    setNotice(item.displayName + " selected. Drag it to a valid surface.");
                  }}
                >
                  <span aria-hidden="true">{objectMark(item.id)}</span>
                  <span>
                    <strong>{item.displayName}</strong>
                    <small>{total ? available + " available of " + total : item.unlock.label}</small>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="panel-actions">
            <button type="button" onClick={undo} disabled={undoStack.length === 0}>
              Undo
            </button>
            <button type="button" onClick={redo} disabled={redoStack.length === 0}>
              Redo
            </button>
          </div>
          <p className="key-help">Keyboard: select inventory, then use Place selected object · arrows move · R rotates · Delete stores · Ctrl/Cmd+Z undoes.</p>
        </aside>

        <section className="scene-panel" aria-label="Living Shelf scene">
          <div className="scene-title-row">
            <div>
              <p className="panel-kicker">{mode === "arrange" ? "Arrange mode" : "Live mode"}</p>
              <h2>{cozyPackUnlocked ? "Craft corner living shelf" : "Kitchen evidence shelf"}</h2>
            </div>
            <span className="seed-label">Seed {world.worldSeed}</span>
          </div>
          <Suspense
            fallback={
              <div className="scene-loading" role="status">
                <span>Setting up the Living Shelf…</span>
              </div>
            }
          >
            <ShelfScene
              state={world}
              packs={SHELF_PACKS}
              selectedObjectId={selectedObjectId}
              activePlacementId={activePlacementId}
              preview={preview}
              behaviorToken={behaviorToken}
              arrangeEnabled={mode === "arrange"}
              canPlace={(candidate) => isPlacementValid(world, SHELF_PACKS, candidate).valid}
              getAvailableCount={(objectId) => availableInventoryCount(world, objectId)}
              onSelect={(objectId, placementId) => {
                setSelectedObjectId(objectId);
                setActivePlacementId(placementId);
              }}
              onPreview={(candidate) => {
                setPreview(candidate);
                setSelectedObjectId(candidate.objectId);
                setActivePlacementId(candidate.placementId);
              }}
              onCommit={commitPlacement}
              onCancel={() => {
                setPreview(null);
                setNotice("Unfinished drag cancelled. The last stable Shelf state was preserved.");
              }}
            />
          </Suspense>
          <p className="scene-help">
            {mode === "arrange"
              ? "Green outline: valid placement. Red outline: surface, boundary, ownership, or collision issue."
              : "Live mode never changes inventory. Arrange required props together on a valid shared surface to trigger an unlocked resident behavior; Counter Cat uses the Blue Mug and Yarn Ball, while Mallow reacts to craft props."}
          </p>
        </section>

        <aside className="panel inspector-panel" aria-label="Selected object and proof details">
          <p className="panel-kicker">Object record</p>
          <h2>{selectedObject ? selectedObject.displayName : "Select an object"}</h2>
          {selectedObject ? (
            <>
              <p className="provenance">{selectedReceipt?.provenance ?? selectedObject.provenanceCopy}</p>
              <dl className="definition-list">
                <div>
                  <dt>Unlock rule</dt>
                  <dd>{selectedObject.unlock.label}</dd>
                </div>
                <div>
                  <dt>Valid surfaces</dt>
                  <dd>{selectedObject.validSurfaces.join(", ")}</dd>
                </div>
                <div>
                  <dt>Current location</dt>
                  <dd>
                    {activePlacement
                      ? activePlacement.surfaceId +
                        " · " +
                        Math.round(activePlacement.rotation) +
                        "° · x " +
                        activePlacement.x.toFixed(2) +
                        " · y " +
                        activePlacement.y.toFixed(2)
                      : "In inventory"}
                  </dd>
                </div>
              </dl>
              <button type="button" onClick={placeSelectedObject} disabled={Boolean(activePlacementId) || mode !== "arrange" || availableInventoryCount(world, selectedObject.id) < 1}>
                Place selected object
              </button>
              <button type="button" onClick={storeActiveObject} disabled={!activePlacementId || mode !== "arrange"}>
                Store selected object
              </button>
            </>
          ) : (
            <p className="help-text">The Blue Mug appears here with a receipt after a verified Counter Cat completion is imported.</p>
          )}
          <div className="discovery-box">
            <p className="panel-kicker">Discovery record</p>
            {world.discoveries.length ? (
              world.discoveries
                .slice()
                .reverse()
                .map((discovery) => (
                  <article key={discovery.discoveryId}>
                    <strong>{discovery.title}</strong>
                    <p>{discovery.copy}</p>
                  </article>
                ))
            ) : (
              <p className="help-text">No behavior discovered yet. Live mode will explain every valid resident action in text.</p>
            )}
          </div>
          <div className="save-tools">
            <button type="button" onClick={exportSave}>Export JSON</button>
            <label className="file-button">
              Import JSON
              <input type="file" accept="application/json" onChange={importSave} />
            </label>
          </div>
        </aside>
      </section>

      <p className="notice" role="status" aria-live="polite">
        {notice}
      </p>
    </main>
  );
};
