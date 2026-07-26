// Package git commits and pushes the data directory after each pass.
package git

import (
	"fmt"
	"os/exec"
	"strings"
)

type Repo struct {
	Dir    string
	Remote string
	Branch string
}

func run(dir string, args ...string) (string, error) {
	cmd := exec.Command("git", append([]string{"-C", dir}, args...)...)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("git %s: %v: %s", strings.Join(args, " "), err, strings.TrimSpace(string(out)))
	}
	return strings.TrimSpace(string(out)), nil
}

// CommitAndPush stages data/, commits with the pass summary, and pushes.
// A pass with no data changes is a no-op, not an error.
func (r *Repo) CommitAndPush(message string, push bool) error {
	if _, err := run(r.Dir, "add", "data"); err != nil {
		return err
	}
	if _, err := run(r.Dir, "diff", "--cached", "--quiet"); err == nil {
		return nil // nothing staged
	}
	if _, err := run(r.Dir, "commit", "-m", message); err != nil {
		return err
	}
	if !push {
		return nil
	}
	_, err := run(r.Dir, "push", r.Remote, r.Branch)
	return err
}
