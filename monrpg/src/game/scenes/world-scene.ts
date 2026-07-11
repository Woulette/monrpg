import * as Phaser from "phaser";
import {
  STARTER_ZONE,
  TILE_SIZE,
  isTileWalkable,
  tileToWorldCenter,
  worldToTile,
} from "@pixel-realms/game-core";
import type {
  PlayerSnapshot,
  ServerMessage,
  TransportStatus,
  WorldSnapshotMessage,
} from "@pixel-realms/protocol";
import {
  GAME_STATUS_EVENT,
  GAME_TOAST_EVENT,
  type GameStatusDetail,
  type GameToastDetail,
} from "../game-events";
import {
  TERRAIN_TEXTURE_KEY,
  ensureObjectTextures,
  ensureTerrainTexture,
  isLargeObject,
  objectTextureKey,
} from "../rendering/pixel-textures";
import { PlayerAvatar } from "../rendering/player-avatar";
import { createWorldTransport } from "../transports/create-world-transport";
import type { WorldTransport } from "../transports/world-transport";

export class WorldScene extends Phaser.Scene {
  private transport: WorldTransport | null = null;
  private playerId: string | null = null;
  private sequence = 0;
  private avatars = new Map<string, PlayerAvatar>();
  private connectionStatus: TransportStatus = "connecting";
  private ping = 0;
  private unsubscribeMessage: (() => void) | null = null;
  private unsubscribeStatus: (() => void) | null = null;

  constructor() {
    super({ key: "world" });
  }

  create(): void {
    ensureTerrainTexture(this);
    ensureObjectTextures(this);
    this.createMap();

    const spawn = tileToWorldCenter(STARTER_ZONE, STARTER_ZONE.spawnPoints[0]!);
    this.cameras.main
      .setBounds(
        0,
        0,
        STARTER_ZONE.width * TILE_SIZE,
        STARTER_ZONE.height * TILE_SIZE,
      )
      .centerOn(spawn.x, spawn.y)
      .setZoom(this.getCameraZoom())
      .setRoundPixels(true)
      .setBackgroundColor("#14251c");

    this.input.on("pointerdown", this.handlePointerDown, this);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);

    const storedName = window.localStorage.getItem("pixel-realms-player-name");
    const playerName = storedName?.trim() || "Aventurier";
    this.transport = createWorldTransport(playerName);
    this.unsubscribeMessage = this.transport.onMessage((message) =>
      this.handleServerMessage(message),
    );
    this.unsubscribeStatus = this.transport.onStatus((status) =>
      this.handleStatus(status),
    );
    this.emitStatus();
    this.transport.connect();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  update(time: number, delta: number): void {
    for (const avatar of this.avatars.values()) avatar.update(time, delta);
  }

  private createMap(): void {
    const tilemap = this.make.tilemap({
      data: STARTER_ZONE.terrain,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = tilemap.addTilesetImage(
      "pixel-realms-terrain",
      TERRAIN_TEXTURE_KEY,
      TILE_SIZE,
      TILE_SIZE,
      0,
      0,
    );
    if (!tileset) throw new Error("Impossible de créer le tileset");

    tilemap.createLayer(0, tileset, 0, 0)?.setDepth(0);

    for (const object of STARTER_ZONE.objects) {
      const x = isLargeObject(object.kind)
        ? object.tileX * TILE_SIZE
        : (object.tileX + object.width / 2) * TILE_SIZE;
      const y = (object.tileY + object.height) * TILE_SIZE;
      const image = this.add.image(x, y, objectTextureKey(object.kind));
      image.setOrigin(isLargeObject(object.kind) ? 0 : 0.5, 1);
      image.setDepth(y - 1);

      if (object.kind === "campfire") {
        const glow = this.add
          .ellipse(x, y - 10, 44, 26, 0xff9d3f, 0.12)
          .setDepth(y - 2);
        this.tweens.add({
          targets: glow,
          alpha: { from: 0.08, to: 0.2 },
          scale: { from: 0.92, to: 1.08 },
          duration: 750,
          yoyo: true,
          repeat: -1,
        });
      }
    }

    const edge = this.add.graphics().setDepth(2);
    edge.lineStyle(3, 0x13281a, 0.65);
    edge.strokeRect(
      1,
      1,
      STARTER_ZONE.width * TILE_SIZE - 2,
      STARTER_ZONE.height * TILE_SIZE - 2,
    );
  }

  private handleResize(): void {
    this.cameras.main.setZoom(this.getCameraZoom());
  }

  private getCameraZoom(): number {
    const shortestSide = Math.min(this.scale.width, this.scale.height);
    if (shortestSide < 430) return 1.7;
    if (shortestSide < 720) return 1.9;
    return 2.1;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.transport || pointer.y < 98) return;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const target = worldToTile(STARTER_ZONE, worldPoint.x, worldPoint.y);
    const center = tileToWorldCenter(STARTER_ZONE, target);

    if (!isTileWalkable(STARTER_ZONE, target)) {
      this.showTargetMarker(center.x, center.y, false);
      this.showToast("Cette case est inaccessible.");
      return;
    }

    this.sequence += 1;
    this.showTargetMarker(center.x, center.y, true);
    this.transport.send({ type: "move_to", target, sequence: this.sequence });
  }

  private showTargetMarker(x: number, y: number, valid: boolean): void {
    const marker = this.add
      .ellipse(x, y, 23, 12)
      .setStrokeStyle(2, valid ? 0xf4d06f : 0xe86969, 0.95)
      .setDepth(y - 3)
      .setScale(0.65);
    this.tweens.add({
      targets: marker,
      alpha: 0,
      scaleX: 1.45,
      scaleY: 1.45,
      duration: 520,
      ease: "Sine.Out",
      onComplete: () => marker.destroy(),
    });
  }

  private handleStatus(status: TransportStatus): void {
    this.connectionStatus = status;
    this.emitStatus();
  }

  private handleServerMessage(message: ServerMessage): void {
    if (message.type === "welcome") {
      this.playerId = message.playerId;
      this.emitStatus();
      return;
    }

    if (message.type === "world_snapshot") {
      this.applySnapshot(message);
      return;
    }

    if (message.type === "pong") {
      this.ping = Math.max(0, Date.now() - message.sentAt);
      this.emitStatus();
      return;
    }

    if (message.type === "error") this.showToast(message.message);
  }

  private applySnapshot(snapshot: WorldSnapshotMessage): void {
    const incomingIds = new Set<string>();

    for (const player of snapshot.players) {
      incomingIds.add(player.id);
      const isLocal = player.id === this.playerId;
      let avatar = this.avatars.get(player.id);
      if (!avatar) {
        avatar = this.createAvatar(player, isLocal);
        this.avatars.set(player.id, avatar);
      }
      avatar.applySnapshot(player, isLocal);
    }

    for (const [id, avatar] of this.avatars) {
      if (!incomingIds.has(id)) {
        avatar.destroy();
        this.avatars.delete(id);
      }
    }
  }

  private createAvatar(player: PlayerSnapshot, isLocal: boolean): PlayerAvatar {
    const avatar = new PlayerAvatar(this, player, isLocal);
    if (isLocal) this.cameras.main.startFollow(avatar.container, true, 0.12, 0.12);
    return avatar;
  }

  private emitStatus(): void {
    const detail: GameStatusDetail = {
      mode: this.transport?.mode ?? "local-authority",
      status: this.connectionStatus,
      ping: this.ping,
    };
    window.dispatchEvent(new CustomEvent(GAME_STATUS_EVENT, { detail }));
  }

  private showToast(message: string): void {
    const detail: GameToastDetail = { message };
    window.dispatchEvent(new CustomEvent(GAME_TOAST_EVENT, { detail }));
  }

  private shutdown(): void {
    this.input.off("pointerdown", this.handlePointerDown, this);
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.unsubscribeMessage?.();
    this.unsubscribeStatus?.();
    this.transport?.dispose();
    this.transport = null;
    for (const avatar of this.avatars.values()) avatar.destroy();
    this.avatars.clear();
  }
}
