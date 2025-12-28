import { Agent } from "@/agent.ts";
import { ScoutPolicy } from "@/policies/ScoutPolicy.ts";
import { IdlePolicy } from "@/policies/IdlePolicy.ts";
import { Environment, KeyboardControls } from "@/environment.ts";
import { ConfigType, createConfig, Logger } from "@/util/index.ts";

const flattenObject = (obj: any, parentKey = '', result: any = {}) => {
  for (let key in obj) {
    const newKey = parentKey ? `${parentKey}_${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      flattenObject(obj[key], newKey, result);
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
};

const run = async (config1: ConfigType, config2: ConfigType) => {
  const env1 = new Environment(config1);
  const env2 = new Environment(config2);

  for (let i = 0; i < config1.SCOUT_COUNT; i++) {
    new Agent(env1)
      .setPolicy(
        new ScoutPolicy(config1)
      );
  }

  for (let i = 0; i < config2.SCOUT_COUNT; i++) {
    new Agent(env2)
      .setPolicy(
        new ScoutPolicy(config2)
      );
  }
  
  for (let i = 0; i < config1.COLLECTOR_COUNT; i++) {
    new Agent(env1)
      .setPolicy(
        new IdlePolicy(config1)
      );
  }

  for (let i = 0; i < config2.COLLECTOR_COUNT; i++) {
    new Agent(env2)
      .setPolicy(
        new IdlePolicy(config2)
      );
  }

  const startingTypeCounts = env1.snapshotTypeCounts();
  let iter = 0;
  
  for (iter = 0; iter < Math.min(config1.ITER_COUNT, config2.ITER_COUNT); iter++) {
    env1.processAgents();
    env2.processAgents();
    
    console.log("=".repeat(env1.size), iter + 1, "=".repeat(env1.size));
    const env1map = env1.printEnvironmentEmplaceAgents();
    const env2map = env2.printEnvironmentEmplaceAgents();

    const combinedMap = env1map.split("\n").map((line, index) => line + "    " + env2map.split("\n")[index]).join("\n");
    console.log(combinedMap);

    // check if agents diverged
    const env1Positions = Object.values(env1.agents).map(agent => agent.position);
    if (!env1.controls) {
      for (const env1Position of env1Positions) {
        const agent = Object.values(env2.agents).find(agent => {
          if (agent.position[0] === env1Position[0] && agent.position[1] === env1Position[1]) {
            return true;
          }
        });
        if (!agent) {
          Logger.log("Agents have diverged in their positions. switching to user input mode.");
          env1.setControls(KeyboardControls);
          break;
        }
      }
    }
    
    if (env1.typeCounter.RESOURCE === 0 && env1.typeCounter.SCOUTED_RESOURCE === 0 && Object.values(env1.agents).every(agent => agent.policy.symbol !== "C" && agent.policy.symbol !== "D")) {
      Logger.log("All resources have been collected and delivered. Stopping simulation.");
      break;
    }
    await env1.controls?.process_input();
  }
  
  Logger.log("Simulation ended after", iter, "iterations.");
  Logger.log("Starting type counts:", startingTypeCounts);
  const endingTypeCounts = env1.snapshotTypeCounts();
  Logger.log("Ending type counts:", endingTypeCounts);

  return { iter, seed: config1.SEED,  startingTypeCounts, endingTypeCounts, final_environment_snapshot: [env1.printEnvironmentEmplaceAgents(), env2.printEnvironmentEmplaceAgents()] };
}

(async () => {
  const config1 = createConfig({
    SCOUT_COLLECTOR_CHOICE_METHOD: "bestPathCollectorChoice",
    COLLECTOR_PATH_METHOD: "greedyPathMethod",
    DELIVER_PATH_METHOD: "greedyPathMethod",
  });

  const config2 = createConfig({
    SCOUT_COLLECTOR_CHOICE_METHOD: "bestPathCollectorChoice",
    COLLECTOR_PATH_METHOD: "aStarPathMethod",
    DELIVER_PATH_METHOD: "greedyPathMethod",
  });

  const startTime = performance.now()
  
  const { iter, startingTypeCounts, endingTypeCounts, final_environment_snapshot } = await run(config1, config2);
      
  const endTime = performance.now()
  console.log({ iter, startingTypeCounts, endingTypeCounts, final_environment_snapshot });

  console.log("Total time for experiments:", (endTime - startTime).toFixed(2), "ms");
  console.log(config1, "vs", config2);
})();
