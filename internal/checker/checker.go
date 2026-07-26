// Package checker runs concurrent HTTP, DNS and TCP reachability checks
// against the configured services and returns one flat Result per service.
package checker

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"

	"iran-internet-monitor/internal/config"
)

// Result is one check outcome. The field set is deliberately flat and
// self-describing so a single JSONL line is meaningful to an LLM on its own.
type Result struct {
	Timestamp  string `json:"ts"`
	ServiceID  string `json:"service_id"`
	Name       string `json:"name"`
	Category   string `json:"category"`
	Type       string `json:"type"`
	Target     string `json:"target"`
	Status     string `json:"status"` // up | degraded | down
	LatencyMS  int64  `json:"latency_ms"`
	Error      string `json:"error,omitempty"`
	HTTPStatus int    `json:"http_status,omitempty"`
}

type Checker struct {
	timeout    time.Duration
	degradedMS int64
	client     *http.Client
}

func New(timeoutSeconds, degradedMS int) *Checker {
	timeout := time.Duration(timeoutSeconds) * time.Second
	return &Checker{
		timeout:    timeout,
		degradedMS: int64(degradedMS),
		client: &http.Client{
			Timeout: timeout,
			Transport: &http.Transport{
				// Many Iranian endpoints present broken or MITM'd certificates;
				// we measure reachability, not trust.
				TLSClientConfig:   &tls.Config{InsecureSkipVerify: true},
				DisableKeepAlives: true,
			},
		},
	}
}

// RunAll checks every service concurrently (bounded by concurrency) and
// returns results in stable config order.
func (c *Checker) RunAll(ctx context.Context, cats []config.Category, concurrency int) []Result {
	type job struct {
		svc config.Service
		cat string
		idx int
	}
	var jobs []job
	for _, cat := range cats {
		for _, s := range cat.Services {
			jobs = append(jobs, job{svc: s, cat: cat.Name, idx: len(jobs)})
		}
	}

	results := make([]Result, len(jobs))
	sem := make(chan struct{}, concurrency)
	var wg sync.WaitGroup
	for _, j := range jobs {
		wg.Add(1)
		go func(j job) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()
			results[j.idx] = c.check(ctx, j.svc, j.cat)
		}(j)
	}
	wg.Wait()
	return results
}

func (c *Checker) check(ctx context.Context, s config.Service, category string) Result {
	r := Result{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		ServiceID: s.ID,
		Name:      s.Name,
		Category:  category,
		Type:      s.Type,
		Target:    s.Target,
	}
	ctx, cancel := context.WithTimeout(ctx, c.timeout)
	defer cancel()

	start := time.Now()
	var err error
	switch s.Type {
	case "http":
		err = c.checkHTTP(ctx, s.Target, &r)
	case "dns":
		err = c.checkDNS(ctx, s)
	case "tcp":
		err = c.checkTCP(ctx, s.Target)
	}
	r.LatencyMS = time.Since(start).Milliseconds()

	switch {
	case err != nil:
		r.Status = "down"
		r.LatencyMS = 0
		r.Error = err.Error()
	case r.LatencyMS > c.degradedMS:
		r.Status = "degraded"
	default:
		r.Status = "up"
	}
	return r
}

func (c *Checker) checkHTTP(ctx context.Context, url string, r *Result) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; IranNetMonitor/1.0)")
	resp, err := c.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	r.HTTPStatus = resp.StatusCode
	// Any HTTP answer below 500 means the endpoint is alive and talking;
	// 403/451-style blocks from the host itself still prove reachability.
	if resp.StatusCode >= 500 {
		return fmt.Errorf("http %d", resp.StatusCode)
	}
	return nil
}

func (c *Checker) checkDNS(ctx context.Context, s config.Service) error {
	query := s.Query
	if query == "" {
		query = "google.com"
	}
	resolver := &net.Resolver{
		PreferGo: true,
		Dial: func(ctx context.Context, network, _ string) (net.Conn, error) {
			d := net.Dialer{Timeout: c.timeout}
			return d.DialContext(ctx, network, s.Target)
		},
	}
	addrs, err := resolver.LookupHost(ctx, query)
	if err != nil {
		return err
	}
	if len(addrs) == 0 {
		return fmt.Errorf("no answers for %s", query)
	}
	return nil
}

func (c *Checker) checkTCP(ctx context.Context, target string) error {
	d := net.Dialer{}
	conn, err := d.DialContext(ctx, "tcp", target)
	if err != nil {
		return err
	}
	return conn.Close()
}
