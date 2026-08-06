#!/bin/bash
# Iran Internet Monitor — data collection + commit + push
# Runs the Go binary, commits results, and pushes to GitHub.
# The LLM analysis is handled by a separate cron job with clean context.
set -e

cd /root/iran-internet-monitor

# 1. Run the Go binary to collect data
./bin/monitor -repo . -no-llm -no-git 2>&1

# 2. Git add, commit, push
git add data/latest.json data/networks.json data/networks_history.jsonl data/site.json data/raw/ 2>/dev/null
git commit -m "pass $(date -u +%H:%MZ) — data collection" 2>/dev/null || true
git push origin main 2>/dev/null || true

# 3. Output the latest data summary for the analysis cron to pick up
python3 -c "
import json
d = json.load(open('data/latest.json'))
print(f\"ts={d['ts']} overall={d['overall']} up={d['counts']['up']} degraded={d['counts']['degraded']} down={d['counts']['down']}\")
" 2>/dev/null || true
