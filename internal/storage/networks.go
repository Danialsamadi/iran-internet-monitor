package storage

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"

	"iran-internet-monitor/internal/checker"
)

// NetworkOrg is the per-operator aggregation of one range-probe pass.
type NetworkOrg struct {
	Org       string  `json:"org"`
	Ranges    int     `json:"ranges"`
	IPs       int64   `json:"ips"`
	Up        int     `json:"up"`
	Pct       float64 `json:"pct"`
	MedianMS  int64   `json:"median_ms"`
}

// Networks is data/networks.json — the labeled IP-range picture of one pass.
type Networks struct {
	Timestamp   string       `json:"ts"`
	RangesTotal int          `json:"ranges_total"`
	RangesUp    int          `json:"ranges_up"`
	Orgs        []NetworkOrg `json:"orgs"`
}

// SaveNetworks aggregates range probes per operator, writes networks.json and
// appends one summary line per pass to networks_history.jsonl (per-range
// history would be ~100k lines/day; the org summary is the useful record).
func (s *Store) SaveNetworks(ts string, results []checker.RangeResult) (*Networks, error) {
	byOrg := map[string]*NetworkOrg{}
	lats := map[string][]int64{}
	n := &Networks{Timestamp: ts, RangesTotal: len(results)}
	for _, r := range results {
		o := byOrg[r.Org]
		if o == nil {
			o = &NetworkOrg{Org: r.Org}
			byOrg[r.Org] = o
		}
		o.Ranges++
		o.IPs += r.Count
		if r.Status == "up" {
			o.Up++
			n.RangesUp++
			lats[r.Org] = append(lats[r.Org], r.LatencyMS)
		}
	}
	for org, o := range byOrg {
		o.Pct = float64(o.Up) * 100 / float64(o.Ranges)
		if l := lats[org]; len(l) > 0 {
			sort.Slice(l, func(i, j int) bool { return l[i] < l[j] })
			o.MedianMS = l[len(l)/2]
		}
		n.Orgs = append(n.Orgs, *o)
	}
	// biggest operators first — the order the page shows them in
	sort.Slice(n.Orgs, func(i, j int) bool { return n.Orgs[i].IPs > n.Orgs[j].IPs })

	if err := writeJSON(filepath.Join(s.Dir, "networks.json"), n); err != nil {
		return nil, err
	}
	f, err := os.OpenFile(filepath.Join(s.Dir, "networks_history.jsonl"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	if err := json.NewEncoder(f).Encode(n); err != nil {
		return nil, err
	}
	return n, nil
}
