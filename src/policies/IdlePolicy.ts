
import { Agent } from "@/agent.ts";
import { BasePolicy } from "./BasePolicy.ts";
import { CollectorPolicy } from "./CollectorPolicy.ts";
import { Message, MESSAGE } from "@/message/index.ts";
import { Vector2D } from "@/constants.ts";
import { MessagesRegister, Random } from "@/util/index.ts";

export class IdlePolicy extends BasePolicy {
  messageMemory = new MessagesRegister();
  constructor() {
    super();
  }
  
  processMessage(agent: Agent, fullmessage: Message): void {
    const [message, payload] = fullmessage;
    if (message === MESSAGE.RESOURCE_SCOUTED) {
      this.messageMemory.get(message).push(payload);
    }
    
    if (message === MESSAGE.GOING_TO_COLLECT_ACK) {
      agent.setPolicy(new CollectorPolicy(payload.resource_position));
    }
  }

  afterMessagesProcessed(agent: Agent): void {
    if (this.messageMemory.has(MESSAGE.RESOURCE_SCOUTED)) {
      const messages = this.messageMemory.get(MESSAGE.RESOURCE_SCOUTED);
      const payload = Random.choice(messages)!
      agent.sendMessage(
        payload.agentId, 
        [
          MESSAGE.GOING_TO_COLLECT,
          {
            position: agent.position,
            agentId: agent.id,
            resource_position: payload.resource_position,
          },
        ],
      );
    }

    this.messageMemory.clear();
  }

  chooseAction(agent: Agent): Vector2D | null {
    const actions = [
      { value: [0, -1] as Vector2D }, // UP
      { value: [0, 1] as Vector2D },  // DOWN
      { value: [-1, 0] as Vector2D }, // LEFT
      { value: [1, 0] as Vector2D },  // RIGHT
    ];

    return Random.choice(actions)!.value;
  }
}