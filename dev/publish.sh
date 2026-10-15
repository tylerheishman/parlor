#!/usr/bin/env bash
# Rebuild the website from dev/games and push it live (GitHub Pages updates in about a minute).
# Usage: dev/publish.sh "What changed"
set -euo pipefail
cd "$(dirname "$0")/.."
python3 dev/build.py
git add -A
if git diff --cached --quiet; then echo "Nothing changed."; exit 0; fi
git commit -q -m "${1:-Update games}"
git push -q origin main
echo "Pushed. Live at https://tylerheishman.github.io/parlor/ in about a minute."
