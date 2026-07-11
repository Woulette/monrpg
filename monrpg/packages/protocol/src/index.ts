import { z } from "zod";

export const PROTOCOL_VERSION = 1;
export const DEFAULT_TICK_RATE = 20;
export const DEFAULT_SNAPSHOT_RATE = 10;

export const mapIdSchema = z.string().min(1).max(64);
export const entityIdSchema = z.string().min(1).max(96);
export const playerNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(20)
  .regex(/^[\p{L}\p{N}_ -]+$/u, "Nom de joueur invalide");

export const tilePointSchema = z
  .object({
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
  })
  .strict();

export type TilePoint = z.infer<typeof tilePointSchema>;

export const directionSchema = z.enum([
  "north",
  "south",
  "east",
  "west",
]);

export type Direction = z.infer<typeof directionSchema>;

export const playerAppearanceSchema = z
  .object({
    bodyTint: z.number().int().min(0).max(0xffffff),
    accentTint: z.number().int().min(0).max(0xffffff),
  })
  .strict();

export type PlayerAppearance = z.infer<typeof playerAppearanceSchema>;

export const playerSnapshotSchema = z
  .object({
    id: entityIdSchema,
    name: playerNameSchema,
    x: z.number().finite(),
    y: z.number().finite(),
    direction: directionSchema,
    moving: z.boolean(),
    level: z.number().int().positive(),
    appearance: playerAppearanceSchema,
  })
  .strict();

export type PlayerSnapshot = z.infer<typeof playerSnapshotSchema>;

const helloMessageSchema = z
  .object({
    type: z.literal("hello"),
    protocolVersion: z.number().int().positive(),
    playerName: playerNameSchema,
  })
  .strict();

const moveToMessageSchema = z
  .object({
    type: z.literal("move_to"),
    target: tilePointSchema,
    sequence: z.number().int().nonnegative(),
  })
  .strict();

const stopMessageSchema = z
  .object({
    type: z.literal("stop"),
    sequence: z.number().int().nonnegative(),
  })
  .strict();

const pingMessageSchema = z
  .object({
    type: z.literal("ping"),
    sentAt: z.number().finite(),
  })
  .strict();

export const clientMessageSchema = z.discriminatedUnion("type", [
  helloMessageSchema,
  moveToMessageSchema,
  stopMessageSchema,
  pingMessageSchema,
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type GameplayClientMessage = Exclude<ClientMessage, { type: "hello" }>;

const welcomeMessageSchema = z
  .object({
    type: z.literal("welcome"),
    playerId: entityIdSchema,
    mapId: mapIdSchema,
    protocolVersion: z.number().int().positive(),
    tickRate: z.number().int().positive(),
    snapshotRate: z.number().int().positive(),
  })
  .strict();

const worldSnapshotMessageSchema = z
  .object({
    type: z.literal("world_snapshot"),
    tick: z.number().int().nonnegative(),
    serverTime: z.number().finite(),
    players: z.array(playerSnapshotSchema),
  })
  .strict();

const pongMessageSchema = z
  .object({
    type: z.literal("pong"),
    sentAt: z.number().finite(),
    serverTime: z.number().finite(),
  })
  .strict();

const serverErrorMessageSchema = z
  .object({
    type: z.literal("error"),
    code: z.enum([
      "INVALID_MESSAGE",
      "PROTOCOL_MISMATCH",
      "INVALID_MOVE",
      "SERVER_FULL",
      "RATE_LIMITED",
      "INTERNAL_ERROR",
    ]),
    message: z.string().min(1).max(240),
    recoverable: z.boolean(),
  })
  .strict();

export const serverMessageSchema = z.discriminatedUnion("type", [
  welcomeMessageSchema,
  worldSnapshotMessageSchema,
  pongMessageSchema,
  serverErrorMessageSchema,
]);

export type ServerMessage = z.infer<typeof serverMessageSchema>;
export type WelcomeMessage = z.infer<typeof welcomeMessageSchema>;
export type WorldSnapshotMessage = z.infer<typeof worldSnapshotMessageSchema>;

export type TransportStatus =
  | "connecting"
  | "online"
  | "reconnecting"
  | "offline";

export function decodeClientMessage(raw: string): ClientMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = clientMessageSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function decodeServerMessage(raw: string): ServerMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = serverMessageSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
