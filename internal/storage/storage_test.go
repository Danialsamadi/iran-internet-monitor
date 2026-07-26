package storage

import (
	"strings"
	"testing"
	"time"
)

func TestOverall(t *testing.T) {
	cases := []struct {
		up, deg, down int
		want          string
	}{
		{10, 0, 0, "operational"},
		{9, 1, 0, "degraded"},
		{9, 0, 1, "partial_outage"},
		{6, 0, 4, "major_outage"},
		{0, 0, 0, "unknown"},
	}
	for _, c := range cases {
		got := Overall(map[string]int{"up": c.up, "degraded": c.deg, "down": c.down})
		if got != c.want {
			t.Errorf("Overall(%d/%d/%d) = %q, want %q", c.up, c.deg, c.down, got, c.want)
		}
	}
}

func TestCells24h(t *testing.T) {
	now := time.Date(2026, 7, 26, 12, 0, 0, 0, time.UTC)
	start := now.Add(-24 * time.Hour)
	hist := []histRec{
		{TS: start.Add(5 * time.Minute), ServiceID: "a", Status: "up"},
		{TS: start.Add(10 * time.Minute), ServiceID: "a", Status: "down"}, // worst wins in bucket 0
		{TS: start.Add(40 * time.Minute), ServiceID: "a", Status: "degraded"},
		{TS: now.Add(-2 * time.Minute), ServiceID: "a", Status: "up"}, // last bucket
		{TS: start.Add(-time.Hour), ServiceID: "a", Status: "down"},   // outside window, ignored
	}
	cells, uptime := cells24h(hist, now)
	c := cells["a"]
	if len(c) != buckets24 {
		t.Fatalf("got %d cells, want %d", len(c), buckets24)
	}
	if c[0] != 'd' || c[1] != 'g' || c[47] != 'u' {
		t.Errorf("cells = %q: want d,g,...,u at 0,1,47", c)
	}
	if n := strings.Count(c, "?"); n != 45 {
		t.Errorf("empty buckets = %d, want 45", n)
	}
	if u := uptime["a"]; u != 50 { // 2 of 4 in-window checks were up
		t.Errorf("uptime = %v, want 50", u)
	}
}
