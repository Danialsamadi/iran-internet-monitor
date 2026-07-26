# IranNet Monitor (Go)

Real-time monitoring of Iran's internet connectivity, censorship, and
circumvention tools — with a bilingual (EN/فارسی) status page, full raw
history, and an LLM analyst reading every pass.

```
VPS cron (*/10) ─▶ Go monitor ─▶ concurrent HTTP/DNS/TCP checks
                      │
                      ├─ data/history.jsonl   one flat JSON line per check (the archive)
                      ├─ data/latest.json     full latest pass + counts
                      ├─ data/raw/<ts>.json   raw snapshots (7-day retention)
                      ├─ data/analysis/       Hermes structured analysis (bilingual EN/FA)
                      └─ data/site.json       pre-aggregated payload for the page
                      │
                      └─ git commit + push ─▶ GitHub Actions ─▶ Cloudflare Pages
```

## What this monitors

40 endpoints across 6 categories, plus 345 labeled Iranian IP ranges:

| Category | Endpoints |
|----------|-----------|
| ISP endpoints | TIC gateways (2.187.1.1, 78.38.112.1), Irancell, Asiatech, Shatel, Respina, Mobinnet |
| DNS resolvers | Shecan (178.22.122.100), TIC (217.218.155.155), Electro (78.157.42.100) |
| Domestic services | Digikala, Snapp, Tapsi, Aparat, Filimo, CafeBazaar, Rubika, Eitaa, Balad, Saman Bank, Shaparak, IRNA |
| Foreign platforms | Google, Cloudflare, Telegram, WhatsApp, Instagram, YouTube, Wikipedia, GitHub |
| Circumvention | Tor Project, Tor BridgeDB, Snowflake broker, Psiphon |
| Observatories | IODA, OONI, RIPEstat, Tor Metrics |

All probes originate from a single VPS **outside Iran** — measuring
reachability from outside, not user experience inside.

## Folder structure

```
cmd/monitor/main.go     entrypoint: one pass = check → store → analyze → commit
internal/checker/       concurrent HTTP, DNS, TCP checks (goroutines, bounded)
internal/storage/       JSONL/JSON persistence + 24 h / 30-day aggregation
internal/analyzer/      Hermes structured analysis with censorship-expert prompt
internal/git/           stage data/, commit with pass summary, push
internal/config/        config.yaml loading + validation
web/index.html          bilingual status page (Overview · Endpoints · Networks · History · Analysis · About)
data/                   everything the monitor writes; committed on every pass
data/analysis/          latest.json (bilingual EN/FA) + history.jsonl (archive)
prompt.md               LLM analysis prompt — the single source of truth for analysis methodology
docs/                   Persian glossary + analysis style guide
config.yaml             the single place services are defined
ir.csv                  labeled Iranian IP allocations (start,end,count,date,org)
.github/workflows/deploy.yml   Cloudflare Pages deploy on data push
```

## VPS setup

```sh
git clone https://github.com/Danialsamadi/iran-internet-monitor.git
cd iran-internet-monitor
make build
make run-once            # smoke test: checks only, no LLM, no git
make run                 # full pass
crontab -e               # then paste the line `make cron` prints:
# */10 * * * * cd /path/to/repo && ./bin/monitor -repo . >> monitor.log 2>&1
```

The VPS needs a git identity and push access (deploy key or PAT):

```sh
git config user.name "irannet-monitor"
git config user.email "monitor@users.noreply.github.com"
```

## Hermes analysis (not Ollama)

The analyzer is **Hermes Agent** (not a local Ollama instance). A Hermes
cron job runs every 10 minutes, reads the latest monitoring data, and
produces a structured bilingual analysis.

The analysis prompt (`prompt.md`) encodes deep technical knowledge of
Iran's censorship architecture:

- **Network topology:** TIC/DCI international gateways (AS12880, AS49666),
  LCT (Islamic Revolution Telecommunication Complex) where 70-80% of
  international traffic terminates, NIN/SHOMA domestic intranet,
  provincial IXPs (TBZIX, SHIX, AHWIX)
- **DPI mechanics:** SNI filtering, DNS poisoning (10.10.34.34 triplet
  injection), HTTP Host header inspection, TCP RST injection, behavioral
  fingerprinting
- **Protocol whitelisting:** Default-deny model — only DNS (53), HTTP
  (80), HTTPS (443) pass; all other protocols silently dropped
  (Bock et al., USENIX FOCI '20)
- **Shutdown evolution:** Blunt BGP withdrawal (2019) → hybrid cellular
  curfews (2022) → stealth blackout with BGP intact (June 2025) →
  tiered "blocked-by-default" whitelisting (Jan 2026)
- **Tiered access:** Stable Communication Network (SCN, USSD *10*327*4#,
  40K T/GB), Pro Internet SIM (2,178,000 T upfront), SHAHKAR/HAMTA
  identity-based enforcement
- **Surveillance:** SIAM telecom intercept system, IMSI catchers, Septam
  CCTV, Charming Kitten (APT35) endpoint threats
- **Circumvention:** Tor (Snowflake, WebTunnel), VLESS/Trojan inside TLS,
  Psiphon, domain fronting status

### Primary sources cross-referenced in analysis

| Source | Coverage |
|--------|----------|
| IODA (Georgia Tech) | Comparative shutdown analysis 2019/2022/2025/2026 |
| Filterwatch | Ongoing Persian-language monitoring, tiered-access, stealth blackout |
| OONI | DPI blocking, protocol whitelisting measurements |
| Bock et al., USENIX FOCI '20 | Reverse-engineering Iran's protocol whitelister |
| arXiv 2507.14183 | Stealth blackout — TTL-limited tracing to localize filter hop |
| arXiv 2603.28753 | Jan 2026 shutdown: public data, methods, circumvention |
| IRBlock (UBC), USENIX Security '25 | Large-scale measurement of Great Firewall of Iran |
| Miaan Group / ASL19 | Stealth blackout report (June 2025) |
| Schneier | Two-tiered "white SIM" model |
| Chatham House | Digital-isolation shift analysis |
| RaazNet | Censorship architecture (DPI, session control, Amnafzar docs) |
| AGSI | Architecture of Iran's Digital Repression |
| SplinterCon 2024 | Censorship resilience for Iran |
| Aryan et al., USENIX FOCI '13 | Foundational DPI mechanics paper |
| WIRED | Iran's Digital Surveillance Machine |

### Bilingual output

Every analysis produces parallel English and Persian fields:

| English field | Persian field |
|---------------|---------------|
| `suspected_causes` | `suspected_causes_fa` |
| `affected_services` | `affected_services_fa` |
| `public_summary` | `public_summary_fa` |
| `insight` | `insight_fa` |
| `recommendation` | `recommendation_fa` |

Persian terminology follows `docs/analysis-template-fa.md` — a style
guide with 60+ mapped terms, verb cycling rules, fixed structure, and
formatting requirements (Persian digits, em-dash, formal register).

Key Persian terms: `گیت‌وی` (gateway), `پرب` (probe), `ابزار عبور`
(circumvention tools), `تایم‌اوت` (timeout), `رد اتصال` (connection
refused), `فیلترینگ` (filtering), `قطعی مخفی` (stealth blackout),
`اینترنت گزینشی` (selective internet), `DPI / بازرسی عمیق بسته`,
`وایت‌لیست پروتکل` (protocol whitelisting), `مسموم‌سازی DNS`
(DNS poisoning), `شاهکار/همتا` (SHAHKAR/HAMTA identity databases).

### Analysis JSON schema

| key | meaning |
|-----|---------|
| `overall_status` | operational / degraded / partial_outage / major_outage |
| `severity` | none / minor / major / critical |
| `suspected_causes` | most likely first |
| `suspected_causes_fa` | Persian translation |
| `affected_services` | impaired names/groups |
| `affected_services_fa` | Persian translation |
| `public_summary` | 2-3 sentences shown on the status page overview |
| `public_summary_fa` | Persian translation |
| `insight` | one analytical sentence (the italic quote on the page) |
| `insight_fa` | Persian translation |
| `recommendation` | one concrete next step |
| `recommendation_fa` | Persian translation |

The reply is saved to `data/analysis/latest.json`, archived in
`data/analysis/history.jsonl`, and embedded in `site.json` for the page.

### How to change the analysis

- **The analyst persona / instructions** — edit `prompt.md` at the repo
  root. It is read fresh on every pass; no rebuild needed.
- **Persian terminology / style** — edit `docs/analysis-template-fa.md`.
  Defines mandatory term mapping, verb cycling, structure, formatting.
- **Persian glossary** — `docs/persian-glossary.md` has the full
  English → Persian term mapping for network/censorship vocabulary.
- **What data Hermes sees** — `buildPrompt()` in
  `internal/analyzer/analyzer.go`.
- **The output schema** — the `Analysis` struct in the same file (the page
  reads the same keys in `web/index.html`).

## Cloudflare Pages deploy

1. Create a Pages project named `iran-internet-monitor` (Direct Upload).
2. Add repo secrets `CLOUDFLARE_API_TOKEN` (Pages:Edit permission) and
   `CLOUDFLARE_ACCOUNT_ID`.
3. Every data push from the VPS triggers `.github/workflows/deploy.yml`,
   which assembles `web/` + the JSON data into `dist/` and deploys it.

Live site: https://iran-internet-monitor.pages.dev

## Bilingual web page

The status page (`web/index.html`) supports English and Persian with a
language toggle. When Persian is selected:

- `dir="rtl"` is set on `<html>` — full RTL layout
- All text renders in **Vazirmatn** font (loaded from Google Fonts)
- All analysis fields (`_fa` suffixed) are displayed instead of English
- Persian digits (`۰۱۲۳۴۵۶۷۸۹`) used for all numbers

Pages: Overview · Endpoints · Networks · History · Analysis · About

The About page documents all 14+ cross-referenced research sources with
bilingual descriptions.

## Adding a service

Append one entry to the right category in `config.yaml`:

```yaml
- id: my-service          # unique, stable — keys the history archive
  name: My Service
  name_fa: سرویس من       # optional, for the Persian page
  type: http              # http | dns | tcp
  target: https://example.ir
```

That's the whole change — checker, storage, analysis and the page all pick
it up on the next pass. `dns` checks take a resolver in `target`
(`ip:53`) and an optional `query:` domain; `tcp` checks take `host:port`.

## Labeled IP ranges (ir.csv)

`ir.csv` lists registered Iranian IP allocations with their operator label.
Each pass TCP-probes one representative address per range on port 80 and
aggregates reachability per operator into `data/networks.json` (one summary
line per pass is appended to `data/networks_history.jsonl`); the Networks
page renders it. Swap or extend the CSV and the next pass picks it up —
the path is `ip_ranges_csv` in config.yaml.

Guard: before sweeping, the checker dials TEST-NET-1 (192.0.2.1:80). If it
"connects", the vantage intercepts TCP :80 (VPN/transparent proxy) and the
sweep is skipped instead of publishing fake reachability.

## Data formats

`history.jsonl` — one self-describing line per check, ideal for LLMs/jq:

```json
{"ts":"2026-07-26T10:55:01Z","service_id":"telegram-web","name":"Telegram Web","category":"Foreign platforms","type":"http","target":"https://web.telegram.org","status":"up","latency_ms":412,"http_status":200}
```

Statuses: `up`, `degraded` (slower than `check.degraded_ms`), `down`.
Overall: `operational` → `degraded` → `partial_outage` (≥10% down) →
`major_outage` (≥⅓ down).

## Documentation

- `prompt.md` — LLM analysis prompt (censorship architecture knowledge base)
- `docs/persian-glossary.md` — English → Persian technical term glossary (60+ terms)
- `docs/analysis-template-fa.md` — Persian analysis style guide (terminology, structure, formatting)
