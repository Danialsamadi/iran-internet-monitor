// Update README.md with live status table (Go replacement for update-readme.sh).

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type summary struct {
	OverallStatus string `json:"overall_status"`
	Up            int    `json:"up"`
	Degraded      int    `json:"degraded"`
	Down          int    `json:"down"`
	Unknown       int    `json:"unknown"`
	LastCheck     string `json:"last_check"`
}

type service struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Status        string  `json:"status"`
	ResponseTime  int     `json:"response_time_ms"`
	UptimePct     float64 `json:"uptime_pct"`
	Message       string  `json:"message"`
}

type config struct {
	Owner string `json:"owner"`
	Repo  string `json:"repo"`
	URL   string `json:"url"`
}

func main() {
	root := rootDir()
	apiDir := filepath.Join(root, "api")
	configPath := filepath.Join(root, "config.json")
	readmePath := filepath.Join(root, "README.md")

	summaryPath := filepath.Join(apiDir, "summary.json")
	if _, err := os.Stat(summaryPath); os.IsNotExist(err) {
		fmt.Println("No summary data yet, skipping README update")
		os.Exit(0)
	}

	var s summary
	must(readJSON(summaryPath, &s))
	emoji, label := overallEmojiLabel(s.OverallStatus)

	table := buildTable(apiDir)

	cfg := readConfig(configPath)
	pageURL := cfg.URL
	if pageURL == "" {
		pageURL = fmt.Sprintf("https://%s.github.io/%s", cfg.Owner, cfg.Repo)
	}

	readme := generateREADME(readmeParams{
		PageURL:   pageURL,
		Emoji:    emoji,
		Label:    label,
		Table:    table,
		LastCheck: s.LastCheck,
		Up:       s.Up,
		Degraded: s.Degraded,
		Down:     s.Down,
		Unknown:  s.Unknown,
		Owner:    cfg.Owner,
		Repo:     cfg.Repo,
	})

	if err := os.WriteFile(readmePath, []byte(readme), 0644); err != nil {
		fmt.Fprintf(os.Stderr, "write README: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("README.md updated with live status")
}

func rootDir() string {
	dir, err := os.Getwd()
	if err != nil {
		fmt.Fprintf(os.Stderr, "getwd: %v\n", err)
		os.Exit(1)
	}
	// If run from scripts/ (e.g. "go run ." from scripts), use parent as repo root.
	if filepath.Base(dir) == "scripts" {
		dir = filepath.Dir(dir)
	}
	return dir
}

func overallEmojiLabel(overall string) (emoji, label string) {
	switch overall {
	case "up":
		return "🟩", "All Systems Operational"
	case "degraded":
		return "🟨", "Minor Degradation"
	case "partial_outage":
		return "🟧", "Partial Outage"
	case "major_outage":
		return "🟥", "Major Outage"
	default:
		return "⬜", "Unknown"
	}
}

func statusEmoji(status string) string {
	switch status {
	case "up":
		return "🟩"
	case "degraded":
		return "🟨"
	case "down":
		return "🟥"
	default:
		return "⬜"
	}
}

func buildTable(apiDir string) string {
	entries, err := os.ReadDir(apiDir)
	if err != nil {
		return ""
	}
	var rows []string
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		name := e.Name()
		if name == "summary.json" || name == "page-data.json" {
			continue
		}
		var svc service
		if err := readJSON(filepath.Join(apiDir, name), &svc); err != nil {
			continue
		}
		if svc.ID == "" {
			continue
		}
		if svc.Name == "" {
			svc.Name = "Unknown"
		}
		uptimeStr := fmt.Sprintf("%.1f", svc.UptimePct)
		if svc.UptimePct == float64(int(svc.UptimePct)) {
			uptimeStr = fmt.Sprintf("%d", int(svc.UptimePct))
		}
		rows = append(rows, fmt.Sprintf("| %s **%s** | %s | %dms | %s%% |",
			statusEmoji(svc.Status), escapePipe(svc.Name), svc.Status, svc.ResponseTime, uptimeStr))
	}
	sort.Strings(rows)
	return "| Service | Status | Response | Uptime |\n|---------|--------|----------|--------|\n" + strings.Join(rows, "\n")
}

func escapePipe(s string) string {
	return strings.ReplaceAll(s, "|", "\\|")
}

func readConfig(path string) config {
	var c config
	_ = readJSON(path, &c)
	if c.Owner == "" {
		c.Owner = "Danialsamadi"
	}
	if c.Repo == "" {
		c.Repo = "iran-internet-monitor"
	}
	return c
}

func readJSON(path string, v interface{}) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

func must(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}
}

type readmeParams struct {
	PageURL   string
	Emoji    string
	Label    string
	Table    string
	LastCheck string
	Up       int
	Degraded int
	Down     int
	Unknown  int
	Owner    string
	Repo     string
}

func generateREADME(p readmeParams) string {
	return `# [📈 Live Status](` + p.PageURL + `): ` + p.Emoji + ` ` + p.Label + `

> Real-time monitoring of Iran's internet connectivity, censorship, and circumvention tools.
> Powered by [GitHub Actions](https://github.com/features/actions) — no server required.

This repository contains the open-source uptime monitor and status page for Iran's internet infrastructure.
Data is collected every 5 minutes using GitHub Actions, and results are committed to this repo.

[![Uptime CI](https://github.com/` + p.Owner + `/` + p.Repo + `/workflows/Uptime%20CI/badge.svg)](https://github.com/` + p.Owner + `/` + p.Repo + `/actions?query=workflow%3A%22Uptime+CI%22)
[![Pages CI](https://github.com/` + p.Owner + `/` + p.Repo + `/workflows/Pages%20CI/badge.svg)](https://github.com/` + p.Owner + `/` + p.Repo + `/actions?query=workflow%3A%22Pages+CI%22)

- [Dashboard](` + p.PageURL + `/) · [Monitors](` + p.PageURL + `/monitors.html) · [Incidents](` + p.PageURL + `/incidents.html)

## [📈 Live Status](` + p.PageURL + `): ` + p.Emoji + ` ` + p.Label + `

<!--START_STATUS_TABLE-->
` + p.Table + `
<!--END_STATUS_TABLE-->

> Last checked: ` + p.LastCheck + `
> ` + fmt.Sprintf("%d", p.Up) + ` up · ` + fmt.Sprintf("%d", p.Degraded) + ` degraded · ` + fmt.Sprintf("%d", p.Down) + ` down · ` + fmt.Sprintf("%d", p.Unknown) + ` unknown

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

` + "```" + `
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
` + "```" + `

## 📄 License

Code: [MIT](./LICENSE) · Powered by open-source data from IODA, OONI, RIPE, Tor Metrics, and Psiphon.
`
}
