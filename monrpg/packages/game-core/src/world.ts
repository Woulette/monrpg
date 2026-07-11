import type { TilePoint } from "@pixel-realms/protocol";

export const TILE_SIZE = 32;
export const WORLD_WIDTH = 64;
export const WORLD_HEIGHT = 48;
export const STARTER_ZONE_ID = "evergreen-crossing";

export enum TerrainTile {
  Grass = 0,
  FlowerGrass = 1,
  Dirt = 2,
  Stone = 3,
  Water = 4,
  Bridge = 5,
  Sand = 6,
}

export type WorldObjectKind =
  | "tree"
  | "pine"
  | "rock"
  | "house-blue"
  | "house-red"
  | "sign"
  | "campfire"
  | "well";

export interface WorldObject {
  id: string;
  kind: WorldObjectKind;
  tileX: number;
  tileY: number;
  width: number;
  height: number;
  blocksMovement: boolean;
}

export interface WorldMapDefinition {
  id: string;
  displayName: string;
  width: number;
  height: number;
  tileSize: number;
  terrain: TerrainTile[][];
  collision: boolean[][];
  objects: WorldObject[];
  spawnPoints: TilePoint[];
}

function makeMatrix<T>(width: number, height: number, value: T): T[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => value),
  );
}

function tileNoise(x: number, y: number): number {
  let value = Math.imul(x + 11, 374761393) + Math.imul(y + 17, 668265263);
  value = (value ^ (value >>> 13)) >>> 0;
  value = Math.imul(value, 1274126177) >>> 0;
  return (value ^ (value >>> 16)) / 0xffffffff;
}

function createStarterZone(): WorldMapDefinition {
  const terrain = makeMatrix<TerrainTile>(
    WORLD_WIDTH,
    WORLD_HEIGHT,
    TerrainTile.Grass,
  );
  const collision = makeMatrix(WORLD_WIDTH, WORLD_HEIGHT, false);
  const objects: WorldObject[] = [];

  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    for (let x = 0; x < WORLD_WIDTH; x += 1) {
      if (tileNoise(x, y) > 0.86) {
        terrain[y]![x] = TerrainTile.FlowerGrass;
      }
    }
  }

  const paintRect = (
    startX: number,
    startY: number,
    width: number,
    height: number,
    tile: TerrainTile,
  ) => {
    for (let y = startY; y < startY + height; y += 1) {
      for (let x = startX; x < startX + width; x += 1) {
        if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
          terrain[y]![x] = tile;
        }
      }
    }
  };

  // Main roads and village plaza.
  paintRect(2, 22, 60, 4, TerrainTile.Dirt);
  paintRect(14, 3, 4, 42, TerrainTile.Dirt);
  paintRect(11, 18, 10, 12, TerrainTile.Stone);
  paintRect(14, 18, 4, 12, TerrainTile.Dirt);
  paintRect(11, 22, 10, 4, TerrainTile.Dirt);

  // River and sandy banks.
  paintRect(41, 0, 1, WORLD_HEIGHT, TerrainTile.Sand);
  paintRect(42, 0, 4, WORLD_HEIGHT, TerrainTile.Water);
  paintRect(46, 0, 1, WORLD_HEIGHT, TerrainTile.Sand);
  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    for (let x = 42; x <= 45; x += 1) {
      collision[y]![x] = true;
    }
  }

  // Single controlled crossing for the first zone.
  paintRect(41, 22, 6, 4, TerrainTile.Bridge);
  for (let y = 22; y <= 25; y += 1) {
    for (let x = 41; x <= 46; x += 1) {
      collision[y]![x] = false;
    }
  }

  const addObject = (
    kind: WorldObjectKind,
    tileX: number,
    tileY: number,
    width = 1,
    height = 1,
    blocksMovement = true,
  ) => {
    const id = `${kind}-${tileX}-${tileY}`;
    objects.push({ id, kind, tileX, tileY, width, height, blocksMovement });

    if (!blocksMovement) return;

    for (let y = tileY; y < tileY + height; y += 1) {
      for (let x = tileX; x < tileX + width; x += 1) {
        if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
          collision[y]![x] = true;
        }
      }
    }
  };

  // Village buildings deliberately avoid the road grid.
  addObject("house-blue", 6, 13, 6, 5);
  addObject("house-red", 20, 13, 6, 5);
  addObject("house-red", 6, 29, 6, 5);
  addObject("house-blue", 20, 29, 6, 5);
  addObject("well", 18, 20, 2, 2);
  addObject("sign", 27, 23, 1, 1, false);
  addObject("campfire", 53, 30, 1, 1, false);

  const treePositions: Array<[number, number, WorldObjectKind]> = [];

  // Natural border, with openings where roads reach the edge.
  for (let x = 0; x < WORLD_WIDTH; x += 2) {
    if (x < 13 || x > 18) {
      treePositions.push([x, 0, x % 4 === 0 ? "pine" : "tree"]);
      treePositions.push([x, WORLD_HEIGHT - 1, x % 4 === 0 ? "tree" : "pine"]);
    }
  }
  for (let y = 2; y < WORLD_HEIGHT - 2; y += 2) {
    if (y < 21 || y > 26) {
      treePositions.push([0, y, y % 4 === 0 ? "tree" : "pine"]);
      treePositions.push([
        WORLD_WIDTH - 1,
        y,
        y % 4 === 0 ? "pine" : "tree",
      ]);
    }
  }

  const groves: Array<[number, number, WorldObjectKind]> = [
    [3, 5, "tree"],
    [5, 6, "pine"],
    [8, 4, "tree"],
    [10, 7, "pine"],
    [25, 4, "pine"],
    [28, 6, "tree"],
    [31, 3, "tree"],
    [35, 7, "pine"],
    [4, 39, "pine"],
    [8, 42, "tree"],
    [25, 40, "tree"],
    [30, 43, "pine"],
    [35, 38, "tree"],
    [49, 5, "pine"],
    [52, 7, "tree"],
    [56, 4, "pine"],
    [60, 8, "tree"],
    [50, 17, "tree"],
    [55, 15, "pine"],
    [59, 18, "tree"],
    [49, 38, "pine"],
    [55, 41, "tree"],
    [60, 37, "pine"],
    [30, 11, "tree"],
    [34, 13, "pine"],
    [37, 17, "tree"],
  ];

  treePositions.push(...groves);
  for (const [x, y, kind] of treePositions) {
    const terrainTile = terrain[y]?.[x];
    if (
      terrainTile !== undefined &&
      terrainTile !== TerrainTile.Dirt &&
      terrainTile !== TerrainTile.Stone &&
      terrainTile !== TerrainTile.Bridge &&
      terrainTile !== TerrainTile.Water
    ) {
      addObject(kind, x, y);
    }
  }

  const rocks: Array<[number, number]> = [
    [32, 33],
    [36, 31],
    [50, 27],
    [57, 28],
    [51, 34],
    [58, 33],
    [29, 20],
  ];
  for (const [x, y] of rocks) addObject("rock", x, y);

  // Water always wins over object footprints if future map edits overlap it.
  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    for (let x = 0; x < WORLD_WIDTH; x += 1) {
      if (terrain[y]![x] === TerrainTile.Water) collision[y]![x] = true;
    }
  }

  const spawnPoints: TilePoint[] = [
    { x: 15, y: 27 },
    { x: 16, y: 27 },
    { x: 13, y: 24 },
    { x: 18, y: 24 },
  ];

  return {
    id: STARTER_ZONE_ID,
    displayName: "Le Passage d’Émeraude",
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    tileSize: TILE_SIZE,
    terrain,
    collision,
    objects,
    spawnPoints,
  };
}

export const STARTER_ZONE = createStarterZone();

export function isTileInBounds(
  map: WorldMapDefinition,
  point: TilePoint,
): boolean {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x < map.width &&
    point.y < map.height
  );
}

export function isTileWalkable(
  map: WorldMapDefinition,
  point: TilePoint,
): boolean {
  return isTileInBounds(map, point) && !map.collision[point.y]![point.x];
}

export function tileToWorldCenter(
  map: WorldMapDefinition,
  point: TilePoint,
): { x: number; y: number } {
  return {
    x: point.x * map.tileSize + map.tileSize / 2,
    y: point.y * map.tileSize + map.tileSize / 2,
  };
}

export function worldToTile(
  map: WorldMapDefinition,
  x: number,
  y: number,
): TilePoint {
  return {
    x: Math.max(0, Math.min(map.width - 1, Math.floor(x / map.tileSize))),
    y: Math.max(0, Math.min(map.height - 1, Math.floor(y / map.tileSize))),
  };
}
