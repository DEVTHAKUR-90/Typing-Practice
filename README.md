<div align="center">

<pre>
        
████████╗██╗   ██╗██████╗ ██╗███╗   ██╗ ██████╗
╚══██╔══╝╚██╗ ██╔╝██╔══██╗██║████╗  ██║██╔════╝
   ██║    ╚████╔╝ ██████╔╝██║██╔██╗ ██║██║     
   ██║     ╚██╔╝  ██╔═══╝ ██║██║╚██╗██║██║     
   ██║      ██║   ██║     ██║██║ ╚████║╚██████╗
   ╚═╝      ╚═╝   ╚═╝     ╚═╝╚═╝  ╚═══╝ ╚═════╝

TYPING PRACTICE
─────────────────────────────────
Speed • Accuracy • Focus
</pre>

</div>

<div align="center">
        
### *A typing speed test that doesn't look like every other typing speed test.*

<br>

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion)
[![License: MIT](https://img.shields.io/badge/License-MIT-FFB454?style=for-the-badge)](LICENSE)

</div>

<br>

---

## ✦ Overview

Aurora Type is a glassmorphism-styled typing speed test built around a single principle: the *interaction itself* is the product. Featuring Time, Words, Zen, and Custom-text modes, live WPM/accuracy analytics, and **Block Defence** — an arcade mode where you destroy falling word-blocks before they cross the kill line.

The caret glides between characters instead of jumping. Mistakes flash like a hairline crack in glass. The entire experience sits on a slow-drifting aurora gradient that never quite repeats. Nothing should feel like it's fighting you to get a number on the screen.

<br>

---

## ✦ Features

### 🎯 Test Modes

| Mode | Description |
|------|-------------|
| **Time** | 15 / 30 / 60 / 120 second sprints |
| **Words** | Fixed sets of 10 / 25 / 50 / 100 words |
| **Zen** | Untimed, pressure-free practice |
| **Custom** | Paste any text and test against it |

**Word pools** — Common, Programming terms, Quotes — with Punctuation, Numbers, Capitalization, and Advanced difficulty toggles that blend symbols and digits into generated words.

<br>

### 🕹️ Block Defence

A full arcade mode built into the same app:

- Falling word-blocks destroyed by typing them before they cross the kill line
- Draggable vertical speed slider with one-click reset
- Combo system rewarding consecutive kills
- Power-up blocks (2× score) and debuff blocks (mirrored text)
- Difficulty curve that ramps over minutes, not seconds

<br>

### 📊 Analytics

- Live WPM and accuracy overlay while you type
- Full post-test breakdown — correct / incorrect / missed / extra characters
- WPM-over-time chart via Recharts
- Words to practice, surfaced automatically from your mistakes
- Personal bests tracked per mode, shown directly on the results screen

<br>

### 🎨 Themes

| Theme | Description |
|-------|-------------|
| **Aurora** | Dark — deep gradients, glowing accents |
| **Daybreak** | Light — clean whites, independently tuned contrast |

Both themes are fully designed, not just one palette with the lights inverted.

<br>

### ⌨️ Focus Mode

Press `Enter` before a test to enter true fullscreen — large live word-progress counter, live WPM display, zero distractions. `Esc` exits.

<br>

---

## ✦ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router, TypeScript) |
| **Styling** | Tailwind CSS + custom CSS variables for theming |
| **Animation** | Framer Motion — shared-layout caret, mode pills, selection dots |
| **State** | Zustand, persisted to `localStorage` with manual rehydration |
| **Charts** | Recharts |
| **Icons** | Lucide |

<br>

---

## ✦ Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

```bash
# Production build
npm run build

# Serve the production build
npm run start
```

> **Note:** Fonts (Sora, Space Mono) load from Google Fonts at build time via `next/font/google` — requires network access once, same as any standard dev machine or CI runner.

<br>

### 🚀 Deploying

```bash
npm install -g vercel
vercel
```

Or push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).
**No environment variables required.**

<br>

---

## ✦ Project Structure

```
src/
├── app/                  Root layout, global styles, page entry
├── components/
│   ├── layout/           Header, background, settings drawer, glass container
│   ├── typing/           Typing test surface and live stats overlay
│   ├── game/             Block Defence (presentational layer only)
│   └── stats/            Post-test results dashboard
├── lib/
│   ├── hooks/            useTypingEngine, useBlockDefenseGame
│   │                     All game logic lives here; components only render
│   ├── stores/           Zustand stores + hydration guard
│   ├── constants.ts      Shared tunables — no scattered magic numbers
│   ├── wordLists.ts
│   └── utils.ts
└── types/
```

Each mode's logic is isolated in a hook that owns its state and exposes plain data and handlers. Components are purely presentational — same shape for both modes, straightforward to extend.

<br>

---

## ✦ Roadmap

| Feature | Status |
|---------|--------|
| Live multiplayer race | `planned` |
| Custom word-list upload | `planned` |
| Keypress sound packs | `planned` |
| Keyboard heatmap | `planned` |

None of these require a rewrite — the architecture already has a natural slot for each.

See [`CHANGELOG.md`](CHANGELOG.md) for the full engineering history of what's changed and why.

<br>

---

## 📬 Contact

<div align="center">

[![Email](https://img.shields.io/badge/📧_Email-90dthakur@gmail.com-EA4335?style=for-the-badge)](mailto:90dthakur@gmail.com)
[![LinkedIn](https://img.shields.io/badge/💼_LinkedIn-dev--thakur90-0A66C2?style=for-the-badge)](https://www.linkedin.com/in/dev-thakur90)
[![GitHub](https://img.shields.io/badge/🐙_GitHub-DEVTHAKUR--90-181717?style=for-the-badge)](https://github.com/DEVTHAKUR-90)
[![Portfolio](https://img.shields.io/badge/🌐_Portfolio-devthakur.vercel.app-7C3AED?style=for-the-badge)](https://devthakur.vercel.app)

</div>

<br>

---

## 📄 License

Open source under the [MIT License](LICENSE).

<br>

---

<div align="center">

<br>

⭐ **Star this repo if you found it useful** ⭐

<br>

<img src="https://img.shields.io/badge/Built_with-❤️_by_Dev_Thakur-7C3AED?style=for-the-badge" />

<br><br>

<sub>© 2026 Dev Thakur. All rights reserved.</sub>

</div>
