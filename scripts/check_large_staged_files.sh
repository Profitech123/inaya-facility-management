#!/usr/bin/env bash
set -euo pipefail

MAX_MB="${MAX_STAGED_FILE_SIZE_MB:-5}"
MAX_BYTES=$((MAX_MB * 1024 * 1024))

staged_files="$(git diff --cached --name-only --diff-filter=AM)"

if [[ -z "$staged_files" ]]; then
  exit 0
fi

violations=0

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  [[ ! -f "$file" ]] && continue

  size_bytes="$(wc -c < "$file" | tr -d '[:space:]')"
  if [[ "$size_bytes" -gt "$MAX_BYTES" ]]; then
    size_mb="$(awk "BEGIN {printf \"%.2f\", $size_bytes/1024/1024}")"
    echo "Large staged file blocked: $file (${size_mb} MB)"
    violations=1
  fi
done <<< "$staged_files"

if [[ "$violations" -eq 1 ]]; then
  echo
  echo "Commit blocked. Keep staged files under ${MAX_MB} MB."
  echo "To override once, run:"
  echo "  MAX_STAGED_FILE_SIZE_MB=20 git commit -m \"your message\""
  exit 1
fi
