#!/bin/sh
# Runs ON the VM. Generates a short low impact sound (used for stamp hits). Usage: make_thump.sh <out.wav>
set -e
OUT="${1:?output path required}"
mkdir -p "$(dirname "$OUT")"
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=f=52:d=0.9" \
  -f lavfi -i "anoisesrc=d=0.9:c=pink:a=0.5" \
  -filter_complex "[0]afade=t=out:st=0.02:d=0.8,volume=4[a];[1]lowpass=f=900,afade=t=out:st=0:d=0.25[b];[a][b]amix=inputs=2:normalize=0,alimiter=limit=0.9[o]" \
  -map "[o]" -ar 22050 -ac 1 "$OUT"
echo "wrote $OUT"
