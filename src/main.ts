import { Agent } from "@/agent.ts";
import { ScoutPolicy } from "@/policies/ScoutPolicy.ts";
import { IdlePolicy } from "@/policies/IdlePolicy.ts";
import { Environment } from "@/environment.ts";
import { createConfig, Logger } from "./util/index.ts";

const config = createConfig({
  SCOUT_COLLECTOR_CHOICE_METHOD: "bestPathCollectorChoice",
  COLLECTOR_PATH_METHOD: "greedyPathMethod",
  DELIVER_PATH_METHOD: "greedyPathMethod",
  NOMAP: false,
});

const env = new Environment(config);

for (let i = 0; i < config.SCOUT_COUNT; i++) {
  new Agent(env).setPolicy(new ScoutPolicy(config));
}

// new Agent(env).setPolicy(new ScoutPolicy().setCollectorChoiceFunction(astarChoice));

for (let i = 0; i < config.COLLECTOR_COUNT; i++) {
  new Agent(env).setPolicy(new IdlePolicy(config));
}

const startingTypeCounts = env.snapshotTypeCounts();

for (let iter = 0; iter < config.ITER_COUNT; iter++) {
  env.processAgents();
  console.log("=".repeat(env.size), iter + 1, "=".repeat(env.size));
  env.printEnvironmentEmplaceAgents();
  
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

Logger.log("Starting type counts:", startingTypeCounts);
const endingTypeCounts = env.snapshotTypeCounts();
Logger.log("Ending type counts:", endingTypeCounts);