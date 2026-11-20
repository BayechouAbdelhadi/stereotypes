"""Runs ON the VM (uploaded by `vm reel-narrate`). Usage: python narrate.py <vm_slug>

Reads projects/<slug>/narration.json:
  {"voice": "fr_FR-siwis-medium", "length_scale": 0.95, "lines": [{"id": "s1a", "text": "..."}]}
Writes public/audio/<id>.wav for each line and artifacts/durations.json.
Calls the local piper CLI directly (no network, no API key) so noise_scale / noise_w can be tuned.
"""
import json
import pathlib
import subprocess
import sys


slug = sys.argv[1]
proj = pathlib.Path("projects") / slug
cfg = json.loads((proj / "narration.json").read_text(encoding="utf-8"))

out = proj / "public" / "audio"
out.mkdir(parents=True, exist_ok=True)
(proj / "artifacts").mkdir(parents=True, exist_ok=True)

# Calm delivery: lower noise_scale / noise_w make the voice steadier and less animated.
# Any of these can be overridden per line in narration.json.
model_dir = pathlib.Path.home() / ".piper" / "models"
durations = {}
for line in cfg["lines"]:
    path = out / f"{line['id']}.wav"
    voice = line.get("voice", cfg.get("voice", "fr_FR-siwis-medium"))
    proc = subprocess.run(
        [
            "piper",
            "--model", voice,
            "--data-dir", str(model_dir),
            "--length-scale", str(line.get("length_scale", cfg.get("length_scale", 1.0))),
            "--noise-scale", str(line.get("noise_scale", cfg.get("noise_scale", 0.667))),
            "--noise-w-scale", str(line.get("noise_w", cfg.get("noise_w", 0.8))),
            "--sentence-silence", str(line.get("sentence_silence", cfg.get("sentence_silence", 0.3))),
            "--output_file", str(path),
        ],
        input=line["text"],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if proc.returncode != 0 or not path.exists():
        sys.exit(f"TTS failed for {line['id']}: {proc.stderr}")
    dur = float(
        subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]
        ).decode()
    )
    durations[line["id"]] = round(dur, 3)
    print(line["id"], durations[line["id"]])

(proj / "artifacts" / "durations.json").write_text(json.dumps(durations, indent=1), encoding="utf-8")
print("total speech seconds:", round(sum(durations.values()), 2))
