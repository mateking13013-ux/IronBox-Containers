#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
# Build a script for xargs to run in parallel
awk -F'\t' '{ if ($1 && $2) print $1 "\t" $2 }' scrape/images_manifest.tsv \
| while IFS=$'\t' read -r url dest; do
    mkdir -p "$(dirname "$dest")"
    [ -s "$dest" ] && continue
    printf '%s\t%s\n' "$url" "$dest"
  done \
| xargs -P 12 -n 1 -I {} bash -c '
    line="{}"
    url="${line%%	*}"
    dest="${line##*	}"
    curl -sSL -A "Mozilla/5.0" --max-time 30 "$url" -o "$dest" && [ -s "$dest" ] || rm -f "$dest"
  '
echo "downloaded: $(find public/images/products -path '*/trl-*/*' -type f | wc -l) files"
