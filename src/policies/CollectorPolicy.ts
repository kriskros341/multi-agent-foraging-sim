
import { Agent } from "@/agent.ts";
import { Direction, Vector2D } from "@/constants.ts";
import { BasePolicy } from "./BasePolicy.ts";
import { DeliverPolicy } from "./DeliverPolicy.ts";
import { TILE_TYPES } from "@/environment.ts";

const actions = Object.values(Direction);

interface PathChoiceFunction {
  run(agent: Agent, target: Vector2D): Vector2D | null;
}

const aStarPathFinding: PathChoiceFunction = {
  run(agent: Agent, end: Vector2D): Vector2D | null {
    const d = agent.environment.createPath(agent.position, end)?.[0] ?? null;
    return d === null ? null : [d[0] - agent.position[0], d[1] - agent.position[1]];
  }
};

const simplePathFinding: PathChoiceFunction = {
  run(agent: Agent, end: Vector2D): Vector2D | null {
    let best = null;
    let bestAction: Vector2D | null = null;
    // pick best
    for (const action of actions) {
      const newpos: Vector2D = [agent.position[0] + action.value[0], agent.position[1] + action.value[1]];
      const dist = Math.abs(newpos[0] - end[0]) + Math.abs(newpos[1] - end[1]);
      if (best === null || dist < best) {
        if (agent.environment.checkTileForObstacle(newpos)) {
          continue;
        }
        best = dist;
        bestAction = action.value;
      }
    }
    return bestAction;
  }
};



export class CollectorPolicy extends BasePolicy {
  target_position: Vector2D;
  pathFindingMethod: PathChoiceFunction = aStarPathFinding;
  
  constructor(position: Vector2D) {
    super();
    this.target_position = position;
    this.symbol = "C";
  }
  
  chooseAction(agent: Agent): Vector2D | null {
    return this.pathFindingMethod.run(agent, this.target_position);
  }
  
  onPickup(agent: Agent, cell: keyof typeof TILE_TYPES): keyof typeof TILE_TYPES {
    if (cell === TILE_TYPES.SCOUTED_RESOURCE && agent.position[0] === this.target_position[0] && agent.position[1] === this.target_position[1]) {
      agent.setPolicy(new DeliverPolicy());
      return TILE_TYPES.EMPTY;
    }
    return cell;
  }
}