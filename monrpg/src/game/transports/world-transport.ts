import type {
  GameplayClientMessage,
  ServerMessage,
  TransportStatus,
} from "@pixel-realms/protocol";

export type TransportMode = "local-authority" | "websocket";

export interface WorldTransport {
  readonly mode: TransportMode;
  connect(): void;
  send(message: GameplayClientMessage): void;
  onMessage(listener: (message: ServerMessage) => void): () => void;
  onStatus(listener: (status: TransportStatus) => void): () => void;
  dispose(): void;
}

export abstract class BaseWorldTransport implements WorldTransport {
  abstract readonly mode: TransportMode;
  private readonly messageListeners = new Set<(message: ServerMessage) => void>();
  private readonly statusListeners = new Set<(status: TransportStatus) => void>();

  abstract connect(): void;
  abstract send(message: GameplayClientMessage): void;
  abstract dispose(): void;

  onMessage(listener: (message: ServerMessage) => void): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  onStatus(listener: (status: TransportStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  protected emitMessage(message: ServerMessage): void {
    for (const listener of this.messageListeners) listener(message);
  }

  protected emitStatus(status: TransportStatus): void {
    for (const listener of this.statusListeners) listener(status);
  }

  protected clearListeners(): void {
    this.messageListeners.clear();
    this.statusListeners.clear();
  }
}
