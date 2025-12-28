#!/bin/bash

# Exit on any error
set -e

echo "Starting pathfinding analysis..."

# Get the absolute path of the script's directory
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# --- 1. Set up report name and directories ---
COMMIT_HASH=$(git rev-parse --short HEAD)
RAPORT_NAME="$(date +%Y%m%d)-${COMMIT_HASH}"
RESULTS_DIR="$SCRIPT_DIR/results/$RAPORT_NAME"

# --- Configuration ---
ANALYSIS_SCRIPT="$RESULTS_DIR/analysis.py"

# --- 3. Run the Python analysis script ---
echo "Running Python script to analyze results and generate report..."
(cd "$RESULTS_DIR" && python3 "analysis.py")
echo "---"
echo "✅ Analysis process completed successfully!"
echo "Report available at: $RESULTS_DIR/REPORT.md"
