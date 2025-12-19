
import { MESSAGE, Message } from "@/message/index.ts";
import { Agent } from "../agent.ts";
import { Direction, Vector2D } from "../constants.ts";
import { BasePolicy } from "./BasePolicy.ts";
import { TILE_TYPES, TileType } from "@/environment.ts";
import { ExtractPayload, MessagesRegister, Random } from "@/util/index.ts";

type CollectMessage = ExtractPayload<Message, typeof MESSAGE.GOING_TO_COLLECT>

export const randomChoice = (payloads: CollectMessage[], _?: unknown) => Random.choice(payloads) ?? null;

interface CollectorChoiceMethod {
  run(payloads: CollectMessage[], algorithm?: (start: Vector2D, end: Vector2D) => Vector2D[] | null): CollectMessage | null;
}

const bestPathCollectorChoice: CollectorChoiceMethod = {
  run(payloads: CollectMessage[], algorithm: (start: Vector2D, end: Vector2D) => Vector2D[] | null) {
    let best = null;
    let best_value = null;
    for (const payload of payloads) {
      const path = algorithm(payload.position, payload.resource_position);
      if (path === null) {
        continue;
      }
      const path_length = path.length;
      if (best === null || path_length < best_value!) {
        best = payload;
        best_value = path_length;
      }
      console.log("TEST", best_value)
    }
    return best;
  }
};

const randomCollectorChoice: CollectorChoiceMethod = {
  run(payloads: CollectMessage[]): CollectMessage | null {
    return Random.choice(payloads) ?? null; 
  }
};

export class ScoutPolicy extends BasePolicy {
  messageMemory = new MessagesRegister();
  collectorChoiceFunction: CollectorChoiceMethod = bestPathCollectorChoice;
  symbol: string;
  responses: Array<Message>;
  waiting: boolean;
  
  constructor() {
    super();
    this.symbol = "S";
    this.responses = [];
    this.waiting = false;
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
    
    return Random.choice(actions)!.value;
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
      const payload = this.collectorChoiceFunction.run(payloads, agent.environment.createPath)!;
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
