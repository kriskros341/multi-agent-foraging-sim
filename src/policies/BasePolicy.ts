import { Agent } from "@/agent.ts";
import { Vector2D } from "@/constants.ts";
import { Policy } from "./interfaces.ts";
import { Message } from "@/message/index.ts";
import { TileType } from "@/environment.ts";
import { collectorChoice, CollectorChoiceMethod } from "./methods/collectorChoice.ts";
import { ConfigType } from "@/util/index.ts";

export class BasePolicy implements Policy {
  static defaultMethods: { [key: string]: CollectorChoiceMethod | null } = {};

  static setDefaultPolicies(config: ConfigType): void {
    this.defaultMethods["collectorChoice"] = collectorChoice[config.SCOUT_COLLECTOR_CHOICE_METHOD] ?? null;
  }
  
  symbol: string;
  
  constructor(config: ConfigType) {
    this.symbol = "A";
  }
  
  chooseAction(agent: Agent): Vector2D | null {
    return null;
  }
  
  onPickup(agent: Agent, cell: TileType): TileType {
    return cell;
  }
  
  onDelivery(agent: Agent, cell: TileType): TileType {
    return cell;
  }
  
  processMessage(agent: Agent, fullmessage: Message): void {
    // No-op
  }
  
  afterMessagesProcessed(agent: Agent): void {
    // No-op
  }
}
