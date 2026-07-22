import { describe, expect, it } from "vitest";
import {
  CounterCatShelfPackFixtures,
  validateShelfPack
} from "@teammultiply/shelf-pack";

describe("Counter Cat Shelf Pack validation", () => {
  it("accepts the valid test pack", () => {
    const result = validateShelfPack(CounterCatShelfPackFixtures.valid);
    expect(result.success).toBe(true);
  });

  it("reports a missing required field", () => {
    const result = validateShelfPack(CounterCatShelfPackFixtures.missingRequiredFields);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("title");
    }
  });

  it("rejects unsupported versions safely", () => {
    const result = validateShelfPack(CounterCatShelfPackFixtures.unsupportedSchemaVersion);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Unsupported Shelf Pack schema version");
    }
  });

  it("rejects duplicate object ids", () => {
    const result = validateShelfPack(CounterCatShelfPackFixtures.duplicateObjectIds);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Duplicate collectible id");
    }
  });

  it("rejects invalid behavior references", () => {
    const result = validateShelfPack(CounterCatShelfPackFixtures.invalidBehaviorReference);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("not-a-real-object");
    }
  });
});
