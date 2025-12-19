export const ENV_SIZE = 11;

export type Vector2D = [x: number, y: number]

export const Direction = {
    UP: { value: [0, -1] as Vector2D },
    DOWN: { value: [0, 1] as Vector2D },
    LEFT: { value: [-1, 0] as Vector2D },
    RIGHT: { value: [1, 0] as Vector2D },
    NONE: { value: [0, 0] as Vector2D },
} as const;

export const ITER_COUNT = 50;