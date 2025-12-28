import { Agent } from "@/agent.ts";
import { Direction, Vector2D } from "@/constants.ts";
import { TILE_TYPES, TileType } from "@/environment.ts";

const actions = Object.values(Direction);

export interface ScoutingChoiceMethod {
  run(agent: Agent, target: Vector2D): Vector2D | null;
}

export class MineSweeperMethod implements ScoutingChoiceMethod {
  plan: Vector2D[] | null = null;
  createPlan = (agent: Agent) => {
    let best: number | null = null;
    let bestTarget: Vector2D | null = null;

    const surroundingKnownTiles: Record<string, number> = {}
    agent.knowledge.forEach((tileRow, i) => {
      tileRow.forEach((tile, j) => {
        if (tile === TILE_TYPES.UNKNOWN) return;
        agent.environment.getNeighbors([j, i] as Vector2D).forEach(([x, y]) => {
          if (agent.knowledge[y][x] !== TILE_TYPES.UNKNOWN) return;
          surroundingKnownTiles[`${x}|${y}`] = (surroundingKnownTiles[`${x}|${y}`] || 0) + 1;
        })
      })
    })

    // pick best
    Object.entries(surroundingKnownTiles).sort((a, b) => b[1] - a[1]).forEach(([key, _]) => {
      const [xStr, yStr] = key.split("|");
      const x = parseInt(xStr, 10);
      const y = parseInt(yStr, 10);
      const newpos: Vector2D = [x, y];
      const dist = Math.abs(newpos[0] - agent.position[0]) + Math.abs(newpos[1] - agent.position[1]);
      if (best === null || dist < best) {
        if (agent.environment.checkTileForObstacle(newpos) || !agent.environment.pointInMap(newpos)) {
          return;
        }
        best = dist;
        bestTarget = newpos;
      }
    });

    if (bestTarget) {
      this.plan = agent.environment.createPath(agent.position, bestTarget);
    }
  }

  run(agent: Agent, end: Vector2D): Vector2D | null {
    if (!this.plan || this.plan.length === 0) {
      this.createPlan(agent);
    }

    const d = this.plan?.[0] ?? null;
    
    if (!d) {
      return null;
    }

    if (agent.environment.checkTileForObstacle(d!)) {
      return null;
    }

    this.plan?.shift();

    const bestAction: Vector2D | null = d ? [d[0] - agent.position[0], d[1] - agent.position[1]] : null;
    return bestAction;
  }
}

export class RandomPreferUnscouted implements ScoutingChoiceMethod {
  run(agent: Agent, end: Vector2D): Vector2D | null {
    const unscoutedActions: Vector2D[] = [];
    const scoutedActions: Vector2D[] = [];
    for (const action of actions) {
      const newpos: Vector2D = [agent.position[0] + action.value[0], agent.position[1] + action.value[1]];
      if (agent.environment.checkTileForObstacle(newpos) || !agent.environment.pointInMap(newpos)) {
        continue;
      }
      const knowledgeCell = agent.knowledge[newpos[1]][newpos[0]];
      if (knowledgeCell === TILE_TYPES.UNKNOWN) {
        unscoutedActions.push(action.value);
      } else {
        scoutedActions.push(action.value);
      }
    }
    if (unscoutedActions.length > 0) {
      const choice = unscoutedActions[Math.floor(Math.random() * unscoutedActions.length)];
      return choice;
    } else if (scoutedActions.length > 0) {
      const choice = scoutedActions[Math.floor(Math.random() * scoutedActions.length)];
      return choice;
    }
    return null;
  }
}

export class RandomScoutingChoice implements ScoutingChoiceMethod {
  run(agent: Agent, end: Vector2D): Vector2D | null {
    let best: number | null = null;
    let bestAction: Vector2D | null = null;
    // pick best
    for (const action of actions) {
      const newpos: Vector2D = [agent.position[0] + action.value[0], agent.position[1] + action.value[1]];
      const dist = Math.abs(newpos[0] - end[0]) + Math.abs(newpos[1] - end[1]);
      if (best === null || dist < best) {
        if (agent.environment.checkTileForObstacle(newpos) || !agent.environment.pointInMap(newpos)) {
          continue;
        }
        best = dist;
        bestAction = action.value;
      }
    }
    return bestAction;
  }
}

export interface ScoutingChoiceMethodConstructor {
  new (): RandomScoutingChoice;
}

export const scoutingChoice = {
  randomPreferUnscouted: RandomPreferUnscouted,
  randomScoutingChoice: RandomScoutingChoice,
} as const satisfies Record<string, ScoutingChoiceMethodConstructor>;