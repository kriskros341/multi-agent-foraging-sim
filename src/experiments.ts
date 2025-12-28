import { Agent } from "@/agent.ts";
import { ScoutPolicy } from "@/policies/ScoutPolicy.ts";
import { IdlePolicy } from "@/policies/IdlePolicy.ts";
import { Environment } from "@/environment.ts";
import { ConfigType, createConfig, Logger } from "./util/index.ts";
import { writeFileSync } from "fs";

const run = async (config: ConfigType) => {
  const env = new Environment(config);

  for (let i = 0; i < config.SCOUT_COUNT; i++) {
    new Agent(env)
      .setPolicy(
        new ScoutPolicy(config)
      );
  }
  
  for (let i = 0; i < config.COLLECTOR_COUNT; i++) {
    new Agent(env)
      .setPolicy(
        new IdlePolicy(config)
      );
  }

  const startingTypeCounts = env.snapshotTypeCounts();
  let iter = 0;
  
  for (iter = 0; iter < config.ITER_COUNT; iter++) {
    env.processAgents();
    
    if (!config.NOMAP) {
      console.log("=".repeat(env.size), iter + 1, "=".repeat(env.size));
      env.printEnvironmentEmplaceAgents();
    }
    
    // if (env.typeCounter.RESOURCE === 0 && env.collectedMessage) {
    //   Logger.log("All resources have been collected.");
    //   env.collectedMessage = false;
    //   env.setControls(KeyboardControls);
    //   // process.exit(0);
    // }

    if (env.typeCounter.RESOURCE === 0 && env.typeCounter.SCOUTED_RESOURCE === 0 && Object.values(env.agents).every(agent => agent.policy.symbol !== "C" && agent.policy.symbol !== "D")) {
      Logger.log("All resources have been collected and delivered. Stopping simulation.");
      break;
    }
    await env.controls?.process_input();
  }
  
  Logger.log("Simulation ended after", iter, "iterations.");
  Logger.log("Starting type counts:", startingTypeCounts);
  const endingTypeCounts = env.snapshotTypeCounts();
  Logger.log("Ending type counts:", endingTypeCounts);

  return { iter, seed: config.SEED,  startingTypeCounts, endingTypeCounts, final_environment_snapshot: env.printEnvironmentEmplaceAgents() };
}

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

const seeds = Array.from({ length: 1000 }, (_, i) => 1 + i * 67);

(async () => {
  let total = 0
  let summaries = []
  const TOTAL_SIMS = 1000
  
  const config = createConfig({
    SCOUT_COLLECTOR_CHOICE_METHOD: "bestPathCollectorChoice",
    COLLECTOR_PATH_METHOD: "greedyPathMethod",
    DELIVER_PATH_METHOD: "greedyPathMethod",
    NOMAP: true,
  });

  for (let i = 1; i <= TOTAL_SIMS; i++) {
    const startTime = performance.now()
    
    const { iter, startingTypeCounts, endingTypeCounts, final_environment_snapshot, seed } = await run({ ...config, SEED: seeds[i - 1] });
        
    const endTime = performance.now()
  
    console.log(`progress: ${i}/${TOTAL_SIMS} runs completed.`)
    summaries.push({ no: i, time: endTime - startTime, iter, startingTypeCounts, endingTypeCounts, final_environment_snapshot, seed })
  }  
  
  // write all data to a json file
  writeFileSync("greedy_results.json", JSON.stringify(
    {
      total_runs: total,
      config: flattenObject(config),
      summaries: summaries.map(s => flattenObject(s)),
    }, null, 2))
})();

(async () => {
  let total = 0
  let summaries = []
  const TOTAL_SIMS = 1000
  
  const config = createConfig({
    SCOUT_COLLECTOR_CHOICE_METHOD: "bestPathCollectorChoice",
    COLLECTOR_PATH_METHOD: "aStarPathMethod",
    DELIVER_PATH_METHOD: "greedyPathMethod",
    NOMAP: true,
  });
  for (let i = 1; i <= TOTAL_SIMS; i++) {
    const startTime = performance.now()
    
    const { iter, startingTypeCounts, endingTypeCounts, final_environment_snapshot, seed } = await run({ ...config, SEED: seeds[i - 1] });
        
    const endTime = performance.now()
  
    console.log(`progress: ${i}/${TOTAL_SIMS} runs completed.`)
    summaries.push({ no: i, time: endTime - startTime, iter, startingTypeCounts, endingTypeCounts, final_environment_snapshot, seed })
  }  
  
  // write all data to a json file
  writeFileSync("astar_results.json", JSON.stringify(
    {
      total_runs: total,
      config: flattenObject(config),
      summaries: summaries.map(s => flattenObject(s)),
    }, null, 2))
})();