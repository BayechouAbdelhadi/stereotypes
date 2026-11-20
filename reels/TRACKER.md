# Reels tracker

One row per reel. Each reel has its own folder `reels/NNN-slug/` with a `status.md`.

Stages: idea -> plan approved -> script -> narration -> render -> review -> published

| # | Reel | Source | Format | Voice | Stage | Updated |
|---|------|--------|--------|-------|-------|---------|
| 001 | Tous les Marocains sont arabes | steriotypes DB, stereotype id 1246 (Maroc) | 9:16, ~35 s, French | Piper fr_FR-siwis-medium | rendered v1, awaiting review | 2026-11-20 |

## Environment

- Production runs in the VM (Ubuntu Server, `abdel@192.168.122.142`), project in `~/OpenMontage`, venv `.venv`, Node 22.23.5 in `~/.local/node`.
- Local-only: no API keys set in `.env`. Free tools only (Remotion, HyperFrames, ffmpeg, Piper).
- This host folder only tracks progress. Repo files were removed on purpose; `.git` is kept.
| 007 | Les Français ne se lavent pas ? | DB 734 + Vigarello 1985 | 9:16 | Piper fr_FR-siwis-medium | render (draft) | 2026-11-20 |
