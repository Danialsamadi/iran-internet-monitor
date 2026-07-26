# IranNet Monitor (Go)

Real-time monitoring of Iran's internet connectivity, censorship, and
circumvention tools — with a bilingual (EN/فارسی) status page, full raw
history, and an LLM analyst reading every pass.

```
VPS cron (*/5) ─▶ Go monitor ─▶ concurrent HTTP/DNS/TCP checks
                      │
                      ├─ data/history.jsonl   one flat JSON line per check (the archive)
                      ├─ data/latest.json     full latest pass + counts
                      ├─ data/raw/<ts>.json   raw snapshots (7-day retention)
                      ├─ data/analysis/       Hermes-via-Ollama structured analysis
                      └─ data/site.json       pre-aggregated payload for the page
                      │
                      └─ git commit + push ─▶ GitHub Actions ─▶ Cloudflare Pages
```

## Folder structure

```
cmd/monitor/main.go     entrypoint: one pass = check → store → analyze → commit
internal/checker/       concurrent HTTP, DNS, TCP checks (goroutines, bounded)
internal/storage/       JSONL/JSON persistence + 24 h / 30-day aggregation
internal/analyzer/      Ollama chat call to Hermes with a censorship-expert prompt
internal/git/           stage data/, commit with pass summary, push
internal/config/        config.yaml loading + validation
web/index.html          the status page (Overview · Endpoints · History · Analysis · About)
data/                   everything the monitor writes; committed on every pass
config.yaml             the single place services are defined
.github/workflows/deploy.yml   Cloudflare Pages deploy on data push
```

## VPS setup

```sh
git clone git@github.com:Danialsamadi/iran-internet-monitor.git
cd iran-internet-monitor
make build
make run-once            # smoke test: checks only, no LLM, no git
make run                 # full pass
crontab -e               # then paste the line `make cron` prints:
# */5 * * * * cd /path/to/repo && ./bin/monitor -repo . >> monitor.log 2>&1
```

The VPS needs a git identity and push access (deploy key or PAT):

```sh
git config user.name "irannet-monitor"
git config user.email "monitor@users.noreply.github.com"
```

## Ollama + Hermes

```sh
curl -fsSL https://ollama.com/install.sh | sh
ollama pull hermes3          # or: ollama pull nous-hermes2
ollama serve                 # usually started by systemd automatically
```

Model and host live in `config.yaml` under `ollama:`. The analyzer is
best-effort — a dead Ollama never loses a pass; the page keeps showing the
last good analysis. The model returns strict JSON (`format: json`):
overall status, severity, suspected causes, affected services, a public
summary, one insight, and one recommendation.

## Cloudflare Pages deploy

1. Create a Pages project named `iran-internet-monitor` (Direct Upload).
2. Add repo secrets `CLOUDFLARE_API_TOKEN` (Pages:Edit permission) and
   `CLOUDFLARE_ACCOUNT_ID`.
3. Every data push from the VPS triggers `.github/workflows/deploy.yml`,
   which assembles `web/` + the JSON data into `dist/` and deploys it.

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

## Data formats

`history.jsonl` — one self-describing line per check, ideal for LLMs/jq:

```json
{"ts":"2026-07-26T10:55:01Z","service_id":"telegram-web","name":"Telegram Web","category":"Foreign platforms","type":"http","target":"https://web.telegram.org","status":"up","latency_ms":412,"http_status":200}
```

Statuses: `up`, `degraded` (slower than `check.degraded_ms`), `down`.
Overall: `operational` → `degraded` → `partial_outage` (≥10% down) →
`major_outage` (≥⅓ down).
