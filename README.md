# OpenMontage reels (control folder)

This folder tracks the reels and holds the scripts that drive the production VM
(Ubuntu Server, where OpenMontage is installed). Nothing renders on the host.

## Layout

- `vm.conf` - VM host, user, project dir (no secrets)
- `.vm.secret` - VM password, chmod 600, gitignored. Replace with a key: `scripts/vm setup-key`
- `scripts/vm` - SSH, upload, download and reel build commands (`scripts/vm help`)
- `scripts/new-reel.sh` - create a reel from `reels/_template`
- `scripts/remote/` - helpers that run on the VM (narration, impact sound)
- `reels/STYLE-GUIDE.md` - series rules every reel must follow (pace, intro/outro, character zoom, subtitles, references, palette)
- `reels/TRACKER.md` - one row per reel and its stage
- `reels/NNN-slug/` - one folder per reel:
  `status.md`, `script.md`, `art-direction.md`, `source.json`, `narration.json`,
  `reel.conf`, `project/` (Remotion sources), `renders/` (MP4, gitignored), `snapshots/`

## Typical flow

```bash
scripts/new-reel.sh 002-slug "Title" --vm   # scaffold locally and on the VM
# edit source.json, script.md, narration.json, project/Composition.tsx
scripts/vm reel-push 002
scripts/vm reel-narrate 002
scripts/vm reel-still 002 90 300 600        # check frames
scripts/vm reel-render 002 --scale=0.5      # fast draft; drop the flag for final
scripts/vm reel-pull 002
```
