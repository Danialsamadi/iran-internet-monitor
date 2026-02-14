# [📈 Live Status](https://Danialsamadi.github.io/iran-internet-monitor): 🟥 Major Outage

> Real-time monitoring of Iran's internet connectivity, censorship, and circumvention tools.
> Powered by [GitHub Actions](https://github.com/features/actions) — no server required.

This repository contains the open-source uptime monitor and status page for Iran's internet infrastructure.
Data is collected every 5 minutes using GitHub Actions, and results are committed to this repo.

[![Uptime CI](https://github.com/Danialsamadi/iran-internet-monitor/workflows/Uptime%20CI/badge.svg)](https://github.com/Danialsamadi/iran-internet-monitor/actions?query=workflow%3A%22Uptime+CI%22)
[![Pages CI](https://github.com/Danialsamadi/iran-internet-monitor/workflows/Pages%20CI/badge.svg)](https://github.com/Danialsamadi/iran-internet-monitor/actions?query=workflow%3A%22Pages+CI%22)

## [📈 Live Status](https://Danialsamadi.github.io/iran-internet-monitor): 🟥 Major Outage

<!--START_STATUS_TABLE-->
| Service | Status | Response | Uptime |
|---------|--------|----------|--------|
| 🟩 **IODA Outage Alerts** | up | 224ms | 100% |
| 🟩 **IODA BGP Visibility** | up | 440ms | 83.33333333333334% |
| 🟩 **IODA Google Traffic** | up | 446ms | 83.33333333333334% |
| ⬜ **IODA Latency** | unknown | 1008ms | 33.33333333333333% |
| ⬜ **IODA Packet Loss** | unknown | 784ms | 33.33333333333333% |
| 🟩 **IODA MERIT Telescope** | up | 422ms | 83.33333333333334% |
| 🟩 **IODA Active Probing** | up | 419ms | 83.33333333333334% |
| 🟥 **irinter.net Score** | down | 454ms | 0% |
| 🟩 **ArvanCloud (AS205585)** | up | 783ms | 66.66666666666666% |
| 🟩 **Asiatech (AS43754)** | up | 598ms | 66.66666666666666% |
| 🟩 **Irancell (AS44244)** | up | 788ms | 66.66666666666666% |
| 🟩 **MCI / Hamrah-e-Aval (AS197207)** | up | 777ms | 66.66666666666666% |
| 🟩 **Mobinnet (AS50810)** | up | 694ms | 66.66666666666666% |
| 🟩 **Pishgaman (AS44208)** | up | 809ms | 66.66666666666666% |
| 🟩 **Respina (AS42337)** | up | 730ms | 66.66666666666666% |
| 🟩 **Shatel (AS31549)** | up | 805ms | 66.66666666666666% |
| 🟩 **TIC Regional (AS58224)** | up | 731ms | 66.66666666666666% |
| 🟩 **DCI / TIC (AS12880)** | up | 789ms | 66.66666666666666% |
| ⬜ **DNS Tampering** | unknown | 714ms | 0% |
| 🟩 **DPI / Middlebox** | up | 658ms | 100% |
| 🟥 **Facebook Blocking** | down | 664ms | 0% |
| 🟨 **Psiphon Reachability** | degraded | 715ms | 0% |
| 🟥 **Signal Blocking** | down | 659ms | 0% |
| 🟥 **Telegram Blocking** | down | 660ms | 0% |
| 🟩 **Tor Reachability** | up | 713ms | 100% |
| 🟥 **Tor Snowflake** | down | 717ms | 0% |
| 🟩 **Web Censorship** | up | 794ms | 100% |
| 🟥 **WhatsApp Blocking** | down | 716ms | 0% |
| 🟩 **Psiphon Conduit Stats** | up | 6251ms | 100.00% |
| ⬜ **Psiphon Global Stats** | unknown | 2802ms | 0.00% |
| 🟩 **RIPE Probes Disconnected** | up | 607ms | 100% |
| 🟩 **RIPE Probes Active** | up | 619ms | 100% |
| 🟩 **Iran ASN Count** | up | 1493ms | 100.00% |
| 🟩 **Irancell Route Visibility** | up | 7769ms | 100.00% |
| 🟩 **TIC Announced Prefixes** | up | 21661ms | 100.00% |
| 🟩 **Tor Bridge Users (Iran)** | up | 4626ms | 100.00% |
| 🟩 **Tor Relay Users (Iran)** | up | 18377ms | 100.00% |
<!--END_STATUS_TABLE-->

> Last checked: 2026-02-14T18:15:09Z
> 26 up · 1 degraded · 6 down · 4 unknown

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
├── scripts/
│   └── update-readme.sh   # README auto-update
├── run-check.sh           # Run checker (builds & runs Go binary)
├── config.json            # Service configuration
├── index.html             # Status page
└── README.md              # This file (auto-generated)
```

## 📄 License

Code: [MIT](./LICENSE) · Powered by open-source data from IODA, OONI, RIPE, Tor Metrics, and Psiphon.

