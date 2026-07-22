import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  OWNER_PRESENTATION,
  describePost,
  isPostInspected,
  isPostLocked,
  occupiedUnits,
  postById,
  tagById,
  visibleVariant,
  type MoveCommand,
  type ParadeState,
  type PetParadeLevel,
  type PostDefinition,
  type TagDefinition,
  type TagOwner
} from "@teammultiply/pet-parade-sort";

export interface PetParadeStageProps {
  level: PetParadeLevel;
  state: ParadeState;
  selectedPostId: string | null;
  hintMove: MoveCommand | null;
  coachTargetId?: string | null;
  coachTargetLabel?: string;
  coachPhase?: "source" | "destination" | "reset" | null;
  animationToken: number;
  reducedMotion: boolean;
  reducedEffects: boolean;
  highContrast: boolean;
  onPostActivate: (postId: string) => void;
  onMoveRequest: (from: string, to: string) => void;
}

interface PostPosition {
  id: string;
  x: number;
  baseY: number;
  width: number;
  height: number;
}

interface DragVisual {
  postId: string;
  x: number;
  y: number;
  tilt: number;
}

const layoutPosts = (level: PetParadeLevel, width: number, height: number): PostPosition[] => {
  const count = level.posts.length;
  const compact = width < 620;
  const columns = compact ? Math.min(5, count) : count > 8 ? Math.ceil(count / 2) : count;
  const rows = Math.ceil(count / columns);
  const cellWidth = width * 0.92 / columns;
  const postWidth = Math.min(compact ? 60 : 76, cellWidth * 0.78);
  const usableTop = compact ? height * 0.22 : height * 0.2;
  const usableBottom = height * 0.92;
  const rowHeight = (usableBottom - usableTop) / rows;
  return level.posts.map((post, index) => {
    const row = Math.floor(index / columns);
    const rowCount = Math.min(columns, count - row * columns);
    const column = index % columns;
    const x = width * 0.5 + (column - (rowCount - 1) / 2) * cellWidth;
    const baseY = usableTop + rowHeight * (row + 1) - rowHeight * 0.08;
    return { id: post.id, x, baseY, width: postWidth, height: rowHeight * 0.8 };
  });
};

const shade = (color: number, factor: number) => {
  const red = Math.max(0, Math.min(255, Math.round(((color >> 16) & 255) * factor)));
  const green = Math.max(0, Math.min(255, Math.round(((color >> 8) & 255) * factor)));
  const blue = Math.max(0, Math.min(255, Math.round((color & 255) * factor)));
  return (red << 16) | (green << 8) | blue;
};

const drawTagSilhouette = (graphic: Graphics, tag: TagDefinition, width: number, height: number) => {
  if (tag.edge === "diamond") {
    graphic.drawPolygon([0, -height / 2, width / 2, 0, 0, height / 2, -width / 2, 0]);
  } else if (tag.edge === "hex" || tag.edge === "shield") {
    graphic.drawPolygon([
      -width * 0.35, -height / 2, width * 0.35, -height / 2, width / 2, -height * 0.08,
      width * 0.28, height / 2, -width * 0.28, height / 2, -width / 2, -height * 0.08
    ]);
  } else if (tag.edge === "gear") {
    const points: number[] = [];
    for (let index = 0; index < 16; index += 1) {
      const angle = -Math.PI / 2 + index * Math.PI / 8;
      const radiusX = width * (index % 2 ? 0.43 : 0.5);
      const radiusY = height * (index % 2 ? 0.43 : 0.5);
      points.push(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY);
    }
    graphic.drawPolygon(points);
  } else if (tag.edge === "scallop") {
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, Math.min(17, width * 0.26));
  } else {
    graphic.drawRoundedRect(-width / 2, -height / 2, width, height, Math.min(12, width * 0.2));
  }
};

const addCenteredText = (container: Container, value: string, size: number, color: number, y = 0, weight: "700" | "800" = "700", x = 0) => {
  const text = new Text(value, new TextStyle({
    fontFamily: "Segoe UI, Arial, sans-serif",
    fontSize: size,
    fontWeight: weight,
    fill: color,
    align: "center",
    dropShadow: true,
    dropShadowColor: 0x1d1713,
    dropShadowAlpha: 0.28,
    dropShadowDistance: 1
  }));
  text.anchor.set(0.5);
  text.x = x;
  text.y = y;
  container.addChild(text);
};

const drawOwnerPortrait = (container: Container, owner: TagOwner, width: number, height: number) => {
  const portrait = new Graphics();
  const x = -width * 0.2;
  const y = height * 0.02;
  const radius = Math.max(4.5, Math.min(width, height) * 0.13);
  portrait.lineStyle(Math.max(1.1, width * 0.022), 0xfff6df, 0.94);
  portrait.beginFill(0x372b24, 0.18);
  portrait.drawCircle(x, y, radius);
  if (owner === "cat" || owner === "fox") {
    portrait.drawPolygon([x - radius * 0.82, y - radius * 0.48, x - radius * 0.55, y - radius * 1.35, x - radius * 0.08, y - radius * 0.72]);
    portrait.drawPolygon([x + radius * 0.82, y - radius * 0.48, x + radius * 0.55, y - radius * 1.35, x + radius * 0.08, y - radius * 0.72]);
  } else if (owner === "dog") {
    portrait.drawEllipse(x - radius * 0.92, y - radius * 0.2, radius * 0.3, radius * 0.72);
    portrait.drawEllipse(x + radius * 0.92, y - radius * 0.2, radius * 0.3, radius * 0.72);
  } else if (owner === "rabbit") {
    portrait.drawEllipse(x - radius * 0.4, y - radius * 1.15, radius * 0.24, radius * 0.75);
    portrait.drawEllipse(x + radius * 0.4, y - radius * 1.15, radius * 0.24, radius * 0.75);
  } else if (owner === "hamster") {
    portrait.drawCircle(x - radius * 0.68, y - radius * 0.48, radius * 0.32);
    portrait.drawCircle(x + radius * 0.68, y - radius * 0.48, radius * 0.32);
  } else if (owner === "parrot") {
    portrait.drawPolygon([x + radius * 0.48, y, x + radius * 1.18, y + radius * 0.2, x + radius * 0.48, y + radius * 0.42]);
  }
  portrait.endFill();
  portrait.beginFill(0x211914, 0.92);
  portrait.drawCircle(x - radius * 0.34, y - radius * 0.12, Math.max(1, radius * 0.11));
  portrait.drawCircle(x + radius * 0.34, y - radius * 0.12, Math.max(1, radius * 0.11));
  portrait.drawCircle(x, y + radius * 0.28, Math.max(1, radius * 0.1));
  portrait.endFill();
  container.addChild(portrait);
};

const drawTag = (
  parent: Container,
  level: PetParadeLevel,
  state: ParadeState,
  tagId: string,
  x: number,
  y: number,
  width: number,
  unitHeight: number,
  highContrast: boolean,
  selected: boolean
) => {
  const tag = tagById(level, tagId)!;
  const presentation = OWNER_PRESENTATION[tag.owner];
  const height = tag.size === 2 ? unitHeight * 1.5 : unitHeight;
  const container = new Container();
  container.x = x;
  container.y = y;

  const contact = new Graphics();
  contact.beginFill(0x17120f, 0.34);
  contact.drawEllipse(3, height * 0.48, width * 0.48, Math.max(4, height * 0.13));
  contact.endFill();
  container.addChild(contact);

  const thickness = new Graphics();
  thickness.beginFill(shade(presentation.color, 0.48), 1);
  drawTagSilhouette(thickness, tag, width, height);
  thickness.endFill();
  thickness.y = 5;
  container.addChild(thickness);

  const rim = new Graphics();
  rim.lineStyle(highContrast ? 5 : selected ? 5 : 3.5, selected ? 0xffe58f : highContrast ? 0xffffff : 0xd8ad58, 1);
  rim.beginFill(presentation.color, 1);
  drawTagSilhouette(rim, tag, width, height);
  rim.endFill();
  container.addChild(rim);

  const enamel = new Graphics();
  enamel.lineStyle(1.25, highContrast ? 0xffffff : shade(presentation.color, 1.42), 0.92);
  enamel.beginFill(shade(presentation.color, 1.08), 0.74);
  if (tag.edge === "diamond") enamel.drawPolygon([0, -height * 0.34, width * 0.34, 0, 0, height * 0.34, -width * 0.34, 0]);
  else enamel.drawRoundedRect(-width * 0.38, -height * 0.34, width * 0.76, height * 0.68, Math.min(9, width * 0.15));
  enamel.endFill();
  enamel.lineStyle(2, 0xffffff, 0.42);
  enamel.moveTo(-width * 0.26, -height * 0.22);
  enamel.lineTo(width * 0.22, -height * 0.3);
  enamel.lineStyle(1, 0xffffff, 0.2);
  enamel.moveTo(-width * 0.18, height * 0.2);
  enamel.lineTo(width * 0.08, height * 0.1);
  enamel.moveTo(width * 0.02, height * 0.28);
  enamel.lineTo(width * 0.28, height * 0.18);
  container.addChild(enamel);

  const hole = new Graphics();
  hole.lineStyle(2, 0xf5d88c, 1);
  hole.beginFill(0x46382c, 1);
  hole.drawCircle(0, -height * 0.36, Math.max(3.2, width * 0.065));
  hole.endFill();
  container.addChild(hole);

  drawOwnerPortrait(container, tag.owner, width, height);
  addCenteredText(container, presentation.symbol, Math.max(13, width * 0.28), 0xfff9e9, height * 0.02, "700", width * 0.16);
  const variant = visibleVariant(level, state, tagId).replace("-reverse", " ↺");
  addCenteredText(container, variant === "nameplate" ? "ID" : variant === "stripe" ? "II" : variant === "star" ? "+" : variant === "bell" ? "•" : "—", Math.max(8, width * 0.14), 0x30231c, height * 0.27, "800");
  if (tag.linkedGroup) {
    const link = new Graphics();
    link.lineStyle(2.5, 0xffedb3, 1);
    link.drawCircle(width * 0.34, -height * 0.26, Math.max(4, width * 0.08));
    container.addChild(link);
  }
  if (tag.doubleSided) {
    addCenteredText(container, "↻", Math.max(10, width * 0.17), 0xffffff, -height * 0.23, "800");
  }
  parent.addChild(container);
  return container;
};

const drawPost = (
  parent: Container,
  level: PetParadeLevel,
  state: ParadeState,
  post: PostDefinition,
  position: PostPosition,
  selectedPostId: string | null,
  hintMove: MoveCommand | null,
  highContrast: boolean,
  motionProgress: number
) => {
  const stack = state.stacks[post.id] ?? [];
  const selected = selectedPostId === post.id;
  const hintedSource = hintMove?.from === post.id;
  const hintedDestination = hintMove?.to === post.id;
  const inspected = isPostInspected(state, post.id);
  const locked = isPostLocked(level, state, post.id);
  const holder = new Container();
  holder.x = position.x;
  holder.y = position.baseY;
  if (selected && motionProgress > 0) holder.rotation = Math.sin(motionProgress * Math.PI * 2) * 0.012;
  parent.addChild(holder);

  const unitHeight = Math.min(46, Math.max(30, position.height / Math.max(5.2, post.capacity + 0.8)));
  const strapHeight = unitHeight * (post.capacity + 0.8);
  const strap = new Graphics();
  strap.beginFill(0x21150f, 0.3);
  strap.drawRoundedRect(-position.width * 0.25 + 5, -strapHeight + 8, position.width * 0.5, strapHeight + 13, 10);
  strap.endFill();
  strap.lineStyle(highContrast ? 3.5 : 2, highContrast ? 0xffffff : 0x805633, 1);
  strap.beginFill(post.kind === "foster" ? 0x425f58 : 0x8f6038, 1);
  strap.drawRoundedRect(-position.width * 0.25, -strapHeight, position.width * 0.5, strapHeight, 9);
  strap.endFill();
  strap.lineStyle(1.5, 0xe8bd79, 0.7);
  for (let y = -strapHeight + 9; y < -7; y += 8) {
    strap.moveTo(-position.width * 0.19, y);
    strap.lineTo(position.width * 0.19, y + 5);
  }
  holder.addChild(strap);

  const base = new Graphics();
  base.beginFill(0x1b120d, 0.4);
  base.drawEllipse(3, 8, position.width * 0.56, 10);
  base.endFill();
  base.lineStyle(selected || hintedSource || hintedDestination ? 4 : 2.5, selected ? 0xffe58f : hintedSource ? 0xff9d72 : hintedDestination ? 0x86e5c8 : 0xc38a45, 1);
  base.beginFill(0x573a28, 1);
  base.drawRoundedRect(-position.width * 0.48, -7, position.width * 0.96, 17, 7);
  base.endFill();
  holder.addChild(base);

  const capacity = new Graphics();
  for (let index = 0; index < post.capacity; index += 1) {
    const y = -unitHeight * (index + 0.66);
    capacity.lineStyle(1.2, highContrast ? 0xffffff : 0xf4d3a1, 0.52);
    capacity.drawCircle(position.width * 0.34, y, 2.8);
  }
  holder.addChild(capacity);

  let cursorY = -unitHeight * 0.62;
  for (const tagId of stack) {
    const tag = tagById(level, tagId)!;
    const tagHeight = tag.size === 2 ? unitHeight * 1.5 : unitHeight;
    drawTag(holder, level, state, tagId, 0, cursorY - (tagHeight - unitHeight) * 0.48, position.width * 0.82, unitHeight * 0.86, highContrast, selected && tagId === stack.at(-1));
    cursorY -= tag.size * unitHeight;
  }

  if (locked || inspected) {
    const block = new Graphics();
    block.beginFill(0x181312, 0.58);
    block.drawRoundedRect(-position.width * 0.47, -strapHeight, position.width * 0.94, strapHeight + 10, 12);
    block.endFill();
    block.lineStyle(3, inspected ? 0xf1a36f : 0xf2d28c, 1);
    block.drawRoundedRect(-position.width * 0.43, -strapHeight + 4, position.width * 0.86, strapHeight + 2, 10);
    holder.addChild(block);
    addCenteredText(holder, inspected ? "CAT" : "LOCK", Math.max(11, position.width * 0.2), 0xfff2d5, -strapHeight * 0.52, "800");
    if (inspected) addCenteredText(holder, String(state.activeInspection?.remainingMoves ?? 0), Math.max(18, position.width * 0.34), 0xffb383, -strapHeight * 0.33, "800");
  }

  if (post.kind === "foster") {
    const owners = (post.acceptsOwners ?? []).map((owner) => OWNER_PRESENTATION[owner].symbol).join(" ");
    addCenteredText(holder, owners, Math.max(11, position.width * 0.18), 0xdaf8ec, 25, "800");
  } else {
    addCenteredText(holder, `${occupiedUnits(level, stack)}/${post.capacity}`, Math.max(10, position.width * 0.16), 0xffefd3, 24, "700");
  }
};

const drawArrivedPets = (parent: Container, state: ParadeState, width: number, highContrast: boolean) => {
  const owners = [...new Set(state.arrivedPetIds)] as TagOwner[];
  owners.slice(-6).forEach((owner, index) => {
    const x = width - 32 - index * 43;
    const pet = new Graphics();
    const color = OWNER_PRESENTATION[owner].color;
    pet.beginFill(0x181210, 0.28);
    pet.drawEllipse(x + 2, 48, 17, 6);
    pet.endFill();
    pet.lineStyle(2, highContrast ? 0xffffff : 0xffe8b6, 1);
    pet.beginFill(shade(color, 1.25), 1);
    pet.drawCircle(x, 32, 15);
    if (owner === "cat" || owner === "fox") {
      pet.drawPolygon([x - 12, 23, x - 8, 7, x - 1, 19]);
      pet.drawPolygon([x + 12, 23, x + 8, 7, x + 1, 19]);
    } else if (owner === "rabbit") {
      pet.drawEllipse(x - 7, 9, 4, 14);
      pet.drawEllipse(x + 7, 9, 4, 14);
    }
    pet.endFill();
    pet.beginFill(0x231c18, 1);
    pet.drawCircle(x - 5, 30, 1.8);
    pet.drawCircle(x + 5, 30, 1.8);
    pet.endFill();
    parent.addChild(pet);
  });
};

const drawChapterDressing = (parent: Container, level: PetParadeLevel, width: number, height: number) => {
  const props = new Graphics();
  const chapter = level.chapterNumber;
  const right = width * 0.88;
  const top = height * 0.13;
  if (chapter <= 1) {
    props.lineStyle(2, 0xe4bd77, 0.8);
    props.beginFill(0x6b4933, 0.78);
    props.drawRoundedRect(right - width * 0.12, top, width * 0.13, height * 0.15, 6);
    props.endFill();
    props.lineStyle(1.5, 0xffedc7, 0.72);
    for (let index = 0; index < 3; index += 1) {
      props.moveTo(right - width * 0.095, top + height * (0.045 + index * 0.03));
      props.lineTo(right - width * 0.015, top + height * (0.045 + index * 0.03));
    }
  } else if (chapter === 2) {
    const towelColors = [0xc96f5c, 0x3b8e8b, 0xe0c492, 0x5f7d5a];
    towelColors.forEach((color, index) => {
      props.beginFill(color, 0.82);
      props.drawRoundedRect(right - width * 0.13, top + index * height * 0.035, width * 0.14, height * 0.03, 5);
      props.endFill();
      props.lineStyle(1, 0xfff1d0, 0.35);
      props.moveTo(right - width * 0.115, top + index * height * 0.035 + height * 0.014);
      props.lineTo(right - width * 0.005, top + index * height * 0.035 + height * 0.014);
    });
  } else if (chapter === 3) {
    props.lineStyle(2, 0xe8c07a, 0.76);
    props.beginFill(0x49382f, 0.72);
    props.drawRoundedRect(right - width * 0.14, top, width * 0.15, height * 0.16, 7);
    props.endFill();
    const colors = [0xdf6a61, 0x2f8c98, 0xd9a43b, 0x9a5a92, 0x6d9954, 0x496ca7];
    colors.forEach((color, index) => {
      props.beginFill(color, 0.92);
      props.drawCircle(right - width * (0.11 - (index % 3) * 0.045), top + height * (0.045 + Math.floor(index / 3) * 0.065), Math.max(4, width * 0.007));
      props.endFill();
    });
  } else if (chapter === 4) {
    const swatches = [0xe56d61, 0x168d8a, 0xd9a43b, 0x9a5a92];
    swatches.forEach((color, index) => {
      const x = right - width * 0.15 + index * width * 0.04;
      props.lineStyle(1.5, 0xffefd0, 0.7);
      props.beginFill(color, 0.8);
      props.drawRoundedRect(x, top + (index % 2) * height * 0.025, width * 0.035, height * 0.13, 4);
      props.endFill();
      props.lineStyle(1, 0xffefd0, 0.36);
      for (let line = 0; line < 4; line += 1) {
        props.moveTo(x + width * 0.006, top + height * (0.02 + line * 0.025));
        props.lineTo(x + width * 0.028, top + height * (0.03 + line * 0.025));
      }
    });
  } else if (chapter === 5) {
    props.lineStyle(Math.max(3, width * 0.006), 0x4d6f3f, 0.82);
    props.moveTo(right + width * 0.03, top - height * 0.06);
    props.lineTo(right - width * 0.1, top + height * 0.15);
    for (let index = 0; index < 7; index += 1) {
      props.beginFill(index % 2 ? 0x73935b : 0x4f7f4f, 0.82);
      props.drawEllipse(right - width * (0.005 + index * 0.018), top + height * (-0.015 + index * 0.028), width * 0.014, height * 0.022);
      props.endFill();
    }
  } else {
    props.lineStyle(2, 0xe1bb72, 0.78);
    props.moveTo(width * 0.64, top);
    props.lineTo(width * 0.94, top + height * 0.04);
    for (let index = 0; index < 6; index += 1) {
      const x = width * (0.66 + index * 0.052);
      const y = top + height * (0.006 + index * 0.007);
      props.beginFill(index % 2 ? 0xe56d61 : 0xf2cf7a, 0.92);
      props.drawCircle(x, y, Math.max(3, width * 0.005));
      props.endFill();
    }
  }
  parent.addChild(props);
};

export const PetParadeStage = (props: PetParadeStageProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const propsRef = useRef(props);
  const layoutRef = useRef<PostPosition[]>([]);
  const dragStartRef = useRef<string | null>(null);
  const dragVisualRef = useRef<DragVisual | null>(null);
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const animationStartedRef = useRef(0);
  const drawRef = useRef<() => void>(() => undefined);
  const [stageSize, setStageSize] = useState({ width: 900, height: 560 });
  propsRef.current = props;

  const buttonLayout = useMemo(
    () => layoutPosts(props.level, stageSize.width, stageSize.height),
    [props.level, stageSize]
  );

  drawRef.current = () => {
    const app = appRef.current;
    if (!app) return;
    const current = propsRef.current;
    const width = app.screen.width;
    const height = app.screen.height;
    const stage = app.stage;
    stage.removeChildren().forEach((child) => child.destroy({ children: true }));
    const elapsed = performance.now() - animationStartedRef.current;
    const motionProgress = current.reducedMotion ? 0 : Math.max(0, Math.min(1, 1 - elapsed / 620));

    const wash = new Graphics();
    const chapterTints = [0x233830, 0x29444a, 0x44352e, 0x3d2e48, 0x243c2b, 0x221e2e, 0x23384a];
    wash.beginFill(chapterTints[Math.min(chapterTints.length - 1, current.level.chapterNumber)] ?? 0x233830, current.highContrast ? 0.54 : 0.22);
    wash.drawRect(0, 0, width, height);
    wash.endFill();
    wash.beginFill(0x16110e, 0.25);
    wash.drawRoundedRect(width * 0.025, height * 0.055, width * 0.95, height * 0.89, 24);
    wash.endFill();
    wash.lineStyle(current.highContrast ? 4 : 2, current.highContrast ? 0xffffff : 0xe8c78d, current.highContrast ? 0.95 : 0.64);
    wash.drawRoundedRect(width * 0.035, height * 0.065, width * 0.93, height * 0.87, 21);
    stage.addChild(wash);
    drawChapterDressing(stage, current.level, width, height);

    layoutRef.current = layoutPosts(current.level, width, height);
    for (const position of layoutRef.current) {
      const post = postById(current.level, position.id)!;
      drawPost(stage, current.level, current.state, post, position, current.selectedPostId, current.hintMove, current.highContrast, motionProgress);
    }
    const dragVisual = dragVisualRef.current;
    if (dragVisual) {
      const position = layoutRef.current.find((candidate) => candidate.id === dragVisual.postId);
      const tagId = current.state.stacks[dragVisual.postId]?.at(-1);
      if (position && tagId) {
        const post = postById(current.level, dragVisual.postId)!;
        const unitHeight = Math.min(46, Math.max(30, position.height / Math.max(5.2, post.capacity + 0.8)));
        const ghost = drawTag(stage, current.level, current.state, tagId, dragVisual.x, dragVisual.y, position.width * 0.86, unitHeight * 0.9, current.highContrast, true);
        ghost.alpha = 0.94;
        ghost.rotation = dragVisual.tilt;
        ghost.scale.set(1.08);
      }
    }
    drawArrivedPets(stage, current.state, width, current.highContrast);

    if (!current.reducedEffects && motionProgress > 0) {
      const sparkles = new Graphics();
      sparkles.beginFill(0xffe09a, motionProgress * 0.75);
      for (let index = 0; index < 9; index += 1) {
        const angle = index * 2.3 + current.animationToken;
        sparkles.drawCircle(width * 0.5 + Math.cos(angle) * width * 0.38, height * 0.5 + Math.sin(angle * 1.2) * height * 0.32, 1.5 + (index % 3));
      }
      sparkles.endFill();
      stage.addChild(sparkles);
    }
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const app = new Application({
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 3)
    });
    appRef.current = app;
    const canvas = app.view as HTMLCanvasElement;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "none";
    host.appendChild(canvas);

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      app.renderer.resize(width, height);
      setStageSize((current) => current.width === width && current.height === height ? current : { width, height });
      drawRef.current();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const canvasPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (app.screen.width / rect.width),
        y: (event.clientY - rect.top) * (app.screen.height / rect.height)
      };
    };
    const nearestPost = (event: PointerEvent) => {
      const { x, y } = canvasPoint(event);
      return layoutRef.current
        .map((position) => ({ position, distance: Math.hypot(position.x - x, position.baseY - position.height * 0.4 - y) }))
        .filter(({ position, distance }) => distance <= Math.max(58, position.width * 0.95))
        .sort((left, right) => left.distance - right.distance)[0]?.position.id ?? null;
    };
    const onPointerDown = (event: PointerEvent) => {
      dragStartRef.current = nearestPost(event);
      if (dragStartRef.current) {
        const point = canvasPoint(event);
        dragVisualRef.current = { postId: dragStartRef.current, x: point.x, y: point.y, tilt: 0 };
        canvas.setPointerCapture(event.pointerId);
        drawRef.current();
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      const visual = dragVisualRef.current;
      if (!visual) return;
      const point = canvasPoint(event);
      dragVisualRef.current = {
        ...visual,
        x: point.x,
        y: point.y,
        tilt: Math.max(-0.16, Math.min(0.16, (point.x - visual.x) * 0.012))
      };
      drawRef.current();
    };
    const onPointerUp = (event: PointerEvent) => {
      const start = dragStartRef.current;
      const end = nearestPost(event);
      dragStartRef.current = null;
      dragVisualRef.current = null;
      drawRef.current();
      if (!start) return;
      if (end && end !== start) propsRef.current.onMoveRequest(start, end);
      else propsRef.current.onPostActivate(start);
    };
    const onPointerCancel = () => {
      dragStartRef.current = null;
      dragVisualRef.current = null;
      drawRef.current();
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);
    const ticker = () => {
      if (!propsRef.current.reducedMotion && performance.now() - animationStartedRef.current < 660) drawRef.current();
    };
    app.ticker.add(ticker);
    return () => {
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      app.ticker.remove(ticker);
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    animationStartedRef.current = performance.now();
    drawRef.current();
  }, [props.level, props.state, props.selectedPostId, props.hintMove, props.animationToken, props.reducedMotion, props.reducedEffects, props.highContrast]);

  const stagePoint = (clientX: number, clientY: number) => {
    const rect = hostRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left) * (stageSize.width / rect.width),
      y: (clientY - rect.top) * (stageSize.height / rect.height)
    };
  };

  const nearestPostAt = (clientX: number, clientY: number) => {
    const point = stagePoint(clientX, clientY);
    return buttonLayout
      .map((position) => ({ position, distance: Math.hypot(position.x - point.x, position.baseY - position.height * 0.4 - point.y) }))
      .filter(({ position, distance }) => distance <= Math.max(58, position.width * 0.95))
      .sort((left, right) => left.distance - right.distance)[0]?.position.id ?? null;
  };

  return (
    <div ref={hostRef} className="parade-stage" aria-label="Pet tag sorting organizer">
      <img className="parade-stage-atmosphere" src="/assets/pet-parade/grooming-room-atmosphere-v1.webp" alt="" aria-hidden="true" />
      <div className="parade-stage-label" aria-hidden="true">{props.level.setting} · collar organizer</div>
      <div className="parade-post-targets" aria-label="Collar posts">
        {buttonLayout.map((position) => (
          <button
            key={position.id}
            type="button"
            className={[
              props.selectedPostId === position.id ? "selected" : "",
              props.hintMove?.from === position.id ? "hint-source" : "",
              props.hintMove?.to === position.id ? "hint-destination" : "",
              props.coachTargetId === position.id ? `coach-target coach-${props.coachPhase ?? "source"}` : ""
            ].filter(Boolean).join(" ")}
            style={{
              left: `${(position.x / stageSize.width * 100).toFixed(2)}%`,
              top: `${Math.max(0, (position.baseY - position.height) / stageSize.height * 100).toFixed(2)}%`,
              width: `${Math.max(11, position.width / stageSize.width * 100).toFixed(2)}%`,
              height: `${(position.height / stageSize.height * 100).toFixed(2)}%`
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              const point = stagePoint(event.clientX, event.clientY);
              dragStartRef.current = position.id;
              dragOriginRef.current = point;
              dragVisualRef.current = { postId: position.id, x: point.x, y: point.y, tilt: 0 };
              event.currentTarget.setPointerCapture(event.pointerId);
              drawRef.current();
            }}
            onPointerMove={(event) => {
              const visual = dragVisualRef.current;
              if (!visual || dragStartRef.current !== position.id) return;
              const point = stagePoint(event.clientX, event.clientY);
              dragVisualRef.current = {
                ...visual,
                x: point.x,
                y: point.y,
                tilt: Math.max(-0.16, Math.min(0.16, (point.x - visual.x) * 0.012))
              };
              drawRef.current();
            }}
            onPointerUp={(event) => {
              const start = dragStartRef.current;
              const origin = dragOriginRef.current;
              const point = stagePoint(event.clientX, event.clientY);
              const end = nearestPostAt(event.clientX, event.clientY);
              const dragged = Boolean(origin && Math.hypot(point.x - origin.x, point.y - origin.y) > 8);
              dragStartRef.current = null;
              dragOriginRef.current = null;
              dragVisualRef.current = null;
              drawRef.current();
              if (!dragged || !start) return;
              suppressClickRef.current = true;
              if (end && end !== start) props.onMoveRequest(start, end);
            }}
            onPointerCancel={() => {
              dragStartRef.current = null;
              dragOriginRef.current = null;
              dragVisualRef.current = null;
              suppressClickRef.current = false;
              drawRef.current();
            }}
            onClick={() => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false;
                return;
              }
              props.onPostActivate(position.id);
            }}
            aria-pressed={props.selectedPostId === position.id}
            aria-current={props.coachTargetId === position.id ? "step" : undefined}
            aria-label={`${props.coachTargetId === position.id ? `Guided action: ${props.coachTargetLabel}. ` : ""}${describePost(props.level, props.state, position.id)}`}
          >
            {props.coachTargetId === position.id && <span className="parade-coach-badge" aria-hidden="true">{props.coachTargetLabel}</span>}
            <span className="sr-only">{describePost(props.level, props.state, position.id)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
