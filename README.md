# Cinematron — Premium Netflix Clone Platform

**Cinematron** is a cutting-edge, ultra-high-fidelity streaming platform clone of Netflix, engineered with Vanilla HTML5, CSS3, and modern ES Modules with Vite tooling.

![Cinematron Banner](https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features & Capabilities

### 1. 🎬 Cinematic Hero Billboard
- Auto-rotating flagship titles (*Apex Horizon: Void Odyssey*, *Cyberpunk: Neo Syndicate*, *Shadows of the Citadel*, *Quantum Velocity*).
- Ambient looping background video trailers with smooth vignette grading.
- One-click **Play** (theatre mode) & **More Info** modal triggers.
- Mute / Unmute audio toggle with animated feedback.
- Category indicators, match scores, maturity tags (`18+`, `16+`, `All`), and `#1 in India Today` badges.

### 2. 🎞️ Netflix-Style Content Rows & Interactive Hover
- **Top 10 in India Today**: Giant stylized 3D outline numbers (`1` to `10`) overlapping poster thumbnails.
- **Cinematron Originals**: Tall vertical 2:3 posters with bold red original brand ribbons.
- **Continue Watching**: Real-time progress bars with remaining timestamps and instant resume.
- **Card Hover Trailer Preview**: Hovering over any card reveals an instant moving video trailer preview, quick action bar (▶ Play, ➕ My List, 👍 Like, ⌄ Details), match score, and genre tags.

### 3. 🔊 Authentic Web Audio API "Ta-Dum" Chime
- Completely self-contained dual-oscillator sub-bass and resonant orchestral hit synthesizer recreating Netflix's iconic "Ta-Dum" sound without external audio file dependencies.
- Subtle micro-animations and sound feedback across the UI.

### 4. 🎭 "The Theatre" — Fullscreen Video Player
- Custom Netflix player overlay with auto-hiding controls on mouse idle.
- Dynamic ambient canvas glow that reflects live video colors onto the surrounding screen.
- Scrubber timeline with buffered cache bar and hover timestamp preview tooltip.
- **Skip Intro** floating glass button (appearing automatically between 5s and 25s).
- **Picture-in-Picture (PiP)** and Fullscreen controls.
- Playback speed switcher (`0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x`).
- Audio & Subtitle track selector (English [Original], Spanish, Hindi, Japanese).

### 5. 👥 Multi-Profile Switcher & Profile Manager
- Switch between **Alex**, **Film Buff**, **Kids**, and **Sci-Fi Geek**.
- Dedicated **Manage Profiles** modal to edit names, pick avatars, and toggle **Kids Mode** (which filters out mature 18+ content and prioritizes family animations).

### 6. 🎲 "Surprise Me" (Play Something)
- One-click random roulette picker in the navigation bar that selects a top-rated blockbuster and instantly starts playback with sound FX.

### 7. ⌨️ Keyboard Shortcuts
- Press `?` anywhere to reveal the cheat sheet:
  - `Space` / `K`: Play / Pause
  - `F`: Toggle Fullscreen
  - `M`: Mute / Unmute
  - `←` / `→` or `J` / `L`: Seek 10 seconds
  - `↑` / `↓`: Volume control
  - `Esc`: Close player or dialogs

---

## 🚀 Running Locally

The project is served with Vite:

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit: **[http://localhost:5173/](http://localhost:5173/)**
