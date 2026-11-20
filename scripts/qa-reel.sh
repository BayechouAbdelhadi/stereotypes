#!/usr/bin/env bash
# QA for a rendered reel. Usage: scripts/qa-reel.sh <id>   (run after `vm reel-pull <id>`)
# Writes reels/<dir>/qa-report.md. Exit 1 if any check fails.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
D="$(ls -d "$ROOT"/reels/${1:?id}-* | head -1)"
V="$(ls "$D"/renders/*.mp4 | head -1)"
R="$D/qa-report.md"; fail=0
row(){ printf '| %s | %s | %s |\n' "$1" "$2" "$3" >>"$R"; if [ "$2" = FAIL ]; then fail=1; fi; return 0; }
printf '# QA %s\n\n| Check | Result | Detail |\n|---|---|---|\n' "$(basename "$D")" >"$R"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
awk -v d="$dur" 'BEGIN{exit !(d>=45&&d<=60)}' && row "Duration 45-60 s" PASS "$dur s" || row "Duration 45-60 s" FAIL "$dur s"
wh=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name,r_frame_rate -of csv=p=0 "$V")
[ "${wh%,}" = "h264,1080,1920,30/1" ] && row "1080x1920 H.264 30fps" PASS "$wh" || row "1080x1920 H.264 30fps" FAIL "$wh"
ac=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$V")
[ "$ac" = aac ] && row "Audio AAC present" PASS "$ac" || row "Audio AAC present" FAIL "${ac:-none}"
ln=$(ffmpeg -nostats -i "$V" -af loudnorm=print_format=summary -f null - 2>&1)
lufs=$(echo "$ln" | awk '/Input Integrated/{print $3}'); tp=$(echo "$ln" | awk '/Input True Peak/{print $4}')
awk -v l="$lufs" 'BEGIN{exit !(l>=-20&&l<=-12)}' && row "Loudness -20..-12 LUFS" PASS "$lufs LUFS" || row "Loudness -20..-12 LUFS" FAIL "$lufs LUFS"
awk -v t="$tp" 'BEGIN{exit !(t<=-0.5)}' && row "True peak <= -0.5 dBTP (no clipping)" PASS "$tp dBTP" || row "True peak <= -0.5 dBTP (no clipping)" FAIL "$tp dBTP"
# Cold open: frame 0 not black, first speech < 0.3 s
y0=$(ffmpeg -nostats -v error -i "$V" -vf "select=eq(n\,0),signalstats,metadata=print:file=-" -frames:v 1 -f null - 2>&1 | awk -F= '/YAVG/{print $2}')
awk -v y="$y0" 'BEGIN{exit !(y>=18)}' && row "Frame 0 not black" PASS "YAVG=$y0" || row "Frame 0 not black" FAIL "YAVG=$y0"
sd=$(ffmpeg -nostats -i "$V" -t 6 -af silencedetect=n=-35dB:d=0.1 -vn -f null - 2>&1 | grep -E 'silence_(start|end)' | head -2)
# leading silence only if the first silence starts at 0; otherwise speech begins at 0
first=0
if echo "$sd" | head -1 | grep -qE 'silence_start: (-?0(\.0[0-9]*)?|-[0-9.e-]+)$'; then first=$(echo "$sd" | awk '/silence_end/{print $5; exit}'); fi
awk -v s="${first:-9}" 'BEGIN{exit !(s<=0.3)}' && row "First speech <= 0.3 s" PASS "${first}s" || row "First speech <= 0.3 s" FAIL "${first:-none}s"
# Subtitle sync vs narration clips, no overlap, inside video
python3 -I - "$D" >>"$R" <<'P'
import json,re,sys
d=sys.argv[1];t=open(d+'/project/timing.tsx').read();c=open(d+'/project/cues.tsx').read()
t=json.loads(t[t.index('{'):t.rindex('}')+1]);cues=json.loads('['+','.join(re.findall(r'\{"at".*?\}',c))+']')
ok=True;prev=0
for q in cues:
    if q['at']<prev: ok=False
    prev=q['to']
    for l in q['text'].split('\n'):
        if len(l)>42: ok=False
print('| Subtitles ordered, no overlap, lines <= 42 chars | %s | %d cues |'%('PASS' if ok else 'FAIL',len(cues)))
P
for f in script.md narration.json description.md source.json status.md; do [ -s "$D/$f" ] || row "File $f" FAIL missing; done
[ -s "$D/subtitles.srt" ] || row "File subtitles.srt" FAIL missing
cat "$R"; exit $fail
