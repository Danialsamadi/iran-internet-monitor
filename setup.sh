#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Iran Internet Monitor — Quick Setup
# Creates GitHub repo, configures Pages, and pushes initial commit
# Usage: bash setup.sh [github-username] [repo-name]
# ═══════════════════════════════════════════════════════════════

set -eo pipefail

USER="${1:-Danialsamadi}"
REPO="${2:-iran-internet-monitor}"

echo "═══════════════════════════════════════════════════"
echo "  Iran Internet Monitor — Setup"
echo "═══════════════════════════════════════════════════"
echo ""

# Check prerequisites (Go required for checker)
for cmd in git gh go jq; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "ERROR: $cmd is required. Please install it first."
        exit 1
    fi
done

echo "[1/6] Creating GitHub repository..."
gh repo create "$USER/$REPO" --public \
  --description "📈 Real-time monitoring of Iran's internet connectivity, censorship & circumvention tools — powered by GitHub Actions" \
  || true

echo "[2/6] Initializing local repo..."
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
git init
git checkout -b main 2>/dev/null || true

echo "[3/6] Configuring project..."
# Update config with actual repo info
tmp=$(mktemp)
jq --arg owner "$USER" --arg repo "$REPO" \
    '.owner = $owner | .repo = $repo | .url = "https://\($owner).github.io/\($repo)"' \
    config.json > "$tmp" && mv "$tmp" config.json
rm -f "$tmp"

chmod +x run-check.sh scripts/update-readme.sh 2>/dev/null || true

echo "[4/6] Running initial check..."
./run-check.sh || echo "  (Initial check had some errors, that's OK)"

echo "[5/6] Creating initial commit..."
git add -A
git commit -m "🚀 Initial setup: Iran Internet Monitor

Includes:
- GitHub Actions workflow (every 5 min)
- Status page (GitHub Pages)
- Auto-generated README with live status
- Issue-based incident tracking"

echo "[6/6] Pushing to GitHub..."
git remote add origin "https://github.com/$USER/$REPO.git" 2>/dev/null || true
git push -u origin main --force

echo ""
echo "═════════════════════════════════════════════════════"
echo "  ✅ Setup Complete!"
echo ""
echo "  Next steps:"
echo ""
echo "  1. Enable GitHub Pages:"
echo "     → https://github.com/$USER/$REPO/settings/pages"
echo "     → Source: 'Deploy from a branch'"
echo "     → Branch: 'gh-pages' / '/ (root)'"
echo ""
echo "  2. Create labels for incident tracking:"
echo "     gh label create 'status:down' --color 'e74c3c' --repo $USER/$REPO"
echo "     gh label create 'status:degraded' --color 'f39c12' --repo $USER/$REPO"
echo "     gh label create 'automated' --color '6c757d' --repo $USER/$REPO"
echo ""
echo "  3. (Optional) Create a GH_PAT secret for better Actions:"
echo "     → https://github.com/$USER/$REPO/settings/secrets/actions"
echo ""
echo "  4. Your status page will be at:"
echo "     → https://$USER.github.io/$REPO"
echo ""
echo "  5. Monitor will start running automatically every 5 minutes!"
echo "═════════════════════════════════════════════════════"
