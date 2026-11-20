#!/usr/bin/env bash
# Scaffold a new reel folder from reels/_template.
# Usage: scripts/new-reel.sh <NNN-slug> "<Title>" [--vm]
#   e.g. scripts/new-reel.sh 002-maroc-desert "Le Maroc, c'est le désert" --vm
# --vm also scaffolds the atelier project on the VM (needs working scripts/vm auth).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAME="${1:?usage: new-reel.sh <NNN-slug> \"<Title>\" [--vm]}"
TITLE="${2:?title required}"
WITH_VM="${3:-}"

DEST="$ROOT/reels/$NAME"
[ -e "$DEST" ] && { echo "$DEST already exists" >&2; exit 1; }

SLUG="${NAME#*-}"                                   # 002-maroc-desert -> maroc-desert
COMP="$(printf '%s' "$SLUG" | sed -E 's/(^|-)([a-z])/\U\2/g')"   # maroc-desert -> MarocDesert
TODAY="$(date +%F)"

cp -r "$ROOT/reels/_template" "$DEST"
find "$DEST" -type f -print0 | while IFS= read -r -d '' f; do
  sed -i -e "s|__NAME__|$NAME|g" -e "s|__SLUG__|$SLUG|g" -e "s|__COMP__|$COMP|g" \
         -e "s|__TITLE__|$TITLE|g" -e "s|__DATE__|$TODAY|g" "$f"
done

# Append to the tracker table.
printf '| %s | %s | (set source) | 9:16 | Piper fr_FR-siwis-medium | idea | %s |\n' \
  "${NAME%%-*}" "$TITLE" "$TODAY" >>"$ROOT/reels/TRACKER.md"

echo "created $DEST (VM slug: $SLUG, composition: $COMP)"
if [ "$WITH_VM" = "--vm" ]; then
  "$ROOT/scripts/vm" run "python scripts/scaffold_atelier_project.py $SLUG"
fi
echo "next: fill source.json, script.md, art-direction.md, narration.json, project/Composition.tsx"
echo "then: scripts/vm reel-push ${NAME%%-*} && scripts/vm reel-narrate ${NAME%%-*}"
