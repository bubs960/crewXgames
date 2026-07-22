import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ZodType } from "zod";

interface StoredGameSession {
  gameId: string;
  payload: unknown;
  savedAt: string;
}

interface GameSessionDatabase extends DBSchema {
  sessions: {
    key: string;
    value: StoredGameSession;
  };
}

/**
 * Shared local-first storage for an individual game's versioned session payload.
 * The game owns its schema; this package owns the durable IndexedDB boundary.
 */
export class GameSessionStorage<T> {
  private database?: Promise<IDBPDatabase<GameSessionDatabase>>;
  private writeChain: Promise<void> = Promise.resolve();

  public constructor(
    private readonly gameId: string,
    private readonly schema: ZodType<T>,
    private readonly dbName = "teammultiply-game-sessions"
  ) {}

  private getDatabase() {
    if (!this.database) {
      this.database = openDB<GameSessionDatabase>(this.dbName, 1, {
        upgrade(database) {
          if (!database.objectStoreNames.contains("sessions")) {
            database.createObjectStore("sessions", { keyPath: "gameId" });
          }
        }
      });
    }
    return this.database;
  }

  private queueWrite(operation: () => Promise<void>) {
    const next = this.writeChain.then(operation, operation);
    this.writeChain = next.catch(() => undefined);
    return next;
  }

  public async save(payload: T, savedAt = new Date().toISOString()) {
    const validated = this.schema.parse(structuredClone(payload));
    return this.queueWrite(async () => {
      const database = await this.getDatabase();
      await database.put("sessions", { gameId: this.gameId, payload: validated, savedAt });
    });
  }

  public async load(): Promise<T | null> {
    const database = await this.getDatabase();
    const stored = await database.get("sessions", this.gameId);
    return stored ? this.schema.parse(stored.payload) : null;
  }

  public async clear() {
    return this.queueWrite(async () => {
      const database = await this.getDatabase();
      await database.delete("sessions", this.gameId);
    });
  }
}
