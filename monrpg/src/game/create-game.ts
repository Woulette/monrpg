import * as Phaser from "phaser";
import { WorldScene } from "./scenes/world-scene";

export function createPixelRealmsGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: Math.max(320, parent.clientWidth),
    height: Math.max(480, parent.clientHeight),
    backgroundColor: "#14251c",
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    render: {
      antialias: false,
      pixelArt: true,
      roundPixels: true,
      powerPreference: "high-performance",
    },
    fps: {
      target: 60,
      min: 30,
      smoothStep: true,
    },
    input: {
      activePointers: 3,
      touch: {
        capture: true,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent,
    },
    scene: [WorldScene],
  });
}
