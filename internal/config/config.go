// Package config loads config.yaml: monitor settings, Ollama settings and
// the full list of monitored services grouped by category.
package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Service struct {
	ID     string `yaml:"id" json:"id"`
	Name   string `yaml:"name" json:"name"`
	NameFa string `yaml:"name_fa,omitempty" json:"name_fa,omitempty"`
	// Type is one of: http, dns, tcp.
	Type   string `yaml:"type" json:"type"`
	Target string `yaml:"target" json:"target"`
	// Query is the domain to resolve for dns checks (default "google.com").
	Query string `yaml:"query,omitempty" json:"query,omitempty"`
}

type Category struct {
	Name     string    `yaml:"name" json:"name"`
	NameFa   string    `yaml:"name_fa,omitempty" json:"name_fa,omitempty"`
	Services []Service `yaml:"services" json:"services"`
}

type Config struct {
	Check struct {
		TimeoutSeconds int `yaml:"timeout_seconds"`
		Concurrency    int `yaml:"concurrency"`
		DegradedMS     int `yaml:"degraded_ms"`
	} `yaml:"check"`
	Ollama struct {
		Host           string `yaml:"host"`
		Model          string `yaml:"model"`
		TimeoutSeconds int    `yaml:"timeout_seconds"`
		Enabled        bool   `yaml:"enabled"`
	} `yaml:"ollama"`
	Git struct {
		Push   bool   `yaml:"push"`
		Remote string `yaml:"remote"`
		Branch string `yaml:"branch"`
	} `yaml:"git"`
	Categories []Category `yaml:"categories"`
}

// Load reads and validates config.yaml, applying defaults.
func Load(path string) (*Config, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}
	var c Config
	if err := yaml.Unmarshal(b, &c); err != nil {
		return nil, fmt.Errorf("parse config: %w", err)
	}
	if c.Check.TimeoutSeconds == 0 {
		c.Check.TimeoutSeconds = 15
	}
	if c.Check.Concurrency == 0 {
		c.Check.Concurrency = 20
	}
	if c.Check.DegradedMS == 0 {
		c.Check.DegradedMS = 3000
	}
	if c.Ollama.Host == "" {
		c.Ollama.Host = "http://localhost:11434"
	}
	if c.Ollama.Model == "" {
		c.Ollama.Model = "hermes3"
	}
	if c.Ollama.TimeoutSeconds == 0 {
		c.Ollama.TimeoutSeconds = 180
	}
	if c.Git.Remote == "" {
		c.Git.Remote = "origin"
	}
	if c.Git.Branch == "" {
		c.Git.Branch = "main"
	}
	seen := map[string]bool{}
	for _, cat := range c.Categories {
		for _, s := range cat.Services {
			if s.ID == "" || s.Target == "" {
				return nil, fmt.Errorf("service %q in %q: id and target are required", s.Name, cat.Name)
			}
			if seen[s.ID] {
				return nil, fmt.Errorf("duplicate service id %q", s.ID)
			}
			seen[s.ID] = true
			switch s.Type {
			case "http", "dns", "tcp":
			default:
				return nil, fmt.Errorf("service %q: unknown type %q", s.ID, s.Type)
			}
		}
	}
	return &c, nil
}
