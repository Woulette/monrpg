import type {
  Direction,
  GameplayClientMessage,
  PlayerAppearance,
  PlayerSnapshot,
  TilePoint,
  WorldSnapshotMessage,
} from "@pixel-realms/protocol";
import { findPath } from "./pathfinding";
import {
  STARTER_ZONE,
  isTileWalkable,
  tileToWorldCenter,
  worldToTile,
  type WorldMapDefinition,
} from "./world";

interface RuntimePlayer extends PlayerSnapshot {
  path: TilePoint[];
  lastSequence: number;
}

export interface AddPlayerOptions {
  id: string;
  name: string;
  appearance?: PlayerAppearance;
}

export interface CommandResult {
  accepted: boolean;
  reason?: "INVALID_TARGET" | "PATH_NOT_FOUND" | "STALE_SEQUENCE";
}

const PLAYER_SPEED = 150;
const DEFAULT_APPEARANCES: PlayerAppearance[] = [
  { bodyTint: 0x4a90e2, accentTint: 0xf4c95d },
  { bodyTint: 0x8e67d5, accentTint: 0x75e6a4 },
  { bodyTint: 0xd76c82, accentTint: 0x63d2ff },
  { bodyTint: 0x45a36f, accentTint: 0xffc857 },
];

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function directionFromDelta(dx: number, dy: number): Direction {
  if (Math.abs(dx) > Math.abs(dy)) return dx >= 0 ? "east" : "west";
  return dy >= 0 ? "south" : "north";
}

export class AuthoritativeWorld {
  readonly map: WorldMapDefinition;
  private readonly players = new Map<string, RuntimePlayer>();
  private tick = 0;

  constructor(map: WorldMapDefinition = STARTER_ZONE) {
    this.map = map;
  }

  addPlayer(options: AddPlayerOptions): PlayerSnapshot {
    const hash = hashString(options.id);
    const spawn = this.map.spawnPoints[hash % this.map.spawnPoints.length]!;
    const position = tileToWorldCenter(this.map, spawn);
    const appearance =
      options.appearance ??
      DEFAULT_APPEARANCES[hash % DEFAULT_APPEARANCES.length]!;

    const player: RuntimePlayer = {
      id: options.id,
      name: options.name,
      x: position.x,
      y: position.y,
      direction: "south",
      moving: false,
      level: 1,
      appearance,
      path: [],
      lastSequence: -1,
    };

    this.players.set(options.id, player);
    return this.toSnapshot(player);
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);
  }

  hasPlayer(playerId: string): boolean {
    return this.players.has(playerId);
  }

  handleMessage(
    playerId: string,
    message: GameplayClientMessage,
  ): CommandResult {
    const player = this.players.get(playerId);
    if (!player) return { accepted: false, reason: "INVALID_TARGET" };

    if (message.type === "ping") return { accepted: true };

    if (message.sequence <= player.lastSequence) {
      return { accepted: false, reason: "STALE_SEQUENCE" };
    }
    player.lastSequence = message.sequence;

    if (message.type === "stop") {
      player.path = [];
      player.moving = false;
      return { accepted: true };
    }

    if (!isTileWalkable(this.map, message.target)) {
      return { accepted: false, reason: "INVALID_TARGET" };
    }

    const start = worldToTile(this.map, player.x, player.y);
    const path = findPath(this.map, start, message.target);
    if (!path) return { accepted: false, reason: "PATH_NOT_FOUND" };

    player.path = path.slice(1);
    player.moving = player.path.length > 0;
    return { accepted: true };
  }

  update(deltaSeconds: number): void {
    const safeDelta = Math.max(0, Math.min(deltaSeconds, 0.1));
    this.tick += 1;

    for (const player of this.players.values()) {
      let remainingDistance = PLAYER_SPEED * safeDelta;

      while (remainingDistance > 0 && player.path.length > 0) {
        const nextTile = player.path[0]!;
        const target = tileToWorldCenter(this.map, nextTile);
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const distance = Math.hypot(dx, dy);

        player.direction = directionFromDelta(dx, dy);

        if (distance <= remainingDistance || distance < 0.001) {
          player.x = target.x;
          player.y = target.y;
          player.path.shift();
          remainingDistance -= distance;
        } else {
          player.x += (dx / distance) * remainingDistance;
          player.y += (dy / distance) * remainingDistance;
          remainingDistance = 0;
        }
      }

      player.moving = player.path.length > 0;
    }
  }

  getPlayer(playerId: string): PlayerSnapshot | null {
    const player = this.players.get(playerId);
    return player ? this.toSnapshot(player) : null;
  }

  createSnapshot(serverTime = Date.now()): WorldSnapshotMessage {
    return {
      type: "world_snapshot",
      tick: this.tick,
      serverTime,
      players: [...this.players.values()]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((player) => this.toSnapshot(player)),
    };
  }

  private toSnapshot(player: RuntimePlayer): PlayerSnapshot {
    return {
      id: player.id,
      name: player.name,
      x: player.x,
      y: player.y,
      direction: player.direction,
      moving: player.moving,
      level: player.level,
      appearance: player.appearance,
    };
  }
}
