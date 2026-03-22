#!/usr/bin/env bash
# dev-status.sh — Quick status dashboard for paris-trip-2026
set -euo pipefail

REPO="jveldheer/paris-trip-2026"

echo "========================================"
echo "  Paris Trip 2026 — Dev Status"
echo "========================================"
echo ""

# Current branch
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
echo "Branch: $branch"
echo ""

# Last 3 commits
echo "--- Recent Commits ---"
git log --oneline -3 2>/dev/null || echo "  (no git history)"
echo ""

# Uncommitted changes
changes=$(git status --short 2>/dev/null)
if [ -z "$changes" ]; then
  echo "--- Working Tree ---"
  echo "  Clean"
else
  echo "--- Uncommitted Changes ---"
  echo "$changes"
fi
echo ""

# Open GitHub issues
if command -v gh &>/dev/null && gh auth status &>/dev/null 2>&1; then
  issue_count=$(gh api "repos/$REPO/issues?state=open&per_page=1" --jq 'length' 2>/dev/null || echo "?")
  total=$(gh api "repos/$REPO/issues?state=open" --jq 'length' 2>/dev/null || echo "?")
  echo "--- GitHub Issues ---"
  echo "  Open issues: $total"
  echo ""
else
  echo "--- GitHub Issues ---"
  echo "  (gh CLI not authenticated — run 'gh auth login')"
  echo ""
fi

# Latest Vercel deployment
if command -v vercel &>/dev/null && vercel whoami &>/dev/null 2>&1; then
  echo "--- Latest Vercel Deploy ---"
  vercel ls 2>/dev/null | head -4
  echo ""
else
  echo "--- Vercel Deploy ---"
  echo "  (vercel CLI not authenticated — run 'vercel login')"
  echo ""
fi

echo "========================================"
