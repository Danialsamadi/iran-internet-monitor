// Iran Internet Monitor — Go checker (parallel API checks)
// Reads config.json, checks all services concurrently, writes api/*.json and history/*.csv
package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	timeout     = 30 * time.Second
	maxParallel = 20
	historyMax  = 8640
)

type Config struct {
	Categories []Category `json:"categories"`
}

type Category struct {
	Name     string    `json:"name"`
	Icon     string    `json:"icon"`
	Services []Service `json:"services"`
}

type Service struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	URL           string  `json:"url"`
	Type          string  `json:"type"`
	Interval      int     `json:"interval"`
	ThresholdWarn int     `json:"threshold_warn"`
	ThresholdCrit int     `json:"threshold_crit"`
}

type ServiceResult struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Status       string  `json:"status"`
	Message      string  `json:"message"`
	Value        float64 `json:"value"`
	ResponseTime int64   `json:"response_time_ms"`
	HTTPCode     int     `json:"http_code"`
	UptimePct    float64 `json:"uptime_pct"`
	LastCheck    string  `json:"last_check"`
	LastCheckEpoch int64 `json:"last_check_epoch"`
	PrevStatus   string  `json:"prev_status"`
}

func expandURL(url string, now time.Time) string {
	nowUnix := now.Unix()
	ago7d := nowUnix - 7*86400
	ago24h := nowUnix - 86400
	ago30d := nowUnix - 30*86400
	today := now.UTC().Format("2006-01-02")
	ago7dDate := time.Unix(ago7d, 0).UTC().Format("2006-01-02")
	ago30dDate := time.Unix(ago30d, 0).UTC().Format("2006-01-02")

	url = strings.ReplaceAll(url, "__NOW__", strconv.FormatInt(nowUnix, 10))
	url = strings.ReplaceAll(url, "__7D_AGO__", strconv.FormatInt(ago7d, 10))
	url = strings.ReplaceAll(url, "__24H_AGO__", strconv.FormatInt(ago24h, 10))
	url = strings.ReplaceAll(url, "__30D_AGO__", strconv.FormatInt(ago30d, 10))
	url = strings.ReplaceAll(url, "__TODAY__", today)
	url = strings.ReplaceAll(url, "__7D_AGO_DATE__", ago7dDate)
	url = strings.ReplaceAll(url, "__30D_AGO_DATE__", ago30dDate)
	return url
}

func needsCheck(apiDir, id string, interval int, now int64) bool {
	b, err := os.ReadFile(filepath.Join(apiDir, id+".json"))
	if err != nil {
		return true
	}
	var prev ServiceResult
	if json.Unmarshal(b, &prev) != nil {
		return true
	}
	elapsed := now - prev.LastCheckEpoch
	return elapsed >= int64(interval)
}

// Evaluators return (status, value, message)
func evalIODASignal(raw []byte, threshWarn, threshCrit int) (string, float64, string) {
	var data struct {
		Data []json.RawMessage `json:"data"`
	}
	if json.Unmarshal(raw, &data) != nil || len(data.Data) == 0 {
		return "unknown", 0, "No data available"
	}
	var first interface{}
	if json.Unmarshal(data.Data[0], &first) != nil {
		return "unknown", 0, "No data available"
	}
	var values []float64
	switch v := first.(type) {
	case []interface{}:
		if len(v) > 0 {
			if m, ok := v[0].(map[string]interface{}); ok {
				if arr, ok := m["values"].([]interface{}); ok {
					for _, x := range arr {
						if f, ok := x.(float64); ok {
							values = append(values, f)
						}
					}
				}
			}
		}
	case map[string]interface{}:
		if arr, ok := v["values"].([]interface{}); ok {
			for _, x := range arr {
				if f, ok := x.(float64); ok {
					values = append(values, f)
				}
			}
		}
	}
	if len(values) == 0 {
		return "unknown", 0, "No signal data"
	}
	latest := values[len(values)-1]
	maxVal := values[0]
	for _, x := range values {
		if x > maxVal {
			maxVal = x
		}
	}
	if maxVal <= 0 {
		return "unknown", 0, "No signal data"
	}
	pct := (latest / maxVal) * 100
	status, msg := "up", fmt.Sprintf("Healthy — signal at %.0f%% of normal", pct)
	if pct < float64(threshCrit) {
		status, msg = "down", fmt.Sprintf("Critical — signal at %.0f%% of normal", pct)
	} else if pct < float64(threshWarn) {
		status, msg = "degraded", fmt.Sprintf("Degraded — signal at %.0f%% of normal", pct)
	}
	return status, pct, msg
}

func evalIODAAlerts(raw []byte) (string, float64, string) {
	var data struct {
		Data []interface{} `json:"data"`
	}
	json.Unmarshal(raw, &data)
	count := len(data.Data)
	if count > 0 {
		return "degraded", float64(count), fmt.Sprintf("%d active alert(s)", count)
	}
	return "up", 0, "No active outage alerts"
}

func evalOONI(raw []byte) (string, float64, string) {
	var resp struct {
		Result interface{} `json:"result"`
	}
	if json.Unmarshal(raw, &resp) != nil {
		return "unknown", 0, "No measurement data"
	}
	var anomalyCount, okCount float64
	switch r := resp.Result.(type) {
	case []interface{}:
		for _, item := range r {
			if m, ok := item.(map[string]interface{}); ok {
				if v, ok := m["anomaly_count"].(float64); ok {
					anomalyCount += v
				}
				if v, ok := m["ok_count"].(float64); ok {
					okCount += v
				}
			}
		}
	case map[string]interface{}:
		if v, ok := r["anomaly_count"].(float64); ok {
			anomalyCount = v
		}
		if v, ok := r["ok_count"].(float64); ok {
			okCount = v
		}
	}
	total := anomalyCount + okCount
	if total <= 0 {
		return "unknown", 0, "No measurement data"
	}
	anomalyPct := (anomalyCount / total) * 100
	status, msg := "up", fmt.Sprintf("Accessible — %.0f%% anomaly rate (%.0f OK)", anomalyPct, okCount)
	if anomalyPct > 80 {
		status, msg = "down", fmt.Sprintf("Blocked — %.0f%% anomaly rate (%.0f/%.0f tests)", anomalyPct, anomalyCount, total)
	} else if anomalyPct > 30 {
		status, msg = "degraded", fmt.Sprintf("Partially blocked — %.0f%% anomaly rate", anomalyPct)
	}
	return status, anomalyPct, msg
}

func evalIrinter(raw []byte, threshWarn, threshCrit int) (string, float64, string) {
	var data struct {
		Data []struct {
			Value float64 `json:"value"`
		} `json:"data"`
	}
	if json.Unmarshal(raw, &data) != nil || len(data.Data) == 0 {
		return "unknown", 0, "No score data"
	}
	score := data.Data[len(data.Data)-1].Value
	scoreInt := int(score)
	status, msg := "up", fmt.Sprintf("Good — network score %.0f/100", score)
	if scoreInt < threshCrit {
		status, msg = "down", fmt.Sprintf("Poor — network score %.0f/100", score)
	} else if scoreInt < threshWarn {
		status, msg = "degraded", fmt.Sprintf("Fair — network score %.0f/100", score)
	}
	return status, score, msg
}

func evalRIPEProbes(raw []byte) (string, float64, string) {
	var data struct {
		Count int `json:"count"`
	}
	json.Unmarshal(raw, &data)
	return "up", float64(data.Count), fmt.Sprintf("%d probes", data.Count)
}

func evalPsiphon(raw []byte) (string, float64, string) {
	var m map[string]interface{}
	if json.Unmarshal(raw, &m) != nil {
		return "unknown", 0, "Could not parse stats"
	}
	if v, ok := m["total_stations"].(float64); ok {
		return "up", v, fmt.Sprintf("%.0f active stations", v)
	}
	if daily, ok := m["daily_stats"].([]interface{}); ok && len(daily) > 0 {
		if d, ok := daily[len(daily)-1].(map[string]interface{}); ok {
			if u, ok := d["daily_unique_users"].(float64); ok {
				return "up", u, fmt.Sprintf("%.0f daily unique users", u)
			}
		}
	}
	return "unknown", 0, "Could not parse stats"
}

var torCSVLine = regexp.MustCompile(`^[0-9]{4}-[0-9]{2}-[0-9]{2}`)

func evalTorCSV(raw []byte) (string, float64, string) {
	scanner := bufio.NewScanner(bytes.NewReader(raw))
	var lastLine string
	for scanner.Scan() {
		line := scanner.Text()
		if torCSVLine.MatchString(line) {
			lastLine = line
		}
	}
	if lastLine == "" {
		return "unknown", 0, "No data available"
	}
	parts := strings.Split(lastLine, ",")
	if len(parts) == 0 {
		return "unknown", 0, "No user data"
	}
	lastVal := parts[len(parts)-1]
	lastVal = regexp.MustCompile(`[^0-9]`).ReplaceAllString(lastVal, "")
	v, _ := strconv.ParseFloat(lastVal, 64)
	if v == 0 {
		return "unknown", 0, "No user data"
	}
	return "up", v, fmt.Sprintf("%.0f estimated users", v)
}

func evalRIPEstat(raw []byte) (string, float64, string) {
	var data struct {
		Status string `json:"status"`
	}
	json.Unmarshal(raw, &data)
	if data.Status == "ok" {
		return "up", 100, "Data available"
	}
	return "unknown", 0, "API returned: " + data.Status
}

func evalGeneric(httpCode int) (string, float64, string) {
	if httpCode >= 200 && httpCode < 300 {
		return "up", 100, fmt.Sprintf("HTTP %d", httpCode)
	}
	if httpCode >= 400 {
		return "down", 0, fmt.Sprintf("HTTP %d", httpCode)
	}
	return "unknown", 0, fmt.Sprintf("HTTP %d", httpCode)
}

func evaluate(serviceType string, raw []byte, httpCode int, threshWarn, threshCrit int) (status string, value float64, message string) {
	if httpCode == 0 || len(raw) == 0 {
		return "down", 0, "Connection failed (timeout or unreachable)"
	}
	if threshWarn <= 0 {
		threshWarn = 80
	}
	if threshCrit <= 0 {
		threshCrit = 50
	}
	switch serviceType {
	case "ioda_signal":
		return evalIODASignal(raw, threshWarn, threshCrit)
	case "ioda_alerts":
		return evalIODAAlerts(raw)
	case "ooni_aggregation":
		return evalOONI(raw)
	case "irinter_score":
		return evalIrinter(raw, threshWarn, threshCrit)
	case "ripe_probes":
		return evalRIPEProbes(raw)
	case "psiphon_stats":
		return evalPsiphon(raw)
	case "tor_csv":
		return evalTorCSV(raw)
	case "ripestat":
		return evalRIPEstat(raw)
	default:
		return evalGeneric(httpCode)
	}
}

func readPrevStatus(apiDir, id string) string {
	b, err := os.ReadFile(filepath.Join(apiDir, id+".json"))
	if err != nil {
		return "unknown"
	}
	var prev ServiceResult
	if json.Unmarshal(b, &prev) != nil {
		return "unknown"
	}
	return prev.Status
}

func readUptimePct(historyPath string) float64 {
	f, err := os.Open(historyPath)
	if err != nil {
		return 100
	}
	defer f.Close()
	r := csv.NewReader(f)
	var total, up int
	for {
		row, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil || len(row) < 2 {
			continue
		}
		total++
		if row[1] == "up" {
			up++
		}
	}
	if total <= 0 {
		return 100
	}
	return float64(up) / float64(total) * 100
}

func appendHistory(historyPath, nowISO, status string, value float64, responseTime int64, httpCode int) {
	f, err := os.OpenFile(historyPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return
	}
	defer f.Close()
	fmt.Fprintf(f, "%s,%s,%.0f,%d,%d\n", nowISO, status, value, responseTime, httpCode)
}

func trimHistory(historyPath string) {
	b, err := os.ReadFile(historyPath)
	if err != nil {
		return
	}
	lines := strings.Split(strings.TrimSuffix(string(b), "\n"), "\n")
	if len(lines) <= historyMax {
		return
	}
	keep := lines[len(lines)-historyMax:]
	if err := os.WriteFile(historyPath, []byte(strings.Join(keep, "\n")+"\n"), 0644); err != nil {
		return
	}
}

func checkOne(client *http.Client, rootDir, apiDir, historyDir string, s Service, now time.Time, nowUnix int64, nowISO string, sem chan struct{}, wg *sync.WaitGroup, allResults *[]ServiceResult, resultsMu *sync.Mutex) {
	defer wg.Done()
	<-sem
	defer func() { sem <- struct{}{} }()

	url := expandURL(s.URL, now)
	start := time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), 25*time.Second)
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	resp, err := client.Do(req)
	cancel()
	elapsed := time.Since(start).Milliseconds()
	var body []byte
	code := 0
	if err == nil {
		code = resp.StatusCode
		body, _ = io.ReadAll(resp.Body)
		resp.Body.Close()
	}

	status, value, message := evaluate(s.Type, body, code, s.ThresholdWarn, s.ThresholdCrit)
	prevStatus := readPrevStatus(apiDir, s.ID)
	historyPath := filepath.Join(historyDir, s.ID+".csv")
	uptimePct := readUptimePct(historyPath)
	appendHistory(historyPath, nowISO, status, value, elapsed, code)
	trimHistory(historyPath)

	result := ServiceResult{
		ID:            s.ID,
		Name:          s.Name,
		Status:        status,
		Message:       message,
		Value:         value,
		ResponseTime:  elapsed,
		HTTPCode:      code,
		UptimePct:     uptimePct,
		LastCheck:     nowISO,
		LastCheckEpoch: nowUnix,
		PrevStatus:   prevStatus,
	}
	resultsMu.Lock()
	*allResults = append(*allResults, result)
	resultsMu.Unlock()

	// Write api/{id}.json
	outPath := filepath.Join(apiDir, s.ID+".json")
	jb, _ := json.MarshalIndent(result, "", "  ")
	os.WriteFile(outPath, jb, 0644)

	// Incident log
	if prevStatus != "unknown" && prevStatus != status {
		incPath := filepath.Join(rootDir, "incidents.log")
		f, _ := os.OpenFile(incPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if f != nil {
			fmt.Fprintf(f, "%s|%s|%s|%s|%s|%s\n", nowISO, s.ID, s.Name, prevStatus, status, message)
			f.Close()
		}
	}
}

func main() {
	// Run from uptime/ so config.json and api/ are alongside the binary or cwd
	rootDir := "."
	if len(os.Args) > 1 {
		rootDir = os.Args[1]
	}
	configPath := filepath.Join(rootDir, "config.json")
	apiDir := filepath.Join(rootDir, "api")
	historyDir := filepath.Join(rootDir, "history")
	os.MkdirAll(apiDir, 0755)
	os.MkdirAll(historyDir, 0755)

	configData, err := os.ReadFile(configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to read config: %v\n", err)
		os.Exit(1)
	}
	var cfg Config
	if json.Unmarshal(configData, &cfg) != nil {
		fmt.Fprintf(os.Stderr, "Failed to parse config.json\n")
		os.Exit(1)
	}

	now := time.Now().UTC()
	nowUnix := now.Unix()
	nowISO := now.Format(time.RFC3339)
	client := &http.Client{Timeout: timeout}

	fmt.Println("═══════════════════════════════════════════════════════════════")
	fmt.Println("  Iran Internet Monitor — Check Run (Go)")
	fmt.Printf("  %s\n", now.Format("2006-01-02 15:04:05 UTC"))
	fmt.Println("═══════════════════════════════════════════════════════════════")
	fmt.Println()

	// Semaphore: pre-fill with tokens so up to maxParallel goroutines can run
	sem := make(chan struct{}, maxParallel)
	for i := 0; i < maxParallel; i++ {
		sem <- struct{}{}
	}
	var wg sync.WaitGroup
	var allResults []ServiceResult
	var resultsMu sync.Mutex

	totalServices := 0
	checked := 0
	checkedIDs := make(map[string]bool)
	for _, cat := range cfg.Categories {
		fmt.Printf("── %s %s ──────────────────────────────────\n", cat.Icon, cat.Name)
		for _, s := range cat.Services {
			totalServices++
			interval := s.Interval
			if interval <= 0 {
				interval = 300
			}
			if !needsCheck(apiDir, s.ID, interval, nowUnix) {
				fmt.Printf("  Skipping: %s (checked recently)\n", s.Name)
				// Load existing result for summary
				b, _ := os.ReadFile(filepath.Join(apiDir, s.ID+".json"))
				var prev ServiceResult
				if json.Unmarshal(b, &prev) == nil {
					resultsMu.Lock()
					allResults = append(allResults, prev)
					resultsMu.Unlock()
				}
				continue
			}
			checked++
			checkedIDs[s.ID] = true
			fmt.Printf("  Checking: %s (%s)\n", s.Name, s.ID)
			wg.Add(1)
			go checkOne(client, rootDir, apiDir, historyDir, s, now, nowUnix, nowISO, sem, &wg, &allResults, &resultsMu)
		}
		fmt.Println()
	}

	wg.Wait()

	// Build map for printing in config order
	resultByID := make(map[string]ServiceResult)
	for _, r := range allResults {
		resultByID[r.ID] = r
	}
	// Print results for checked services only, in config order
	for _, cat := range cfg.Categories {
		for _, s := range cat.Services {
			if !checkedIDs[s.ID] {
				continue
			}
			r, ok := resultByID[s.ID]
			if !ok {
				continue
			}
			icon := "?"
			switch r.Status {
			case "up":
				icon = "✓"
			case "degraded":
				icon = "!"
			case "down":
				icon = "✗"
			}
			fmt.Printf("    [%s] %s — %s (%dms)\n", icon, r.Status, r.Message, r.ResponseTime)
		}
	}

	var up, degraded, down, unknown int
	for _, r := range allResults {
		switch r.Status {
		case "up":
			up++
		case "degraded":
			degraded++
		case "down":
			down++
		default:
			unknown++
		}
	}
	overall := "up"
	if down > 0 {
		overall = "major_outage"
	} else if degraded > 2 {
		overall = "partial_outage"
	} else if degraded > 0 {
		overall = "degraded"
	}

	summary := map[string]interface{}{
		"overall_status":   overall,
		"last_check":      nowISO,
		"last_check_epoch": nowUnix,
		"total_services":  totalServices,
		"checked_this_run": checked,
		"up":               up,
		"degraded":         degraded,
		"down":             down,
		"unknown":          unknown,
	}
	summaryPath := filepath.Join(apiDir, "summary.json")
	summaryJSON, _ := json.MarshalIndent(summary, "", "  ")
	os.WriteFile(summaryPath, summaryJSON, 0644)

	fmt.Println("═══════════════════════════════════════════════════════════════")
	fmt.Printf("  Done: %d/%d checked\n", checked, totalServices)
	fmt.Printf("  Status: %d up, %d degraded, %d down, %d unknown\n", up, degraded, down, unknown)
	fmt.Printf("  Overall: %s\n", overall)
	fmt.Println("═══════════════════════════════════════════════════════════════")
}
