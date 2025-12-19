import { Agent } from "@/agent.ts";
import { Direction, Vector2D } from "@/constants.ts";

const actions = Object.values(Direction);

export interface PathChoiceMethod {
  run(agent: Agent, target: Vector2D): Vector2D | null;
}

export const aStarPathMethod: PathChoiceMethod = {
  run(agent: Agent, end: Vector2D): Vector2D | null {
    const d = agent.environment.createPath(agent.position, end)?.[0] ?? null;
    return d === null ? null : [d[0] - agent.position[0], d[1] - agent.position[1]];
  }
};

export const simplePathMethod: PathChoiceMethod = {
  run(agent: Agent, end: Vector2D): Vector2D | null {
    let best = null;
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
};
