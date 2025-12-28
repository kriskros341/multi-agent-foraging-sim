import { Vector2D } from "../constants.ts";

export function heuristic(a: Vector2D, b: Vector2D): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

export function aStar(start: Vector2D, goal: Vector2D): Vector2D[] | null {
  const openSet: Set<string> = new Set();
  openSet.add(start.toString());

  const cameFrom: Map<string, Vector2D> = new Map();

  const gScore: Map<string, number> = new Map();
  gScore.set(start.toString(), 0);

  const fScore: Map<string, number> = new Map();
  fScore.set(start.toString(), heuristic(start, goal));

  while (openSet.size > 0) {
    let current: Vector2D | null = null;
    let currentFScore = Infinity;
    for (const nodeStr of openSet) {
      const score = fScore.get(nodeStr) ?? Infinity;
      if (score < currentFScore) {
        currentFScore = score;
        current = nodeStr.split(",").map(Number) as Vector2D;
      }
    }

    if (current && current[0] === goal[0] && current[1] === goal[1]) {
      const path: Vector2D[] = [];
      let currStr = current.toString();
      while (cameFrom.has(currStr)) {
        path.unshift(current);
        current = cameFrom.get(currStr)!;
        currStr = current.toString();
      }
      return path;
    }

    openSet.delete(current!.toString());

    const actions: Vector2D[] = [
      [0, -1], // UP
      [0, 1],  // DOWN
      [-1, 0], // LEFT
      [1, 0],  // RIGHT
    ];
    for (const action of actions) {
      const neighbor: Vector2D = [current![0] + action[0], current![1] + action[1]];
      const tentativeGScore = (gScore.get(current!.toString()) ?? Infinity) + 1;

      if (tentativeGScore < (gScore.get(neighbor.toString()) ?? Infinity)) {
        cameFrom.set(neighbor.toString(), current!);
        gScore.set(neighbor.toString(), tentativeGScore);
        fScore.set(neighbor.toString(), tentativeGScore + heuristic(neighbor, goal));
        if (!openSet.has(neighbor.toString())) {
          openSet.add(neighbor.toString());
        }
      }
    }
  }

  return null;
}