import { Agent } from "@/agent.ts";
import { ScoutPolicy } from "@/policies/ScoutPolicy.ts";
import { IdlePolicy } from "@/policies/IdlePolicy.ts";
import { Environment } from "@/environment.ts";
import { ConfigType, createConfig, Logger } from "@/util/index.ts";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import minimist from "minimist";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = minimist(process.argv.slice(3));

const raportname = args.raportname;

if (!raportname) {
  throw new Error("Please provide a raportname using --raportname argument.");
}

const serializeObjectStructure = (obj: any): string => {
  if (typeof obj !== "object" || obj === null) {
    return typeof obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return "array[]";
    }
    return `${serializeObjectStructure(obj[0])}[]`;
  }
  const entries = Object.entries(obj).map(
    ([key, value]) => `${key}: ${serializeObjectStructure(value)}`
  );
  return `{ ${entries.join(", ")} }`;
}

const run = async (config: ConfigType) => {
  const env = new Environment(config);

  for (let i = 0; i < config.SCOUT_COUNT; i++) {
    new Agent(env).setPolicy(new ScoutPolicy(config));
  }

  for (let i = 0; i < config.COLLECTOR_COUNT; i++) {
    new Agent(env).setPolicy(new IdlePolicy(config));
  }

  const startingTypeCounts = env.snapshotTypeCounts();
  let iter = 0;

  for (iter = 0; iter < config.ITER_COUNT; iter++) {
    env.processAgents();

    if (!config.NOMAP) {
      console.log("=".repeat(env.size), iter + 1, "=".repeat(env.size));
      env.printEnvironmentEmplaceAgents();
    }

    if (
      env.typeCounter.RESOURCE === 0 &&
      env.typeCounter.SCOUTED_RESOURCE === 0 &&
      Object.values(env.agents).every(
        (agent) => agent.policy.symbol !== "C" && agent.policy.symbol !== "D"
      )
    ) {
      Logger.log(
        "All resources have been collected and delivered. Stopping simulation."
      );
      break;
    }
    await env.controls?.process_input();
  }

  Logger.log("Simulation ended after", iter, "iterations.");
  Logger.log("Starting type counts:", startingTypeCounts);
  const endingTypeCounts = env.snapshotTypeCounts();
  Logger.log("Ending type counts:", endingTypeCounts);

  return {
    iter,
    seed: config.SEED,
    startingTypeCounts,
    endingTypeCounts,
    final_environment_snapshot: env.printEnvironmentEmplaceAgents(),
  };
};

const flattenObject = (obj: any, parentKey = "", result: any = {}) => {
  for (let key in obj) {
    const newKey = parentKey ? `${parentKey}_${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenObject(obj[key], newKey, result);
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
};

const seeds = Array.from({ length: 1000 }, (_, i) => 1 + i * 67);

const resultsDir = path.join(__dirname, "results", raportname);
mkdirSync(resultsDir, { recursive: true });

(async () => {
  let summaries = [];
  const TOTAL_SIMS = 1000;

  const greedyConfig = createConfig({
    SCOUT_COLLECTOR_CHOICE_METHOD: "bestPathCollectorChoice",
    COLLECTOR_PATH_METHOD: "greedyPathMethod",
    DELIVER_PATH_METHOD: "greedyPathMethod",
    NOMAP: true,
    ITER_COUNT: 1000,
  });

  for (let i = 1; i <= TOTAL_SIMS; i++) {
    const startTime = performance.now();

    const {
      iter,
      startingTypeCounts,
      endingTypeCounts,
      final_environment_snapshot,
      seed,
    } = await run({ ...greedyConfig, SEED: seeds[i - 1] });

    const endTime = performance.now();

    summaries.push({
      no: i,
      time: endTime - startTime,
      iter,
      startingTypeCounts,
      endingTypeCounts,
      final_environment_snapshot,
      seed,
    });
  }

  const result = {
    config: flattenObject(greedyConfig),
    summaries: summaries.map((s) => flattenObject(s)),
  }
    

  const greedyPath = path.join(resultsDir, "greedy_results.json");
  console.log("Writing Greedy results to", greedyPath);
  console.log("Result object structure:", serializeObjectStructure(result));
  writeFileSync(
    greedyPath,
    JSON.stringify(
      {
        config: flattenObject(greedyConfig),
        summaries: summaries.map((s) => flattenObject(s)),
      },
      null,
      2
    )
  );
})();

(async () => {
  let summaries = [];
  const TOTAL_SIMS = 1000;

  const astarConfig = createConfig({
    SCOUT_COLLECTOR_CHOICE_METHOD: "bestPathCollectorChoice",
    COLLECTOR_PATH_METHOD: "aStarPathMethod",
    DELIVER_PATH_METHOD: "greedyPathMethod",
    NOMAP: true,
    ITER_COUNT: 1000,
  });
  for (let i = 1; i <= TOTAL_SIMS; i++) {
    const startTime = performance.now();

    const {
      iter,
      startingTypeCounts,
      endingTypeCounts,
      final_environment_snapshot,
      seed,
    } = await run({ ...astarConfig, SEED: seeds[i - 1] });

    const endTime = performance.now();

    summaries.push({
      no: i,
      time: endTime - startTime,
      iter,
      startingTypeCounts,
      endingTypeCounts,
      final_environment_snapshot,
      seed,
    });
  }

  const result = {
    config: flattenObject(astarConfig),
    summaries: summaries.map((s) => flattenObject(s)),
  }
  const astarPath = path.join(resultsDir, "astar_results.json");
  console.log("Writing A* results to", astarPath);
  console.log("Result object structure:", serializeObjectStructure(result));
  writeFileSync(
    astarPath,
    JSON.stringify(
      result,
      null,
      2
    )
  );
})();
