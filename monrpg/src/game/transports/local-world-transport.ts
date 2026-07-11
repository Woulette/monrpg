import { AuthoritativeWorld } from "@pixel-realms/game-core";
import {
  DEFAULT_SNAPSHOT_RATE,
  DEFAULT_TICK_RATE,
  PROTOCOL_VERSION,
  type GameplayClientMessage,
} from "@pixel-realms/protocol";
import { BaseWorldTransport } from "./world-transport";

export class LocalWorldTransport extends BaseWorldTransport {
  readonly mode = "local-authority" as const;
  private readonly world = new AuthoritativeWorld();
  private readonly playerId = `local-${crypto.randomUUID()}`;
  private tickTimer: number | null = null;
  private snapshotTimer: number | null = null;
  private disposed = false;

  constructor(private readonly playerName: string) {
    super();
  }

  connect(): void {
    if (this.disposed || this.tickTimer !== null) return;
    this.emitStatus("connecting");
    this.world.addPlayer({ id: this.playerId, name: this.playerName });

    queueMicrotask(() => {
      if (this.disposed) return;
      this.emitMessage({
        type: "welcome",
        playerId: this.playerId,
        mapId: this.world.map.id,
        protocolVersion: PROTOCOL_VERSION,
        tickRate: DEFAULT_TICK_RATE,
        snapshotRate: DEFAULT_SNAPSHOT_RATE,
      });
      this.emitMessage(this.world.createSnapshot());
      this.emitStatus("online");
    });

    this.tickTimer = window.setInterval(() => {
      this.world.update(1 / DEFAULT_TICK_RATE);
    }, 1_000 / DEFAULT_TICK_RATE);

    this.snapshotTimer = window.setInterval(() => {
      this.emitMessage(this.world.createSnapshot());
    }, 1_000 / DEFAULT_SNAPSHOT_RATE);
  }

  send(message: GameplayClientMessage): void {
    if (this.disposed) return;

    if (message.type === "ping") {
      this.emitMessage({
        type: "pong",
        sentAt: message.sentAt,
        serverTime: Date.now(),
      });
      return;
    }

    const result = this.world.handleMessage(this.playerId, message);
    if (!result.accepted && result.reason !== "STALE_SEQUENCE") {
      this.emitMessage({
        type: "error",
        code: "INVALID_MOVE",
        message: "Destination inaccessible.",
        recoverable: true,
      });
    }
  }

  dispose(): void {
    this.disposed = true;
    if (this.tickTimer !== null) window.clearInterval(this.tickTimer);
    if (this.snapshotTimer !== null) window.clearInterval(this.snapshotTimer);
    this.tickTimer = null;
    this.snapshotTimer = null;
    this.world.removePlayer(this.playerId);
    this.emitStatus("offline");
    this.clearListeners();
  }
}
