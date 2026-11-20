# Reel style guide (applies to every reel)

Series name: "Kill the Stereotype". Every reel follows this guide so the series looks and feels like one documentary. Per-reel `art-direction.md` may only add to it, never contradict it.

## 1. Tone

- Documentary, not social-media hype. Calm, authoritative, evidence first.
- Slow pace. Let each image and each sentence breathe.
- Neutral, respectful voice. The target is the stereotype, never the group.
- Proof-guided: no claim without a source. Every fact comes from `source.json`.

## 2. Pacing

- Runtime: 45 to 60 s including intro and outro.
- Narration: Piper `length_scale` 1.05 (slightly slower than default 0.95-1.0; 1.12 was judged too slow).
- One idea per scene.
- Pause 0.5 to 0.8 s between sentences, 1 s before the verdict.
- Motion: as reel 001 v1 (spring impacts, whip wipes, shake on the stamp hit). Keep it controlled, no flashing.

## 3. Fixed structure (same in every reel)

| Block | Time | Content |
|-------|------|---------|
| Intro (common) | 0-4.6 s | Spoken and on screen: "Tuons le stéréotype." Very slow (`length_scale` 1.4), gold rule draws in. Same every reel. |
| Hook | 3-10 s | The stereotype quoted on screen, then its animated typography. |
| Proof | 10-40 s | 2 to 4 evidence beats. Each shows the data or fact plus a small source tag. |
| Verdict | 40-48 s | Short, calm statement. Verdict stamp (FAUX / VRAI / NUANCÉ) once. |
| Outro (common) | last 6-8 s | References card (section 6), then series sign-off line and logo. |

The intro and outro are built once as shared components and reused. Copy them from `reels/_template/project/`, do not redesign per reel.

## 4. Visual language (no people)

- No generated characters or portraits of people. Decided by the user after reel 001 v2.
- Image language is animated typography, data, counters, dot grids, timelines and diagrams, as in reel 001 v1 (Anton + Inter, kinetic, spring motion).
- Anti-cliché rule: no orientalist or folkloric imagery (camels, lanterns, costumes, flag stock art).
- Each reel has one signature device (one beat only).

## 5. On-screen text (subtitle style)

- Small subtitles, lower third, inside the 9:16 safe area (keep 8% margin, clear of the platform UI at the bottom 15%).
- Max 2 lines, max 42 characters per line. Keywords and numbers first, not a verbatim transcript of every sentence.
- Font: Inter 600, 38 to 44 px at 1080 wide, bone color on a soft ink shadow or 55% ink bar. No all-caps blocks except labels.
- Each text fades in and out with the sentence. Never overlaps the main animation.
- Source tag: tiny caption (28 px, 70% opacity) shown with each proof beat, e.g. "HCP, Recensement 2014".

## 6. References card (end of every reel)

- Title: "Sources" (FR) / "References" (EN).
- Up to 4 entries, one per line: Institution or author, title, year. Taken from `source.json` `sources`.
- Held for at least 5 s, text at least 34 px, readable without pausing. Spoken line: none, or a soft "Sources à l'écran."
- Every statistic or date shown in the reel must map to a listed entry.

## 7. Color palette (uniform)

| Role | Name | Hex | Use |
|------|------|-----|-----|
| Background | Midnight ink | #0B0F14 | Base of every scene |
| Surface | Deep teal | #12303A | Panels, gradients |
| Text | Warm bone | #F4F1EA | Titles, subtitles |
| Accent | Sand gold | #E3A72F | Rule lines, highlights, key numbers, truth |
| Secondary | Soft teal | #3FA7A0 | Charts, secondary data |
| Verdict | Signal red | #E8272B | FAUX stamp only |

- Gold is the one accent. Red appears once per reel.
- Contrast: body text at least 7:1 against its background.
- Subtle film grain (3 to 5%) and soft vignette on all scenes for the documentary look.

## 8. Voice and audio

- Same voice across a language: FR `fr_FR-siwis-medium` (female, Piper), `length_scale` 1.05, calm and peaceful: `noise_scale` 0.45, `noise_w` 0.55, `sentence_silence` 0.5 (steadier, less animated). Intro line even slower (1.4). Falling tone on the verdict.
- Music: single quiet ambient bed, same track family, -22 dB under voice. No drops.
- Intro tone and verdict impact are the only effects. Both soft.

## 9. Pre-render checklist

1. Intro and outro are the shared components, unchanged.
2. Every on-screen fact has a source in `source.json` and appears on the references card.
3. No people or characters.
4. Subtitles small, inside safe area.
5. Palette limited to section 7. Red used once.
6. Narration at length_scale 1.05.
7. Runtime 45 to 60 s.
8. Check stills with `scripts/vm reel-still` before final render.
