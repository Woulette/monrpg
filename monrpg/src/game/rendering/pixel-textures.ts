import * as Phaser from "phaser";
import {
  TILE_SIZE,
  TerrainTile,
  type WorldObjectKind,
} from "@pixel-realms/game-core";
import type { Direction, PlayerAppearance } from "@pixel-realms/protocol";

export const TERRAIN_TEXTURE_KEY = "terrain-tiles";
export const STARTER_ADVENTURER_TEXTURE_KEY = "starter-adventurer";

const PLAYER_FRAME_WIDTH = 32;
const PLAYER_FRAME_HEIGHT = 48;
const PLAYER_FRAME_COUNT = 8;
const STARTER_ADVENTURER_ASSET =
  "/assets/characters/starter-adventurer.svg";

const TERRAIN_COLORS = {
  grass: "#4d8b4e",
  grassLight: "#66a765",
  grassDark: "#376d3d",
  dirt: "#a97649",
  dirtLight: "#c28e5c",
  dirtDark: "#805537",
  stone: "#879299",
  stoneLight: "#adb6bb",
  stoneDark: "#596269",
  water: "#2f83ad",
  waterLight: "#67bed6",
  waterDark: "#1f688f",
  sand: "#cfb76d",
  sandLight: "#ead795",
  sandDark: "#aa934f",
  bridge: "#8a5a37",
  bridgeLight: "#b47a48",
  bridgeDark: "#5d3b27",
} as const;

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) context.imageSmoothingEnabled = false;
  return canvas;
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

function polygon(
  context: CanvasRenderingContext2D,
  color: string,
  points: ReadonlyArray<readonly [number, number]>,
): void {
  const [first, ...rest] = points;
  if (!first) return;
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(first[0], first[1]);
  for (const point of rest) context.lineTo(point[0], point[1]);
  context.closePath();
  context.fill();
}

export function preloadPixelAssets(scene: Phaser.Scene): void {
  if (!scene.textures.exists(STARTER_ADVENTURER_TEXTURE_KEY)) {
    scene.load.svg(
      STARTER_ADVENTURER_TEXTURE_KEY,
      STARTER_ADVENTURER_ASSET,
      {
        width: PLAYER_FRAME_WIDTH * PLAYER_FRAME_COUNT,
        height: PLAYER_FRAME_HEIGHT,
      },
    );
  }
}

function drawTerrainTile(
  context: CanvasRenderingContext2D,
  tile: TerrainTile,
  offsetX: number,
): void {
  const x = offsetX;

  if (tile === TerrainTile.Grass || tile === TerrainTile.FlowerGrass) {
    rect(context, TERRAIN_COLORS.grass, x, 0, TILE_SIZE, TILE_SIZE);
    rect(context, "#579858", x, 0, TILE_SIZE, 4);
    rect(context, TERRAIN_COLORS.grassLight, x + 3, 8, 7, 3);
    rect(context, TERRAIN_COLORS.grassDark, x + 21, 19, 8, 3);
    rect(context, TERRAIN_COLORS.grassDark, x + 11, 26, 4, 3);
    rect(context, "#6aa766", x + 27, 5, 3, 5);
    rect(context, "#447f47", x + 6, 17, 3, 4);
    rect(context, TERRAIN_COLORS.grassDark, x + 13, 4, 2, 4);
    rect(context, TERRAIN_COLORS.grassLight, x + 14, 3, 2, 2);

    if (tile === TerrainTile.FlowerGrass) {
      rect(context, "#f3dc76", x + 8, 12, 2, 2);
      rect(context, "#fff2aa", x + 7, 13, 4, 1);
      rect(context, "#d77c9b", x + 20, 8, 2, 2);
      rect(context, "#f1acc1", x + 19, 9, 4, 1);
      rect(context, "#e7edf0", x + 16, 24, 2, 2);
      rect(context, "#ffffff", x + 15, 25, 4, 1);
    }
    return;
  }

  if (tile === TerrainTile.Dirt) {
    rect(context, TERRAIN_COLORS.dirt, x, 0, TILE_SIZE, TILE_SIZE);
    rect(context, "#b98454", x, 0, TILE_SIZE, 3);
    rect(context, TERRAIN_COLORS.dirtLight, x + 3, 7, 9, 3);
    rect(context, TERRAIN_COLORS.dirtDark, x + 21, 21, 7, 4);
    rect(context, "#8c5f3d", x + 13, 14, 3, 3);
    rect(context, "#d0a06a", x + 6, 25, 2, 2);
    rect(context, "#6f4932", x + 25, 5, 3, 2);
    return;
  }

  if (tile === TerrainTile.Stone) {
    rect(context, "#7e8990", x, 0, TILE_SIZE, TILE_SIZE);
    rect(context, "#9da7ad", x, 0, TILE_SIZE, 2);
    const stones: Array<[number, number, number, number]> = [
      [1, 3, 14, 11],
      [17, 3, 14, 11],
      [1, 16, 9, 14],
      [12, 16, 19, 14],
    ];
    for (const [stoneX, stoneY, width, height] of stones) {
      rect(context, TERRAIN_COLORS.stone, x + stoneX, stoneY, width, height);
      rect(context, TERRAIN_COLORS.stoneLight, x + stoneX, stoneY, width, 2);
      rect(
        context,
        "#626c73",
        x + stoneX,
        stoneY + height - 2,
        width,
        2,
      );
    }
    rect(context, TERRAIN_COLORS.stoneDark, x + 15, 3, 2, 11);
    rect(context, TERRAIN_COLORS.stoneDark, x + 10, 16, 2, 14);
    rect(context, TERRAIN_COLORS.stoneDark, x, 14, TILE_SIZE, 2);
    return;
  }

  if (tile === TerrainTile.Water) {
    rect(context, TERRAIN_COLORS.water, x, 0, TILE_SIZE, TILE_SIZE);
    rect(context, "#3793ba", x, 0, TILE_SIZE, 4);
    rect(context, TERRAIN_COLORS.waterLight, x + 2, 7, 13, 2);
    rect(context, TERRAIN_COLORS.waterDark, x + 18, 15, 12, 2);
    rect(context, "#5db4d0", x + 7, 25, 14, 2);
    rect(context, "#9ddbe6", x + 23, 5, 6, 1);
    rect(context, "#1c668c", x + 3, 20, 7, 1);
    return;
  }

  if (tile === TerrainTile.Bridge) {
    rect(context, TERRAIN_COLORS.bridge, x, 0, TILE_SIZE, TILE_SIZE);
    for (let plank = 0; plank < 4; plank += 1) {
      const plankY = plank * 8;
      rect(context, TERRAIN_COLORS.bridgeLight, x, plankY, TILE_SIZE, 2);
      rect(context, TERRAIN_COLORS.bridgeDark, x, plankY + 7, TILE_SIZE, 1);
    }
    rect(context, "#2f2923", x + 4, 5, 2, 2);
    rect(context, "#2f2923", x + 26, 20, 2, 2);
    rect(context, "#d39a61", x + 17, 12, 2, 2);
    return;
  }

  rect(context, TERRAIN_COLORS.sand, x, 0, TILE_SIZE, TILE_SIZE);
  rect(context, "#ddc77e", x, 0, TILE_SIZE, 3);
  rect(context, TERRAIN_COLORS.sandLight, x + 4, 7, 8, 2);
  rect(context, TERRAIN_COLORS.sandDark, x + 20, 22, 6, 3);
  rect(context, "#b9a25c", x + 14, 14, 2, 2);
  rect(context, "#f0dda0", x + 7, 26, 3, 1);
  rect(context, "#927d43", x + 25, 6, 2, 1);
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
  tree: { width: 64, height: 80 },
  pine: { width: 64, height: 88 },
  rock: { width: 48, height: 32 },
  "house-blue": { width: 192, height: 160 },
  "house-red": { width: 192, height: 160 },
  sign: { width: 32, height: 48 },
  campfire: { width: 40, height: 40 },
  well: { width: 72, height: 68 },
};

export function objectTextureKey(kind: WorldObjectKind): string {
  return `object-${kind}`;
}

function drawHouse(
  context: CanvasRenderingContext2D,
  roofDark: string,
  roofLight: string,
  width: number,
  height: number,
): void {
  rect(context, "#5c4635", 22, 70, width - 44, height - 70);
  rect(context, "#d2ae79", 29, 79, width - 58, height - 79);
  polygon(context, roofDark, [
    [10, 76],
    [width / 2, 12],
    [width - 10, 76],
  ]);
  polygon(context, roofLight, [
    [18, 72],
    [width / 2, 20],
    [width - 18, 72],
  ]);
  rect(context, roofDark, 12, 72, width - 24, 12);

  rect(context, "#3f6f8f", 46, 93, 36, 35);
  rect(context, "#a8dce3", 50, 97, 28, 27);
  rect(context, "#3f6f8f", width - 82, 93, 36, 35);
  rect(context, "#a8dce3", width - 78, 97, 28, 27);
  rect(context, "#547f8c", 63, 97, 3, 27);
  rect(context, "#547f8c", width - 65, 97, 3, 27);

  rect(context, "#3b2a22", width / 2 - 15, height - 54, 30, 54);
  rect(context, "#7e5333", width / 2 - 10, height - 48, 20, 48);
  rect(context, "#d7b060", width / 2 + 5, height - 29, 3, 3);

  rect(context, "#544238", width - 57, 30, 19, 46);
  rect(context, "#7e6959", width - 53, 22, 11, 12);
}

function createObjectTexture(scene: Phaser.Scene, kind: WorldObjectKind): void {
  const key = objectTextureKey(kind);
  if (scene.textures.exists(key)) return;
  const size = OBJECT_SIZES[kind];
  const canvas = createCanvas(size.width, size.height);
  const context = canvas.getContext("2d");
  if (!context) return;

  if (kind === "tree") {
    rect(context, "#3b281d", 27, 42, 14, 38);
    rect(context, "#6c4328", 30, 39, 9, 41);
    rect(context, "#92613a", 33, 43, 3, 33);
    rect(context, "#1e4f2c", 16, 20, 38, 34);
    rect(context, "#245f32", 6, 34, 36, 28);
    rect(context, "#2e7139", 28, 28, 34, 31);
    rect(context, "#367f42", 20, 9, 36, 34);
    rect(context, "#4a934f", 36, 5, 23, 25);
    rect(context, "#3d8746", 10, 24, 22, 21);
    rect(context, "#62a95d", 27, 15, 9, 6);
    rect(context, "#183d23", 9, 39, 9, 5);
  } else if (kind === "pine") {
    rect(context, "#563822", 28, 46, 9, 42);
    rect(context, "#8a5a34", 31, 43, 4, 44);
    polygon(context, "#183f2c", [
      [32, 3],
      [9, 42],
      [55, 42],
    ]);
    polygon(context, "#235a38", [
      [32, 17],
      [5, 61],
      [59, 61],
    ]);
    polygon(context, "#2d6d42", [
      [32, 33],
      [2, 78],
      [62, 78],
    ]);
    polygon(context, "#467f50", [
      [32, 10],
      [22, 31],
      [41, 31],
    ]);
    rect(context, "#4b8e57", 30, 18, 4, 40);
  } else if (kind === "rock") {
    polygon(context, "#4a545d", [
      [3, 30],
      [8, 14],
      [23, 2],
      [39, 9],
      [46, 30],
    ]);
    polygon(context, "#88949c", [
      [8, 14],
      [23, 2],
      [31, 14],
      [18, 22],
    ]);
    polygon(context, "#626d75", [
      [18, 22],
      [31, 14],
      [46, 30],
      [20, 30],
    ]);
    rect(context, "#a7b0b6", 11, 14, 9, 4);
    rect(context, "#3d464e", 34, 23, 8, 4);
  } else if (kind === "house-blue") {
    drawHouse(context, "#2e4e68", "#416f90", size.width, size.height);
  } else if (kind === "house-red") {
    drawHouse(context, "#6d3340", "#944a57", size.width, size.height);
  } else if (kind === "sign") {
    rect(context, "#4b301e", 14, 23, 5, 25);
    rect(context, "#6a4327", 3, 6, 27, 22);
    rect(context, "#b77c46", 5, 8, 23, 18);
    rect(context, "#e0ad69", 8, 12, 16, 3);
    rect(context, "#76502d", 8, 19, 12, 3);
  } else if (kind === "campfire") {
    rect(context, "#4b2e1d", 5, 33, 30, 4);
    rect(context, "#744426", 9, 28, 22, 5);
    polygon(context, "#d3452c", [
      [20, 2],
      [7, 28],
      [34, 28],
    ]);
    polygon(context, "#ff8c35", [
      [20, 10],
      [12, 28],
      [28, 28],
    ]);
    polygon(context, "#ffd45d", [
      [20, 18],
      [17, 28],
      [24, 28],
    ]);
  } else if (kind === "well") {
    rect(context, "#59636a", 12, 35, 48, 28);
    rect(context, "#879198", 8, 40, 56, 20);
    rect(context, "#b4bdc2", 12, 37, 48, 7);
    rect(context, "#26343b", 20, 46, 32, 11);
    rect(context, "#54371f", 13, 12, 6, 31);
    rect(context, "#54371f", 53, 12, 6, 31);
    rect(context, "#7b5030", 10, 9, 52, 6);
    polygon(context, "#6f3540", [
      [6, 16],
      [36, 1],
      [66, 16],
    ]);
    polygon(context, "#974a57", [
      [12, 14],
      [36, 4],
      [60, 14],
    ]);
    rect(context, "#b18a57", 34, 15, 4, 31);
  }

  const texture = scene.textures.addCanvas(key, canvas);
  texture?.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export function ensureObjectTextures(scene: Phaser.Scene): void {
  const kinds: WorldObjectKind[] = [
    "tree",
    "pine",
    "rock",
    "house-blue",
    "house-red",
    "sign",
    "campfire",
    "well",
  ];
  for (const kind of kinds) createObjectTexture(scene, kind);
}

export function isLargeObject(kind: WorldObjectKind): boolean {
  return kind === "house-blue" || kind === "house-red" || kind === "well";
}

export function playerTextureKey(_appearance: PlayerAppearance): string {
  return STARTER_ADVENTURER_TEXTURE_KEY;
}

export function ensurePlayerTexture(
  scene: Phaser.Scene,
  appearance: PlayerAppearance,
): string {
  const key = playerTextureKey(appearance);
  const texture = scene.textures.get(key);
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

  if (!texture.has("0")) {
    for (let index = 0; index < PLAYER_FRAME_COUNT; index += 1) {
      texture.add(
        index.toString(),
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

export function playerFrame(
  direction: Direction,
  moving: boolean,
  time: number,
): number {
  const directionOffset: Record<Direction, number> = {
    north: 0,
    south: 2,
    east: 4,
    west: 6,
  };
  const walkFrame = moving ? Math.floor(time / 155) % 2 : 0;
  return directionOffset[direction] + walkFrame;
}
