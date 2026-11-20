---
name: video-production-manager
description: Use when asked to produce a "Kill the Stereotype" reel end to end from an idea (e.g. "crée un reel sur le stéréotype X"), to QA a rendered reel, or to analyse a published reel's performance. Orchestrates the VM tooling, the reel template, the .agents skills and the QA script. Never publishes.
---

# video-production-manager

Idea in, finished 9:16 MP4 plus delivery folder out. Full spec: `reels/PROMPT-VIDEO-MANAGER.md`. Series rules: `reels/STYLE-GUIDE.md` (always wins).

## Hard rules
- Nothing renders on the host. Use `scripts/vm` (VM in `vm.conf`).
- No paid service, no new API key, no AI-generated people. Free tools only: Remotion, Piper, ffmpeg.
- Never publish, never commit, unless the user asks for that reel explicitly.
- Every on-screen fact comes from `source.json`. Source marked `[À VÉRIFIER]` in the DB: exclude it, never show its figures.
- Never claim a capability untested. Music: only with a verified free track; otherwise none.

## Workflow
1. **Audit** (once per session): `scripts/vm status`; `ffmpeg`, `ffprobe`, `node` on host; Piper model on VM (`~/.piper/models`); list `.agents/skills/`.
2. **Pick topic**: user's, else a `todo` row of `reels/BACKLOG.csv` (prefer recognizable memes with verifiable history). Data: `/home/abdelhadi/Documents/steriotypes/data/steriotypes.db` (tables `stereotypes`, `sources`).
3. **Scaffold**: `scripts/new-reel.sh slug "Titre" --vm`. Folder prefix NNN = generation order (highest existing + 1), NOT the backlog id. Backlog id goes in `source.json` `stereotype_id` and `reels/BACKLOG.csv` (mark status there).
4. **Hook** (`.agents/skills/hook-anatomy`, `platform-fluency`): write 3 cold-open variants, score with the 3 questions, keep the best. Cold open 0-2 s: full frame 0, no fade, no logo, voice starts <= 0.3 s, loop opened, closed in the verdict. Log answers in `status.md`.
5. **Write**: `source.json`, `script.md`, `narration.json` (numbers spelled out for Piper), `art-direction.md`. Target 45-60 s INCLUDING spoken outro (9.4 s) and references card (5 s): about 41 s of story.
6. **Narrate**: `scripts/vm reel-push N && scripts/vm reel-narrate N`; fetch `projects/<slug>/artifacts/durations.json` into the reel folder; compute start times from durations (gap 0.6 s, 1 s before verdict).
7. **Compose** `project/Composition.tsx`: copy `shared.tsx` unchanged; subtitles via `Subtitle`, cues in `project/cues.tsx`, timing in `project/timing.tsx`.
   - `scripts/vm reel-push` only copies `*.tsx`: keep every module `.tsx`, no `.json`.
8. **Check**: `scripts/vm reel-still N <frames>` then `scripts/vm get projects/<slug>/snapshots/. reels/NNN-*/snapshots/`. Look at frames 0, mid-scenes, verdict, outro, sources. Fix overflow (text wider than 1080 px), overlaps, empty frames.
9. **Render**: `scripts/vm reel-render N` (about 6 min at 1080x1920, run in background), then `scripts/vm reel-pull N`.
10. **QA**: `scripts/qa-reel.sh N`. Writes `qa-report.md`. A FAIL blocks delivery: fix, re-render, retry (max 3).
11. **Deliver** in `reels/NNN-slug/`: `renders/*.mp4`, `script.md`, `subtitles.srt`, `description.md` (Facebook Reels + 8-12 hashtags: `#tuonslestéréotype` + 4 fixed + 3-5 topic), `qa-report.md`, `status.md`; update `reels/TRACKER.md` and `reels/BACKLOG.csv`. Also copy the narration track as `narration.wav` (concatenate or extract from the MP4) when requested.

## Learning loop
When the user supplies Facebook stats (views, retention curve, completion, 1 s drop-off): read `.agents/skills/content-autopsy`, compare with earlier reels in `reels/*/status.md`, write findings in the reel's `status.md`, adjust the next cold open and pacing. Do not invent numbers.
