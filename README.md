# RPC Studio

RPC Studio is a cross-platform desktop app (macOS, Windows, Linux) for local Discord Rich Presence.

## Main Features

- Connect with Discord `Client ID` (no account token required).
- Multi-session support for multiple Client IDs.
- Profiles (save/load/delete) and quick slots `A/B/C`.
- Activity types: `Playing`, `Watching`, `Listening`, `Competing`.
- Rich fields: details, state, images, tooltips, timestamps, clickable buttons.
- Start-at elapsed timer (for example `5h 22m`).
- Auto-start support and tray/menu-bar background behavior.
- Bilingual UI (`EN` / `SI`).
- Built-in version label and `Check for updates` button.

## Privacy and Safety

- RPC Studio does not require Discord account tokens.
- App settings/profiles are stored locally on your machine.
- Signing keys/certificates must stay in GitHub Secrets (never commit to repo).

## Requirements

- Discord desktop app running on the same machine.
- A Discord Developer Portal app with a valid Client ID.
- (Optional) image asset keys uploaded in your Discord app.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Stable Releases (GitHub Actions)

The repository includes automatic build/release workflows.

- Release version source: `src-tauri/tauri.conf.json` -> `version`
- On push to `main`, workflow checks `v<version>` tag
- If tag does not exist, it creates a new release with artifacts

Before pushing a new stable release:

1. Increase version in:
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`
   - `package.json`
2. Commit and push to `main`.

## Check For Updates (In App)

- `Check for updates` calls GitHub latest release API.
- If newer version exists, app shows `New version available` and a `Download` button.
- Download opens the release page in browser (manual install flow, safer than forced auto-install).
- For macOS, install from `.dmg` release asset.
- macOS release workflow uses `--no-sign` so users should get the standard `Open Anyway` flow instead of a broken signature warning.

## Release Notes Template

Use: `.github/release-notes-template.md`

## License

MIT - see `LICENSE`.
