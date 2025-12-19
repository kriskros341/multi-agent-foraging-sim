# Multi-Agent System

This project is a simulation of a multi-agent system for a resource collection task. In this simulation, agents with different roles (scouts and collectors) work together to find and collect resources in a 2D grid environment.

## Features

*   **Policy-Based Agent Design:** Agent behavior is defined by interchangeable policies (e.g., `ScoutPolicy`, `CollectorPolicy`).
*   **Inter-Agent Communication:** Agents communicate using a message-passing system.
*   **2D Grid Environment:** A customizable 2D grid serves as the world for the agents.
*   **Multiple Agent Roles:**
    *   **Scouts:** Explore the environment to find resources.
    *   **Collectors:** Collect resources discovered by scouts.
*   **Simulation and Evaluation:** The simulation runs for a configurable number of iterations and outputs performance metrics at the end.

## Installation

1.  Clone the repository.
2.  Install the dependencies using `pnpm`:

    ```bash
    pnpm install
    ```

## Usage

To run the simulation, use the `pnpm start` command:

```bash
pnpm start
```

### Configuration

You can configure the simulation by passing command-line arguments after the `--` in the `pnpm start` command.

| Argument      | Description                  | Default |
|---------------|------------------------------|---------|
| `--scouts`    | Number of scout agents.      | 1       |
| `--collectors`| Number of collector agents.  | 1       |
| `--iterations`| Number of simulation steps.  | 50     |
| `--envsize`   | Size of the square environment grid. | 11      |
| `--seed`      | Seed for the random number generator. | null    |
| `--log`       | Enable detailed logging.     | false   |

**Example:**

To run the simulation with 5 scouts, 10 collectors, for 200 iterations in a 20x20 environment, with logging enabled and a specific random seed:

```bash
pnpm start -- --scouts 5 --collectors 10 --iterations 200 --envsize 20 --log --seed 67
```

## Project Structure

*   `src/`: Contains the main source code.
    *   `agent.ts`: The `Agent` class definition.
    *   `environment.ts`: The `Environment` class and tile definitions.
    *   `main.ts`: The main simulation entry point.
    *   `policies/`: Contains the different agent behavior policies.
    *   `message/`: Message types for agent communication.
    *   `util/`: Utility functions, including configuration management.
*   `package.json`: Project metadata and dependencies.