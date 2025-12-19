import { Agent } from "@/agent.ts";
import { Vector2D } from "@/constants.ts";
import { TileType } from "@/environment.ts";
import { Message } from "@/message/index.ts";

export interface Policy {
  symbol: string;
  chooseAction(agent: Agent): Vector2D | null;
  onPickup(agent: Agent, cell: TileType): TileType;
  onDelivery(agent: Agent, cell: TileType): TileType;
  processMessage(agent: Agent, fullmessage: Message): void;
  afterMessagesProcessed(agent: Agent): void;
}