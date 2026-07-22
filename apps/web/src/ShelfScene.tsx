import { Application, Container, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";
import type {
  CollectibleDefinition,
  LivingShelfState,
  PlacementState,
  ShelfPack,
  SurfaceId
} from "@teammultiply/ecosystem-core";

interface SurfaceBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const surfaces: Record<SurfaceId, SurfaceBounds> = {
  shelf: { x: 0.11, y: 0.17, width: 0.78, height: 0.17 },
  counter: { x: 0.08, y: 0.47, width: 0.84, height: 0.2 },
  floor: { x: 0.08, y: 0.76, width: 0.84, height: 0.17 }
};

export interface ShelfSceneProps {
  state: LivingShelfState;
  packs: ShelfPack[];
  selectedObjectId: string | null;
  activePlacementId: string | null;
  preview: PlacementState | null;
  behaviorToken: number;
  arrangeEnabled: boolean;
  onSelect: (objectId: string, placementId: string | null) => void;
  onPreview: (placement: PlacementState) => void;
  onCommit: (placement: PlacementState) => void;
  onCancel: () => void;
  canPlace: (placement: PlacementState) => boolean;
  getAvailableCount: (objectId: string) => number;
}

interface ScreenPoint {
  x: number;
  y: number;
}

const objectColor = (objectId: string) => {
  if (objectId === "blue-mug") return 0x5aa7d8;
  if (objectId === "yarn-ball") return 0xb94c71;
  if (objectId === "crochet-yarn-basket") return 0xa56d3b;
  if (objectId === "crochet-mat") return 0x168d8a;
  if (objectId === "crochet-pin-cushion") return 0xe56d61;
  if (objectId === "crochet-oversized-hook") return 0xd9a43b;
  if (objectId === "crochet-handmade-fox") return 0xdf7048;
  if (objectId === "perfect-stitch-sampler") return 0x7b5943;
  if (objectId === "unauthorized-yarn-nest") return 0x609650;
  if (objectId === "parade-entryway-bench") return 0xb67544;
  if (objectId === "parade-collar-rack") return 0x72513c;
  if (objectId === "parade-name-tag-display") return 0x253148;
  if (objectId === "parade-visitor-leash") return 0x168d8a;
  if (objectId === "parade-park-photo") return 0x4d7d4c;
  if (objectId === "parade-golden-buckle-board") return 0x3b2b28;
  if (objectId === "parade-misplaced-bell") return 0xd9a43b;
  return 0xb5a7a0;
};

const cozyPackId = "cozy-crochet-critters.shelf-pack";
const petParadePackId = "pet-parade-sort.shelf-pack";

const drawEntrywayZone = (container: Container, width: number, height: number) => {
  const entryway = new Graphics();
  entryway.beginFill(0xf1ba72, 0.12);
  entryway.drawPolygon([
    width * 0.06, height * 0.08,
    width * 0.42, height * 0.08,
    width * 0.35, height * 0.72,
    width * 0.08, height * 0.72
  ]);
  entryway.endFill();
  entryway.beginFill(0x8b5d3f, 0.92);
  entryway.drawRoundedRect(width * 0.1, height * 0.1, width * 0.2, height * 0.22, 8);
  entryway.endFill();
  entryway.lineStyle(2, 0xf5d9ae, 0.82);
  entryway.drawRoundedRect(width * 0.1, height * 0.1, width * 0.2, height * 0.22, 8);
  entryway.lineStyle(Math.max(3, width * 0.005), 0x5b3d2e, 0.96);
  entryway.moveTo(width * 0.1, height * 0.395);
  entryway.lineTo(width * 0.37, height * 0.395);
  for (let index = 0; index < 4; index += 1) {
    const x = width * (0.145 + index * 0.06);
    entryway.beginFill(0xd9a43b);
    entryway.drawCircle(x, height * 0.407, Math.max(3, width * 0.005));
    entryway.endFill();
  }
  entryway.beginFill(0x4d7d4c, 0.5);
  entryway.drawRoundedRect(width * 0.12, height * 0.715, width * 0.24, height * 0.035, 6);
  entryway.endFill();
  container.addChild(entryway);
};

const drawRescueVisitor = (container: Container, width: number, height: number) => {
  const visitor = new Graphics();
  const x = width * 0.27;
  const y = height * 0.68;
  const size = Math.max(17, width * 0.028);
  visitor.beginFill(0x30231f, 0.24);
  visitor.drawEllipse(x + size * 0.1, y + size * 1.08, size * 1.12, size * 0.26);
  visitor.endFill();
  visitor.beginFill(0xb87648);
  visitor.drawEllipse(x, y + size * 0.5, size * 0.75, size * 0.72);
  visitor.drawCircle(x, y, size);
  visitor.drawEllipse(x - size * 0.68, y - size * 0.22, size * 0.24, size * 0.65);
  visitor.drawEllipse(x + size * 0.68, y - size * 0.22, size * 0.24, size * 0.65);
  visitor.endFill();
  visitor.beginFill(0xf1d3ae);
  visitor.drawEllipse(x, y + size * 0.17, size * 0.4, size * 0.32);
  visitor.endFill();
  visitor.beginFill(0x253148);
  visitor.drawCircle(x - size * 0.32, y - size * 0.08, Math.max(2, size * 0.1));
  visitor.drawCircle(x + size * 0.32, y - size * 0.08, Math.max(2, size * 0.1));
  visitor.drawCircle(x, y + size * 0.12, Math.max(2, size * 0.11));
  visitor.endFill();
  visitor.lineStyle(Math.max(3, size * 0.14), 0x168d8a, 1);
  visitor.moveTo(x - size * 0.64, y + size * 0.58);
  visitor.lineTo(x + size * 0.64, y + size * 0.58);
  container.addChild(visitor);
};

const drawCraftCorner = (container: Container, width: number, height: number) => {
  const corner = new Graphics();
  corner.beginFill(0xffd87d, 0.13);
  corner.drawPolygon([
    width * 0.61, height * 0.08,
    width * 0.93, height * 0.08,
    width * 0.88, height * 0.58,
    width * 0.68, height * 0.58
  ]);
  corner.endFill();
  corner.beginFill(0x8d5a38, 0.9);
  corner.drawRoundedRect(width * 0.56, height * 0.12, width * 0.24, height * 0.16, 8);
  corner.endFill();
  corner.lineStyle(2, 0xf4d6a8, 0.78);
  corner.drawRoundedRect(width * 0.56, height * 0.12, width * 0.24, height * 0.16, 8);
  corner.lineStyle(2, 0xffdd88, 0.85);
  corner.moveTo(width * 0.85, height * 0.09);
  corner.lineTo(width * 0.85, height * 0.23);
  corner.beginFill(0xffdc88);
  corner.drawCircle(width * 0.85, height * 0.085, Math.max(5, width * 0.009));
  corner.endFill();
  corner.beginFill(0x5d3826, 0.88);
  corner.drawRoundedRect(width * 0.59, height * 0.55, width * 0.22, height * 0.035, 5);
  corner.endFill();
  container.addChild(corner);
};

const drawMallow = (container: Container, width: number, height: number) => {
  const cat = new Graphics();
  const x = width * 0.71;
  const y = height * 0.38;
  const size = Math.max(19, width * 0.03);
  cat.beginFill(0x30231f, 0.28);
  cat.drawEllipse(x + 3, y + size * 1.18, size * 1.2, size * 0.32);
  cat.endFill();
  cat.beginFill(0xe5d2b7);
  cat.drawEllipse(x, y + size * 0.54, size * 0.82, size * 0.7);
  cat.drawCircle(x, y, size);
  cat.drawPolygon([x - size * 0.72, y - size * 0.45, x - size * 0.46, y - size * 1.15, x - size * 0.1, y - size * 0.5]);
  cat.drawPolygon([x + size * 0.72, y - size * 0.45, x + size * 0.46, y - size * 1.15, x + size * 0.1, y - size * 0.5]);
  cat.endFill();
  cat.lineStyle(2, 0x5e4434, 0.9);
  cat.drawCircle(x, y, size);
  cat.beginFill(0x243247);
  cat.drawCircle(x - size * 0.34, y - size * 0.04, Math.max(2, size * 0.12));
  cat.drawCircle(x + size * 0.34, y - size * 0.04, Math.max(2, size * 0.12));
  cat.endFill();
  cat.lineStyle(3, 0x168d8a, 1);
  cat.moveTo(x - size * 0.72, y + size * 0.72);
  cat.lineTo(x + size * 0.72, y + size * 0.72);
  container.addChild(cat);
};

const drawCrochetObject = (graphic: Graphics, objectId: string, width: number, height: number, preview: boolean, valid: boolean) => {
  const outline = valid ? 0xf7f4ee : 0xf0634d;
  const lineWidth = preview ? 3 : 2;
  if (objectId === "crochet-yarn-basket") {
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.beginFill(0xa56d3b, preview ? 0.62 : 1);
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, Math.min(9, height / 2));
    graphic.endFill();
    graphic.lineStyle(1.5, 0x704423, 0.9);
    for (let y = -height * 0.22; y <= height * 0.22; y += Math.max(4, height * 0.22)) {
      graphic.moveTo(-width * 0.42, y);
      graphic.lineTo(width * 0.42, y);
    }
    for (const [x, color] of [[-0.28, 0xe56d61], [-0.09, 0x168d8a], [0.12, 0xe5a72d], [0.31, 0x679d58]] as const) {
      graphic.beginFill(color);
      graphic.drawCircle(width * x, -height * 0.28, Math.max(4, height * 0.22));
      graphic.endFill();
    }
    return true;
  }
  if (objectId === "crochet-mat") {
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.beginFill(0x168d8a, preview ? 0.62 : 1);
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, Math.min(9, height / 2));
    graphic.endFill();
    graphic.lineStyle(2, 0x9de3d8, 0.9);
    graphic.drawRoundedRect(-width * 0.38, -height * 0.28, width * 0.76, height * 0.56, Math.min(6, height / 3));
    for (let x = -width * 0.26; x < width * 0.3; x += Math.max(5, width * 0.16)) {
      graphic.moveTo(x, -height * 0.14);
      graphic.lineTo(x + width * 0.08, height * 0.14);
    }
    return true;
  }
  if (objectId === "crochet-pin-cushion") {
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.beginFill(0xe56d61, preview ? 0.62 : 1);
    graphic.drawEllipse(0, height * 0.1, width * 0.5, height * 0.46);
    graphic.endFill();
    graphic.lineStyle(2, 0xffc2b4, 0.92);
    graphic.drawEllipse(0, height * 0.03, width * 0.32, height * 0.25);
    for (const offset of [-0.22, 0, 0.22]) {
      graphic.lineStyle(2, 0xdfe8ea, 1);
      graphic.moveTo(width * offset, -height * 0.42);
      graphic.lineTo(width * offset * 0.7, -height * 0.02);
      graphic.beginFill(0xf9f7ef);
      graphic.drawCircle(width * offset, -height * 0.44, Math.max(2, width * 0.04));
      graphic.endFill();
    }
    return true;
  }
  if (objectId === "crochet-oversized-hook") {
    graphic.lineStyle(lineWidth + 1, outline, preview ? 1 : 0.82);
    graphic.lineStyle(Math.max(6, height * 0.48), 0xd5a23f, preview ? 0.62 : 1);
    graphic.moveTo(-width * 0.42, height * 0.05);
    graphic.lineTo(width * 0.25, height * 0.05);
    graphic.lineStyle(Math.max(4, height * 0.28), 0x4f392e, 1);
    graphic.moveTo(-width * 0.42, height * 0.05);
    graphic.lineTo(-width * 0.1, height * 0.05);
    graphic.lineStyle(Math.max(4, height * 0.28), 0xd5a23f, 1);
    graphic.moveTo(width * 0.24, height * 0.05);
    graphic.lineTo(width * 0.4, -height * 0.22);
    graphic.lineTo(width * 0.46, -height * 0.02);
    return true;
  }
  if (objectId === "crochet-handmade-fox") {
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.beginFill(0xdf7048, preview ? 0.62 : 1);
    graphic.drawEllipse(0, height * 0.12, width * 0.43, height * 0.45);
    graphic.drawCircle(0, -height * 0.22, Math.min(width, height) * 0.28);
    graphic.drawPolygon([-width * 0.24, -height * 0.32, -width * 0.16, -height * 0.64, -width * 0.02, -height * 0.37]);
    graphic.drawPolygon([width * 0.24, -height * 0.32, width * 0.16, -height * 0.64, width * 0.02, -height * 0.37]);
    graphic.endFill();
    graphic.beginFill(0xf2dfc5);
    graphic.drawEllipse(0, -height * 0.08, width * 0.18, height * 0.14);
    graphic.endFill();
    graphic.beginFill(0x243247);
    graphic.drawCircle(-width * 0.09, -height * 0.25, Math.max(2, width * 0.035));
    graphic.drawCircle(width * 0.09, -height * 0.25, Math.max(2, width * 0.035));
    graphic.endFill();
    graphic.lineStyle(Math.max(3, height * 0.18), 0x679d58, 1);
    graphic.moveTo(-width * 0.26, height * 0.26);
    graphic.lineTo(width * 0.26, height * 0.26);
    return true;
  }
  if (objectId === "perfect-stitch-sampler") {
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.beginFill(0x72513c, preview ? 0.62 : 1);
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, 5);
    graphic.endFill();
    graphic.beginFill(0xf4e3c8);
    graphic.drawRoundedRect(-width * 0.38, -height * 0.34, width * 0.76, height * 0.68, 3);
    graphic.endFill();
    const colors = [0xe56d61, 0x168d8a, 0xe5a72d, 0x679d58, 0x253148];
    for (const [index, color] of colors.entries()) {
      graphic.lineStyle(Math.max(2, height * 0.12), color, 1);
      const y = -height * 0.2 + index * height * 0.1;
      graphic.moveTo(-width * 0.28, y);
      graphic.lineTo(width * 0.28, y + height * 0.035);
    }
    return true;
  }
  if (objectId === "unauthorized-yarn-nest") {
    const colors = [0xe56d61, 0x168d8a, 0xe5a72d, 0x679d58, 0x253148];
    for (const [index, color] of colors.entries()) {
      graphic.lineStyle(Math.max(3, height * 0.18), color, preview ? 0.62 : 1);
      graphic.drawEllipse((index - 2) * width * 0.08, (index % 2 ? -1 : 1) * height * 0.06, width * 0.31, height * 0.29);
    }
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.drawEllipse(0, 0, width * 0.48, height * 0.44);
    return true;
  }
  return false;
};

const drawPetParadeObject = (
  graphic: Graphics,
  objectId: string,
  width: number,
  height: number,
  preview: boolean,
  valid: boolean
) => {
  const outline = valid ? 0xf7f4ee : 0xf0634d;
  const alpha = preview ? 0.62 : 1;
  const lineWidth = preview ? 3 : 2;
  if (objectId === "parade-entryway-bench") {
    const benchHeight = Math.max(height, Math.min(26, width * 0.16));
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.beginFill(0xb67544, alpha);
    graphic.drawRoundedRect(-width / 2, -benchHeight * 0.28, width, benchHeight * 0.56, Math.min(8, benchHeight * 0.2));
    graphic.endFill();
    graphic.beginFill(0x168d8a, alpha);
    graphic.drawRoundedRect(-width * 0.43, -benchHeight * 0.4, width * 0.86, benchHeight * 0.32, Math.min(7, benchHeight * 0.15));
    graphic.endFill();
    graphic.lineStyle(Math.max(3, width * 0.035), 0x72513c, alpha);
    graphic.moveTo(-width * 0.38, benchHeight * 0.2);
    graphic.lineTo(-width * 0.38, benchHeight * 0.5);
    graphic.moveTo(width * 0.38, benchHeight * 0.2);
    graphic.lineTo(width * 0.38, benchHeight * 0.5);
    return true;
  }
  if (objectId === "parade-collar-rack") {
    graphic.lineStyle(Math.max(3, width * 0.05), 0x72513c, alpha);
    graphic.moveTo(-width * 0.42, -height * 0.32);
    graphic.lineTo(width * 0.42, -height * 0.32);
    graphic.moveTo(0, -height * 0.32);
    graphic.lineTo(0, height * 0.48);
    graphic.moveTo(-width * 0.3, height * 0.48);
    graphic.lineTo(width * 0.3, height * 0.48);
    const colors = [0xe56d61, 0x168d8a, 0xd9a43b];
    for (const [index, color] of colors.entries()) {
      const x = (index - 1) * width * 0.27;
      graphic.lineStyle(Math.max(3, width * 0.04), color, alpha);
      graphic.drawEllipse(x, height * 0.03, width * 0.16, height * 0.25);
      graphic.beginFill(0xf7f4ee, alpha);
      graphic.drawCircle(x, height * 0.03, Math.max(2, width * 0.035));
      graphic.endFill();
    }
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, 5);
    return true;
  }
  if (objectId === "parade-name-tag-display") {
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.beginFill(0x253148, alpha);
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, 5);
    graphic.endFill();
    const colors = [0xe56d61, 0x168d8a, 0xd9a43b, 0x679d58, 0x5a7fc0, 0xb16c9b];
    for (const [index, color] of colors.entries()) {
      const x = ((index % 3) - 1) * width * 0.27;
      const y = (Math.floor(index / 3) - 0.5) * height * 0.38;
      graphic.lineStyle(1.5, 0xf7f4ee, alpha);
      graphic.beginFill(color, alpha);
      if (index % 3 === 0) graphic.drawCircle(x, y, Math.min(width, height) * 0.09);
      else if (index % 3 === 1) graphic.drawRoundedRect(x - width * 0.07, y - height * 0.08, width * 0.14, height * 0.16, 2);
      else graphic.drawPolygon([x, y - height * 0.1, x + width * 0.09, y, x, y + height * 0.1, x - width * 0.09, y]);
      graphic.endFill();
    }
    return true;
  }
  if (objectId === "parade-visitor-leash") {
    graphic.lineStyle(Math.max(4, height * 0.22), 0x168d8a, alpha);
    graphic.drawEllipse(-width * 0.08, 0, width * 0.34, height * 0.34);
    graphic.drawEllipse(width * 0.12, 0, width * 0.28, height * 0.28);
    graphic.lineStyle(Math.max(2, height * 0.12), 0xd9a43b, alpha);
    graphic.moveTo(width * 0.32, -height * 0.08);
    graphic.lineTo(width * 0.48, -height * 0.28);
    graphic.lineTo(width * 0.46, height * 0.12);
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, 5);
    return true;
  }
  if (objectId === "parade-park-photo") {
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.beginFill(0x72513c, alpha);
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, 5);
    graphic.endFill();
    graphic.beginFill(0xa9d5dc, alpha);
    graphic.drawRoundedRect(-width * 0.4, -height * 0.37, width * 0.8, height * 0.74, 3);
    graphic.endFill();
    graphic.beginFill(0x4d7d4c, alpha);
    graphic.drawRect(-width * 0.4, height * 0.14, width * 0.8, height * 0.23);
    graphic.endFill();
    for (const [x, color] of [[-0.22, 0xb87648], [0, 0xf1d3ae], [0.22, 0x69727f]] as const) {
      graphic.beginFill(color, alpha);
      graphic.drawCircle(width * x, -height * 0.02, Math.min(width, height) * 0.1);
      graphic.drawEllipse(width * x, height * 0.15, width * 0.09, height * 0.16);
      graphic.endFill();
    }
    return true;
  }
  if (objectId === "parade-golden-buckle-board") {
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.beginFill(0x3b2b28, alpha);
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, 5);
    graphic.endFill();
    graphic.lineStyle(Math.max(4, Math.min(width, height) * 0.12), 0xd9a43b, alpha);
    graphic.drawEllipse(0, 0, width * 0.25, height * 0.25);
    graphic.lineStyle(2, 0xffe4a3, alpha);
    graphic.drawEllipse(0, 0, width * 0.16, height * 0.16);
    return true;
  }
  if (objectId === "parade-misplaced-bell") {
    graphic.lineStyle(lineWidth, outline, preview ? 1 : 0.82);
    graphic.beginFill(0xd9a43b, alpha);
    graphic.drawPolygon([
      -width * 0.36, height * 0.27,
      -width * 0.22, -height * 0.22,
      0, -height * 0.42,
      width * 0.22, -height * 0.22,
      width * 0.36, height * 0.27
    ]);
    graphic.drawEllipse(0, height * 0.25, width * 0.38, height * 0.12);
    graphic.endFill();
    graphic.lineStyle(Math.max(3, width * 0.08), 0xe56d61, alpha);
    graphic.drawEllipse(0, -height * 0.38, width * 0.13, height * 0.12);
    graphic.beginFill(0x72513c, alpha);
    graphic.drawCircle(0, height * 0.32, Math.max(2, width * 0.07));
    graphic.endFill();
    return true;
  }
  return false;
};

const surfacePoint = (
  placement: PlacementState,
  width: number,
  height: number
): ScreenPoint => {
  const surface = surfaces[placement.surfaceId];
  return {
    x: (surface.x + surface.width * placement.x) * width,
    y: (surface.y + surface.height * placement.y) * height
  };
};

const screenToPlacement = (
  point: ScreenPoint,
  width: number,
  height: number,
  source: PlacementState
): PlacementState | null => {
  const x = point.x / width;
  const y = point.y / height;
  const entry = (Object.entries(surfaces) as [SurfaceId, SurfaceBounds][]).find(
    ([, surface]) =>
      x >= surface.x &&
      x <= surface.x + surface.width &&
      y >= surface.y &&
      y <= surface.y + surface.height
  );
  if (!entry) return null;
  const [surfaceId, surface] = entry;
  return {
    ...source,
    surfaceId,
    x: Math.max(0, Math.min(1, (x - surface.x) / surface.width)),
    y: Math.max(0, Math.min(1, (y - surface.y) / surface.height))
  };
};

const drawObject = (
  container: Container,
  placement: PlacementState,
  definition: CollectibleDefinition,
  width: number,
  height: number,
  preview = false,
  valid = true
) => {
  const point = surfacePoint(placement, width, height);
  const surface = surfaces[placement.surfaceId];
  const objectWidth = definition.footprint.width * surface.width * width;
  const objectHeight = definition.footprint.height * surface.height * height;
  const graphic = new Graphics();
  graphic.position.set(point.x, point.y);
  graphic.rotation = (placement.rotation * Math.PI) / 180;
  if (drawPetParadeObject(graphic, definition.id, objectWidth, objectHeight, preview, valid)) {
    container.addChild(graphic);
    return;
  }
  if (drawCrochetObject(graphic, definition.id, objectWidth, objectHeight, preview, valid)) {
    container.addChild(graphic);
    return;
  }

  graphic.lineStyle(preview ? 3 : 2, valid ? 0xf7f4ee : 0xf0634d, preview ? 1 : 0.75);
  graphic.beginFill(objectColor(definition.id), preview ? 0.55 : 1);

  if (definition.id === "yarn-ball") {
    graphic.drawCircle(0, 0, Math.max(objectWidth, objectHeight) / 2);
    graphic.lineStyle(1.5, 0xf7f4ee, 0.85);
    graphic.drawCircle(0, 0, Math.max(objectWidth, objectHeight) / 3);
    graphic.moveTo(-objectWidth / 2.5, 0);
    graphic.lineTo(objectWidth / 2.5, 0);
  } else if (definition.id === "blue-mug") {
    graphic.drawRoundedRect(-objectWidth / 2, -objectHeight / 2, objectWidth * 0.72, objectHeight, 8);
    graphic.lineStyle(2, 0xf7f4ee, 0.9);
    graphic.drawCircle(objectWidth * 0.36, 0, objectHeight * 0.24);
  } else {
    graphic.drawRoundedRect(-objectWidth / 2, -objectHeight / 2, objectWidth, objectHeight, 6);
    graphic.lineStyle(2, 0x6b5d55, 0.75);
    graphic.moveTo(-objectWidth / 3, -objectHeight / 5);
    graphic.lineTo(objectWidth / 3, -objectHeight / 5);
  }
  graphic.endFill();
  container.addChild(graphic);
};

const drawCat = (container: Container, width: number, height: number) => {
  const cat = new Graphics();
  cat.position.set(width * 0.83, height * 0.36);
  cat.beginFill(0xe9653f);
  cat.drawCircle(0, 0, Math.max(22, width * 0.04));
  cat.drawPolygon([
    -width * 0.032,
    -height * 0.04,
    -width * 0.006,
    -height * 0.09,
    width * 0.008,
    -height * 0.03
  ]);
  cat.drawPolygon([
    width * 0.032,
    -height * 0.04,
    width * 0.006,
    -height * 0.09,
    -width * 0.008,
    -height * 0.03
  ]);
  cat.endFill();
  cat.beginFill(0x171714);
  cat.drawCircle(-width * 0.013, -height * 0.006, 3);
  cat.drawCircle(width * 0.013, -height * 0.006, 3);
  cat.drawCircle(0, height * 0.014, 2.5);
  cat.endFill();
  container.addChild(cat);
};

export const ShelfScene = (props: ShelfSceneProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const propsRef = useRef(props);
  const drawRef = useRef<() => void>(() => undefined);
  const dragRef = useRef<PlacementState | null>(null);

  propsRef.current = props;

  drawRef.current = () => {
    const app = appRef.current;
    if (!app) return;
    const current = propsRef.current;
    const width = app.screen.width;
    const height = app.screen.height;
    const stage = app.stage;
    stage.removeChildren().forEach((child) => child.destroy({ children: true }));

    const room = new Graphics();
    room.beginFill(0x171714);
    room.drawRect(0, 0, width, height);
    room.endFill();
    room.beginFill(0xf7f4ee);
    room.drawRoundedRect(width * 0.05, height * 0.07, width * 0.9, height * 0.85, 18);
    room.endFill();
    room.beginFill(0xa9d5dc, 0.42);
    room.drawRoundedRect(width * 0.12, height * 0.12, width * 0.3, height * 0.22, 12);
    room.endFill();

    const shelf = surfaces.shelf;
    room.beginFill(0x4d7d4c);
    room.drawRoundedRect(shelf.x * width, shelf.y * height, shelf.width * width, shelf.height * height, 12);
    room.endFill();
    room.beginFill(0x147a78);
    room.drawRoundedRect(
      surfaces.counter.x * width,
      surfaces.counter.y * height,
      surfaces.counter.width * width,
      surfaces.counter.height * height,
      12
    );
    room.endFill();
    room.beginFill(0xd8c7af);
    room.drawRoundedRect(
      surfaces.floor.x * width,
      surfaces.floor.y * height,
      surfaces.floor.width * width,
      surfaces.floor.height * height,
      12
    );
    room.endFill();
    stage.addChild(room);

    const cozyCraftCornerVisible = current.state.unlockedPacks.includes(cozyPackId);
    const petParadeEntrywayVisible = current.state.unlockedPacks.includes(petParadePackId);
    if (cozyCraftCornerVisible) drawCraftCorner(stage, width, height);
    if (petParadeEntrywayVisible) drawEntrywayZone(stage, width, height);

    const definitions = new Map(current.packs.flatMap((pack) => pack.collectibles).map((item) => [item.id, item]));
    const placements = current.preview
      ? current.state.placements.filter((placement) => placement.placementId !== current.preview!.placementId)
      : current.state.placements;

    for (const placement of placements) {
      const definition = definitions.get(placement.objectId);
      if (!definition) continue;
      drawObject(stage, placement, definition, width, height);
    }
    if (current.preview) {
      const definition = definitions.get(current.preview.objectId);
      if (definition) {
        drawObject(
          stage,
          current.preview,
          definition,
          width,
          height,
          true,
          current.canPlace(current.preview)
        );
      }
    }
    drawCat(stage, width, height);
    if (cozyCraftCornerVisible) drawMallow(stage, width, height);
    if (petParadeEntrywayVisible) drawRescueVisitor(stage, width, height);
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const app = new Application({
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2)
    });
    appRef.current = app;
    const canvas = app.view as HTMLCanvasElement;
    canvas.setAttribute("aria-label", "Interactive Living Shelf scene");
    canvas.setAttribute("role", "application");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "none";
    canvas.style.zIndex = "1";
    host.appendChild(canvas);

    const resize = () => {
      app.renderer.resize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight));
      drawRef.current();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const pointFromEvent = (event: PointerEvent): ScreenPoint => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (app.screen.width / rect.width),
        y: (event.clientY - rect.top) * (app.screen.height / rect.height)
      };
    };

    const hitPlacement = (point: ScreenPoint) => {
      const current = propsRef.current;
      const definitions = new Map(current.packs.flatMap((pack) => pack.collectibles).map((item) => [item.id, item]));
      return [...current.state.placements].reverse().find((placement) => {
        const definition = definitions.get(placement.objectId);
        if (!definition) return false;
        const center = surfacePoint(placement, app.screen.width, app.screen.height);
        const surface = surfaces[placement.surfaceId];
        const width = definition.footprint.width * surface.width * app.screen.width;
        const height = definition.footprint.height * surface.height * app.screen.height;
        return Math.abs(point.x - center.x) <= width / 2 + 14 && Math.abs(point.y - center.y) <= height / 2 + 14;
      });
    };

    const createPlacementId = () =>
      "placement:" +
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()) + "-" + String(Math.random()).slice(2));

    const moveDraft = (point: ScreenPoint) => {
      if (!dragRef.current) return null;
      const next = screenToPlacement(point, app.screen.width, app.screen.height, dragRef.current);
      if (!next) return null;
      dragRef.current = next;
      propsRef.current.onPreview(next);
      return next;
    };

    const onPointerDown = (event: PointerEvent) => {
      const current = propsRef.current;
      if (!current.arrangeEnabled) return;
      const point = pointFromEvent(event);
      const existing = hitPlacement(point);
      if (existing) {
        dragRef.current = existing;
        current.onSelect(existing.objectId, existing.placementId);
      } else if (
        current.selectedObjectId &&
        current.getAvailableCount(current.selectedObjectId) > 0
      ) {
        const draft = screenToPlacement(point, app.screen.width, app.screen.height, {
          placementId: createPlacementId(),
          objectId: current.selectedObjectId,
          surfaceId: "counter",
          x: 0.5,
          y: 0.5,
          rotation: 0
        });
        if (!draft) return;
        dragRef.current = draft;
        current.onSelect(draft.objectId, draft.placementId);
      } else {
        return;
      }
      canvas.setPointerCapture(event.pointerId);
      moveDraft(point);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current) return;
      moveDraft(pointFromEvent(event));
    };

    const finishDrag = (event: PointerEvent, cancelled = false) => {
      if (!dragRef.current) return;
      const finalPlacement = cancelled ? null : moveDraft(pointFromEvent(event)) ?? dragRef.current;
      const current = propsRef.current;
      dragRef.current = null;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      if (cancelled || !finalPlacement) {
        current.onCancel();
      } else {
        current.onCommit(finalPlacement);
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", finishDrag);
    canvas.addEventListener("pointercancel", (event) => finishDrag(event, true));

    return () => {
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", finishDrag);
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    drawRef.current();
  }, [props.state, props.preview, props.selectedObjectId, props.activePlacementId, props.behaviorToken]);

  const motionClass =
    props.behaviorToken && !props.state.settings.quietMode && !props.state.settings.reducedMotion
      ? " scene-has-behavior"
      : "";

  return (
    <div
      ref={hostRef}
      className={"shelf-scene" + motionClass}
      aria-describedby="shelf-scene-instructions"
    >
      <div className="scene-labels" aria-hidden="true">
        <span className="label-shelf">Wall shelf</span>
        <span className="label-counter">Kitchen counter</span>
        <span className="label-floor">Floor</span>
      </div>
      <div key={props.behaviorToken} className="cat-chip" aria-hidden="true">
        Counter Cat
      </div>
      <div id="shelf-scene-instructions" className="sr-only">
        Select an inventory object, then drag it to the shelf, counter, or floor, or use the Place selected object button. Green preview means it can be placed. Use arrow keys to move a selected object, R to rotate, and Delete to store it.
        {props.state.unlockedPacks.includes(cozyPackId) ? " The craft corner is open; Mallow, the craft-room kitten, appears beside its warm task light." : ""}
        {props.state.unlockedPacks.includes(petParadePackId) ? " The entryway is open; a rescue visitor waits beside the collar rail and bench." : ""}
      </div>
    </div>
  );
};
