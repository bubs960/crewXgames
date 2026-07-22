import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url));
const packageSource = (name: string) =>
  fileURLToPath(new URL("../../packages/" + name + "/src/index.ts", import.meta.url));

const legacyGameFolders = [
  "waddle-home",
  "mosaic-meadow",
  "pup-purr-bento",
  "paws-yarn-tangle",
  "pet-parade-sort"
] as const;

type MiddlewareHost = {
  middlewares: {
    use: (handler: (request: IncomingMessage, response: ServerResponse, next: () => void) => void) => void;
  };
};

const addLegacyMiddleware = (server: MiddlewareHost) => {
  server.middlewares.use((request, response, next) => {
    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    for (const folder of legacyGameFolders) {
      if (pathname === `/${folder}`) {
        response.statusCode = 302;
        response.setHeader("Location", `/${folder}/`);
        response.end();
        return;
      }
      if (pathname === `/${folder}/` || pathname === `/${folder}/index.html`) {
        const source = resolve(workspaceRoot, folder, "index.html");
        if (!existsSync(source)) break;
        response.statusCode = 200;
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(readFileSync(source));
        return;
      }
    }
    next();
  });
};

const legacyGameCompatibility = (): Plugin => ({
  name: "teammultiply-legacy-game-compatibility",
  configureServer(server) {
    addLegacyMiddleware(server);
  },
  configurePreviewServer(server) {
    addLegacyMiddleware(server);
  },
  closeBundle() {
    const outputRoot = resolve(dirname(fileURLToPath(import.meta.url)), "dist");
    for (const folder of legacyGameFolders) {
      const destination = resolve(outputRoot, folder, "index.html");
      mkdirSync(dirname(destination), { recursive: true });
      copyFileSync(resolve(workspaceRoot, folder, "index.html"), destination);
    }
  }
});

export default defineConfig({
  plugins: [react(), legacyGameCompatibility()],
  resolve: {
    alias: {
      "@teammultiply/ecosystem-core": packageSource("ecosystem-core"),
      "@teammultiply/shelf-pack": packageSource("shelf-pack"),
      "@teammultiply/save-data": packageSource("save-data"),
      "@teammultiply/game-bridge": packageSource("game-bridge"),
      "@teammultiply/counter-cat-bridge": packageSource("counter-cat-bridge"),
      "@teammultiply/crochet-critters": packageSource("crochet-critters"),
      "@teammultiply/pet-parade-sort": packageSource("pet-parade-sort")
    }
  },
  server: {
    fs: {
      allow: [workspaceRoot]
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/pixi.js/") || id.includes("/node_modules/@pixi/")) {
            return "pixi-runtime";
          }
        }
      }
    }
  }
});
