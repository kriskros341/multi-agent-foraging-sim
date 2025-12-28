
import { Agent } from "@/agent.ts";
import { Vector2D } from "@/constants.ts";
import { BasePolicy } from "./BasePolicy.ts";
import { DeliverPolicy } from "./DeliverPolicy.ts";
import { TILE_TYPES } from "@/environment.ts";
import { pathChoice, PathChoiceMethod } from "./methods/pathChoice.ts";
import { ConfigType } from "@/util/index.ts";

export class CollectorPolicy extends BasePolicy {
  target_position: Vector2D;
  pathFindingMethod: PathChoiceMethod | null = null;
  
  constructor(config: ConfigType, position: Vector2D) {
    super(config);

    this.target_position = position;
    this.symbol = "C";
    const ctor = pathChoice[config.COLLECTOR_PATH_METHOD];
    this.pathFindingMethod = ctor ? new ctor() : null;
  }

  setPathFindingMethod(fn: PathChoiceMethod): this {
    this.pathFindingMethod = fn;
    return this;
  }
  
  chooseAction(agent: Agent): Vector2D | null {
    if (this.pathFindingMethod === null) {
      throw new Error("Path finding method not set for CollectorPolicy");
    }
    const target_position = this.pathFindingMethod.run(agent, this.target_position);
    
    if (target_position === null) {
      return null;
    }
    return target_position;
  }
  
  onPickup(agent: Agent, cell: keyof typeof TILE_TYPES): keyof typeof TILE_TYPES {
    if (cell === TILE_TYPES.SCOUTED_RESOURCE && agent.position[0] === this.target_position[0] && agent.position[1] === this.target_position[1]) {
      agent.setPolicy(new DeliverPolicy(agent.environment.config));
      return TILE_TYPES.EMPTY;
    }
    return cell;
  }
}