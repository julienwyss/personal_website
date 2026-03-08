# Personal Portfolio

[![Live](https://img.shields.io/badge/Live-julien--wyss.ch-success?style=for-the-badge&logo=firefox)](https://julien-wyss.ch)

A browser-based desktop environment built as a personal portfolio. The UI mimics a Linux desktop with draggable application windows, a taskbar, and a set of integrated apps.


## Features

**Window Manager**
Draggable, resizable and minimizable windows with taskbar minimization. Adapted for both desktop and mobile viewports.

**Terminal**
Simulated shell with typewriter animations, tabbed navigation, and skill progress bars.

**CTF Writeup Explorer**
File-explorer-style app that loads writeups directly from the `public/writeups/` directory. Markdown is rendered via `marked` with syntax highlighting and an integrated image viewer.

**GitHub Integration**
Aggregates repositories across multiple GitHub accounts. Deduplicates by name, sorts by last activity, and computes per-language byte statistics. Collaborative projects from external accounts can be listed separately.

**Contact Form**
Terminal-styled multi-step form backed by the Web3Forms API.

**LinkedIn & CTFtime**
Embedded profile badge and live CTFtime event feed.

## Tech Stack

| Area | Technology |
|---|---|
| Framework | [Astro](https://astro.build/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/), [Flowbite](https://flowbite.com/) |
| Language | TypeScript, HTML, CSS |
| Markdown | `marked`, `DOMPurify`, `highlight.js` |
| Forms | Web3Forms API |

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build (generates writeup structure, CTFtime data, then Astro build)
npm run build
```

The build script pre-generates static JSON data for writeups and CTFtime. GitHub data is fetched separately:

```bash
npx tsx src/scripts/generate-github-data.ts
```

Set `GITHUB_TOKEN` as an environment variable to avoid API rate limits.

## Project Structure

```
src/
  components/
    apps/          # Individual app windows (Terminal, GitHub, Writeups, Contact, ...)
    desktop/       # Shell, window manager, taskbar
    utils/         # Shared UI components (tabs, tooltips)
  data/            # Pre-generated JSON data (github.json, ctftime.json, ...)
  pages/           # Astro pages (index.astro)
  scripts/         # Build-time data generators and client-side TypeScript
  styles/          # Global CSS and component styles

public/
  writeups/        # CTF writeup Markdown files, organized by event and category
  writeups.json    # Auto-generated writeup index (via generate-writeups-structure.ts)
```