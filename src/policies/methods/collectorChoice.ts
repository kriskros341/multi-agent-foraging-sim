import { Vector2D } from "@/constants.ts";
import { MESSAGE, Message } from "@/message/index.ts";
import { ExtractPayload, RandomGenerator } from "@/util/index.ts";

type CollectMessage = ExtractPayload<Message, typeof MESSAGE.GOING_TO_COLLECT>

export interface CollectorChoiceMethod {
  run(rng: RandomGenerator, payloads: CollectMessage[], algorithm?: (start: Vector2D, end: Vector2D) => Vector2D[] | null): CollectMessage | null;
}

export const bestPathCollectorChoice: CollectorChoiceMethod = {
  run(rng: RandomGenerator, payloads: CollectMessage[], algorithm: (start: Vector2D, end: Vector2D) => Vector2D[] | null) {
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
    }
    return best;
  }
};

export const randomCollectorChoice: CollectorChoiceMethod = {
  run(rng: RandomGenerator, payloads: CollectMessage[]): CollectMessage | null {
    return rng.choice(payloads) ?? null; 
  }
};

export const collectorChoice = {
  bestPathCollectorChoice,
  randomCollectorChoice,
} as const