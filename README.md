# Chess.com Discord Rich Presence

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js 18+" />
  <img src="https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white" alt="Chrome Extension Manifest V3" />
  <img src="https://img.shields.io/badge/Discord-RPC-5865F2?logo=discord&logoColor=white" alt="Discord RPC" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
  <img src="https://img.shields.io/badge/Contributions-Welcome-brightgreen" alt="Contributions Welcome" />
</div>

<p align="center">
  <strong>Live Chess.com matches, clean Discord status, no heavy setup.</strong>
</p>

A lightweight open-source bridge that turns your live Chess.com activity into a polished Discord Rich Presence. It is designed to be simple, modular, and fast: a small Chrome extension captures the board state, a local WebSocket daemon forwards it, and the Node.js server pushes the activity to Discord without adding heavy browser or desktop dependencies.

## Why this project stands out

- Lightweight and focused: no bulky desktop app or complex runtime
- Modular architecture: browser-side scraping + local daemon + Discord IPC
- Clean presence updates: automatic idle reset, live match clock, and direct watch links
- Easy to localize: built-in i18n support for 10 languages

---

## Features

- 🔴 Real-time match tracking: opponent name, rating, and mode detection for Bullet, Blitz, Rapid, and vs Bot matches
- ⏱️ Dynamic clock display: shows the current move clock as `[MM:SS]` and keeps the match elapsed time in Discord with `startTimestamp`
- 🧑‍🤝‍🧑 Dynamic opponent avatar: uses the opponent avatar from the Chess.com DOM as the small presence image
- 🎯 Interactive watch button: adds a direct button to `gameUrl` when the page is a live match (`/game/live/`)
- 🌍 Native i18n support: 10 languages are available and configurable through `config.json`
- 🧹 Smart idle cleanup: automatically clears the Rich Presence when a match ends or the extension disconnects

---

## Project architecture

```text
Chess.com DOM
    │
    ▼
Chrome Extension
  extension/content.js
    │
    │  WebSocket client
    ▼
ws://localhost:3020
    │
    ▼
Node.js daemon
  server.js
    │
    │  Discord IPC socket
    ▼
Discord Rich Presence
```

The flow is intentionally simple:

1. The content script inspects the live Chess.com page.
2. It extracts state such as opponent, clock, color, bot status, and match URL.
3. It sends a JSON payload through a local WebSocket to the Node.js server.
4. The server translates that payload into a Discord activity and updates the presence in real time.

---

## Installation and local setup

### Prerequisites

- Node.js 18+
- Discord desktop app open and signed in
- Chrome with Developer Mode enabled

### 1) Clone and install dependencies

```bash
git clone https://github.com/sousa7tz/chess-rpc.git
cd chess-rpc
npm install
```

### 2) Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click Load unpacked
4. Select the `extension/` folder from this repository

### 3) Start the daemon

```bash
node server.js
```

> The project currently runs the daemon directly with Node.js. The server listens on `ws://localhost:3020` and connects to Discord via the native IPC socket provided by `discord-rpc`.

### 4) Open Chess.com and play

Once the daemon is running and the extension is loaded, visit a Chess.com live game page and the Discord presence will update automatically.

---

## Language configuration (i18n)

The project reads the active language from `config.json` at startup.

```json
{
  "language": "pt"
}
```

Examples:

```json
{
  "language": "en"
}
```

```json
{
  "language": "pt"
}
```

### Supported locales

The repository includes the following language files under `locales/`:

| Language | ISO tag |
| --- | --- |
| English | `en` |
| Portuguese | `pt` |
| Spanish | `es` |
| Russian | `ru` |
| French | `fr` |
| German | `de` |
| Hindi | `hi` |
| Turkish | `tr` |
| Polish | `pl` |
| Japanese | `ja` |

---

## Directory structure

```text
chess-rpc/
├── extension/
│   ├── content.js
│   └── manifest.json
├── locales/
│   ├── de.json
│   ├── en.json
│   ├── es.json
│   ├── fr.json
│   ├── hi.json
│   ├── ja.json
│   ├── pl.json
│   ├── pt.json
│   ├── ru.json
│   └── tr.json
├── config.json
├── LICENSE
├── package.json
├── README.md
├── server.js
└── .gitignore
```

---

## Tech stack

- JavaScript
- Node.js
- `discord-rpc`
- `ws` (WebSocket server/client)
- Chrome Extensions Manifest V3

---

## Roadmap and packaging

This project is intentionally lightweight, but the repository is already aligned with a future standalone distribution path.

Planned enhancement:

- Package the daemon as a native Windows executable using Inno Setup or a similar installer workflow
- Bundle the local runtime and startup flow for easier non-developer installation
- Improve UX around automatic launch and configuration for end users

---

## Contributing

Contributions are welcome. If you want to improve the project, please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request with a clear description

Potential areas for contribution include translation quality, richer presence states, match detection improvements, and packaging improvements.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Quick facts

| Item | Details |
| --- | --- |
| Project type | Chrome extension + local Node.js daemon |
| Local transport | WebSocket on `ws://localhost:3020` |
| Discord integration | Discord Rich Presence via `discord-rpc` |
| Supported domains | `*.chess.com/*` |
| Default locale | `en` |
| License | MIT |

