# Iran Internet Monitor

Real-time monitoring of Iran's internet connectivity, censorship, and circumvention tools. Powered by GitHub Actions — no server required.

## Live Status

After the first workflow run, this section is replaced with the live status table. See [GitHub Actions](.github/workflows/monitor.yml) and the status page (once [GitHub Pages](.github/workflows/pages.yml) is enabled).

## Quick Start

**Run locally (requires [Go](https://go.dev/) 1.21+):**

```bash
./run-check.sh
```

---

## Push & Deploy

### Option A — One-command setup (new repo)

```bash
bash setup.sh YOUR_GITHUB_USERNAME iran-internet-monitor
```

Then complete **Step 2** below.

### Option B — Push existing repo

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/iran-internet-monitor.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Repo → **Settings** → **Pages**
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` / `/ (root)` → Save
   - Status page: `https://YOUR_USERNAME.github.io/iran-internet-monitor`

3. **First data run**
   - **Actions** → **Uptime CI** → **Run workflow** (or wait for the 5‑min schedule)
   - After it runs, the status page will show data and **Pages CI** will deploy the site.

4. **(Optional) Incident labels**
   ```bash
   gh label create "status:down" --color e74c3c --repo YOUR_USERNAME/iran-internet-monitor
   gh label create "status:degraded" --color f39c12 --repo YOUR_USERNAME/iran-internet-monitor
   gh label create "automated" --color 6c757d --repo YOUR_USERNAME/iran-internet-monitor
   ```

## How It Works

- **Uptime CI** (every 5 min): Go checker runs in parallel, hits 37 API endpoints (IODA, OONI, irinter.net, RIPE, Psiphon, Tor Metrics, RIPEstat), writes `api/*.json` and `history/*.csv`, opens/closes GitHub Issues for incidents.
- **Pages CI**: Builds the status site from `index.html`, `monitors.html`, `incidents.html`, and `api/` → deploys to GitHub Pages.
- **Status page**: Dark-theme dashboard; reads `api/page-data.json`, auto-refreshes.

## Repository Structure

```
├── .github/workflows/   # Uptime CI, Pages CI
├── check/               # Go checker (parallel API checks)
├── scripts/             # update-readme.sh
├── api/                 # Status JSON (committed by workflow)
├── history/             # History CSV (committed by workflow)
├── config.json          # Services to monitor
├── index.html           # Main status page
├── monitors.html        # Monitors view
├── incidents.html       # Incidents view
├── run-check.sh         # Run checker locally
└── setup.sh             # One-command GitHub setup
```

## Data Sources

| Provider | What it measures |
|----------|------------------|
| [IODA](https://ioda.inetintel.cc.gatech.edu/) | BGP visibility, active probing, outage alerts |
| [OONI](https://ooni.org/) | Censorship, app blocking, DPI detection |
| [irinter.net](https://irinter.net/) | Iran network quality score |
| [RIPE Atlas](https://atlas.ripe.net/) | Probe connectivity |
| [RIPEstat](https://stat.ripe.net/) | BGP analytics |
| [Tor Metrics](https://metrics.torproject.org/) | Tor/bridge users from Iran |
| [Psiphon](https://psiphon.ca/) | Conduit stations, user stats |

## License

MIT. Data from IODA, OONI, RIPE, Tor Metrics, Psiphon — see [APIs.md](APIs.md) for endpoints.
