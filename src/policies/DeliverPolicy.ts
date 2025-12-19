import { Agent } from "@/agent.ts";
import { Direction, Vector2D } from "@/constants.ts";
import { BasePolicy } from "./BasePolicy.ts";
import { IdlePolicy } from "./IdlePolicy.ts";
import { TILE_TYPES, TileType } from "@/environment.ts";

export class DeliverPolicy extends BasePolicy {
  constructor() {
    super();
    this.symbol = "D";
  }
  
  chooseAction(agent: Agent): Vector2D | null {
    let best = 9999999;
    let bestAction: Vector2D | null = null;
    
    const actions = Object.values(Direction);
    for (const action of actions) {
      const [dx, dy] = action.value;
      const newpos: Vector2D = [agent.position[0] + dx, agent.position[1] + dy];
      const dist = Math.abs(newpos[0] - Math.floor(agent.environment.size / 2)) + Math.abs(newpos[1] - Math.floor(agent.environment.size / 2));
      if (dist < best && agent.pointInMap(newpos)) {
        best = dist;
        bestAction = action.value;
      }
    }
    
    return bestAction;
  }
  
  onDelivery(agent: Agent, cell: TileType): TileType {
    if (cell === TILE_TYPES.BASE) {
      agent.setPolicy(new IdlePolicy());
    }
    return cell;
  }
}
