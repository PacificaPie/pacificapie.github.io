#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

node --check script.js

test -s assets/pacifica-avatar.png
test -s favicon.ico

css_balance="$({
  awk 'BEGIN { n = 0 } { n += gsub(/\{/, "{"); n -= gsub(/\}/, "}") } END { print n }' styles.css
})"
if [[ "$css_balance" != "0" ]]; then
  echo "styles.css has unbalanced braces: $css_balance" >&2
  exit 1
fi

failed=0
while IFS= read -r html_file; do
  grep -qi '<!doctype html>' "$html_file" || {
    echo "$html_file: missing doctype" >&2
    failed=1
  }
  grep -qi '</html>' "$html_file" || {
    echo "$html_file: missing closing html tag" >&2
    failed=1
  }

  base_dir="$(dirname "$html_file")"
  while IFS= read -r attribute; do
    ref="${attribute#*=\"}"
    ref="${ref%\"}"
    ref="${ref%%#*}"
    case "$ref" in
      ''|http://*|https://*|mailto:*|javascript:*|data:*) continue ;;
    esac
    if [[ ! -e "$base_dir/$ref" ]]; then
      echo "$html_file: missing local target $ref" >&2
      failed=1
    fi
  done < <(rg -o '(href|src)="[^"]+"' "$html_file")
done < <(rg --files -g '*.html')

if [[ "$failed" != "0" ]]; then
  exit 1
fi

echo "Static site validation passed."
