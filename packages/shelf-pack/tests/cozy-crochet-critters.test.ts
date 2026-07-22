import { describe, expect, it } from "vitest";
import { CozyCrochetCrittersShelfPack, validateShelfPack } from "@teammultiply/shelf-pack";

describe("Cozy Crochet Critters Shelf Pack", () => {
  it("contains its complete production pack requirements", () => {
    const result = validateShelfPack(CozyCrochetCrittersShelfPack);
    expect(result.success).toBe(true);
    expect(CozyCrochetCrittersShelfPack.entrance.label).toContain("Craft basket");
    expect(CozyCrochetCrittersShelfPack.behaviors).toHaveLength(5);
    expect(CozyCrochetCrittersShelfPack.collectibles.map((item) => item.id)).toEqual(expect.arrayContaining([
      "crochet-yarn-basket",
      "crochet-mat",
      "crochet-pin-cushion",
      "crochet-handmade-fox",
      "crochet-oversized-hook",
      "perfect-stitch-sampler",
      "unauthorized-yarn-nest"
    ]));
  });
});
