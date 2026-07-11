import * as Phaser from "phaser";
import type { PlayerSnapshot } from "@pixel-realms/protocol";
import {
  ensurePlayerTexture,
  playerFrame,
} from "./pixel-textures";

export class PlayerAvatar {
  readonly container: Phaser.GameObjects.Container;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly nameLabel: Phaser.GameObjects.Text;
  private readonly localRing: Phaser.GameObjects.Ellipse;
  private targetX: number;
  private targetY: number;
  private direction: PlayerSnapshot["direction"];
  private moving: boolean;
  private initialized = false;

  constructor(
    private readonly scene: Phaser.Scene,
    snapshot: PlayerSnapshot,
    isLocal: boolean,
  ) {
    const textureKey = ensurePlayerTexture(scene, snapshot.appearance);
    const shadow = scene.add.ellipse(0, 5, 18, 8, 0x000000, 0.28);
    this.localRing = scene.add
      .ellipse(0, 5, 27, 14)
      .setStrokeStyle(2, 0xf4d06f, isLocal ? 0.9 : 0)
      .setVisible(isLocal);
    this.sprite = scene.add
      .sprite(0, 5, textureKey, playerFrame(snapshot.direction, false, 0))
      .setOrigin(0.5, 1)
      .setScale(1.15);
    this.nameLabel = scene.add
      .text(0, -34, snapshot.name, {
        fontFamily: '"Geist Mono", monospace',
        fontSize: "7px",
        color: isLocal ? "#ffe49a" : "#f4f6f8",
        stroke: "#11161c",
        strokeThickness: 2,
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setResolution(2);

    this.container = scene.add.container(snapshot.x, snapshot.y, [
      this.localRing,
      shadow,
      this.sprite,
      this.nameLabel,
    ]);
    this.targetX = snapshot.x;
    this.targetY = snapshot.y;
    this.direction = snapshot.direction;
    this.moving = snapshot.moving;
    this.container.setDepth(Math.floor(snapshot.y));
    this.initialized = true;
  }

  applySnapshot(snapshot: PlayerSnapshot, isLocal: boolean): void {
    this.targetX = snapshot.x;
    this.targetY = snapshot.y;
    this.direction = snapshot.direction;
    this.moving = snapshot.moving;
    this.nameLabel.setText(snapshot.name);
    this.nameLabel.setColor(isLocal ? "#ffe49a" : "#f4f6f8");
    this.localRing.setVisible(isLocal).setAlpha(isLocal ? 0.9 : 0);

    if (!this.initialized) {
      this.container.setPosition(snapshot.x, snapshot.y);
      this.initialized = true;
    }
  }

  update(time: number, delta: number): void {
    const smoothing = 1 - Math.exp((-14 * delta) / 1_000);
    this.container.x = Phaser.Math.Linear(
      this.container.x,
      this.targetX,
      smoothing,
    );
    this.container.y = Phaser.Math.Linear(
      this.container.y,
      this.targetY,
      smoothing,
    );
    this.container.setDepth(Math.floor(this.container.y));
    this.sprite.setFrame(playerFrame(this.direction, this.moving, time));
    this.localRing.setScale(1 + Math.sin(time / 260) * 0.04);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
