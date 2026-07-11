import * as Phaser from "phaser";
import type { PlayerSnapshot } from "@pixel-realms/protocol";
import { ensurePlayerTexture, playerFrame } from "./pixel-textures";

interface AvatarSample {
  x: number;
  y: number;
  direction: PlayerSnapshot["direction"];
  moving: boolean;
  receivedAt: number;
}

const LOCAL_INTERPOLATION_DELAY_MS = 105;
const REMOTE_INTERPOLATION_DELAY_MS = 130;
const MAX_EXTRAPOLATION_MS = 65;
const TELEPORT_DISTANCE = 96;

export class PlayerAvatar {
  readonly container: Phaser.GameObjects.Container;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly nameLabel: Phaser.GameObjects.Text;
  private readonly localRing: Phaser.GameObjects.Ellipse;
  private readonly samples: AvatarSample[] = [];
  private isLocal: boolean;
  private direction: PlayerSnapshot["direction"];
  private moving: boolean;

  constructor(
    private readonly scene: Phaser.Scene,
    snapshot: PlayerSnapshot,
    isLocal: boolean,
  ) {
    const textureKey = ensurePlayerTexture(scene, snapshot.appearance);
    const shadow = scene.add.ellipse(0, 7, 23, 10, 0x000000, 0.3);
    this.localRing = scene.add
      .ellipse(0, 7, 31, 16)
      .setStrokeStyle(2, 0xf4d06f, isLocal ? 0.9 : 0)
      .setVisible(isLocal);
    this.sprite = scene.add
      .sprite(0, 7, textureKey, playerFrame(snapshot.direction, false, 0))
      .setOrigin(0.5, 1)
      .setScale(1.08);
    this.nameLabel = scene.add
      .text(0, -48, snapshot.name, {
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
    this.container.setDepth(Math.floor(snapshot.y));
    this.isLocal = isLocal;
    this.direction = snapshot.direction;
    this.moving = snapshot.moving;
    this.samples.push(this.makeSample(snapshot));
  }

  applySnapshot(snapshot: PlayerSnapshot, isLocal: boolean): void {
    this.nameLabel.setText(snapshot.name);
    this.nameLabel.setColor(isLocal ? "#ffe49a" : "#f4f6f8");
    this.localRing.setVisible(isLocal).setAlpha(isLocal ? 0.9 : 0);
    this.isLocal = isLocal;

    const last = this.samples.at(-1);
    const distanceFromLatest = last
      ? Phaser.Math.Distance.Between(last.x, last.y, snapshot.x, snapshot.y)
      : 0;

    if (distanceFromLatest > TELEPORT_DISTANCE) {
      this.samples.length = 0;
      this.container.setPosition(snapshot.x, snapshot.y);
    }

    this.samples.push(this.makeSample(snapshot));
    if (this.samples.length > 8) this.samples.splice(0, this.samples.length - 8);
  }

  update(time: number, _delta: number): void {
    const delay = this.isLocal
      ? LOCAL_INTERPOLATION_DELAY_MS
      : REMOTE_INTERPOLATION_DELAY_MS;
    const renderTime = performance.now() - delay;

    while (
      this.samples.length >= 3 &&
      this.samples[1]!.receivedAt <= renderTime
    ) {
      this.samples.shift();
    }

    if (this.samples.length >= 2) {
      const from = this.samples[0]!;
      const to = this.samples[1]!;
      const duration = Math.max(1, to.receivedAt - from.receivedAt);

      if (renderTime <= to.receivedAt) {
        const progress = Phaser.Math.Clamp(
          (renderTime - from.receivedAt) / duration,
          0,
          1,
        );
        this.container.x = Phaser.Math.Linear(from.x, to.x, progress);
        this.container.y = Phaser.Math.Linear(from.y, to.y, progress);
        this.direction = progress < 0.45 ? from.direction : to.direction;
        this.moving = from.moving || to.moving;
      } else if (to.moving) {
        const extrapolation = Math.min(
          renderTime - to.receivedAt,
          MAX_EXTRAPOLATION_MS,
        );
        const ratio = extrapolation / duration;
        this.container.x = to.x + (to.x - from.x) * ratio;
        this.container.y = to.y + (to.y - from.y) * ratio;
        this.direction = to.direction;
        this.moving = true;
      } else {
        this.container.setPosition(to.x, to.y);
        this.direction = to.direction;
        this.moving = false;
      }
    } else if (this.samples.length === 1) {
      const sample = this.samples[0]!;
      this.container.setPosition(sample.x, sample.y);
      this.direction = sample.direction;
      this.moving = sample.moving;
    }

    this.container.setDepth(Math.floor(this.container.y));
    this.sprite.setFrame(playerFrame(this.direction, this.moving, time));
    this.localRing.setScale(1 + Math.sin(time / 260) * 0.04);
  }

  destroy(): void {
    this.samples.length = 0;
    this.container.destroy(true);
  }

  private makeSample(snapshot: PlayerSnapshot): AvatarSample {
    return {
      x: snapshot.x,
      y: snapshot.y,
      direction: snapshot.direction,
      moving: snapshot.moving,
      receivedAt: performance.now(),
    };
  }
}
