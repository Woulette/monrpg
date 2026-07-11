import type { TilePoint } from "@pixel-realms/protocol";
import { isTileWalkable, type WorldMapDefinition } from "./world";

interface SearchNode extends TilePoint {
  g: number;
  h: number;
  f: number;
  parentKey: string | null;
}

const DIRECTIONS = [
  { x: 0, y: -1, cost: 1 },
  { x: 1, y: 0, cost: 1 },
  { x: 0, y: 1, cost: 1 },
  { x: -1, y: 0, cost: 1 },
  { x: 1, y: -1, cost: Math.SQRT2 },
  { x: 1, y: 1, cost: Math.SQRT2 },
  { x: -1, y: 1, cost: Math.SQRT2 },
  { x: -1, y: -1, cost: Math.SQRT2 },
] as const;

function pointKey(point: TilePoint): string {
  return `${point.x},${point.y}`;
}

function octileDistance(a: TilePoint, b: TilePoint): number {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
}

function canUseDiagonal(
  map: WorldMapDefinition,
  from: TilePoint,
  dx: number,
  dy: number,
): boolean {
  if (dx === 0 || dy === 0) return true;
  return (
    isTileWalkable(map, { x: from.x + dx, y: from.y }) &&
    isTileWalkable(map, { x: from.x, y: from.y + dy })
  );
}

export function findPath(
  map: WorldMapDefinition,
  start: TilePoint,
  goal: TilePoint,
  maxVisitedNodes = 8_192,
): TilePoint[] | null {
  if (!isTileWalkable(map, start) || !isTileWalkable(map, goal)) return null;
  if (start.x === goal.x && start.y === goal.y) return [start];

  const open = new Map<string, SearchNode>();
  const closed = new Set<string>();
  const allNodes = new Map<string, SearchNode>();
  const startNode: SearchNode = {
    ...start,
    g: 0,
    h: octileDistance(start, goal),
    f: octileDistance(start, goal),
    parentKey: null,
  };
  open.set(pointKey(start), startNode);
  allNodes.set(pointKey(start), startNode);

  let visited = 0;

  while (open.size > 0 && visited < maxVisitedNodes) {
    visited += 1;
    let current: SearchNode | null = null;
    let currentKey = "";

    for (const [key, candidate] of open) {
      if (
        current === null ||
        candidate.f < current.f ||
        (candidate.f === current.f && candidate.h < current.h)
      ) {
        current = candidate;
        currentKey = key;
      }
    }

    if (!current) break;
    open.delete(currentKey);
    closed.add(currentKey);

    if (current.x === goal.x && current.y === goal.y) {
      const path: TilePoint[] = [];
      let cursor: SearchNode | undefined = current;
      while (cursor) {
        path.push({ x: cursor.x, y: cursor.y });
        cursor = cursor.parentKey
          ? allNodes.get(cursor.parentKey)
          : undefined;
      }
      return path.reverse();
    }

    for (const direction of DIRECTIONS) {
      const next: TilePoint = {
        x: current.x + direction.x,
        y: current.y + direction.y,
      };
      const nextKey = pointKey(next);

      if (
        closed.has(nextKey) ||
        !isTileWalkable(map, next) ||
        !canUseDiagonal(map, current, direction.x, direction.y)
      ) {
        continue;
      }

      const tentativeG = current.g + direction.cost;
      const known = allNodes.get(nextKey);
      if (known && tentativeG >= known.g) continue;

      const h = octileDistance(next, goal);
      const node: SearchNode = {
        ...next,
        g: tentativeG,
        h,
        f: tentativeG + h,
        parentKey: currentKey,
      };
      allNodes.set(nextKey, node);
      open.set(nextKey, node);
    }
  }

  return null;
}
