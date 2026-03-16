# RPC Studio (Tauri)

Cross-platform desktop app (macOS, Windows, Linux) for local Discord Rich Presence.

## Features

- Connect with your Discord application `Client ID` (no account token).
- Multi-session support: keep multiple Client IDs connected at the same time.
- Auto-start support on macOS/Windows/Linux.
- Closing window with `X` hides to tray/menu bar (app keeps running).
- Bilingual UI toggle (`EN` / `SI`) in the top-right corner.
- Profile system (save, load, delete full RPC presets).
- Quick Slots `A/B/C`: assign a profile and run it with one click.
- Set activity type (`Playing`, `Watching`, `Listening`, `Competing`).
- Set `details`, `state`, large/small image keys or image URLs and tooltips.
- Add clickable URLs for large/small images via the 2 Discord activity buttons.
- Set elapsed start time (hours/minutes), e.g. start at `5h 22m`.
- Optional start/end timestamps (unix seconds).
- Clear/disconnect actions.
- Draft values are saved locally.
- In-app updater button (check + install from GitHub Releases).

## Run

```bash
npm install
npm run dev
```

## Important

- Discord desktop app must be running on the same machine.
- Image keys must exist in your Discord Developer Portal application assets.
- The app name shown in Discord comes from the selected Client ID app name.
- Discord allows max 2 clickable buttons per activity.
- Visibility of multiple simultaneous activities depends on Discord client behavior.
- This app is for local user presence, not server-side 24/7 hosting.
- Discord account status (`online` / `idle` / `dnd`) cannot be changed with official RPC API.

## Auto-Updater Setup (One-Time)

1. Generate updater signing keys:

```bash
npm run tauri signer generate -- -w ~/.tauri/rpc-studio.key
```

2. In GitHub repo settings, add these secrets:
- `TAURI_SIGNING_PRIVATE_KEY` -> paste the full content of `~/.tauri/rpc-studio.key`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` -> the password you set during key generation

3. Copy your public key from generated output and set:
- `src-tauri/tauri.conf.json` -> `plugins.updater.pubkey`

4. Keep endpoint as:
- `https://github.com/tiimii3/rpc-studio/releases/latest/download/latest.json`

5. Bump version and push. GitHub Actions release workflow signs artifacts and uploads updater files.
