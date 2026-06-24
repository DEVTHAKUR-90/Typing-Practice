<div align="center">

```
 █████╗ ██╗   ██╗██████╗  ██████╗ ██████╗  █████╗     ████████╗██╗   ██╗██████╗ ███████╗
██╔══██╗██║   ██║██╔══██╗██╔═══██╗██╔══██╗██╔══██╗    ╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝
███████║██║   ██║██████╔╝██║   ██║██████╔╝███████║       ██║    ╚████╔╝ ██████╔╝█████╗
██╔══██║██║   ██║██╔══██╗██║   ██║██╔══██╗██╔══██║       ██║     ╚██╔╝  ██╔═══╝ ██╔══╝
██║  ██║╚██████╔╝██║  ██║╚██████╔╝██║  ██║██║  ██║       ██║      ██║   ██║     ███████╗
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝       ╚═╝      ╚═╝   ╚═╝     ╚══════╝
```

**A typing speed test that doesn't look like every other typing speed test.**

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion)
[![License: MIT](https://img.shields.io/badge/License-MIT-FFB454?style=for-the-badge)](LICENSE)

</div>

<br>

## What this is

Aurora Type is a glassmorphism typing speed test — Time, Words, Zen, and Custom-text modes, live WPM/accuracy analytics, and an arcade mode called **Block Defence** where you destroy falling word-blocks before they cross the kill line.

It's built on a simple idea: a typing test is the one app where the *interaction itself* is the entire product. So the caret glides between characters instead of jumping, mistakes flash like a hairline crack in glass, and the whole thing sits on a slow-drifting aurora gradient that never quite repeats. Nothing about it should feel like it's fighting you to get a number on the screen.

<br>

## Features

**Test modes**
- Time (15 / 30 / 60 / 120s), Words (10 / 25 / 50 / 100), Zen (untimed), and Custom (paste your own text)
- Three word pools — Common, Programming terms, Quotes — plus Punctuation, Numbers, and Capitalization toggles
- An Advanced difficulty that mixes symbols and digits into generated words

**Block Defence**
- Falling word-blocks you destroy by typing them before they cross the kill line
- A draggable vertical speed slider — set your own pace, with a one-click reset to default
- A combo system that rewards consecutive kills, plus power-up blocks (2x score) and debuff blocks (mirrored text)
- A difficulty curve that actually ramps over a couple of minutes instead of maxing out in the first ten seconds

**Analytics that stick around**
- Live WPM/accuracy while you type, a full post-test breakdown (correct / incorrect / missed / extra, WPM-over-time chart, words to practice)
- Personal bests tracked per mode and surfaced right on the results screen — not buried in a database you never look at

**Two themes, actually designed for both**
- Aurora (dark) and Daybreak (light), with accent colors independently tuned for contrast in each — not just one palette with the lights inverted

**Focus mode**
- Press Enter before a test starts to drop into a real fullscreen, distraction-free view with a large live word-progress counter and WPM display — Esc exits, same as any other fullscreen content

<br>

## Tech stack

| | |
|---|---|
| **Framework** | Next.js 14 (App Router, TypeScript) |
| **Styling** | Tailwind CSS + custom CSS variables for theming |
| **Animation** | Framer Motion — shared-layout transitions for the caret, mode pills, and selection dots |
| **State** | Zustand, persisted to `localStorage` with manual rehydration (no SSR/hydration mismatch) |
| **Charts** | Recharts |
| **Icons** | Lucide |

<br>

## Getting started

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

```bash
npm run build   # production build
npm run start   # serve the production build
```

> Fonts (Sora, Space Mono) load from Google Fonts at build time via `next/font/google` — this needs network access once, same as any normal dev machine or CI runner.

### Deploying

```bash
npm install -g vercel
vercel
```

Or push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new). No environment variables required.

<br>

## Project structure

```
src/
├── app/                  Root layout, global styles, the page itself
├── components/
│   ├── layout/           Header, background, settings drawer, glass container
│   ├── typing/           The typing test surface and its live stats
│   ├── game/             Block Defence (presentational only)
│   └── stats/            Post-test results dashboard
├── lib/
│   ├── hooks/            useTypingEngine, useBlockDefenseGame — all game
│   │                     logic lives here; components just render the output
│   ├── stores/           Zustand stores + the hydration guard
│   ├── constants.ts      Shared tunables, not scattered magic numbers
│   ├── wordLists.ts
│   └── utils.ts
└── types/
```

Each mode's logic is isolated in a hook that owns its state and exposes plain data and handlers. The component is purely presentational. Same shape for both modes, easy to extend later.

<br>

## Roadmap

A few things from the original brief are deliberately not in yet:

- [ ] Live multiplayer race
- [ ] Custom word-list upload
- [ ] Keypress sound packs
- [ ] Keyboard heatmap

None of these need a rewrite to add — the architecture already has a slot for each.

See [`CHANGELOG.md`](CHANGELOG.md) for the engineering-level history of what's changed and why.

<br>

<div align="center">

**Dev Thakur** • Premium Interactive Experience

If this was useful or you just like the way it feels, a ⭐ helps more than you'd think.

</div>
