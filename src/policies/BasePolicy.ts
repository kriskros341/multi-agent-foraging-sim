import { Agent } from "@/agent.ts";
import { Vector2D } from "@/constants.ts";
import { Policy } from "./interfaces.ts";
import { Message } from "@/message/index.ts";
import { TileType } from "@/environment.ts";

export class BasePolicy implements Policy {
  symbol: string;
  
  constructor() {
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
