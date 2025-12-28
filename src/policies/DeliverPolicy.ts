import { Agent } from "@/agent.ts";
import { Vector2D } from "@/constants.ts";
import { BasePolicy } from "./BasePolicy.ts";
import { IdlePolicy } from "./IdlePolicy.ts";
import { TILE_TYPES, TileType } from "@/environment.ts";
import { PathChoiceMethod, pathChoice } from "./methods/pathChoice.ts";
import { ConfigType } from "@/util/index.ts";

export class DeliverPolicy extends BasePolicy {
  pathFindingMethod: PathChoiceMethod | null = null;

  constructor(config: ConfigType) {
    super(config);
    this.symbol = "D";
    const ctor = pathChoice[config.DELIVER_PATH_METHOD];
    this.pathFindingMethod = ctor ? new ctor() : null;
  }

  setPathFindingMethod(fn: PathChoiceMethod): this {
    this.pathFindingMethod = fn;
    return this;
  }
  
  chooseAction(agent: Agent): Vector2D | null {
    if (this.pathFindingMethod === null) {
      throw new Error("Path finding method not set for DeliverPolicy");
    }
    return this.pathFindingMethod.run(agent, agent.environment.base_position);
  }
  
  onDelivery(agent: Agent, cell: TileType): TileType {
    if (cell === TILE_TYPES.BASE) {
      agent.setPolicy(new IdlePolicy(agent.environment.config));
    }
    return cell;
  }
}
