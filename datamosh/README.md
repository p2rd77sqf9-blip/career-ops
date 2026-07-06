# webcam datamosher

Live datamosh / glitch video from your webcam. Everything runs locally — no frames ever leave your machine.

## Launch as a desktop app

**Easiest — double-click launcher (zero install if you have Chrome/Edge/Brave):**

```bash
node datamosh/serve.mjs
```

This starts a local server and opens the mosher in a chromeless app window (its own window, no browser tabs or URL bar). Closing the window quits it. It auto-detects Chrome, Chromium, Edge, or Brave; override with `CHROME_PATH=/path/to/browser`. No Chromium-family browser found → it opens your default browser instead.

**Real desktop app (Electron):**

- macOS/Linux: double-click **`Start Datamosher.command`** (or run it from a terminal)
- Windows: double-click **`Start Datamosher.bat`**

The first run installs Electron (~1 minute, needs Node.js + internet); after that it launches instantly as a native window with proper camera-permission prompts. Equivalent to:

```bash
cd datamosh && npm install && npm start
```

**Package it into a standalone .app / .exe / AppImage** (no Node needed to run the result):

```bash
cd datamosh && npm install && npx electron-builder
```

The installable app lands in `datamosh/dist/`.

**Plain browser fallback** — `getUserMedia` needs a secure context, so serve over localhost (not `file://`):

```bash
python3 -m http.server 8080 -d datamosh   # then open http://localhost:8080
```

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
| `orb` (O) | 360° tiny-planet view — wraps the moshed video around a circle (seamless mirror wrap) |
| `scan` (H) | Futuristic face-scan HUD: corner brackets, sweeping scanline, feature boxes with leader lines and live readouts (position/size/motion vectors are real tracker data) |
| `dissect` (D) | Isolates your eyes and mouth, spins each at a different speed with a size pulse — composited into the mosh so they smear and work inside the orb |
| orb warp | Radial curve of the orb — low = rim-heavy fisheye, high = pinched center |
| orb spin | Continuous rotation speed (revolutions/s, negative = counter-clockwise) |
| feature spin | Speed multiplier for dissect's spinning features |

Face tracking is done fully locally by an embedded copy of [pico.js](https://github.com/nenadmarkus/picojs) (MIT) with the `facefinder` cascade — no models are downloaded, nothing leaves your machine. Eye/mouth positions are estimated from the face box geometry, so they work best facing the camera roughly straight on.
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
