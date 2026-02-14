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
| 🟩 **IODA Outage Alerts** | up | 233ms | 100% |
| 🟩 **IODA BGP Visibility** | up | 398ms | 87.5% |
| 🟩 **IODA Google Traffic** | up | 567ms | 87.5% |
| ⬜ **IODA Latency** | unknown | 754ms | 20% |
| ⬜ **IODA Packet Loss** | unknown | 473ms | 20% |
| 🟩 **IODA MERIT Telescope** | up | 481ms | 87.5% |
| 🟩 **IODA Active Probing** | up | 499ms | 87.5% |
| 🟥 **irinter.net Score** | down | 441ms | 0% |
| 🟩 **ArvanCloud (AS205585)** | up | 548ms | 80% |
| 🟩 **Asiatech (AS43754)** | up | 427ms | 80% |
| 🟩 **Irancell (AS44244)** | up | 560ms | 80% |
| 🟩 **MCI / Hamrah-e-Aval (AS197207)** | up | 533ms | 80% |
| 🟩 **Mobinnet (AS50810)** | up | 575ms | 80% |
| 🟩 **Pishgaman (AS44208)** | up | 350ms | 80% |
| 🟩 **Respina (AS42337)** | up | 405ms | 80% |
| 🟩 **Shatel (AS31549)** | up | 401ms | 80% |
| 🟩 **TIC Regional (AS58224)** | up | 554ms | 80% |
| 🟩 **DCI / TIC (AS12880)** | up | 552ms | 80% |
| ⬜ **DNS Tampering** | unknown | 163ms | 0% |
| 🟩 **DPI / Middlebox** | up | 206ms | 100% |
| 🟥 **Facebook Blocking** | down | 187ms | 0% |
| 🟨 **Psiphon Reachability** | degraded | 192ms | 0% |
| 🟥 **Signal Blocking** | down | 519ms | 0% |
| 🟥 **Telegram Blocking** | down | 179ms | 0% |
| 🟩 **Tor Reachability** | up | 458ms | 100% |
| 🟥 **Tor Snowflake** | down | 169ms | 0% |
| 🟩 **Web Censorship** | up | 420ms | 100% |
| 🟥 **WhatsApp Blocking** | down | 178ms | 0% |
| ⬜ **Psiphon Conduit Stats** | unknown | 314ms | 100% |
| ⬜ **Psiphon Global Stats** | unknown | 340ms | 0% |
| 🟩 **RIPE Probes Disconnected** | up | 355ms | 100% |
| 🟩 **RIPE Probes Active** | up | 455ms | 100% |
| 🟩 **Iran ASN Count** | up | 1493ms | 100.00% |
| 🟩 **Irancell Route Visibility** | up | 4269ms | 100% |
| 🟩 **TIC Announced Prefixes** | up | 147ms | 100% |
| 🟩 **Tor Bridge Users (Iran)** | up | 425ms | 100% |
| 🟩 **Tor Relay Users (Iran)** | up | 420ms | 100% |
<!--END_STATUS_TABLE-->

> Last checked: 2026-02-14T18:44:11Z
> 25 up · 1 degraded · 6 down · 5 unknown

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

