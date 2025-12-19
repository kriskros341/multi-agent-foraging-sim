
import { Agent } from "@/agent.ts";
import { Direction, Vector2D } from "@/constants.ts";
import { BasePolicy } from "./BasePolicy.ts";
import { DeliverPolicy } from "./DeliverPolicy.ts";
import { TILE_TYPES } from "@/environment.ts";
import { aStarPathMethod, PathChoiceMethod } from "./methods/pathChoice.ts";

export class CollectorPolicy extends BasePolicy {
  target_position: Vector2D;
  pathFindingMethod: PathChoiceMethod = aStarPathMethod;
  
  constructor(position: Vector2D) {
    super();
    this.target_position = position;
    this.symbol = "C";
  }

  setPathFindingMethod(fn: PathChoiceMethod): this {
    this.pathFindingMethod = fn;
    return this;
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