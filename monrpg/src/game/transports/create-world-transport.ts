import { LocalWorldTransport } from "./local-world-transport";
import type { WorldTransport } from "./world-transport";
import { WebSocketWorldTransport } from "./websocket-world-transport";

export function createWorldTransport(playerName: string): WorldTransport {
  const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL?.trim();
  if (!realtimeUrl) return new LocalWorldTransport(playerName);

  try {
    const parsedUrl = new URL(realtimeUrl);
    if (parsedUrl.protocol !== "ws:" && parsedUrl.protocol !== "wss:") {
      return new LocalWorldTransport(playerName);
    }
    return new WebSocketWorldTransport(parsedUrl.toString(), playerName);
  } catch {
    return new LocalWorldTransport(playerName);
  }
}
