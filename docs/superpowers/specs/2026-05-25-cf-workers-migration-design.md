# IR-NETWATCH — Cloudflare Workers Migration Design

_2026-05-25_

## Overview

Migrate the Iran Internet Monitor from GitHub Pages + GitHub Actions + Go binary to a Cloudflare Workers stack. The visual design is sourced from a Claude Design prototype (`Iran Internet Status.html`) — a technical monitoring console called **IR-NETWATCH** with four screens, bilingual EN/فا support with RTL, and a dark/light theme system.

---

## Repository Structure

```
ir-netwatch/
├── wrangler.toml              # CF Worker config: KV bindings, cron, assets
├── package.json               # scripts: dev, deploy
├── src/
│   ├── worker.ts              # Entry point: routes + cron trigger
│   ├── checker.ts             # HTTP fetch checks with timeout + uptime logic
│   ├── kv.ts                  # KV read/write helpers + TypeScript types
│   ├── telegram.ts            # Telegram bot notifications
│   └── config.ts              # Endpoint catalog (replaces config.json)
└── public/                    # Worker Assets — served from Cloudflare CDN
    ├── index.html
    ├── app.jsx
    ├── data.jsx
    ├── detail.jsx
    ├── i18n.jsx
    ├── tweaks-panel.jsx
    ├── styles.css
    ├── styles-2.css
    └── styles-3.css
```

**Deployment:** `wrangler deploy` publishes the Worker script + static assets in one step. `wrangler dev` for local development (KV in local mode).

---

## Worker Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/status` | Full `page-data` aggregate: `{ services, summary, categories, generated }` |
| `GET` | `/api/status/:id` | Single `ServiceResult` for one endpoint |
| `GET` | `/*` | Pass-through to Worker Assets (static frontend files) |

All API responses include `Content-Type: application/json` and `Cache-Control: no-store`.

---

## Cron Trigger

Schedule: `*/5 * * * *` (matches existing GitHub Actions cadence).

**Execution steps:**
1. Read endpoint catalog from `config.ts`
2. For each endpoint, read `status:{id}` from KV to check `last_check_epoch`; skip if `elapsed < interval`
3. Fan-out HTTP checks with `Promise.allSettled`, max 20 concurrent
4. For each result:
   a. Read previous `ServiceResult` from KV (`status:{id}`)
   b. If `prev_status !== new_status` and `prev_status !== 'unknown'` → queue Telegram notification
   c. Append to `history:{id}` CSV; trim to 8640 rows
   d. Compute `uptime_pct` from history
   e. Write `status:{id}` with new `ServiceResult`
5. Build aggregate `page-data` from all `ServiceResult` values; write to KV
6. Send queued Telegram notifications

---

## HTTP Check Logic (`checker.ts`)

Each check does a `GET` request with a 10-second timeout using the Workers `fetch()` API.

**Status determination per service type:**

| Type | Logic |
|------|-------|
| `http` | 2xx → `up`; 4xx/5xx → `down`; timeout → `down` |
| `ioda_signal` | Same as existing Go: `pct = latest/max * 100`; `< threshCrit` → `down`; `< threshWarn` → `degraded` |
| `ioda_alerts` | Alert count > 0 → `degraded`; 0 → `up` |
| `ooni_aggregation` | `anomaly% > 80` → `down`; `> 30` → `degraded`; else `up` |
| `irinter_score` | Score `< threshCrit` → `down`; `< threshWarn` → `degraded` |
| `ripe_probes` | Always `up` (count reported as value) |
| `psiphon_stats` | Parse stations/users; failure → `unknown` |
| `tor_csv` | Parse last CSV row; no data → `unknown` |
| `ripestat` | `status === "ok"` → `up`; else `unknown` |

URL template expansion (`__NOW__`, `__7D_AGO__`, etc.) is ported from the Go `expandURL` function.

**TCP → HTTPS replacement:** All former `ir-tcp-*` services are converted:
- Services where the host has a known HTTPS endpoint → replaced with `type: "http"` check against that URL
- Bare IP addresses with no HTTP service → dropped from catalog

---

## KV Schema

Single KV namespace (`IR_NETWATCH`), three key prefixes:

| Key | Value | Notes |
|-----|-------|-------|
| `status:{id}` | `ServiceResult` JSON | Overwritten each check run |
| `history:{id}` | Newline-delimited CSV: `timestamp,status,value,response_time_ms,http_code` | Max 8640 rows (~30 days at 5-min intervals) |
| `page-data` | `{ services: ServiceResult[], summary, categories, generated }` | Rebuilt after every cron run |

**`ServiceResult` type:**
```typescript
interface ServiceResult {
  id: string;
  name: string;
  check_type: string;
  status: 'up' | 'degraded' | 'down' | 'unknown';
  message: string;
  value: number;
  response_time_ms: number;
  uptime_pct: number;
  last_check: string;        // ISO 8601
  last_check_epoch: number;
  prev_status: string;
}
```

---

## Frontend Adaptation

The prototype frontend (`public/`) is adapted as follows:

**`data.jsx` changes:**
- Remove `buildDataset`, `makeHistory`, `SCENARIOS`, seeded PRNG
- Keep `ENDPOINTS`, `CATEGORIES`, `summarize`
- Export a `fetchStatus()` async function that calls `GET /api/status`

**`app.jsx` / `Iran Internet Status.html` changes:**
- App root fetches `/api/status` on mount, sets `{ dataset, summary, categories }` state
- 30-second polling interval re-fetches for live updates
- Loading state: banner shows "Polling…" with animated dot
- Error state: banner shows "API unreachable" in `down` style
- Tweaks panel: remove the "Scenario" section; keep theme/density/accent/lang

**No changes to:**
- Header, StatusBoard, EndpointRow, HistoryGrid, Legend (visual components)
- DetailScreen, HistoryMatrix, HistoryGrid, Sparkline, IncidentLog
- All three CSS files
- i18n.jsx, tweaks-panel.jsx

**History data:** The Worker writes real history to KV in the same CSV format the Go binary used. The frontend `HistoryGrid` and `HistoryMatrix` components consume `ep.history[]` (array of `{ day, status, uptime, incidents[] }`). The `/api/status` response transforms KV history CSV rows into this shape:
- Group rows by calendar day (UTC), take the worst status in that day
- `uptime` = percentage of rows in that day with status `up`
- `incidents` = for each contiguous run of `degraded`/`down` rows in the day, emit one `{ severity, label, durationMin }` entry — duration derived from row timestamps

---

## Telegram Notifications

Bot token and chat ID stored as Worker secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

If either secret is absent, notifications are silently skipped (no error).

**Down/degraded message format:**
```
🔴 {name} ({host}) went {STATUS}
└ Was: {prev}  →  Now: {new}
└ Details: {message}
└ {timestamp} UTC
```

**Recovery message format:**
```
🟢 {name} ({host}) recovered (UP)
└ Was: {prev}  →  Now: up
└ Response: {response_time_ms}ms
└ {timestamp} UTC
```

Notifications are sent via `https://api.telegram.org/bot{token}/sendMessage` with `parse_mode: "HTML"`.

---

## `wrangler.toml` (sketch)

```toml
name = "ir-netwatch"
main = "src/worker.ts"
compatibility_date = "2025-01-01"

[assets]
directory = "./public"

[[kv_namespaces]]
binding = "IR_NETWATCH"
id = "<KV_NAMESPACE_ID>"

[triggers]
crons = ["*/5 * * * *"]
```

---

## Out of Scope

- GitHub Issues for incidents (replaced by Telegram)
- The Go checker binary and shell TCP checks
- GitHub Actions workflows (replaced entirely by CF cron trigger)
- GitHub Pages deployment
- The README auto-update script (`scripts/main.go`)
