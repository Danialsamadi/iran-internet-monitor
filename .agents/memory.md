# .agents/memory.md — Iran Internet Monitor Project

## 2026-08-03 — Agent — Pipeline hardened to deterministic zero-LLM analysis

- **Data collection cron** (`0ee6bfd619f4`, `:00` hourly): Pure script `collect_and_push.sh` — runs Go binary (`bin/monitor`), commits raw data (`data/latest.json`, `data/networks.json`, etc.), pushes to GitHub. `no_agent=true` — zero LLM, no timeouts.
- **Deterministic analysis cron** (`f0c3e7163d25`, `:05` hourly): Pure script `deterministic_analyze.py` — reads real data, generates bilingual EN/FA analysis with template + real numbers, commits `data/analysis/latest.json` + appends to `history.jsonl`, pushes. `no_agent=true` — zero LLM.
- **Eliminated all LLM failure modes**: DeepSeek thinking-mode bug, provider upstream errors (Console 502), context rot (Indonesian garbage), thinking-mode API issues.
- **Analysis output**: Real endpoint counts (up/degraded/down), IP reachability (44/1068 = 4.1%), service names + actual errors, bilingual EN/FA with Pinglish terminology, source citations (Bock et al. FOCI'20).
- **Scripts committed**: `scripts/collect_and_push.sh`, `scripts/deterministic_analyze.py`
- **Copied to Hermes scripts dir**: `~/.hermes/scripts/collect_and_push.sh`, `~/.hermes/scripts/deterministic_analyze.py`

## 2026-08-01 — Agent — Split cron into data + analysis to fix context rot

- Original single cron failed due to LLM timeout during analysis step.
- Split into two: data collection at `:00`, analysis at `:05` with fresh context.
- Data collection scripted; analysis still LLM-based but isolated.

## 2026-07-29 — Agent — Iran censorship knowledge base integrated

- Enriched `prompt.md` with full Iran censorship architecture: NIN dual-stack, TIC/DCI gateways (AS12880, AS49666), DPI payload inspection, DNS poisoning 10.10.34.0/24, SNI-based TLS filtering, protocol whitelisting (DNS/HTTP/HTTPS only), stealth blackout (BGP intact), tiered access (white SIM/Internet Pro), SHAHKAR/HAMTA user identity, EUI Cadmus NIN primer, IranTrial network forensics, OONI Women on Web, RaazNet session control, AGSI architecture, Splintercon resilience, IRBlock USENIX Security, WIRED surveillance, Aryan et al. FOCI'13.
- Updated `docs/analysis-template-fa.md` with 50+ new terms.
- Updated Persian glossary with standard technical terminology (Pinglish).

## 2026-07-27 — Agent — Python 3.12 installed, last30days-skill integrated

- Installed Python 3.12 via deadsnakes PPA.
- Symlinked `last30days-skill` to `~/.hermes/skills/research/last30days`.
- Verified working with free sources: Reddit, HN, Polymarket, GitHub, grounding.

## 2026-07-26 — Agent — Persian translation standards established

- Created `docs/persian-glossary.md` (~90 terms, 7 categories).
- Created `docs/analysis-template-fa.md` with Pinglish rules, verb cycling, SOV syntax.
- Gateway = گیت‌وی (not دروازه), Psiphon = سایفون, latency = لیتنسی/تاخیر, QoS/ASN/IXP/BGP kept in English.
- "Server-room coffee test" — sounds like two Tehran sysadmins talking.

## 2026-07-25 — Agent — Iran Internet Monitor baseline established

- Go binary built: `bin/monitor` — 34s wall-clock, 16MB RSS, 1068 IP ranges swept.
- 40 endpoints monitored: 6 categories (ISP gateways, DNS, domestic services, foreign platforms, circumvention, observatories).
- Cron schedule: every 10 min → later changed to 1 hour.
- Cloudflare Pages auto-deploys on git push.

---

**Key files:**
- `prompt.md` — LLM analysis framework (now reference only)
- `docs/persian-glossary.md` — EN→FA terminology
- `docs/analysis-template-fa.md` — Persian style guide
- `scripts/collect_and_push.sh` — data collection
- `scripts/deterministic_analyze.py` — zero-LLM bilingual analysis
- `data/analysis/latest.json` — current analysis
- `data/analysis/history.jsonl` — append-only history

## 2026-08-04 — Agent — Hermes updated to v0.20.0

- Hermes Agent updated from v0.19.0 to v0.20.0 (2026.8.3)
- Dependencies updated: cryptography 48.0.1, mcp 1.28.1, nemo-relay 0.6.0, starlette 1.3.1, httplib2 0.32.0, pillow 12.3.0, pyasn1 0.6.4, python-multipart 0.0.32
- Pip updated to 26.1.2
- All cron jobs survived update and remain healthy:
  - Data collection (`0ee6bfd619f4`) — `:00` hourly, `no_agent=true`
  - Deterministic analysis (`f0c3e7163d25`) — `:05` hourly, `no_agent=true`
  - Tech News Curator (`82ff22796edb`) — 4x/day Toronto