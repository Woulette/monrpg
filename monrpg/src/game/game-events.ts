import type { TransportStatus } from "@pixel-realms/protocol";
import type { TransportMode } from "./transports/world-transport";

export const GAME_STATUS_EVENT = "pixel-realms:status";
export const GAME_TOAST_EVENT = "pixel-realms:toast";

export interface GameStatusDetail {
  mode: TransportMode;
  status: TransportStatus;
  ping: number;
}

export interface GameToastDetail {
  message: string;
}
