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
| ⬜ **DNS Tampering** | unknown | 6637ms | 0% |
| ⬜ **IODA Latency** | unknown | 677ms | 4.8% |
| ⬜ **IODA Packet Loss** | unknown | 496ms | 4.8% |
| ⬜ **Psiphon Conduit Stats** | unknown | 422ms | 28.6% |
| ⬜ **Psiphon Global Stats** | unknown | 321ms | 0% |
| 🟥 **Facebook Blocking** | down | 682ms | 0% |
| 🟥 **Signal Blocking** | down | 6633ms | 0% |
| 🟥 **Telegram Blocking** | down | 750ms | 0% |
| 🟥 **Tor Snowflake** | down | 804ms | 0% |
| 🟥 **WhatsApp Blocking** | down | 751ms | 0% |
| 🟥 **irinter.net Score** | down | 382ms | 0% |
| 🟨 **Psiphon Reachability** | degraded | 681ms | 0% |
| 🟩 **ArvanCloud (AS205585)** | up | 366ms | 95.2% |
| 🟩 **Asiatech (AS43754)** | up | 387ms | 95.2% |
| 🟩 **DCI / TIC (AS12880)** | up | 366ms | 95.2% |
| 🟩 **DPI / Middlebox** | up | 6638ms | 100% |
| 🟩 **IODA Active Probing** | up | 389ms | 96.2% |
| 🟩 **IODA BGP Visibility** | up | 373ms | 96.2% |
| 🟩 **IODA Google Traffic** | up | 386ms | 96.2% |
| 🟩 **IODA MERIT Telescope** | up | 371ms | 96.2% |
| 🟩 **IODA Outage Alerts** | up | 237ms | 100% |
| 🟩 **Iran ASN Count** | up | 434ms | 100% |
| 🟩 **Irancell (AS44244)** | up | 389ms | 95.2% |
| 🟩 **Irancell Route Visibility** | up | 4444ms | 100% |
| 🟩 **MCI / Hamrah-e-Aval (AS197207)** | up | 441ms | 95.2% |
| 🟩 **Mobinnet (AS50810)** | up | 460ms | 95.2% |
| 🟩 **Pishgaman (AS44208)** | up | 403ms | 95.2% |
| 🟩 **RIPE Probes Active** | up | 299ms | 100% |
| 🟩 **RIPE Probes Disconnected** | up | 351ms | 100% |
| 🟩 **Respina (AS42337)** | up | 346ms | 95.2% |
| 🟩 **Shatel (AS31549)** | up | 418ms | 95.2% |
| 🟩 **TIC Announced Prefixes** | up | 285ms | 100% |
| 🟩 **TIC Regional (AS58224)** | up | 429ms | 95.2% |
| 🟩 **Tor Bridge Users (Iran)** | up | 2977ms | 100% |
| 🟩 **Tor Reachability** | up | 6635ms | 94.1% |
| 🟩 **Tor Relay Users (Iran)** | up | 3123ms | 100% |
| 🟩 **Web Censorship** | up | 760ms | 47.1% |
<!--END_STATUS_TABLE-->

> Last checked: 2026-02-15T01:02:12Z
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
