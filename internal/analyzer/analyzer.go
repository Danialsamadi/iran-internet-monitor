// Package analyzer sends each pass to a local Hermes model via Ollama and
// stores the structured expert reading of the results.
package analyzer

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"iran-internet-monitor/internal/storage"
)

// systemPrompt makes Hermes act as an Iran internet censorship analyst and
// forces a strict JSON reply the site can render directly.
const systemPrompt = `You are an expert analyst of Iran's internet infrastructure, censorship apparatus, and circumvention ecosystem. You have deep knowledge of:
- Iran's network topology: TIC/DCI international gateways (AS12880, AS49666), major ISPs (Irancell AS44244, MCI AS197207, Shatel AS31549, Respina, Asiatech), and the National Information Network (SHOMA).
- Censorship techniques used in Iran: DNS tampering, SNI-based TLS filtering, DPI, protocol whitelisting, throttling, and full shutdowns ordered via CRA.
- Historical patterns: exam-season shutdowns, protest-related blackouts (Nov 2019, Sep 2022), evening throttling, and the domestic/foreign split of the "national intranet".
- Circumvention tools: Tor bridges/Snowflake, Psiphon, VPN protocols, and how each is typically blocked.

You receive one monitoring pass: reachability results for endpoints probed from a single VPS OUTSIDE Iran. Interpret them like an experienced analyst:
- Distinguish infrastructure failure (BGP withdrawal, backbone loss) from policy filtering (routing intact, application layer dark).
- Note the domestic vs foreign split, circumvention tool health, and any change versus the previous pass.
- Be honest about the single-vantage limitation: you see reachability from outside, not the inside-Iran user experience.
- Never invent data. If evidence is thin, say so.

Reply with ONLY a JSON object, no markdown, exactly these keys:
{
  "overall_status": "operational" | "degraded" | "partial_outage" | "major_outage",
  "severity": "none" | "minor" | "major" | "critical",
  "suspected_causes": ["short cause strings, most likely first"],
  "affected_services": ["service names or groups that are impaired"],
  "public_summary": "2-3 plain sentences for the public status page",
  "insight": "one sharp analytical sentence about what the pattern means",
  "recommendation": "one concrete monitoring or mitigation suggestion"
}`

// Analysis is the parsed model output plus bookkeeping.
type Analysis struct {
	Timestamp        string   `json:"ts"`
	Model            string   `json:"model"`
	OverallStatus    string   `json:"overall_status"`
	Severity         string   `json:"severity"`
	SuspectedCauses  []string `json:"suspected_causes"`
	AffectedServices []string `json:"affected_services"`
	PublicSummary    string   `json:"public_summary"`
	Insight          string   `json:"insight"`
	Recommendation   string   `json:"recommendation"`
}

type Analyzer struct {
	Host    string
	Model   string
	Timeout time.Duration
	DataDir string
}

// Run builds the user prompt from the pass, calls Ollama, validates the JSON
// and persists it to data/analysis/. Returns the raw JSON for site.json.
func (a *Analyzer) Run(ctx context.Context, latest storage.Latest) (json.RawMessage, error) {
	prompt, err := a.buildPrompt(latest)
	if err != nil {
		return nil, err
	}
	ctx, cancel := context.WithTimeout(ctx, a.Timeout)
	defer cancel()

	reqBody, _ := json.Marshal(map[string]any{
		"model":  a.Model,
		"stream": false,
		"format": "json", // Ollama constrains the output to valid JSON
		"options": map[string]any{
			"temperature": 0.2, // analysis, not creative writing
		},
		"messages": []map[string]string{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": prompt},
		},
	})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, a.Host+"/api/chat", bytes.NewReader(reqBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ollama: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ollama: http %d", resp.StatusCode)
	}
	var chat struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&chat); err != nil {
		return nil, fmt.Errorf("ollama response: %w", err)
	}

	var an Analysis
	if err := json.Unmarshal([]byte(chat.Message.Content), &an); err != nil {
		return nil, fmt.Errorf("model returned invalid JSON: %w", err)
	}
	if an.PublicSummary == "" {
		return nil, fmt.Errorf("model reply missing public_summary")
	}
	an.Timestamp = latest.Timestamp
	an.Model = a.Model

	out, err := json.MarshalIndent(an, "", "  ")
	if err != nil {
		return nil, err
	}
	dir := filepath.Join(a.DataDir, "analysis")
	if err := os.WriteFile(filepath.Join(dir, "latest.json"), append(out, '\n'), 0o644); err != nil {
		return nil, err
	}
	// append-only archive of every analysis, one JSON line each
	f, err := os.OpenFile(filepath.Join(dir, "history.jsonl"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	if err := json.NewEncoder(f).Encode(an); err != nil {
		return nil, err
	}
	return json.RawMessage(out), nil
}

// buildPrompt gives the model the pass summary, the failures in full, and the
// previous analysis for continuity — compact enough for an 8B model.
func (a *Analyzer) buildPrompt(latest storage.Latest) (string, error) {
	type slim struct {
		Name     string `json:"name"`
		Category string `json:"category"`
		Status   string `json:"status"`
		Latency  int64  `json:"latency_ms,omitempty"`
		Error    string `json:"error,omitempty"`
	}
	byCat := map[string]map[string]int{}
	var failures []slim
	for _, r := range latest.Results {
		if byCat[r.Category] == nil {
			byCat[r.Category] = map[string]int{}
		}
		byCat[r.Category][r.Status]++
		if r.Status != "up" {
			failures = append(failures, slim{Name: r.Name, Category: r.Category, Status: r.Status, Latency: r.LatencyMS, Error: r.Error})
		}
	}
	payload := map[string]any{
		"pass_time_utc":     latest.Timestamp,
		"overall":           latest.Overall,
		"counts":            latest.Counts,
		"per_category":      byCat,
		"failing_endpoints": failures,
	}
	if prev, err := os.ReadFile(filepath.Join(a.DataDir, "analysis", "latest.json")); err == nil {
		payload["previous_analysis"] = json.RawMessage(prev)
	}
	b, err := json.MarshalIndent(payload, "", " ")
	if err != nil {
		return "", err
	}
	return "Analyze this monitoring pass:\n" + string(b), nil
}
