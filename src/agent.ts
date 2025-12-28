import { Queue } from "queue-typescript";
import { v4 as uuidv4 } from 'uuid';
import { Vector2D } from "./constants.ts";
import { Policy } from "./policies/interfaces.ts";
import { IdlePolicy } from "./policies/IdlePolicy.ts";
import { Message } from "./message/index.ts";
import { Environment, TILE_TYPES, TileType } from "./environment.ts";
import { Logger } from "./util/index.ts";

export class Agent {
  id: string;
  position: Vector2D;
  policy: Policy;
  mailbox: Queue<Message>;
  environment: Environment;
  knowledge: (TileType)[][];
  
  constructor(environment: Environment, position?: Vector2D) {
    this.id = uuidv4();
    this.position = position ?? environment.randomTile();
    this.policy = new IdlePolicy(environment.config);
    this.mailbox = new Queue();
    this.environment = environment;
    environment.agents[this.id] = this;
    this.knowledge = Array.from({ length: environment.size }, () =>
      Array.from({ length: environment.size }, () => TILE_TYPES.UNKNOWN)
    ) as (TileType)[][];
  }

  setPolicy(policy: Policy): Agent {
    this.policy = policy;
    return this;
  }
  
  broadcast(message: Message): void {
    for (const agent_id in this.environment.agents) {
      if (agent_id !== this.id) {
        this.environment.agents[agent_id].mailbox.enqueue(message);
      }
    }
  }
  
  sendMessage(recipient_id: string, message: Message): void {
    if (recipient_id in this.environment.agents) {
      this.environment.agents[recipient_id].mailbox.enqueue(message);
    }
    Logger.log(`Agent ${this.id} (${this.policy.symbol}) sent message to ${recipient_id} ${this.environment.agents[recipient_id].policy.symbol}:`, message);
  }
  
  processMessages(): void {
    while (this.mailbox.length > 0) {
      const fullmessage = this.mailbox.dequeue();
      Logger.log(`Agent ${this.id} (${this.policy.symbol}) processing message:`, fullmessage);
      this.policy.processMessage(this, fullmessage);
    }
    this.policy.afterMessagesProcessed(this);
  }
  
  move(direction: Vector2D | null): void {
    if (direction === null) {
      return;
    }
    
    const [dx, dy] = direction;
    const newpos: Vector2D = [this.position[0] + dx, this.position[1] + dy];
    
    if (newpos[0] < 0 || newpos[0] >= this.environment.size ||
      newpos[1] < 0 || newpos[1] >= this.environment.size) {
        return;
      }
      
      this.position = newpos;
    }
    
    getVision() {
      const tiles: [TileType, Vector2D][] = [];
      const x = this.position[0];
      const y = this.position[1];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const newX = x + dx;
          const newY = y + dy;
          if (newX >= 0 && newX < this.environment.size && newY >= 0 && newY < this.environment.size) {
            tiles.push([this.environment.tiles[newY][newX].type, [dx, dy]]);
          }
        }
      }
      return tiles;
    }
  }