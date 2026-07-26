// Package storage persists check results in LLM-friendly formats:
//
//	data/history.jsonl   — one flat JSON line per check, append-only archive
//	data/latest.json     — the full latest pass with summary counts
//	data/raw/<ts>.json   — raw pass snapshot (pruned after 7 days)
//	data/site.json       — everything the status page needs, pre-aggregated
package storage

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"iran-internet-monitor/internal/checker"
	"iran-internet-monitor/internal/config"
)

type Store struct {
	Dir string // the data/ directory
}

func New(dir string) (*Store, error) {
	for _, d := range []string{dir, filepath.Join(dir, "raw"), filepath.Join(dir, "analysis")} {
		if err := os.MkdirAll(d, 0o755); err != nil {
			return nil, err
		}
	}
	return &Store{Dir: dir}, nil
}

// Latest is the shape of data/latest.json.
type Latest struct {
	Timestamp string           `json:"ts"`
	Overall   string           `json:"overall"` // operational | degraded | partial_outage | major_outage
	Counts    map[string]int   `json:"counts"`
	Results   []checker.Result `json:"results"`
}

// Overall classifies a pass from its counts.
func Overall(counts map[string]int) string {
	total := counts["up"] + counts["degraded"] + counts["down"]
	if total == 0 {
		return "unknown"
	}
	down := counts["down"]
	switch {
	case down*3 >= total: // a third or more unreachable
		return "major_outage"
	case down*10 >= total: // 10%+
		return "partial_outage"
	case down > 0 || counts["degraded"] > 0:
		return "degraded"
	default:
		return "operational"
	}
}

func Counts(results []checker.Result) map[string]int {
	c := map[string]int{"up": 0, "degraded": 0, "down": 0}
	for _, r := range results {
		c[r.Status]++
	}
	return c
}

// SavePass writes history.jsonl, latest.json and the raw snapshot.
func (s *Store) SavePass(results []checker.Result) (Latest, error) {
	now := time.Now().UTC()
	latest := Latest{
		Timestamp: now.Format(time.RFC3339),
		Counts:    Counts(results),
		Results:   results,
	}
	latest.Overall = Overall(latest.Counts)

	// append-only archive
	f, err := os.OpenFile(filepath.Join(s.Dir, "history.jsonl"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return latest, err
	}
	w := bufio.NewWriter(f)
	enc := json.NewEncoder(w)
	for _, r := range results {
		if err := enc.Encode(r); err != nil {
			f.Close()
			return latest, err
		}
	}
	if err := w.Flush(); err != nil {
		f.Close()
		return latest, err
	}
	if err := f.Close(); err != nil {
		return latest, err
	}

	if err := writeJSON(filepath.Join(s.Dir, "latest.json"), latest); err != nil {
		return latest, err
	}
	raw := filepath.Join(s.Dir, "raw", now.Format("2006-01-02T15-04-05Z")+".json")
	if err := writeJSON(raw, latest); err != nil {
		return latest, err
	}
	s.pruneRaw(now)
	return latest, nil
}

// pruneRaw deletes raw snapshots older than 7 days; errors are ignored —
// pruning is housekeeping, never worth failing a pass over.
func (s *Store) pruneRaw(now time.Time) {
	cutoff := now.AddDate(0, 0, -7).Format("2006-01-02T15-04-05Z")
	entries, _ := os.ReadDir(filepath.Join(s.Dir, "raw"))
	for _, e := range entries {
		if name, ok := strings.CutSuffix(e.Name(), ".json"); ok && name < cutoff {
			os.Remove(filepath.Join(s.Dir, "raw", e.Name()))
		}
	}
}

func writeJSON(path string, v any) error {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(b, '\n'), 0o644)
}

// ─── site.json: pre-aggregated data for the status page ───

type SiteService struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	NameFa    string `json:"name_fa,omitempty"`
	Kind      string `json:"kind"`
	Status    string `json:"status"`
	LatencyMS int64  `json:"latency_ms"`
	// Cells: 48 half-hour buckets over the last 24 h.
	// "u"=up "g"=degraded "d"=down "?"=no data, oldest first.
	Cells    string  `json:"cells"`
	Uptime24 float64 `json:"uptime24"`
}

type SiteCategory struct {
	Name     string        `json:"name"`
	NameFa   string        `json:"name_fa,omitempty"`
	Services []SiteService `json:"services"`
}

type Site struct {
	Timestamp  string          `json:"ts"`
	Overall    string          `json:"overall"`
	Counts     map[string]int  `json:"counts"`
	Categories []SiteCategory  `json:"categories"`
	DayHist    []float64       `json:"day_hist"`  // hours/day with ≥⅓ endpoints down, 30 days, oldest first
	HourHist   []int           `json:"hour_hist"` // down-events by Tehran hour of day, 30-day window
	Analysis   json.RawMessage `json:"analysis,omitempty"`
	MedianMS   int64           `json:"median_ms"`
}

// BuildSite reads history.jsonl and produces data/site.json. Analysis is the
// latest LLM output (may be nil).
func (s *Store) BuildSite(cfg *config.Config, latest Latest, analysis json.RawMessage) error {
	now := time.Now().UTC()
	hist, err := s.readHistory(now.AddDate(0, 0, -30))
	if err != nil {
		return err
	}
	site := Site{
		Timestamp: latest.Timestamp,
		Overall:   latest.Overall,
		Counts:    latest.Counts,
		Analysis:  analysis,
		MedianMS:  medianLatency(latest.Results),
	}

	latestBy := map[string]checker.Result{}
	for _, r := range latest.Results {
		latestBy[r.ServiceID] = r
	}
	cellsBy, upBy := cells24h(hist, now)
	for _, cat := range cfg.Categories {
		sc := SiteCategory{Name: cat.Name, NameFa: cat.NameFa}
		for _, svc := range cat.Services {
			lr := latestBy[svc.ID]
			sc.Services = append(sc.Services, SiteService{
				ID: svc.ID, Name: svc.Name, NameFa: svc.NameFa,
				Kind:      kind(svc),
				Status:    lr.Status,
				LatencyMS: lr.LatencyMS,
				Cells:     cellsBy[svc.ID],
				Uptime24:  upBy[svc.ID],
			})
		}
		site.Categories = append(site.Categories, sc)
	}
	site.DayHist, site.HourHist = longHists(hist, now)
	return writeJSON(filepath.Join(s.Dir, "site.json"), site)
}

// histRec is the subset of a history line the aggregations need.
type histRec struct {
	TS        time.Time
	ServiceID string
	Status    string
}

func (s *Store) readHistory(since time.Time) ([]histRec, error) {
	f, err := os.Open(filepath.Join(s.Dir, "history.jsonl"))
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	defer f.Close()
	var out []histRec
	sc := bufio.NewScanner(f)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for sc.Scan() {
		var r struct {
			TS        string `json:"ts"`
			ServiceID string `json:"service_id"`
			Status    string `json:"status"`
		}
		if json.Unmarshal(sc.Bytes(), &r) != nil {
			continue // never let one corrupt line poison the archive
		}
		t, err := time.Parse(time.RFC3339, r.TS)
		if err != nil || t.Before(since) {
			continue
		}
		out = append(out, histRec{TS: t, ServiceID: r.ServiceID, Status: r.Status})
	}
	return out, sc.Err()
}

const buckets24 = 48 // half-hour buckets in 24 h

// cells24h aggregates the last 24 h into per-service half-hour cells
// (worst status wins within a bucket) and a 24 h uptime percentage.
func cells24h(hist []histRec, now time.Time) (map[string]string, map[string]float64) {
	start := now.Add(-24 * time.Hour)
	perSvc := map[string]*[buckets24]byte{}
	nUp := map[string]int{}
	nAll := map[string]int{}
	rank := map[byte]int{0: 0, '?': 0, 'u': 1, 'g': 2, 'd': 3}
	for _, r := range hist {
		if r.TS.Before(start) {
			continue
		}
		b := int(r.TS.Sub(start) / (30 * time.Minute))
		if b < 0 || b >= buckets24 {
			continue
		}
		cells := perSvc[r.ServiceID]
		if cells == nil {
			cells = &[buckets24]byte{}
			perSvc[r.ServiceID] = cells
		}
		var c byte
		switch r.Status {
		case "up":
			c = 'u'
		case "degraded":
			c = 'g'
		case "down":
			c = 'd'
		default:
			continue
		}
		if rank[c] > rank[cells[b]] {
			cells[b] = c
		}
		nAll[r.ServiceID]++
		if c == 'u' {
			nUp[r.ServiceID]++
		}
	}
	cellStr := map[string]string{}
	uptime := map[string]float64{}
	for id, cells := range perSvc {
		b := make([]byte, buckets24)
		for i, c := range cells {
			if c == 0 {
				c = '?'
			}
			b[i] = c
		}
		cellStr[id] = string(b)
		if nAll[id] > 0 {
			uptime[id] = float64(nUp[id]) * 100 / float64(nAll[id])
		}
	}
	return cellStr, uptime
}

// longHists computes the 30-day charts: hours per day in which at least a
// third of checked endpoints were down, and down-events by Tehran hour.
func longHists(hist []histRec, now time.Time) ([]float64, []int) {
	tehran := time.FixedZone("IRST", int((3*time.Hour + 30*time.Minute).Seconds()))
	dayStart := now.AddDate(0, 0, -29).Truncate(24 * time.Hour)

	type hourKey struct{ day, hour int }
	downPerHour := map[hourKey]int{}
	allPerHour := map[hourKey]int{}
	hourHist := make([]int, 24)
	for _, r := range hist {
		day := int(r.TS.Sub(dayStart) / (24 * time.Hour))
		if day < 0 || day >= 30 {
			continue
		}
		k := hourKey{day, r.TS.Hour()}
		allPerHour[k]++
		if r.Status == "down" {
			downPerHour[k]++
			hourHist[r.TS.In(tehran).Hour()]++
		}
	}
	dayHist := make([]float64, 30)
	for k, all := range allPerHour {
		if all > 0 && downPerHour[k]*3 >= all {
			dayHist[k.day]++
		}
	}
	return dayHist, hourHist
}

func medianLatency(results []checker.Result) int64 {
	var lats []int64
	for _, r := range results {
		if r.LatencyMS > 0 {
			lats = append(lats, r.LatencyMS)
		}
	}
	if len(lats) == 0 {
		return 0
	}
	sort.Slice(lats, func(i, j int) bool { return lats[i] < lats[j] })
	return lats[len(lats)/2]
}

func kind(s config.Service) string {
	switch s.Type {
	case "dns":
		return "DNS · " + s.Target
	case "tcp":
		return "TCP · " + s.Target
	default:
		return fmt.Sprintf("HTTP · %s", strings.TrimPrefix(strings.TrimPrefix(s.Target, "https://"), "http://"))
	}
}
