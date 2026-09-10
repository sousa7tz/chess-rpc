<div align="center">
<h1>♟️ Discord Rich Presence for Chess.com</h1>
  <a href="https://github.com/sousa7tz/chess-rpc/releases/latest">
    <img src="https://img.shields.io/github/v/release/sousa7tz/chess-rpc?style=for-the-badge&color=2ea44f&logo=github" alt="Latest Release" />
  </a>
  <img src="https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Windows Support" />
  <img src="https://img.shields.io/badge/Runtime-Bun-f472b6?style=for-the-badge&logo=bun&logoColor=white" alt="Bun Compiled" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
</div>

<p align="center">
  <strong>Display your live Chess.com matches seamlessly on Discord with zero terminal clutter.</strong>
</p>

A lightweight, zero-configuration bridge connecting live Chess.com gameplay directly to Discord Rich Presence. It extracts the game state directly from your browser and pipes it through a stealth background daemon compiled into a single native binary.

---

## ✨ Key Highlights

- **Automated Windows Setup:** One-click installer with automatic silent boot on Windows startup.
- **Zero Terminal Footprint:** Runs in the background via Windows Script Host—no open CMD windows.
- **Low Resource Usage:** Binary compiled natively with **Bun**, running quietly without heavy runtimes.
- **Real-time Game Tracking:** Displays active clock `[MM:SS]`, current mode (Blitz, Bullet, Rapid, Bots), match turn, and side.
- **Direct Spectate Action:** Renders a direct Discord button leading viewers straight to the live match.
- **Multi-language Support:** Native i18n support across 10 locales configurable via JSON.

---

## 🏗️ Architecture

```text
Chess.com Live Match (DOM)
          │
          ▼
Chrome Extension (Manifest V3)
  └─ content.js (WebSocket Client)
          │
          │  ws://localhost:3020
          ▼
Native Stealth Daemon
  ├─ start-hidden.vbs (Silent Launcher)
  └─ chess-rpc.exe (Bun Binary)
          │
          │  Discord IPC Socket
          ▼
Discord Rich Presence
```

---

## 📦 Quick Installation (End Users)

### 1. Install the Windows Daemon

1. Download **`ChessRPC-Setup-1.0.0.exe`** from the [Latest Release](https://github.com/sousa7tz/chess-rpc/releases/latest).
2. Run the setup wizard and ensure **"Start automatically with Windows"** is selected.

### 2. Install the Browser Extension

1. Download **`extension.zip`** from the [Latest Release](https://github.com/sousa7tz/chess-rpc/releases/latest) and extract it.
2. In Chrome, Brave, Edge, or Opera, go to `chrome://extensions/`.
3. Enable **Developer mode** (top-right corner).
4. Click **Load unpacked** and select the unzipped `extension/` folder.
5. Open [Chess.com](https://www.chess.com) and start a match.

---

## 🛠️ Developer Setup & Pipeline

### Prerequisites

- Node.js 18+ or Bun
- Inno Setup 6 (for compiling the installer)
- Discord Desktop Client running locally

### Local Development

```bash
# Clone the repository
git clone https://github.com/sousa7tz/chess-rpc.git
cd chess-rpc

# Install dependencies
npm install

# Run development server
npm start
```

### Full Production Build Pipeline

The build pipeline terminates stale processes, compiles the standalone native binary via Bun, mirrors localized assets, and generates the Inno Setup executable installer:

```bash
npm run build
```

The installer will be generated at:

```text
build-installer/ChessRPC-Setup-1.0.0.exe
```

---

## 🌍 Localization (i18n)

Modify the active language in `config.json`:

```json
{
  "language": "en"
}
```

### Supported Locales

| Language | Tag | Language | Tag |
| --- | --- | --- | --- |
| **English** | `en` | **German** | `de` |
| **Portuguese** | `pt` | **Hindi** | `hi` |
| **Spanish** | `es` | **Turkish** | `tr` |
| **French** | `fr` | **Polish** | `pl` |
| **Russian** | `ru` | **Japanese** | `ja` |

---

## 📂 Project Structure

```text
chess-rpc/
├── assets/             # Project branding & icons
├── build-installer/    # Output directory for generated setup binaries (ignored)
├── dist/               # Compiled standalone binary and staging files
│   ├── locales/        # Bundled localization dictionaries
│   ├── chess-rpc.exe   # Compiled binary daemon
│   ├── config.json     # Configuration file
│   └── start-hidden.vbs # Stealth Windows launcher
├── extension/          # Manifest V3 browser extension
│   ├── content.js      # DOM scraper & WebSocket dispatch
│   └── manifest.json   # Extension manifest
├── locales/            # Raw JSON translation strings
├── config.json         # Base application config
├── installer.iss       # Inno Setup build recipe
├── package.json        # Project metadata & build scripts
└── server.js           # Core IPC/WebSocket bridge logic
```

---

## ⚠️ Disclaimer

This is an unofficial open-source utility and is not affiliated with, associated with, authorized by, endorsed by, or officially connected with Chess.com or Discord Inc.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for full details.