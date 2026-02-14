#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Update README.md with live status table
# Similar to Upptime's summary workflow
# ═══════════════════════════════════════════════════════════════

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
API_DIR="$ROOT_DIR/api"
CONFIG="$ROOT_DIR/config.json"
README="$ROOT_DIR/README.md"

# ─── Read summary ────────────────────────────────────────────
SUMMARY_FILE="$API_DIR/summary.json"
if [ ! -f "$SUMMARY_FILE" ]; then
    echo "No summary data yet, skipping README update"
    exit 0
fi

overall=$(jq -r '.overall_status // "unknown"' "$SUMMARY_FILE")
up=$(jq -r '.up // 0' "$SUMMARY_FILE")
degraded=$(jq -r '.degraded // 0' "$SUMMARY_FILE")
down=$(jq -r '.down // 0' "$SUMMARY_FILE")
unknown=$(jq -r '.unknown // 0' "$SUMMARY_FILE")
last_check=$(jq -r '.last_check // "unknown"' "$SUMMARY_FILE")

# ─── Determine overall emoji ─────────────────────────────────
case "$overall" in
    up)             emoji="🟩"; label="All Systems Operational" ;;
    degraded)       emoji="🟨"; label="Minor Degradation" ;;
    partial_outage) emoji="🟧"; label="Partial Outage" ;;
    major_outage)   emoji="🟥"; label="Major Outage" ;;
    *)              emoji="⬜"; label="Unknown" ;;
esac

# ─── Build status table ──────────────────────────────────────
TABLE="| Service | Status | Response | Uptime |\n"
TABLE+="|---------|--------|----------|--------|\n"

# Read each service status file
for f in "$API_DIR"/*.json; do
    fname=$(basename "$f")
    [ "$fname" = "summary.json" ] && continue
    [ "$fname" = "page-data.json" ] && continue
    
    id=$(jq -r '.id // ""' "$f" 2>/dev/null)
    [ -z "$id" ] && continue
    
    name=$(jq -r '.name // "Unknown"' "$f")
    status=$(jq -r '.status // "unknown"' "$f")
    resp=$(jq -r '.response_time_ms // 0' "$f")
    uptime_pct=$(jq -r '.uptime_pct // 0' "$f")
    message=$(jq -r '.message // ""' "$f")
    
    # Status emoji
    case "$status" in
        up)       s_emoji="🟩" ;;
        degraded) s_emoji="🟨" ;;
        down)     s_emoji="🟥" ;;
        *)        s_emoji="⬜" ;;
    esac
    
    # Uptime color badge
    uptime_int="${uptime_pct%%.*}"
    if [ "$uptime_int" -ge 99 ] 2>/dev/null; then
        uptime_color="brightgreen"
    elif [ "$uptime_int" -ge 95 ] 2>/dev/null; then
        uptime_color="green"
    elif [ "$uptime_int" -ge 90 ] 2>/dev/null; then
        uptime_color="yellow"
    else
        uptime_color="red"
    fi
    
    TABLE+="| ${s_emoji} **${name}** | ${status} | ${resp}ms | ${uptime_pct}% |\n"
done

# ─── Get owner/repo from config ──────────────────────────────
OWNER=$(jq -r '.owner // "Danialsamadi"' "$CONFIG")
REPO=$(jq -r '.repo // "iran-internet-monitor"' "$CONFIG")
PAGE_URL=$(jq -r '.url // ""' "$CONFIG")
[ -z "$PAGE_URL" ] && PAGE_URL="https://${OWNER}.github.io/${REPO}"

# ─── Generate README ─────────────────────────────────────────
cat > "$README" << READMEEOF
# [📈 Live Status](${PAGE_URL}): ${emoji} ${label}

> Real-time monitoring of Iran's internet connectivity, censorship, and circumvention tools.
> Powered by [GitHub Actions](https://github.com/features/actions) — no server required.

This repository contains the open-source uptime monitor and status page for Iran's internet infrastructure.
Data is collected every 5 minutes using GitHub Actions, and results are committed to this repo.

[![Uptime CI](https://github.com/${OWNER}/${REPO}/workflows/Uptime%20CI/badge.svg)](https://github.com/${OWNER}/${REPO}/actions?query=workflow%3A%22Uptime+CI%22)
[![Pages CI](https://github.com/${OWNER}/${REPO}/workflows/Pages%20CI/badge.svg)](https://github.com/${OWNER}/${REPO}/actions?query=workflow%3A%22Pages+CI%22)

## [📈 Live Status](${PAGE_URL}): ${emoji} ${label}

<!--START_STATUS_TABLE-->
$(echo -e "$TABLE")
<!--END_STATUS_TABLE-->

> Last checked: ${last_check}
> ${up} up · ${degraded} degraded · ${down} down · ${unknown} unknown

## ⭐ How it works

- **GitHub Actions** checks all endpoints every 5 minutes
- **Response time** and status are recorded and committed to git
- **GitHub Issues** are automatically opened/closed for incidents
- **GitHub Pages** hosts the status page website
- **History** is tracked in CSV files for long-term trend analysis

### Data Sources

| Provider | What it measures |
|----------|-----------------|
| [IODA](https://ioda.inetintel.cc.gatech.edu/) | BGP visibility, active probing, outage detection |
| [OONI](https://ooni.org/) | Censorship, app blocking, DPI detection |
| [irinter.net](https://irinter.net/) | Iran network quality score |
| [RIPE Atlas](https://atlas.ripe.net/) | Probe connectivity, routing analytics |
| [RIPEstat](https://stat.ripe.net/) | BGP analytics, prefix visibility |
| [Tor Metrics](https://metrics.torproject.org/) | Tor/bridge users from Iran |
| [Psiphon](https://psiphon.ca/) | Conduit stations, user stats |

## 📂 Repository Structure

\`\`\`
├── .github/workflows/     # GitHub Actions workflows
│   ├── monitor.yml        # Main uptime check (every 5 min)
│   └── pages.yml          # Deploy status page to GitHub Pages
├── api/                   # Latest status data (JSON)
├── history/               # Historical data (CSV)
├── check/                 # Go checker (parallel API checks)
├── scripts/
│   └── update-readme.sh   # README auto-update
├── run-check.sh           # Run checker (builds & runs Go binary)
├── config.json            # Service configuration
├── index.html             # Status page
└── README.md              # This file (auto-generated)
\`\`\`

## 📄 License

Code: [MIT](./LICENSE) · Powered by open-source data from IODA, OONI, RIPE, Tor Metrics, and Psiphon.

READMEEOF

echo "README.md updated with live status"
