package checker

import (
	"context"
	"fmt"
	"net"
	"sync"
	"time"

	"iran-internet-monitor/internal/config"
)

// RangeResult is one probe of a labeled IP range: a TCP dial to the first
// usable address of the range on port 80.
type RangeResult struct {
	Timestamp string `json:"ts"`
	ProbeIP   string `json:"probe_ip"`
	Org       string `json:"org"`
	Count     int64  `json:"ips_in_range"`
	Status    string `json:"status"` // up | down
	LatencyMS int64  `json:"latency_ms"`
}

// RunRanges probes one representative IP per labeled range concurrently.
// ponytail: fixed :80 probe and concurrency 64 — enough for ~400 ranges
// inside a 5-minute cadence; make them config knobs if the CSV grows.
//
// Before sweeping, it dials TEST-NET-1 (192.0.2.1:80), which no real network
// routes: if that "connects", something on the path intercepts TCP :80
// (transparent proxy, VPN, captive portal) and every range would read as up
// — the sweep is refused rather than publishing fake reachability.
func (c *Checker) RunRanges(ctx context.Context, ranges []config.IPRange) ([]RangeResult, error) {
	sctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	if conn, err := (&net.Dialer{}).DialContext(sctx, "tcp", "192.0.2.1:80"); err == nil {
		conn.Close()
		return nil, fmt.Errorf("vantage intercepts TCP :80 (TEST-NET-1 answered) — range results would be meaningless")
	}
	results := make([]RangeResult, len(ranges))
	sem := make(chan struct{}, 64)
	var wg sync.WaitGroup
	for i, r := range ranges {
		wg.Add(1)
		go func(i int, r config.IPRange) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()
			probe := r.Start.Next() // start is the network address; .1 answers most often
			res := RangeResult{
				Timestamp: time.Now().UTC().Format(time.RFC3339),
				ProbeIP:   probe.String(),
				Org:       r.Org,
				Count:     r.Count,
			}
			dctx, cancel := context.WithTimeout(ctx, c.timeout)
			defer cancel()
			startT := time.Now()
			d := net.Dialer{}
			conn, err := d.DialContext(dctx, "tcp", net.JoinHostPort(probe.String(), "80"))
			if err != nil {
				res.Status = "down"
			} else {
				conn.Close()
				res.Status = "up"
				res.LatencyMS = time.Since(startT).Milliseconds()
			}
			results[i] = res
		}(i, r)
	}
	wg.Wait()
	return results, nil
}
