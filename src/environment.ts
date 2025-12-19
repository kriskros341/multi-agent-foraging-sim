
import { Agent } from "./agent.ts";
import { aStar } from "./algorithms/aStar.ts";
import { Vector2D } from "./constants.ts";
import { Config, Logger, Random } from "./util/index.ts";

export const TILE_TYPES = {
  EMPTY: "EMPTY",
  RESOURCE: "RESOURCE",
  SCOUTED_RESOURCE: "SCOUTED_RESOURCE",
  BASE: "BASE",
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
}

const spawn_entity = (x: number, y: number, size: number): Tile => {
  // chance based spawning logic
  if (x === Math.floor(size / 2) && y === Math.floor(size / 2)) {
    return { type: TILE_TYPES.BASE };
  }
  
  const chance = Random.next();
  if (chance < 0.1) {
    return { type: TILE_TYPES.RESOURCE };
  }
  
  return { type: TILE_TYPES.EMPTY };
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

export class Environment {
  typeCounter: { [key in TileType]: number } = {
    EMPTY: 0,
    RESOURCE: 0,
    SCOUTED_RESOURCE: 0,
    BASE: 0,
  };
  size: number;
  tiles: Tile[][];
  controls = DontBotherMeControls;
  
  constructor(size: number = Config.ENV_SIZE) {
    this.size = size;
    this.tiles = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ type: TILE_TYPES.EMPTY })));
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const type = spawn_entity(i, j, this.size);
        this.typeCounter[type.type]++;
        this.tiles[i][j] = type;
      }
    }
  }
  
  snapshotTypeCounts(): { [key in TileType]: number } {
    return { ...this.typeCounter };
  }

  setControls(controls: ProcessControls) {
    this.controls = controls;
  }
  
  printEnvironmentEmplaceAgents(): void {
    const tileReprs: string[][] = [];
    // Print the environment with agents
    for (let y = 0; y < this.size; y++) {
      const reprRow = [];
      for (let x = 0; x < this.size; x++) {
        let tileRepr = ""
        
        tileRepr = TileRepresentations[this.tiles[y][x].type]; // Placeholder for actual agent logic
        Object.values(Agent.agents)
        .forEach(agent => {
          if (agent.position[0] === x && agent.position[1] === y) {
            tileRepr = agent.policy.symbol; // Replace last tile with agent symbol
          }
        });

        
        reprRow.push(tileRepr);
      }
      tileReprs.push(reprRow);
    }
    
    for (const agent of Object.values(Agent.agents)) {
      agent.getVision().forEach(([type, position]) => {
        const absolutePos: Vector2D = [agent.position[0] + position[0], agent.position[1] + position[1]];
        if (tileReprs[absolutePos[1]][absolutePos[0]] === TileRepresentations[TILE_TYPES.EMPTY] && agent.policy.symbol === "S") {
          tileReprs[absolutePos[1]][absolutePos[0]] = "0";
        }
      });
    }
    
    // Print the environment with agents
    for (let y = 0; y < this.size; y++) {
      let rowStr = "";
      for (let x = 0; x < this.size; x++) {
        rowStr += tileReprs[y][x] + " "; // Placeholder for actual agent logic
      }
      console.log(rowStr.trim());
    }
  }
  
  processAgents() {
    // Process each agent's actions
    Object.values(Agent.agents).forEach(agent => {
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
    return !!Object.values(Agent.agents).find(agent => agent.position[0] === x && agent.position[1] === y);
  }

  // Goal musi być podany, aby umożliwić sprawdzanie, czy sąsiad to cel
  getNeighbors = (node: Vector2D, goal: Vector2D): Vector2D[] => {
    const directions: Vector2D[] = [
      [0, -1], // UP
      [0, 1],  // DOWN
      [-1, 0], // LEFT
      [1, 0],  // RIGHT
    ];
    const neighbors: Vector2D[] = [];
    for (const dir of directions) {
      const neighbor: Vector2D = [node[0] + dir[0], node[1] + dir[1]];
      if (!this.checkTileForObstacle(neighbor) || (neighbor[0] === goal[0] && neighbor[1] === goal[1])) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }

  createPath = (from: Vector2D, to: Vector2D): Vector2D[] | null => {
    const first = aStar(from, to, this.getNeighbors);
    const second = aStar(to, [Math.floor(this.size / 2), Math.floor(this.size / 2)], this.getNeighbors);
    return [...first ?? [], ...second?.slice(1) ?? []];
  }

  collectedMessage = true
  checkStopCondition(): void {
    
  }
}