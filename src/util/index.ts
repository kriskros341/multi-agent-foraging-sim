import { ENV_SIZE, ITER_COUNT, Vector2D } from "@/constants.ts";
import { Message, MessagePayload, MessageType } from "@/message/index.ts";
import { collectorChoice } from "@/policies/methods/collectorChoice.ts";
import { pathChoice } from "@/policies/methods/pathChoice.ts";

export class RandomGenerator {
  private seed: number | null;

  constructor(seed: number | null = null) {
    this.seed = seed;
  }

  setSeed(seed: number | null) {
    this.seed = seed;
  }

  next() {
    if (this.seed === null) {
      return Math.random();
    }
    this.seed = (this.seed * 48271) % 2147483647;
    return this.seed / 2147483647;
  }

  choice<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    const randomIndex = Math.floor(this.next() * arr.length);
    return arr[randomIndex];
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

export type ConfigType = {
  log: boolean;
  SCOUT_COUNT: number;
  COLLECTOR_COUNT: number;
  ITER_COUNT: number;
  ENV_SIZE: number;
  NOMAP: boolean;
  SEED: number | null;
  COLLECTOR_PATH_METHOD: keyof typeof pathChoice;
  DELIVER_PATH_METHOD: keyof typeof pathChoice;
  SCOUT_COLLECTOR_CHOICE_METHOD: keyof typeof collectorChoice;
}

export const createConfig = (object?: Partial<ConfigType>) => {
  const args = minimist(process.argv.slice(3));
  
  const config = {
    log: args.log || false,
    SEED: args.seed !== undefined ? parseInt(args.seed, 10) : null,
    SCOUT_COUNT: args.scouts !== undefined ? parseInt(args.scouts, 10) : 1,
    COLLECTOR_COUNT: args.collectors !== undefined ? parseInt(args.collectors, 10) : 1,
    ITER_COUNT: args.iterations !== undefined ? parseInt(args.iterations, 10) : ITER_COUNT,
    ENV_SIZE: args.envsize !== undefined ? parseInt(args.envsize, 10) : ENV_SIZE,
    NOMAP: args.nomap !== undefined ? Boolean(args.nomap) : false,
    COLLECTOR_PATH_METHOD: args.collectorPathMethod !== undefined ? String(args.collectorPathMethod) : "greedyPathMethod",
    SCOUT_COLLECTOR_CHOICE_METHOD: args.collectorChoiceMethod !== undefined ? String(args.collectorChoiceMethod) : "bestPathCollectorChoice",
    ...object
  } as ConfigType;

  return { ...config, ...(object ?? {}) } as ConfigType;
}

export type ExtractPayload<M, K> = M extends [K, infer P] ? P : never;

export class MessagesRegister extends Map<MessageType, MessagePayload[]> {
  get<K extends MessageType>(key: K) {
    if (!this.has(key)) {
      this.set(key, []);
    }
    return super.get(key)! as ExtractPayload<Message, K>[];
  }
}