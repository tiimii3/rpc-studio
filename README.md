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
