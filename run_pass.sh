#!/bin/bash
# Iran Internet Monitor — data collection pass
# Runs the Go binary to collect data, then exits.
# The Hermes agent handles analysis, git, and push.
set -euo pipefail
cd /root/iran-internet-monitor
./bin/monitor -repo . -no-llm -no-git 2>&1
echo "---DATA_COLLECTED---"
cat data/latest.json
