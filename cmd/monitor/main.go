// Command monitor runs one full monitoring pass: concurrent checks, storage,
// LLM analysis via Ollama, site.json regeneration, and a git commit+push.
// It is designed to be run from cron every 5 minutes.
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"iran-internet-monitor/internal/analyzer"
	"iran-internet-monitor/internal/checker"
	"iran-internet-monitor/internal/config"
	"iran-internet-monitor/internal/git"
	"iran-internet-monitor/internal/storage"
)

func main() {
	repoDir := flag.String("repo", ".", "repository root (config.yaml and data/ live here)")
	skipLLM := flag.Bool("no-llm", false, "skip the Ollama analysis step")
	skipGit := flag.Bool("no-git", false, "skip git commit and push")
	flag.Parse()
	log.SetFlags(log.LstdFlags | log.LUTC)

	if err := runPass(*repoDir, *skipLLM, *skipGit); err != nil {
		log.Fatalf("pass failed: %v", err)
	}
}

func runPass(repoDir string, skipLLM, skipGit bool) error {
	start := time.Now()
	cfg, err := config.Load(filepath.Join(repoDir, "config.yaml"))
	if err != nil {
		return err
	}
	store, err := storage.New(filepath.Join(repoDir, "data"))
	if err != nil {
		return err
	}
	ctx := context.Background()

	// 1. concurrent checks — the labeled IP-range sweep runs alongside the
	// service checks; both are network-bound.
	chk := checker.New(cfg.Check.TimeoutSeconds, cfg.Check.DegradedMS)
	var rangeResults []checker.RangeResult
	rangesDone := make(chan struct{})
	go func() {
		defer close(rangesDone)
		if cfg.IPRangesCSV == "" {
			return
		}
		ranges, err := config.LoadRanges(filepath.Join(repoDir, cfg.IPRangesCSV))
		if err != nil {
			log.Printf("ip ranges skipped: %v", err)
			return
		}
		if rangeResults, err = chk.RunRanges(ctx, ranges); err != nil {
			log.Printf("ip ranges skipped: %v", err)
		}
	}()
	results := chk.RunAll(ctx, cfg.Categories, cfg.Check.Concurrency)
	<-rangesDone

	// 2. persist the pass
	latest, err := store.SavePass(results)
	if err != nil {
		return fmt.Errorf("save pass: %w", err)
	}
	var networks *storage.Networks
	if len(rangeResults) > 0 {
		if networks, err = store.SaveNetworks(latest.Timestamp, rangeResults); err != nil {
			return fmt.Errorf("save networks: %w", err)
		}
		log.Printf("probed %d labeled ranges — %d up across %d operators",
			networks.RangesTotal, networks.RangesUp, len(networks.Orgs))
	}
	log.Printf("checked %d endpoints in %s — up:%d degraded:%d down:%d overall:%s",
		len(results), time.Since(start).Round(time.Millisecond),
		latest.Counts["up"], latest.Counts["degraded"], latest.Counts["down"], latest.Overall)

	// 3. LLM analysis — best-effort: a dead Ollama must never lose a pass.
	var analysis json.RawMessage
	if cfg.Ollama.Enabled && !skipLLM {
		an := &analyzer.Analyzer{
			Host:    cfg.Ollama.Host,
			Model:   cfg.Ollama.Model,
			Timeout: time.Duration(cfg.Ollama.TimeoutSeconds) * time.Second,
			DataDir: store.Dir,
		}
		if analysis, err = an.Run(ctx, latest, networks); err != nil {
			log.Printf("analysis skipped: %v", err)
			analysis = nil
		} else {
			log.Printf("analysis written by %s", cfg.Ollama.Model)
		}
	}
	if analysis == nil {
		// keep showing the last good analysis on the site
		if prev, err := os.ReadFile(filepath.Join(store.Dir, "analysis", "latest.json")); err == nil {
			analysis = prev
		}
	}

	// 4. regenerate the aggregated site payload
	if err := store.BuildSite(cfg, latest, analysis, networks); err != nil {
		return fmt.Errorf("build site.json: %w", err)
	}

	// 5. commit and push — this is what triggers the Pages deploy
	if !skipGit {
		repo := &git.Repo{Dir: repoDir, Remote: cfg.Git.Remote, Branch: cfg.Git.Branch}
		msg := fmt.Sprintf("📊 %s | up:%d degraded:%d down:%d | %s",
			latest.Timestamp, latest.Counts["up"], latest.Counts["degraded"], latest.Counts["down"], latest.Overall)
		if err := repo.CommitAndPush(msg, cfg.Git.Push); err != nil {
			return fmt.Errorf("git: %w", err)
		}
	}
	log.Printf("pass complete in %s", time.Since(start).Round(time.Millisecond))
	return nil
}
