# webcam datamosher

Live datamosh / glitch video from your webcam. Single HTML file, no dependencies, everything runs locally in the browser — no frames ever leave your machine.

## Run it

`getUserMedia` needs a secure context, so open it via localhost (not `file://`):

```bash
npx serve datamosh          # or: python3 -m http.server 8080 -d datamosh
```

Then open http://localhost:8080 (port varies by server) and allow camera access.

## How it works

This is real moshing, not a color filter. Each frame:

1. The webcam frame is downscaled to a small grayscale grid.
2. Block matching estimates a motion vector for every block (where did this block come from in the previous frame).
3. Instead of showing the new frame, each block of a **persistent feedback buffer** is pulled from its motion-vector source — pixels smear along motion like a video whose I-frames were deleted.
4. Optionally a small fraction of the real frame is blended back in ("fresh pixels"), which mimics P-frame residuals and keeps detail accumulating.

Pressing **keyframe** injects a clean frame (an I-frame), resetting the smear.

## Controls

| Control | Effect |
|---------|--------|
| `keyframe` (Space) | Reset to a clean frame |
| `mosh` (M) | Toggle moshing on/off |
| `glitch` (G) | 12-frame burst of random block vectors (blocky tearing) |
| block size | Size of the motion blocks — small = fluid, large = chunky |
| smear | Motion vector multiplier — above 1 exaggerates movement |
| fresh pixels | How much real image bleeds back per frame (0 = pure smear soup) |
| chaos | Sustained random block corruption |
| auto keyframe | Automatically reset every N seconds |
| `record` (R) | Record the canvas to a .webm download |
| `snapshot` (S) | Save the current frame as .png |

## Tips

- Move slowly for long paint-like smears; move fast for chunky tearing.
- Big gestures + a `glitch` burst + waiting a few seconds is the classic look.
- Record, then screen-capture or convert the .webm with ffmpeg if you need mp4:
  `ffmpeg -i mosh.webm -crf 18 mosh.mp4`
