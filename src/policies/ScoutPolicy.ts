
import { MESSAGE, Message } from "@/message/index.ts";
import { Agent } from "../agent.ts";
import { Direction, Vector2D } from "../constants.ts";
import { BasePolicy } from "./BasePolicy.ts";
import { TILE_TYPES, TileType } from "@/environment.ts";
import { ConfigType, MessagesRegister } from "@/util/index.ts";
import { collectorChoice, CollectorChoiceMethod } from "./methods/collectorChoice.ts";

export class ScoutPolicy extends BasePolicy {
  messageMemory = new MessagesRegister();
  collectorChoiceFunction: CollectorChoiceMethod | null = null;
  symbol: string;
  responses: Array<Message>;
  waiting: boolean;

  constructor(config: ConfigType) {
    super(config);
    this.symbol = "S";
    this.responses = [];
    this.waiting = false;
    this.collectorChoiceFunction = collectorChoice[config.SCOUT_COLLECTOR_CHOICE_METHOD] ?? null;
  }

  setCollectorChoiceFunction(fn: CollectorChoiceMethod): this {
    this.collectorChoiceFunction = fn;
    return this;
  }
  
  chooseAction(agent: Agent): Vector2D | null {
    if (this.waiting) {
      return Direction.NONE.value;
    }
    
    const actions = [
      { value: [0, -1] as Vector2D }, // UP
      { value: [0, 1] as Vector2D },  // DOWN
      { value: [-1, 0] as Vector2D }, // LEFT
      { value: [1, 0] as Vector2D },  // RIGHT
    ];
    
    for (const [type, position] of agent.getVision()) {
      if (type === TILE_TYPES.RESOURCE) {
        const absolutePos: Vector2D = [agent.position[0] + position[0], agent.position[1] + position[1]];
        for (const action of actions) {
          const newpos: Vector2D = [agent.position[0] + action.value[0], agent.position[1] + action.value[1]];
          if (newpos[0] === absolutePos[0] && newpos[1] === absolutePos[1]) {
            return action.value;
          }
        }
      }
    }
    
    return agent.environment.random.choice(actions)!.value;
  }
  
  onPickup(agent: Agent, cell: TileType): TileType {
    if (cell === TILE_TYPES.RESOURCE) {
      agent.broadcast(
        [
          MESSAGE.RESOURCE_SCOUTED,
          {
            agentId: agent.id,
            resource_position: agent.position,
          }
        ]
      );
      this.waiting = true;
      return TILE_TYPES.SCOUTED_RESOURCE;
    }
    return cell;
  }
  
  processMessage(agent: Agent, fullmessage: Message): void {
    const [message, payload] = fullmessage;
    if (message === MESSAGE.GOING_TO_COLLECT) {
      this.messageMemory.get(message).push(payload);
    }
  }
  
  afterMessagesProcessed(agent: Agent): void {
    if (this.messageMemory.has(MESSAGE.GOING_TO_COLLECT)) {
      const payloads = this.messageMemory.get(MESSAGE.GOING_TO_COLLECT)
      if (!this.collectorChoiceFunction) {
        throw new Error("Collector choice function not set for ScoutPolicy");
      }
      const payload = this.collectorChoiceFunction.run(agent.environment.random, payloads, agent.environment.createPath)!;
      agent.sendMessage(payload.agentId, [MESSAGE.GOING_TO_COLLECT_ACK, payload]);

      this.waiting = false;
    } else {
      if (this.waiting) {
        agent.broadcast(
          [
            MESSAGE.RESOURCE_SCOUTED,
            {
              agentId: agent.id,
              resource_position: agent.position,
            }
          ]
        );
      }
    }
    this.messageMemory.clear();
  }
}
