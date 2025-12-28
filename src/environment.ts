
import { Agent } from "./agent.ts";
import { aStar } from "./algorithms/aStar.ts";
import { Vector2D } from "./constants.ts";
import { ConfigType, Logger, RandomGenerator } from "./util/index.ts";

export const TILE_TYPES = {
  EMPTY: "EMPTY",
  RESOURCE: "RESOURCE",
  SCOUTED_RESOURCE: "SCOUTED_RESOURCE",
  BASE: "BASE",
  UNKNOWN: "UNKNOWN",
} as const;

export type TileType = keyof typeof TILE_TYPES;

type Tile = {
  type: TileType;
}

export const TileRepresentations: { [key in TileType]: string } = {
  EMPTY: ".",
  RESOURCE: "R",
  SCOUTED_RESOURCE: "M",
  BASE: "B",
  UNKNOWN: "?",
}

interface ProcessControls {
  process_input(): void  
}

export const DontBotherMeControls: ProcessControls = {
  process_input(): void {
  }
}

export const KeyboardControls: ProcessControls = {
  process_input(): Promise<void> {
    return new Promise(resolve => process.stdin.once('data', (data) => {
      if (data.toString() === 'q') {
        Logger.log("Exiting simulation.");
        process.exit(0);
      }
      resolve()
    }))
  }
}

const spawn_entity = (rng: RandomGenerator, x: number, y: number, size: number): Tile => {
  // chance based spawning logic
  if (x === Math.floor(size / 2) && y === Math.floor(size / 2)) {
    return { type: TILE_TYPES.BASE };
  }

  const chance = rng.next();
  if (chance < 0.1) {
    return { type: TILE_TYPES.RESOURCE };
  }

  return { type: TILE_TYPES.EMPTY };
}

export class Environment {
  agents: { [id: string]: Agent } = {};
  typeCounter: { [key in TileType]: number } = {
    EMPTY: 0,
    RESOURCE: 0,
    SCOUTED_RESOURCE: 0,
    BASE: 0,
    UNKNOWN: 0,
  };
  size: number;
  tiles: Tile[][];
  controls: ProcessControls | null = null;
  base_position: Vector2D;
  config: ConfigType;
  random: RandomGenerator;
  
  constructor(config: ConfigType) {
    this.random = new RandomGenerator(config.SEED);

    this.config = config;
    this.size = config.ENV_SIZE;
    this.tiles = Array.from({ length: this.size }, () => Array.from({ length: this.size }, () => ({ type: TILE_TYPES.EMPTY })));
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const type = spawn_entity(this.random, i, j, this.size);
        this.typeCounter[type.type]++;
        this.tiles[i][j] = type;
      }
    }
    this.base_position = [Math.floor(this.size / 2), Math.floor(this.size / 2)] as Vector2D;
  }
  
  snapshotTypeCounts(): { [key in TileType]: number } {
    return { ...this.typeCounter };
  }

  setControls(controls: ProcessControls) {
    this.controls = controls;
  }
  
  printEnvironmentEmplaceAgents(): string {
    const tileReprs: string[][] = [];
    // Print the environment with agents
    for (let y = 0; y < this.size; y++) {
      const reprRow = [];
      for (let x = 0; x < this.size; x++) {
        let tileRepr = ""
        
        tileRepr = TileRepresentations[this.tiles[y][x].type];
        Object.values(this.agents)
          .forEach(agent => {
            if (agent.position[0] === x && agent.position[1] === y) {
              tileRepr = agent.policy.symbol;
            }
          });

        
        reprRow.push(tileRepr);
      }
      tileReprs.push(reprRow);
    }
    
    for (const agent of Object.values(this.agents)) {
      agent.getVision().forEach(([type, position]) => {
        const absolutePos: Vector2D = [agent.position[0] + position[0], agent.position[1] + position[1]];
        if (tileReprs[absolutePos[1]][absolutePos[0]] === TileRepresentations[TILE_TYPES.EMPTY] && agent.policy.symbol === "S") {
          tileReprs[absolutePos[1]][absolutePos[0]] = "0";
        }
      });
    }
    
    let final = "";
    // Print the environment with agents
    for (let y = 0; y < this.size; y++) {
      let rowStr = "";
      for (let x = 0; x < this.size; x++) {
        rowStr += tileReprs[y][x] + " "; // Placeholder for actual agent logic
      }

      Logger.log(rowStr.trim());
      final += rowStr.trim() + "\n";
    }
    return final;
  }
  
  processAgents() {
    // Process each agent's actions
    Object.values(this.agents).forEach(agent => {
      const action = agent.policy.chooseAction(agent);
      agent.processMessages();
      agent.move(action);
      const x = agent.position[0];
      const y = agent.position[1];
      const cell = this.tiles[y][x].type;
      if (cell === TILE_TYPES.RESOURCE || cell === TILE_TYPES.SCOUTED_RESOURCE) {
        this.tiles[y][x].type = agent.policy.onPickup(agent, cell);
      } else if (cell === TILE_TYPES.BASE) {
        this.tiles[y][x].type = agent.policy.onDelivery(agent, cell);
      }
    });
    // Recount tile types
    this.typeCounter = {
      EMPTY: 0,
      RESOURCE: 0,
      SCOUTED_RESOURCE: 0,
      BASE: 0,
      UNKNOWN: 0,
    };
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const type = this.tiles[i][j].type;
        this.typeCounter[type]++;
      }
    }
  }

  checkTileForObstacle = (position: Vector2D): boolean => {
    // Obecnie map edge lub agent
    const x = position[0];
    const y = position[1];
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
      return true;
    }
    return !!Object.values(this.agents).find(agent => agent.position[0] === x && agent.position[1] === y);
  }

  // Goal musi być podany, aby umożliwić sprawdzanie, czy sąsiad to cel
  getNeighbors = (node: Vector2D, goal?: Vector2D): Vector2D[] => {
    const directions: Vector2D[] = [
      [0, -1], // UP
      [0, 1],  // DOWN
      [-1, 0], // LEFT
      [1, 0],  // RIGHT
    ];
    const neighbors: Vector2D[] = directions.map(dir => [node[0] + dir[0], node[1] + dir[1]] as Vector2D)
      .filter(pos => {
        // Allow if not an obstacle or is the goal
        return !this.checkTileForObstacle(pos) || (pos[0] === goal?.[0] && pos[1] === goal?.[1]);
      });
    return neighbors;
  }

  createPath = (from: Vector2D, to: Vector2D): Vector2D[] | null => {
    const first = aStar(from, to);
    return first;
  }

  collectedMessage = true
  checkStopCondition(): void {
    
  }

  pointInMap(point: Vector2D): boolean {
    return point[0] >= 0 && point[1] >= 0 && point[0] < this.size && point[1] < this.size;
  }

  randomTile() {
    const x = Math.floor(this.random.next() * this.size);
    const y = Math.floor(this.random.next() * this.size);
    return [x, y] as Vector2D;
  }
}