import { Vector2D } from "@/constants.ts";

export const MESSAGE = {
  RESOURCE_SCOUTED: "resource_scouted",
  GOING_TO_COLLECT_ACK: "going_to_collect_ack",
  GOING_TO_COLLECT: "going_to_collect"
} as const;

export type Message = 
  [typeof MESSAGE.RESOURCE_SCOUTED, { agentId: string; resource_position: Vector2D }] |
  [typeof MESSAGE.GOING_TO_COLLECT_ACK, { agentId: string; resource_position: Vector2D }] |
  [typeof MESSAGE.GOING_TO_COLLECT, { agentId: string; position: Vector2D, resource_position: Vector2D }];

export type MessageType = Message[0]
export type MessagePayload = Message[1]