import { Application, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";
import {
  getCurrentObjective,
  getNode,
  type CrochetLevel,
  type PuzzleState,
  type YarnColor
} from "@teammultiply/crochet-critters";

const yarnColors: Record<YarnColor, { main: number; shadow: number; light: number }> = {
  coral: { main: 0xe56d61, shadow: 0x7e2d37, light: 0xffbcab },
  teal: { main: 0x168d8a, shadow: 0x07514f, light: 0x8edfd3 },
  gold: { main: 0xe5a72d, shadow: 0x7f4d10, light: 0xffe090 },
  leaf: { main: 0x679d58, shadow: 0x315f31, light: 0xb9d993 },
  ink: { main: 0x253148, shadow: 0x0b1020, light: 0x9aa9c1 }
};

export interface CrochetStageProps {
  level: CrochetLevel;
  state: PuzzleState;
  draftRoute: string[];
  previewValid: boolean | null;
  reducedMotion: boolean;
  highContrast: boolean;
  animationToken: number;
  guidedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
}

const pathPoints = (level: CrochetLevel, nodeIds: string[], width: number, height: number) =>
  nodeIds.map((nodeId) => {
    const node = getNode(level, nodeId)!;
    return { x: node.x * width, y: node.y * height };
  });

const drawYarn = (
  stage: Graphics,
  points: { x: number; y: number }[],
  color: YarnColor,
  highContrast: boolean,
  alpha = 1,
  dashed = false
) => {
  if (points.length < 2) return;
  const palette = yarnColors[color];
  stage.lineStyle(15, palette.shadow, alpha * 0.42);
  stage.moveTo(points[0].x + 2, points[0].y + 5);
  for (const point of points.slice(1)) stage.lineTo(point.x + 2, point.y + 5);
  stage.lineStyle(highContrast ? 10 : 9, highContrast ? 0xfdfbf4 : palette.main, alpha);
  stage.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) stage.lineTo(point.x, point.y);
  stage.lineStyle(highContrast ? 5 : 3, highContrast ? palette.main : palette.light, alpha * 0.82);
  stage.moveTo(points[0].x - 1, points[0].y - 2);
  for (const point of points.slice(1)) stage.lineTo(point.x - 1, point.y - 2);
  if (!dashed) return;
  stage.lineStyle(2, 0xffffff, alpha * 0.8);
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    for (let fraction = 0.16; fraction < 0.95; fraction += 0.18) {
      const x = start.x + (end.x - start.x) * fraction;
      const y = start.y + (end.y - start.y) * fraction;
      stage.moveTo(x - 2, y - 2);
      stage.lineTo(x + 2, y + 2);
    }
  }
};

const drawChannel = (graphic: Graphics, from: { x: number; y: number }, to: { x: number; y: number }) => {
  graphic.lineStyle(2, 0x745844, 0.23);
  graphic.moveTo(from.x, from.y);
  graphic.lineTo(to.x, to.y);
  graphic.lineStyle(1, 0xf7e7c9, 0.18);
  graphic.moveTo(from.x + 1, from.y - 1);
  graphic.lineTo(to.x + 1, to.y - 1);
};

const drawGuidePulse = (graphic: Graphics, x: number, y: number, reducedMotion: boolean, elapsed: number) => {
  const pulse = reducedMotion ? 0 : (Math.sin(elapsed * 0.006) + 1) / 2;
  const radius = 29 + pulse * 7;
  graphic.beginFill(0xffe17a, reducedMotion ? 0.16 : 0.11 + pulse * 0.08);
  graphic.drawCircle(x, y, radius);
  graphic.endFill();
  graphic.lineStyle(2.5, 0xffefaa, reducedMotion ? 0.9 : 0.58 + pulse * 0.35);
  graphic.drawCircle(x, y, radius - 5);
  graphic.lineStyle(1, 0xffffff, reducedMotion ? 0.82 : 0.36 + pulse * 0.4);
  graphic.drawCircle(x, y, radius + 4);
};

const drawNode = (
  graphic: Graphics,
  kind: string,
  x: number,
  y: number,
  color: YarnColor | undefined,
  selected: boolean,
  highContrast: boolean
) => {
  const outline = selected ? 0xffe8a0 : highContrast ? 0xfdfbf4 : 0x30251f;
  if (kind === "spool") {
    const palette = color ? yarnColors[color] : yarnColors.coral;
    graphic.beginFill(0x3b2b25, 0.55);
    graphic.drawEllipse(x + 2, y + 13, 27, 10);
    graphic.endFill();
    graphic.lineStyle(selected ? 5 : 3, outline, 1);
    graphic.beginFill(palette.shadow);
    graphic.drawEllipse(x, y, 24, 16);
    graphic.endFill();
    graphic.lineStyle(3, palette.light, 0.95);
    graphic.drawEllipse(x, y, 17, 11);
    graphic.lineStyle(2, palette.main, 1);
    for (let index = -9; index <= 9; index += 6) graphic.drawEllipse(x + index, y, 2.5, 10);
    graphic.lineStyle(1, 0xffffff, 0.4);
    graphic.moveTo(x - 13, y - 5);
    graphic.lineTo(x + 13, y - 5);
    graphic.beginFill(palette.light, 0.74);
    graphic.drawCircle(x - 6, y - 5, 2.1);
    graphic.endFill();
    return;
  }
  if (kind === "pin") {
    graphic.beginFill(0x382820, 0.45);
    graphic.drawEllipse(x + 2, y + 13, 11, 4);
    graphic.endFill();
    graphic.lineStyle(selected ? 5 : 2.5, outline, 1);
    graphic.beginFill(0xd7d8d4);
    graphic.drawCircle(x, y - 7, 9);
    graphic.endFill();
    graphic.lineStyle(2, 0xffffff, 0.8);
    graphic.drawCircle(x - 2, y - 9, 3);
    graphic.lineStyle(3, 0x7b8589, 1);
    graphic.moveTo(x, y + 1);
    graphic.lineTo(x, y + 15);
    graphic.lineStyle(1, 0xffffff, 0.65);
    graphic.moveTo(x - 2, y + 2);
    graphic.lineTo(x - 2, y + 14);
    return;
  }
  if (kind === "hook") {
    graphic.beginFill(0x382820, 0.42);
    graphic.drawEllipse(x + 3, y + 13, 13, 5);
    graphic.endFill();
    graphic.lineStyle(selected ? 6 : 4, outline, 1);
    graphic.beginFill(0xd4a03f);
    graphic.drawCircle(x, y, 13);
    graphic.endFill();
    graphic.lineStyle(4, 0xffef9e, 0.92);
    graphic.drawCircle(x - 2, y - 2, 7);
    graphic.lineStyle(4, 0x4c351e, 0.95);
    graphic.moveTo(x + 2, y - 9);
    graphic.lineTo(x + 11, y + 2);
    graphic.lineStyle(1.5, 0xfff3bc, 0.86);
    graphic.moveTo(x - 4, y - 6);
    graphic.lineTo(x + 5, y + 4);
    return;
  }
  const palette = color ? yarnColors[color] : yarnColors.coral;
  graphic.beginFill(0x382820, 0.45);
  graphic.drawEllipse(x + 2, y + 13, 15, 5);
  graphic.endFill();
  graphic.lineStyle(selected ? 5 : 3, outline, 1);
  graphic.beginFill(palette.main);
  graphic.drawCircle(x, y, 14);
  graphic.endFill();
  graphic.lineStyle(3, palette.light, 0.85);
  graphic.drawCircle(x, y, 8);
  graphic.lineStyle(2, palette.shadow, 0.8);
  graphic.moveTo(x - 8, y + 2);
  graphic.lineTo(x + 8, y - 2);
  graphic.lineStyle(1.25, 0xffffff, 0.56);
  graphic.moveTo(x - 6, y - 5);
  graphic.lineTo(x + 5, y - 7);
};

export const CrochetStage = (props: CrochetStageProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const propsRef = useRef(props);
  const drawRef = useRef<() => void>(() => undefined);
  const elapsedRef = useRef(0);

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
    const overlay = current.highContrast ? 0.92 : 0.2;
    room.beginFill(0x160f0d, current.highContrast ? 0.9 : 0.3);
    room.drawRect(0, 0, width, height);
    room.endFill();
    room.beginFill(0x432d20, current.highContrast ? 0.94 : 0.32);
    room.drawRoundedRect(width * 0.035, height * 0.035, width * 0.93, height * 0.93, 28);
    room.endFill();
    room.lineStyle(3, 0xffe2ae, current.highContrast ? 0.92 : 0.74);
    room.drawRoundedRect(width * 0.052, height * 0.052, width * 0.896, height * 0.896, 23);
    room.beginFill(0xe8c99b, overlay);
    room.drawRoundedRect(width * 0.075, height * 0.075, width * 0.85, height * 0.85, 18);
    room.endFill();
    room.lineStyle(1.15, 0x5e3e2a, current.highContrast ? 0.62 : 0.22);
    for (let y = height * 0.1; y < height * 0.91; y += Math.max(16, height * 0.06)) {
      room.moveTo(width * 0.09, y);
      room.lineTo(width * 0.91, y + Math.sin(y * 0.08) * 3);
    }
    room.lineStyle(1.4, 0xfff0d0, current.highContrast ? 0.78 : 0.38);
    for (let fraction = 0.12; fraction < 0.89; fraction += 0.045) {
      const left = width * 0.083;
      const right = width * 0.917;
      const top = height * 0.083;
      const bottom = height * 0.917;
      room.moveTo(width * fraction, top);
      room.lineTo(width * fraction + 4, top + 3);
      room.moveTo(width * fraction, bottom);
      room.lineTo(width * fraction + 4, bottom - 3);
      room.moveTo(left, height * fraction);
      room.lineTo(left + 3, height * fraction + 4);
      room.moveTo(right, height * fraction);
      room.lineTo(right - 3, height * fraction + 4);
    }
    stage.addChild(room);

    const channels = new Graphics();
    for (const link of current.level.channels) {
      const from = getNode(current.level, link.from);
      const to = getNode(current.level, link.to);
      if (from && to) drawChannel(channels, { x: from.x * width, y: from.y * height }, { x: to.x * width, y: to.y * height });
    }
    stage.addChild(channels);

    if (current.guidedNodeId) {
      const guided = getNode(current.level, current.guidedNodeId);
      if (guided) {
        const guide = new Graphics();
        drawGuidePulse(guide, guided.x * width, guided.y * height, current.reducedMotion, elapsedRef.current);
        stage.addChild(guide);
      }
    }

    const yarn = new Graphics();
    for (const route of current.state.routes) {
      drawYarn(yarn, pathPoints(current.level, route.nodeIds, width, height), route.color, current.highContrast, 1, false);
    }
    if (current.draftRoute.length > 1) {
      const objective = getCurrentObjective(current.level, current.state);
      if (objective) {
        drawYarn(yarn, pathPoints(current.level, current.draftRoute, width, height), objective.color, current.highContrast, current.previewValid === false ? 0.6 : 0.88, true);
      }
    }
    stage.addChild(yarn);

    if (!current.reducedMotion && current.state.routes.length) {
      const fiber = new Graphics();
      const last = current.state.routes.at(-1)!;
      const points = pathPoints(current.level, last.nodeIds, width, height);
      const progress = (elapsedRef.current * 0.00028 + current.animationToken * 0.17) % 1;
      const segment = Math.min(points.length - 2, Math.floor(progress * (points.length - 1)));
      const local = progress * (points.length - 1) - segment;
      const from = points[segment];
      const to = points[segment + 1];
      const x = from.x + (to.x - from.x) * local;
      const y = from.y + (to.y - from.y) * local;
      fiber.beginFill(yarnColors[last.color].light, 0.95);
      fiber.drawCircle(x, y, 5);
      fiber.endFill();
      fiber.beginFill(0xffffff, 0.8);
      fiber.drawCircle(x - 1, y - 1, 1.7);
      fiber.endFill();
      stage.addChild(fiber);
    }

    const nodes = new Graphics();
    for (const point of current.level.nodes) {
      drawNode(
        nodes,
        point.kind,
        point.x * width,
        point.y * height,
        point.color,
        current.draftRoute.includes(point.id),
        current.highContrast
      );
    }
    stage.addChild(nodes);
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
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.zIndex = "1";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "none";
    host.appendChild(canvas);

    const resize = () => {
      app.renderer.resize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight));
      drawRef.current();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const onPointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (app.screen.width / rect.width);
      const y = (event.clientY - rect.top) * (app.screen.height / rect.height);
      const current = propsRef.current;
      const radius = Math.max(32, Math.min(app.screen.width, app.screen.height) * 0.09);
      const nearest = current.level.nodes
        .map((node) => ({ node, distance: Math.hypot(node.x * app.screen.width - x, node.y * app.screen.height - y) }))
        .filter((candidate) => candidate.distance <= radius)
        .sort((a, b) => a.distance - b.distance)[0];
      if (nearest) current.onNodeSelect(nearest.node.id);
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    const tick = () => {
      const current = propsRef.current;
      if (!current.reducedMotion && (current.state.routes.length || current.guidedNodeId)) {
        elapsedRef.current += app.ticker.deltaMS;
        drawRef.current();
      }
    };
    app.ticker.add(tick);
    return () => {
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      app.ticker.remove(tick);
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    drawRef.current();
  }, [props.level, props.state, props.draftRoute, props.previewValid, props.reducedMotion, props.highContrast, props.animationToken]);

  return (
    <div ref={hostRef} className="crochet-stage" aria-label="Interactive stitch board">
      <img className="crochet-stage-atmosphere" src="/assets/crochet/craft-table-atmosphere-v1.png" alt="" aria-hidden="true" />
      <div className="crochet-stage-label" aria-hidden="true">Craft table · magnetic stitch board</div>
      <div className="crochet-targets" aria-label="Stitch points">
        {props.level.nodes.map((node) => (
          <button
            key={node.id}
            className={"crochet-target crochet-target-" + node.kind + (props.draftRoute.includes(node.id) ? " selected" : "") + (props.guidedNodeId === node.id ? " guided" : "")}
            style={{ left: (node.x * 100).toFixed(2) + "%", top: (node.y * 100).toFixed(2) + "%" }}
            type="button"
            onClick={() => props.onNodeSelect(node.id)}
            aria-label={node.symbol + ", " + node.label + (node.color ? ", " + node.color + " yarn" : "") + (props.guidedNodeId === node.id ? ", next guided step" : "")}
          >
            <span aria-hidden="true">{node.symbol}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
