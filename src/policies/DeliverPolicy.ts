import { Agent } from "@/agent.ts";
import { Direction, Vector2D } from "@/constants.ts";
import { BasePolicy } from "./BasePolicy.ts";
import { IdlePolicy } from "./IdlePolicy.ts";
import { TILE_TYPES, TileType } from "@/environment.ts";
import { aStarPathMethod, PathChoiceMethod, simplePathMethod } from "./methods/pathChoice.ts";

export class DeliverPolicy extends BasePolicy {
  pathFindingMethod: PathChoiceMethod = aStarPathMethod;
  constructor() {
    super();
    this.symbol = "D";
  }

  setPathFindingMethod(fn: PathChoiceMethod): this {
    this.pathFindingMethod = fn;
    return this;
  }
  
  chooseAction(agent: Agent): Vector2D | null {
    return this.pathFindingMethod.run(agent, agent.environment.base_position);
  }
  
  onDelivery(agent: Agent, cell: TileType): TileType {
    if (cell === TILE_TYPES.BASE) {
      agent.setPolicy(new IdlePolicy());
    }
    return cell;
  }
}
