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
| `precise` (P) | Upgrade face tracking from the fast box detector to true 468-point MediaPipe FaceMesh landmarks (downloads ~4MB once) |
| orb warp | Radial curve of the orb — low = rim-heavy fisheye, high = pinched center |
| orb spin | Continuous rotation speed (revolutions/s, negative = counter-clockwise) |
| feature spin | Speed multiplier for dissect's spinning features |

### Face tracking — two tiers

**Fast tracker (default, always on, fully offline):** an embedded copy of [pico.js](https://github.com/nenadmarkus/picojs) (MIT) with the `facefinder` cascade. No downloads, nothing leaves your machine. It finds the face box; eye/mouth positions are estimated from its geometry, so they're best facing the camera roughly straight on.

**Precise tracker (`precise` button / P):** loads Google [MediaPipe FaceMesh](https://developers.google.com/mediapipe/solutions/vision/face_landmarker) on demand for a true 468-point face mesh. Eyes and mouth are located from their actual landmark contours (with real orientation), so dissect patches and the scan HUD lock onto the real features even at an angle, and the scan HUD overlays the live mesh. This is progressive enhancement: it fetches the runtime + model (~4MB) from a CDN the first time, and if that fails (offline/blocked) it silently falls back to the fast tracker. Because it loads a module + WASM from a CDN, precise mode needs the app served over http/https — use `node serve.mjs`, the Electron launchers, or the hosted link (all of which do). Opened as a bare `file://` page it will fall back to the fast tracker.

Self-host or pin the MediaPipe assets by setting `window.DATAMOSH_MP = { module, wasm, model, version, delegate }` before the app script runs.
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
