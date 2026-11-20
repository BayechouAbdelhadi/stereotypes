"""Runs ON the VM (uploaded by `vm reel-narrate`). Usage: python narrate.py <vm_slug>

Reads projects/<slug>/narration.json:
  {"voice": "fr_FR-siwis-medium", "length_scale": 0.95, "lines": [{"id": "s1a", "text": "..."}]}
Writes public/audio/<id>.wav for each line and artifacts/durations.json.
Uses OpenMontage's own piper_tts tool (local, no network, no API key).
"""
import json
import pathlib
import subprocess
import sys

from tools.tool_registry import registry

slug = sys.argv[1]
proj = pathlib.Path("projects") / slug
cfg = json.loads((proj / "narration.json").read_text(encoding="utf-8"))

registry.discover()
tts = registry.get("piper_tts")
out = proj / "public" / "audio"
out.mkdir(parents=True, exist_ok=True)
(proj / "artifacts").mkdir(parents=True, exist_ok=True)

durations = {}
for line in cfg["lines"]:
    path = out / f"{line['id']}.wav"
    res = tts.execute(
        {
            "text": line["text"],
            "model": cfg.get("voice", "fr_FR-siwis-medium"),
            "output_path": str(path),
            "length_scale": cfg.get("length_scale", 1.0),
        }
    )
    if not res.success:
        sys.exit(f"TTS failed for {line['id']}: {res.error}")
    dur = float(
        subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]
        ).decode()
    )
    durations[line["id"]] = round(dur, 3)
    print(line["id"], durations[line["id"]])

(proj / "artifacts" / "durations.json").write_text(json.dumps(durations, indent=1), encoding="utf-8")
print("total speech seconds:", round(sum(durations.values()), 2))
