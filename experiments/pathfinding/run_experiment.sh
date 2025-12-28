#!/bin/bash

# Exit on any error
set -e

echo "Starting pathfinding analysis..."

# Get the absolute path of the script's directory
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)

# --- Configuration ---
EXPERIMENT_SCRIPT="$PROJECT_ROOT/experiments/pathfinding/experiments.ts"
ANALYSIS_TEMPLATE="$SCRIPT_DIR/analyze.py"

# --- 1. Set up report name and directories ---
COMMIT_HASH=$(git rev-parse --short HEAD)
RAPORT_NAME="$(date +%Y%m%d)-${COMMIT_HASH}"
RESULTS_DIR="$SCRIPT_DIR/results/$RAPORT_NAME"

echo "Report name: $RAPORT_NAME"
echo "Results will be saved in: $RESULTS_DIR"

# --- 2. Run the TypeScript experiment ---
echo "Running TypeScript experiment to generate data..."
npx tsx "$EXPERIMENT_SCRIPT" -- --raportname "$RAPORT_NAME"
