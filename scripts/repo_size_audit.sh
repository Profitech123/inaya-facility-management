#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

echo "=== Workspace Size ==="
du -sh . 2>/dev/null || true
echo

echo "=== Largest Top-Level Paths ==="
du -sh ./* ./.??* 2>/dev/null | sed 's#^\([^[:space:]]\+[[:space:]]\+\)\./#\1#' | sort -hr | head -n 20 || true
echo

echo "=== Git Object Database ==="
git count-objects -vH
echo

echo "=== Largest Committed Blobs (bytes) ==="
git rev-list --objects --all \
  | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
  | awk '$1=="blob" {print $3 "\t" $4}' \
  | sort -nr \
  | head -n 20
