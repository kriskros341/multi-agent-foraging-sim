import { Agent } from "@/agent.ts";
import { Direction, Vector2D } from "@/constants.ts";

const actions = Object.values(Direction);

export interface PathChoiceMethod {
  run(agent: Agent, target: Vector2D): Vector2D | null;
}

export class AStarPathMethod implements PathChoiceMethod {
  plan: Vector2D[] | null = null;

  run(agent: Agent, end: Vector2D): Vector2D | null {
    if (!this.plan || this.plan.length === 0) {
      const plan1 = agent.environment.createPath(agent.position, end);
      // Distance from the base too
      const plan2 = agent.environment.createPath([Math.floor(agent.environment.size / 2), Math.floor(agent.environment.size / 2)], end);
      if (plan1 && plan2) {
        this.plan = plan1.length <= plan2.length ? plan1 : plan2;
      }
    }

    const d = this.plan?.[0] ?? null;
    
    if (!d) {
      return null;
    }

    if (agent.environment.checkTileForObstacle(d!)) {
      return null;
    }

    this.plan?.shift();
    return d ? [d[0] - agent.position[0], d[1] - agent.position[1]] : null;
  }
}

export class GreedyPathMethod implements PathChoiceMethod {
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

export interface PathChoiceMethodConstructor {
  new (): PathChoiceMethod;
}

export const pathChoice = {
  aStarPathMethod: AStarPathMethod,
  greedyPathMethod: GreedyPathMethod,
} as const satisfies Record<string, PathChoiceMethodConstructor>;
