# [📈 Live Status](https://Danialsamadi.github.io/iran-internet-monitor): 🟥 Major Outage

> Real-time monitoring of Iran's internet connectivity, censorship, and circumvention tools.
> Powered by [GitHub Actions](https://github.com/features/actions) — no server required.

This repository contains the open-source uptime monitor and status page for Iran's internet infrastructure.
Data is collected every 5 minutes using GitHub Actions, and results are committed to this repo.

[![Uptime CI](https://github.com/Danialsamadi/iran-internet-monitor/workflows/Uptime%20CI/badge.svg)](https://github.com/Danialsamadi/iran-internet-monitor/actions?query=workflow%3A%22Uptime+CI%22)
[![Pages CI](https://github.com/Danialsamadi/iran-internet-monitor/workflows/Pages%20CI/badge.svg)](https://github.com/Danialsamadi/iran-internet-monitor/actions?query=workflow%3A%22Pages+CI%22)

- [Dashboard](https://Danialsamadi.github.io/iran-internet-monitor/) · [Monitors](https://Danialsamadi.github.io/iran-internet-monitor/monitors.html) · [Incidents](https://Danialsamadi.github.io/iran-internet-monitor/incidents.html)

## [📈 Live Status](https://Danialsamadi.github.io/iran-internet-monitor): 🟥 Major Outage

<!--START_STATUS_TABLE-->
| Service | Status | Response | Uptime |
|---------|--------|----------|--------|
| ⬜ **DNS Tampering** | unknown | 583ms | 0% |
| ⬜ **IODA Latency** | unknown | 988ms | 9.1% |
| ⬜ **IODA Packet Loss** | unknown | 897ms | 9.1% |
| ⬜ **Psiphon Conduit Stats** | unknown | 359ms | 66.7% |
| ⬜ **Psiphon Global Stats** | unknown | 254ms | 0% |
| 🟥 **Facebook Blocking** | down | 593ms | 0% |
| 🟥 **Signal Blocking** | down | 593ms | 0% |
| 🟥 **Telegram Blocking** | down | 516ms | 0% |
| 🟥 **Tor Snowflake** | down | 655ms | 0% |
| 🟥 **Web Censorship** | down | 594ms | 75% |
| 🟥 **WhatsApp Blocking** | down | 594ms | 0% |
| 🟥 **irinter.net Score** | down | 554ms | 0% |
| 🟨 **Psiphon Reachability** | degraded | 594ms | 0% |
| 🟩 **ArvanCloud (AS205585)** | up | 981ms | 90.9% |
| 🟩 **Asiatech (AS43754)** | up | 805ms | 90.9% |
| 🟩 **DCI / TIC (AS12880)** | up | 998ms | 90.9% |
| 🟩 **DPI / Middlebox** | up | 706ms | 100% |
| 🟩 **IODA Active Probing** | up | 771ms | 93.8% |
| 🟩 **IODA BGP Visibility** | up | 990ms | 93.8% |
| 🟩 **IODA Google Traffic** | up | 759ms | 93.8% |
| 🟩 **IODA MERIT Telescope** | up | 738ms | 93.8% |
| 🟩 **IODA Outage Alerts** | up | 546ms | 100% |
| 🟩 **Iran ASN Count** | up | 1493ms | 100% |
| 🟩 **Irancell (AS44244)** | up | 745ms | 90.9% |
| 🟩 **Irancell Route Visibility** | up | 4401ms | 100% |
| 🟩 **MCI / Hamrah-e-Aval (AS197207)** | up | 754ms | 90.9% |
| 🟩 **Mobinnet (AS50810)** | up | 993ms | 90.9% |
| 🟩 **Pishgaman (AS44208)** | up | 808ms | 90.9% |
| 🟩 **RIPE Probes Active** | up | 540ms | 100% |
| 🟩 **RIPE Probes Disconnected** | up | 521ms | 100% |
| 🟩 **Respina (AS42337)** | up | 997ms | 90.9% |
| 🟩 **Shatel (AS31549)** | up | 995ms | 90.9% |
| 🟩 **TIC Announced Prefixes** | up | 175ms | 100% |
| 🟩 **TIC Regional (AS58224)** | up | 990ms | 90.9% |
| 🟩 **Tor Bridge Users (Iran)** | up | 552ms | 100% |
| 🟩 **Tor Reachability** | up | 516ms | 100% |
| 🟩 **Tor Relay Users (Iran)** | up | 543ms | 100% |
<!--END_STATUS_TABLE-->

> Last checked: 2026-02-14T20:22:53Z
> 24 up · 1 degraded · 7 down · 5 unknown

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

```
├── .github/workflows/     # GitHub Actions workflows
│   ├── monitor.yml        # Main uptime check (every 5 min)
│   └── pages.yml          # Deploy status page to GitHub Pages
├── api/                   # Latest status data (JSON)
├── history/               # Historical data (CSV)
├── check/                 # Go checker (parallel API checks)
├── scripts/               # update-readme (Go)
├── run-check.sh           # Run checker (builds & runs Go binary)
├── config.json            # Service configuration
├── index.html             # Dashboard (status page)
├── monitors.html          # Per-service monitors & response history
├── incidents.html         # Incidents & current status
└── README.md              # This file (auto-generated)
```

## 📄 License

Code: [MIT](./LICENSE) · Powered by open-source data from IODA, OONI, RIPE, Tor Metrics, and Psiphon.
