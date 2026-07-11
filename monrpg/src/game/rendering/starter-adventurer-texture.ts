import * as Phaser from "phaser";
import type { Direction, PlayerAppearance } from "@pixel-realms/protocol";
import { STARTER_ADVENTURER_PNG_DATA_URL } from "./starter-adventurer-data";

export const STARTER_ADVENTURER_TEXTURE_KEY = "starter-adventurer-16";

const PLAYER_FRAME_WIDTH = 32;
const PLAYER_FRAME_HEIGHT = 48;
const FRAMES_PER_DIRECTION = 4;
const WALK_FRAME_DURATION_MS = 125;

export function preloadStarterAdventurer(scene: Phaser.Scene): void {
  if (scene.textures.exists(STARTER_ADVENTURER_TEXTURE_KEY)) return;

  scene.load.spritesheet(
    STARTER_ADVENTURER_TEXTURE_KEY,
    STARTER_ADVENTURER_PNG_DATA_URL,
    {
      frameWidth: PLAYER_FRAME_WIDTH,
      frameHeight: PLAYER_FRAME_HEIGHT,
      endFrame: 15,
    },
  );
}

export function ensureStarterAdventurerTexture(
  scene: Phaser.Scene,
  _appearance: PlayerAppearance,
): string {
  const texture = scene.textures.get(STARTER_ADVENTURER_TEXTURE_KEY);
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  return STARTER_ADVENTURER_TEXTURE_KEY;
}

export function starterAdventurerFrame(
  direction: Direction,
  moving: boolean,
  time: number,
): number {
  const directionRow: Record<Direction, number> = {
    north: 0,
    east: 1,
    south: 2,
    west: 3,
  };
  const frameInRow = moving
    ? Math.floor(time / WALK_FRAME_DURATION_MS) % FRAMES_PER_DIRECTION
    : 0;

  return directionRow[direction] * FRAMES_PER_DIRECTION + frameInRow;
}
