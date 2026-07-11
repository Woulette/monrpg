import {
  PROTOCOL_VERSION,
  decodeServerMessage,
  type GameplayClientMessage,
} from "@pixel-realms/protocol";
import { BaseWorldTransport } from "./world-transport";

const MAX_RECONNECT_DELAY = 10_000;

export class WebSocketWorldTransport extends BaseWorldTransport {
  readonly mode = "websocket" as const;
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private pingTimer: number | null = null;
  private reconnectAttempts = 0;
  private disposed = false;

  constructor(
    private readonly url: string,
    private readonly playerName: string,
  ) {
    super();
  }

  connect(): void {
    if (this.disposed || this.socket) return;
    this.openSocket(this.reconnectAttempts > 0 ? "reconnecting" : "connecting");
  }

  send(message: GameplayClientMessage): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(message));
  }

  dispose(): void {
    this.disposed = true;
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    if (this.pingTimer !== null) window.clearInterval(this.pingTimer);
    this.reconnectTimer = null;
    this.pingTimer = null;
    this.socket?.close(1000, "Client disposed");
    this.socket = null;
    this.emitStatus("offline");
    this.clearListeners();
  }

  private openSocket(status: "connecting" | "reconnecting"): void {
    if (this.disposed) return;
    this.emitStatus(status);

    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.addEventListener("open", () => {
      socket.send(
        JSON.stringify({
          type: "hello",
          protocolVersion: PROTOCOL_VERSION,
          playerName: this.playerName,
        }),
      );
    });

    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;
      const message = decodeServerMessage(event.data);
      if (!message) return;

      if (message.type === "welcome") {
        this.reconnectAttempts = 0;
        this.emitStatus("online");
        if (this.pingTimer !== null) window.clearInterval(this.pingTimer);
        this.pingTimer = window.setInterval(() => {
          this.send({ type: "ping", sentAt: Date.now() });
        }, 10_000);
      }

      this.emitMessage(message);
    });

    socket.addEventListener("close", () => {
      if (this.pingTimer !== null) window.clearInterval(this.pingTimer);
      this.pingTimer = null;
      this.socket = null;
      if (!this.disposed) this.scheduleReconnect();
    });

    socket.addEventListener("error", () => {
      socket.close();
    });
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts += 1;
    const delay = Math.min(
      MAX_RECONNECT_DELAY,
      500 * 2 ** Math.min(this.reconnectAttempts - 1, 5),
    );
    this.emitStatus("reconnecting");
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket("reconnecting");
    }, delay);
  }
}
