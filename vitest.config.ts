import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const workspace = (name: string) => resolve(__dirname, "packages", name, "src", "index.ts");

export default defineConfig({
  resolve: {
    alias: {
      "@teammultiply/ecosystem-core": workspace("ecosystem-core"),
      "@teammultiply/shelf-pack": workspace("shelf-pack"),
      "@teammultiply/save-data": workspace("save-data"),
      "@teammultiply/game-bridge": workspace("game-bridge"),
      "@teammultiply/counter-cat-bridge": workspace("counter-cat-bridge"),
      "@teammultiply/crochet-critters": workspace("crochet-critters"),
      "@teammultiply/pet-parade-sort": workspace("pet-parade-sort")
    }
  },
  test: {
    environment: "node",
    include: ["packages/**/tests/**/*.test.ts", "apps/web/tests/**/*.test.ts"]
  }
});
