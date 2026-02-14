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
| ⬜ **DNS Tampering** | unknown | 499ms | 0% |
| ⬜ **IODA Latency** | unknown | 800ms | 5.9% |
| ⬜ **IODA Packet Loss** | unknown | 660ms | 5.9% |
| ⬜ **Psiphon Conduit Stats** | unknown | 365ms | 40% |
| ⬜ **Psiphon Global Stats** | unknown | 205ms | 0% |
| 🟥 **Facebook Blocking** | down | 9453ms | 0% |
| 🟥 **Signal Blocking** | down | 499ms | 0% |
| 🟥 **Telegram Blocking** | down | 9457ms | 0% |
| 🟥 **Tor Snowflake** | down | 501ms | 0% |
| 🟥 **Web Censorship** | down | 658ms | 53.8% |
| 🟥 **WhatsApp Blocking** | down | 654ms | 0% |
| 🟥 **irinter.net Score** | down | 447ms | 0% |
| 🟨 **Psiphon Reachability** | degraded | 498ms | 0% |
| 🟩 **ArvanCloud (AS205585)** | up | 404ms | 94.1% |
| 🟩 **Asiatech (AS43754)** | up | 375ms | 94.1% |
| 🟩 **DCI / TIC (AS12880)** | up | 324ms | 94.1% |
| 🟩 **DPI / Middlebox** | up | 658ms | 100% |
| 🟩 **IODA Active Probing** | up | 607ms | 95.5% |
| 🟩 **IODA BGP Visibility** | up | 561ms | 95.5% |
| 🟩 **IODA Google Traffic** | up | 512ms | 95.5% |
| 🟩 **IODA MERIT Telescope** | up | 545ms | 95.5% |
| 🟩 **IODA Outage Alerts** | up | 361ms | 100% |
| 🟩 **Iran ASN Count** | up | 434ms | 100% |
| 🟩 **Irancell (AS44244)** | up | 362ms | 94.1% |
| 🟩 **Irancell Route Visibility** | up | 4403ms | 100% |
| 🟩 **MCI / Hamrah-e-Aval (AS197207)** | up | 338ms | 94.1% |
| 🟩 **Mobinnet (AS50810)** | up | 406ms | 94.1% |
| 🟩 **Pishgaman (AS44208)** | up | 384ms | 94.1% |
| 🟩 **RIPE Probes Active** | up | 353ms | 100% |
| 🟩 **RIPE Probes Disconnected** | up | 331ms | 100% |
| 🟩 **Respina (AS42337)** | up | 421ms | 94.1% |
| 🟩 **Shatel (AS31549)** | up | 437ms | 94.1% |
| 🟩 **TIC Announced Prefixes** | up | 115ms | 100% |
| 🟩 **TIC Regional (AS58224)** | up | 429ms | 94.1% |
| 🟩 **Tor Bridge Users (Iran)** | up | 4860ms | 100% |
| 🟩 **Tor Reachability** | up | 657ms | 100% |
| 🟩 **Tor Relay Users (Iran)** | up | 414ms | 100% |
<!--END_STATUS_TABLE-->

> Last checked: 2026-02-14T22:43:35Z
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
