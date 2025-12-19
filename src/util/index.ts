import { ENV_SIZE, ITER_COUNT, Vector2D } from "@/constants.ts";
import { Message, MessagePayload, MessageType } from "@/message/index.ts";

export const Random = {
  seed: null as number | null,
  setSeed(seed: number | null) {
    this.seed = seed;
  },
  next() {
    if (this.seed === null) {
      return Math.random();
    }
    // Simple linear congruential generator
    this.seed = (this.seed * 48271) % 2147483647;
    return this.seed / 2147483647;
  },

  choice<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    const randomIndex = Math.floor(Random.next() * arr.length);
    return arr[randomIndex];
  },

  randomTile(size: number) {
    const x = Math.floor(this.next() * size);
    const y = Math.floor(this.next() * size);
    return [x, y] as Vector2D;
  }
}

export const Logger = {
  enabled: process.argv.includes("--log"),
  log(...args: any[]) {
    if (this.enabled) {
      console.log(...args);
    }
  }
}

import minimist from 'minimist';

const createConfig = () => {
  const args = minimist(process.argv.slice(3));
  
  const seed = args.seed !== undefined ? parseInt(args.seed, 10) : null;
  if (seed !== null) {
    console.log(`Setting random seed to ${seed}`);
    Random.setSeed(seed);
  }

  return {
    log: args.log || false,
    SCOUT_COUNT: args.scouts !== undefined ? parseInt(args.scouts, 10) : 1,
    COLLECTOR_COUNT: args.collectors !== undefined ? parseInt(args.collectors, 10) : 1,
    ITER_COUNT: args.iterations !== undefined ? parseInt(args.iterations, 10) : ITER_COUNT,
    ENV_SIZE: args.envsize !== undefined ? parseInt(args.envsize, 10) : ENV_SIZE,
  };
}

export const Config = createConfig();

export type ExtractPayload<M, K> = M extends [K, infer P] ? P : never;

export class MessagesRegister extends Map<MessageType, MessagePayload[]> {
  get<K extends MessageType>(key: K) {
    if (!this.has(key)) {
      this.set(key, []);
    }
    return super.get(key)! as ExtractPayload<Message, K>[];
  }
}