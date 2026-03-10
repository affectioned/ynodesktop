
![ynodesk](https://user-images.githubusercontent.com/2998216/201456135-270da105-a4fa-4976-a69a-3a69e5d3fe59.png)

A desktop client for [Yume Nikki Online](https://ynoproject.net/) with optional Discord Rich Presence. Show your friends what game you're playing and what room you're in.

[![Build and Release](https://github.com/aguish/ynodesktop/actions/workflows/release.yml/badge.svg)](https://github.com/aguish/ynodesktop/actions/workflows/release.yml)

## Download

[**→ Latest release**](https://github.com/aguish/ynodesktop/releases/latest)

| Platform | File |
|----------|------|
| Windows | `YNOdesktop-*-win-*.exe` — portable, no install needed |
| macOS (Intel) | `YNOdesktop-*-mac-x64.dmg` |
| macOS (Apple Silicon) | `YNOdesktop-*-mac-arm64.dmg` |
| Linux | `YNOdesktop-*-linux-*.AppImage` |

### macOS note

macOS will block the app on first launch because it is not notarized. To allow it:

```sh
xattr -cr /Applications/YNOdesktop.app
```

Or right-click the app → Open → Open.

### Linux note

Make the AppImage executable before running:

```sh
chmod +x YNOdesktop-*.AppImage
./YNOdesktop-*.AppImage
```

## Discord Rich Presence

![Rich Presence Example 1](https://user-images.githubusercontent.com/2998216/201456282-6337d763-db5c-4fc2-b399-00b3513b1f7b.png)

![Rich Presence Example 2](https://user-images.githubusercontent.com/2998216/201456297-8cb36ebb-6400-4ae8-9804-ce51bcf3c1b5.png)

Click the Discord icon in the title bar to toggle Rich Presence on or off at any time.

## Development Setup

Requires [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/).

```sh
git clone https://github.com/aguish/ynodesktop.git
cd ynodesktop
yarn install
yarn start
```

## Building

Build for the current platform:

```sh
yarn dist
```

Or target a specific platform:

```sh
yarn dist-win      # Windows portable .exe
yarn dist-linux    # Linux AppImage
yarn dist-mac      # macOS dmg + zip (x64 and arm64)
```

Output files are placed in the `dist/` directory.

Releases are built automatically by GitHub Actions when a version tag is pushed:

```sh
git tag v1.2.7
git push origin v1.2.7
```

## Project Structure

```
src/
  main.js                    # App entry point
  createApp.js               # Window, IPC, session, context menu
  preload.js                 # contextBridge API surface for the renderer
  scripts/
    discordRpcUtils.js       # Discord Rich Presence logic
    titlebar.js              # Injected custom title bar
    promptinjection.js       # Save slot dialog (replaces window.prompt)
    utils.js                 # URL parsing helpers
assets/
  logo.png / logo.ico        # App icons
.github/workflows/
  release.yml                # CI: build and publish releases
```

## YNOproject

Check out the [Yume Nikki Online Project](https://github.com/ynoproject)!
