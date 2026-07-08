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

## Presets

One-tap combos at the top of the panel set a curated mix of effects and slider values:

| Preset | What it turns on |
|--------|------------------|
| reset | Everything off, clean mosh (also drops back to the fast tracker) |
| vaporwave | Echo trails + slow orb spin + reactive smear |
| surveillance | Face-scan HUD + precise tracking + motion gate (crisp until you move) |
| acid trip | Kaleidoscope + echo trails + spinning irises |
| cubist | Moving cubist shard grid |
| liquid | Funhouse fluid warp |
| bass drop | Datamosh locked to the kick drum (load a track or use the mic) |

Presets are just starting points — tweak any toggle or slider afterward. All sliders (mosh engine, effect strengths, audio thresholds, hand power, mirror) live under the collapsible **customize** menu in the panel.

## Audio-reactive (bass mosh)

`bass mosh` ties the glitch directly to the low end instead of firing randomly. It runs an FFT on the audio (a 2048-point analyser, ~21Hz per bin) and watches the 20–150Hz bins — the kick-drum band. When that energy crosses the `bass trigger` threshold and is rising, it fires a kick: a massive smear that *freezes* the frame (fresh pixels are held back so your face streaks in place) plus a glitch burst. Between kicks the mosh settles and snaps back to a crisp clean frame, so quiet bridges look normal and drops explode. A little BASS meter in the corner shows the live level, the threshold marker, and flashes on each detected kick.

Two audio sources:
- **mic** (default) — plays whatever the microphone hears, so it reacts to music in the room. Enabling `bass mosh` asks for mic permission.
- **load track** — pick an audio file; it plays through your speakers and drives the effect directly (cleaner than the mic). This auto-enables bass mode.

Tune `bass trigger` to the track: lower if it's not catching the kicks, higher if everything triggers it.

`spectrum` (7) splits the music into three bands, each driving its own visual: **lows** (20–150Hz) keep driving the kick-mosh, **mids** (200Hz–2kHz — vocals/synths) drive a chromatic RGB split whose offset follows the mid energy, and **highs** (4–12kHz — hi-hats/cymbals) fire scanline jitter and a brief flash on each hat onset. The corner meter expands to three bars (LOW/MID/HIGH) so you can watch each band hit. `spectrum amount` scales the mid/high effects.

## Hands

`hands` (8) loads MediaPipe HandLandmarker (~8MB once, needs http/https like precise) and tracks up to two hands, 21 landmarks each. Hand movement drives effects that *only* happen off your hands: moving a hand smears the mosh buffer along its motion (a glitch trail that follows your hand and keeps moshing), fingertips spray neon particles proportional to speed, and a fast fling fires a glitch burst. Fingertips always glow softly so you can see the tracking; turn on `scan` to also get the full hand skeleton in the HUD. `hand power` scales the smear strength. Works on clip sources too.

## Video-clip sources (transition moshing)

`+ clip` loads one or more video files alongside the webcam (clips play muted on loop; audio stays with the mic/track so bass mosh keeps working). The `src` button (or `9`) cuts between cam and clips — and the cut intentionally does **not** insert a keyframe. The feedback buffer keeps the old source's pixels while the new source's motion vectors drag them around, which is precisely the shot-transition effect that made datamoshing famous. Press Space if you want a clean cut instead. `auto cut` rotates through cam → clip → clip on a timer for continuous transition mosh; everything else (face effects, orb, bass, presets) works the same on whichever source is live — face tracking will even lock onto faces *in the clip*.

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
| `react` (T) | Ties glitch intensity to motion — the more your face moves, the more the smear and chaos ramp up, with auto glitch bursts on fast moves. Works with either tracker. |
| `iris` (I) | Swirls each iris/eye region, spinning fast (precise; uses the iris landmarks) |
| `swap` (W) | Swaps your eyes and mouth — mouth is composited onto both eyes and an eye onto the mouth (precise) |
| `+ map a face` | Upload one or more face photos, warped live onto every detected face via an 852-triangle FaceMesh mesh (precise). Multiple photos are distributed across the people in frame. `clear` removes them. |
| map blend | Opacity of the mapped face over your real face |
| map feather | Softness of the mapped face's edge — 0 = hard cutout, 1 = soft blend into your skin |
| `gate` (E) | Motion-triggered mosh — only moshes when you move; still moments stay crisp |
| `echo` (F) | Feedback trails — overlays the previous frame rotated/zoomed/faded for psychedelic spirals |
| `ascii` (A) | Renders the feed as real-time colored text characters |
| `slit` (L) | Slit-scan — stacks one column per frame so moving objects stretch across time |
| motion gate | How much movement is needed before moshing kicks in (lower = more sensitive) |
| echo fade / echo spin | Trail opacity and per-frame rotation |
| ascii size | Character cell size (smaller = more detail, heavier) |
| slit speed | Columns captured per frame (how fast the time-smear scrolls) |
| `fluid` (U) | Funhouse liquid — optical-flow displacement pushes pixels like paint and slowly settles back |
| `cubism` (C) | Slices the feed into a grid of shards, each rotated/offset/time-delayed by your movement |
| `vortex` (V) | Mouth black hole — the wider you open, the harder it sucks and swirls your face in (precise) |
| `mag eyes` (Y) | Magnifying-glass bulge on each eye, scaled by how wide you open them (precise) |
| `kaleido` (K) | Kaleidoscope mirrored across N segments, centered on your nose (precise) |
| `slice` (N) | Time-slice waterfall — horizontal strips each delayed a few frames, melting on sideways motion |
| `paint` (B) | Freezes the frame; your nose paints the live video back in wherever you move (precise) |
| `edge` (X) | Neon edge-detect outlines; shake your head to explode them into physics particles |
| `voice` (J) | Mic loudness drives datamosh intensity — shout to tear it apart |
| `laser` (Z) | Neon laser beams from your eyes that bounce off the screen edges (precise) |
| `blink sort` (Q) | Pixel-sorts your face into melting brightness columns on a blink (precise) |
| `bass mosh` (0) | Ties the datamosh to the kick drum — a big glitch/freeze/smear fires on the beat, snapping crisp between kicks |
| `load track` | Play a music file and drive `bass mosh` from it (instead of the mic) |
| bass trigger | How hard the low end (20–150Hz) must hit to fire a kick |
| `spectrum` (7) | Full-spectrum audio reactivity — mids drive RGB split, highs drive scanline jitter + flash (see below) |
| `hands` (8) | Hand tracking — movement smears the mosh, fingertips spray particles (see below) |
| `+ clip` | Load video clip(s) as additional mosh sources (they play muted on loop) |
| `src` (9) | Cut between webcam and clips — deliberately **no keyframe**, so the old source's pixels smear under the new source's motion: the classic transition mosh |
| auto cut | Automatically rotate cam → clip → clip every N seconds for continuous transition moshing |
| fluid force / cubism amt / vortex amt / eye magnify | Strength of each warp |
| kaleido segments / slice delay | Kaleidoscope mirror count / frames of delay per strip |
| orb warp | Radial curve of the orb — low = rim-heavy fisheye, high = pinched center |
| orb spin | Continuous rotation speed (revolutions/s, negative = counter-clockwise) |
| feature spin | Speed multiplier for dissect's spinning features |

### Face tracking — two tiers

**Fast tracker (default, always on, fully offline):** an embedded copy of [pico.js](https://github.com/nenadmarkus/picojs) (MIT) with the `facefinder` cascade. No downloads, nothing leaves your machine. It finds the face box; eye/mouth positions are estimated from its geometry, so they're best facing the camera roughly straight on.

**Precise tracker (`precise` button / P):** loads Google [MediaPipe FaceMesh](https://developers.google.com/mediapipe/solutions/vision/face_landmarker) on demand for a true 468-point face mesh. Eyes and mouth are located from their actual landmark contours (with real orientation), so dissect patches and the scan HUD lock onto the real features even at an angle, and the scan HUD overlays the live mesh. This is progressive enhancement: it fetches the runtime + model (~4MB) from a CDN the first time, and if that fails (offline/blocked) it silently falls back to the fast tracker. Because it loads a module + WASM from a CDN, precise mode needs the app served over http/https — use `node serve.mjs`, the Electron launchers, or the hosted link (all of which do). Opened as a bare `file://` page it will fall back to the fast tracker.

The `iris`, `swap`, and face-map effects require precise mode and enable it automatically. Face-map builds its warp mesh (852 triangles) from FaceMesh's own tesselation at runtime — no extra assets. Uploaded photos are read locally in the browser and never uploaded anywhere. Mapping is heaviest (per-triangle warp every frame); expect real-time on a GPU, slower on CPU-only machines.

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
