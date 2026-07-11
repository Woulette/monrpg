import * as Phaser from "phaser";
import { TILE_SIZE, TerrainTile, type WorldObjectKind } from "@pixel-realms/game-core";
import type { Direction, PlayerAppearance } from "@pixel-realms/protocol";

export const TERRAIN_TEXTURE_KEY = "terrain-tiles";
const PLAYER_FRAME_WIDTH = 24;
const PLAYER_FRAME_HEIGHT = 34;

const TERRAIN_COLORS = {
  grass: "#397a43",
  grassLight: "#4a9253",
  grassDark: "#2d6937",
  flowerA: "#f5d76e",
  flowerB: "#e78a9d",
  dirt: "#9a6a42",
  dirtLight: "#b98553",
  dirtDark: "#765033",
  stone: "#7d8791",
  stoneLight: "#9ca5ac",
  stoneDark: "#626c76",
  water: "#2879a8",
  waterLight: "#45a7ca",
  waterDark: "#1f608e",
  sand: "#c9ae67",
  sandLight: "#dbc47e",
  bridge: "#8a5a35",
  bridgeLight: "#b27843",
  bridgeDark: "#5e3b25",
} as const;

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) context.imageSmoothingEnabled = false;
  return canvas;
}

function cssColor(value: number): string {
  return `#${value.toString(16).padStart(6, "0")}`;
}

function rect(
  context: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
}

function drawTerrainTile(
  context: CanvasRenderingContext2D,
  tile: TerrainTile,
  offsetX: number,
): void {
  const x = offsetX;
  const y = 0;

  if (tile === TerrainTile.Grass || tile === TerrainTile.FlowerGrass) {
    rect(context, TERRAIN_COLORS.grass, x, y, TILE_SIZE, TILE_SIZE);
    rect(context, TERRAIN_COLORS.grassLight, x + 3, y + 6, 3, 2);
    rect(context, TERRAIN_COLORS.grassDark, x + 23, y + 20, 4, 2);
    rect(context, TERRAIN_COLORS.grassDark, x + 11, y + 27, 2, 3);
    rect(context, TERRAIN_COLORS.grassLight, x + 27, y + 4, 2, 3);
    if (tile === TerrainTile.FlowerGrass) {
      rect(context, TERRAIN_COLORS.flowerA, x + 8, y + 12, 2, 2);
      rect(context, TERRAIN_COLORS.flowerB, x + 20, y + 8, 2, 2);
      rect(context, "#f4f0df", x + 16, y + 24, 2, 2);
    }
    return;
  }

  if (tile === TerrainTile.Dirt) {
    rect(context, TERRAIN_COLORS.dirt, x, y, TILE_SIZE, TILE_SIZE);
    rect(context, TERRAIN_COLORS.dirtLight, x + 4, y + 5, 5, 2);
    rect(context, TERRAIN_COLORS.dirtDark, x + 20, y + 22, 4, 3);
    rect(context, TERRAIN_COLORS.dirtLight, x + 13, y + 16, 2, 2);
    return;
  }

  if (tile === TerrainTile.Stone) {
    rect(context, TERRAIN_COLORS.stone, x, y, TILE_SIZE, TILE_SIZE);
    context.strokeStyle = TERRAIN_COLORS.stoneDark;
    context.lineWidth = 1;
    context.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
    context.beginPath();
    context.moveTo(x + 16, y);
    context.lineTo(x + 16, y + TILE_SIZE);
    context.moveTo(x, y + 16);
    context.lineTo(x + TILE_SIZE, y + 16);
    context.stroke();
    rect(context, TERRAIN_COLORS.stoneLight, x + 3, y + 3, 5, 2);
    return;
  }

  if (tile === TerrainTile.Water) {
    rect(context, TERRAIN_COLORS.water, x, y, TILE_SIZE, TILE_SIZE);
    rect(context, TERRAIN_COLORS.waterLight, x + 2, y + 7, 12, 2);
    rect(context, TERRAIN_COLORS.waterDark, x + 16, y + 19, 13, 2);
    rect(context, TERRAIN_COLORS.waterLight, x + 9, y + 28, 8, 1);
    return;
  }

  if (tile === TerrainTile.Bridge) {
    rect(context, TERRAIN_COLORS.bridge, x, y, TILE_SIZE, TILE_SIZE);
    for (let plank = 0; plank < 4; plank += 1) {
      const plankY = y + plank * 8;
      rect(context, TERRAIN_COLORS.bridgeLight, x, plankY, TILE_SIZE, 2);
      rect(context, TERRAIN_COLORS.bridgeDark, x, plankY + 7, TILE_SIZE, 1);
    }
    rect(context, "#3d2a1c", x + 5, y + 5, 2, 2);
    rect(context, "#3d2a1c", x + 25, y + 21, 2, 2);
    return;
  }

  rect(context, TERRAIN_COLORS.sand, x, y, TILE_SIZE, TILE_SIZE);
  rect(context, TERRAIN_COLORS.sandLight, x + 4, y + 6, 6, 2);
  rect(context, "#aa914f", x + 20, y + 22, 5, 2);
}

export function ensureTerrainTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(TERRAIN_TEXTURE_KEY)) return;
  const tileCount = Object.keys(TerrainTile).length / 2;
  const canvas = createCanvas(TILE_SIZE * tileCount, TILE_SIZE);
  const context = canvas.getContext("2d");
  if (!context) return;

  for (let tile = 0; tile < tileCount; tile += 1) {
    drawTerrainTile(context, tile as TerrainTile, tile * TILE_SIZE);
  }

  const texture = scene.textures.addCanvas(TERRAIN_TEXTURE_KEY, canvas);
  texture?.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

const OBJECT_SIZES: Record<WorldObjectKind, { width: number; height: number }> = {
  tree: { width: 48, height: 64 },
  pine: { width: 48, height: 72 },
  rock: { width: 34, height: 24 },
  "house-blue": { width: 192, height: 160 },
  "house-red": { width: 192, height: 160 },
  sign: { width: 26, height: 38 },
  campfire: { width: 32, height: 30 },
  well: { width: 64, height: 58 },
};

export function objectTextureKey(kind: WorldObjectKind): string {
  return `object-${kind}`;
}

function drawHouse(
  context: CanvasRenderingContext2D,
  roofColor: string,
  width: number,
  height: number,
): void {
  rect(context, "#4c3527", 12, 54, width - 24, height - 54);
  rect(context, "#caa36d", 18, 62, width - 36, height - 72);
  rect(context, "#2d211a", width / 2 - 14, height - 47, 28, 47);
  rect(context, "#7e512f", width / 2 - 10, height - 43, 20, 43);
  rect(context, "#80c5d9", 37, 91, 28, 26);
  rect(context, "#e9dba4", 41, 95, 20, 18);
  rect(context, "#80c5d9", width - 65, 91, 28, 26);
  rect(context, "#e9dba4", width - 61, 95, 20, 18);
  rect(context, "#3a2a21", 34, 88, 34, 4);
  rect(context, "#3a2a21", width - 68, 88, 34, 4);

  context.fillStyle = roofColor;
  context.beginPath();
  context.moveTo(4, 62);
  context.lineTo(width / 2, 6);
  context.lineTo(width - 4, 62);
  context.closePath();
  context.fill();
  context.fillStyle = "#3b2731";
  context.fillRect(3, 60, width - 6, 8);
  rect(context, "rgba(255,255,255,0.16)", width / 2 - 52, 25, 72, 6);
  rect(context, "#665044", width - 50, 25, 20, 42);
  rect(context, "#8b715f", width - 46, 18, 12, 12);
}

function createObjectTexture(scene: Phaser.Scene, kind: WorldObjectKind): void {
  const key = objectTextureKey(kind);
  if (scene.textures.exists(key)) return;
  const size = OBJECT_SIZES[kind];
  const canvas = createCanvas(size.width, size.height);
  const context = canvas.getContext("2d");
  if (!context) return;

  if (kind === "tree") {
    rect(context, "#5b3b24", 21, 35, 8, 29);
    rect(context, "#1c4e2b", 5, 17, 38, 31);
    rect(context, "#286a39", 10, 8, 28, 31);
    rect(context, "#3f8a49", 17, 4, 17, 18);
    rect(context, "#153d22", 2, 29, 16, 14);
  } else if (kind === "pine") {
    rect(context, "#583a25", 21, 45, 7, 27);
    context.fillStyle = "#173f2c";
    context.beginPath();
    context.moveTo(24, 3);
    context.lineTo(3, 43);
    context.lineTo(45, 43);
    context.closePath();
    context.fill();
    context.fillStyle = "#235d3c";
    context.beginPath();
    context.moveTo(24, 15);
    context.lineTo(1, 56);
    context.lineTo(47, 56);
    context.closePath();
    context.fill();
    rect(context, "#3a7750", 22, 10, 5, 26);
  } else if (kind === "rock") {
    context.fillStyle = "#59616b";
    context.beginPath();
    context.moveTo(3, 22);
    context.lineTo(7, 8);
    context.lineTo(17, 2);
    context.lineTo(29, 7);
    context.lineTo(33, 22);
    context.closePath();
    context.fill();
    rect(context, "#8a949d", 10, 7, 10, 4);
    rect(context, "#444b53", 20, 15, 10, 7);
  } else if (kind === "house-blue") {
    drawHouse(context, "#3e668f", size.width, size.height);
  } else if (kind === "house-red") {
    drawHouse(context, "#8b4652", size.width, size.height);
  } else if (kind === "sign") {
    rect(context, "#5e3c22", 11, 15, 5, 23);
    rect(context, "#9d6b3d", 1, 3, 24, 18);
    rect(context, "#d0a264", 4, 6, 18, 3);
    rect(context, "#694725", 4, 14, 11, 3);
  } else if (kind === "campfire") {
    rect(context, "#5d3a25", 4, 22, 24, 5);
    rect(context, "#7d4b2d", 9, 18, 16, 5);
    context.fillStyle = "#e14d2a";
    context.beginPath();
    context.moveTo(16, 3);
    context.lineTo(8, 20);
    context.lineTo(24, 20);
    context.closePath();
    context.fill();
    context.fillStyle = "#ffd45f";
    context.beginPath();
    context.moveTo(16, 8);
    context.lineTo(12, 19);
    context.lineTo(21, 19);
    context.closePath();
    context.fill();
  } else if (kind === "well") {
    rect(context, "#5a4637", 8, 22, 48, 31);
    rect(context, "#8e989e", 4, 27, 56, 22);
    rect(context, "#b3bbc0", 8, 25, 48, 8);
    rect(context, "#25323a", 15, 34, 34, 13);
    rect(context, "#5f4028", 9, 4, 5, 25);
    rect(context, "#5f4028", 50, 4, 5, 25);
    rect(context, "#7d5230", 7, 3, 50, 5);
    context.fillStyle = "#6b4040";
    context.beginPath();
    context.moveTo(4, 8);
    context.lineTo(32, 0);
    context.lineTo(60, 8);
    context.closePath();
    context.fill();
  }

  const texture = scene.textures.addCanvas(key, canvas);
  texture?.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export function ensureObjectTextures(scene: Phaser.Scene): void {
  for (const kind of Object.keys(OBJECT_SIZES) as WorldObjectKind[]) {
    createObjectTexture(scene, kind);
  }
}

export function isLargeObject(kind: WorldObjectKind): boolean {
  return kind === "house-blue" || kind === "house-red" || kind === "well";
}

export function playerTextureKey(appearance: PlayerAppearance): string {
  return `player-${appearance.bodyTint.toString(16)}-${appearance.accentTint.toString(16)}`;
}

function drawPlayerFrame(
  context: CanvasRenderingContext2D,
  frameX: number,
  direction: Direction,
  walkFrame: number,
  appearance: PlayerAppearance,
): void {
  const x = frameX;
  const skin = "#e1b083";
  const hair = "#3a2a26";
  const outline = "#1b1b20";
  const body = cssColor(appearance.bodyTint);
  const accent = cssColor(appearance.accentTint);
  const legOffset = walkFrame === 0 ? 0 : 2;

  if (direction === "south" || direction === "north") {
    rect(context, outline, x + 6, 8, 12, 10);
    rect(context, direction === "south" ? skin : hair, x + 8, 9, 8, 8);
    rect(context, hair, x + 7, 7, 10, 4);
    rect(context, outline, x + 5, 17, 14, 12);
    rect(context, body, x + 7, 18, 10, 10);
    rect(context, accent, x + 7, 18, 10, 3);
    rect(context, outline, x + 5, 29, 6, 4);
    rect(context, outline, x + 13, 29, 6, 4);
    rect(context, "#60452f", x + 6, 29 + legOffset, 4, 4 - legOffset);
    rect(context, "#60452f", x + 14, 31 - legOffset, 4, 2 + legOffset);
    if (direction === "north") rect(context, accent, x + 7, 24, 10, 4);
    return;
  }

  const facingEast = direction === "east";
  const faceX = facingEast ? x + 10 : x + 6;
  rect(context, outline, x + 7, 8, 11, 10);
  rect(context, skin, faceX, 10, 7, 7);
  rect(context, hair, x + 7, 7, 10, 5);
  rect(context, outline, x + 6, 17, 12, 12);
  rect(context, body, x + 8, 18, 8, 10);
  rect(context, accent, facingEast ? x + 14 : x + 6, 19, 4, 8);
  rect(context, "#60452f", x + 7, 29 + legOffset, 4, 4 - legOffset);
  rect(context, "#60452f", x + 14, 31 - legOffset, 4, 2 + legOffset);
}

export function ensurePlayerTexture(
  scene: Phaser.Scene,
  appearance: PlayerAppearance,
): string {
  const key = playerTextureKey(appearance);
  if (scene.textures.exists(key)) return key;

  const directions: Direction[] = ["north", "south", "east", "west"];
  const frameCount = directions.length * 2;
  const canvas = createCanvas(PLAYER_FRAME_WIDTH * frameCount, PLAYER_FRAME_HEIGHT);
  const context = canvas.getContext("2d");
  if (!context) return key;

  let frame = 0;
  for (const direction of directions) {
    for (let walkFrame = 0; walkFrame < 2; walkFrame += 1) {
      drawPlayerFrame(
        context,
        frame * PLAYER_FRAME_WIDTH,
        direction,
        walkFrame,
        appearance,
      );
      frame += 1;
    }
  }

  const texture = scene.textures.addCanvas(key, canvas);
  if (texture) {
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    for (let index = 0; index < frameCount; index += 1) {
      texture.add(
        index,
        0,
        index * PLAYER_FRAME_WIDTH,
        0,
        PLAYER_FRAME_WIDTH,
        PLAYER_FRAME_HEIGHT,
      );
    }
  }
  return key;
}

export function playerFrame(direction: Direction, moving: boolean, time: number): number {
  const directionOffset: Record<Direction, number> = {
    north: 0,
    south: 2,
    east: 4,
    west: 6,
  };
  const walkFrame = moving ? Math.floor(time / 180) % 2 : 0;
  return directionOffset[direction] + walkFrame;
}
