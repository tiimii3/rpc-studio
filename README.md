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

### macOS Distribution Mode

- macOS release is built as `--no-sign` to avoid broken/partial signatures.
- Install from the `.dmg` asset only.
- This usually gives the standard `Open Anyway` flow, but behavior can still vary by macOS version and security policy.

### macOS Troubleshooting

If the app does not start on macOS, run this in Terminal:

```bash
xattr -r -d com.apple.quarantine "/Applications/RPC Studio.app"
open "/Applications/RPC Studio.app"
```

## Check For Updates (In App)

- `Check for updates` calls GitHub latest release API.
- If newer version exists, app shows `New version available`.
- If signed updater metadata is available, app shows `Install update` for one-click install + restart.
- `Download` remains as fallback.
- Download opens the release page in browser (manual install flow, safer than forced auto-install).
- For macOS, install from `.dmg` release asset.

### Updater Signing Secrets (for Install update)

Add these GitHub repository secrets:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

Without these two secrets, release builds cannot produce trusted updater signatures and `Install update` will not work correctly.

Generate updater keys once:

```bash
npm run tauri -- signer generate --ci --write-keys /tmp/rpc-studio-update.key --password "your-password"
```

Then set:

- `TAURI_SIGNING_PRIVATE_KEY` = full contents of `/tmp/rpc-studio-update.key`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` = same password you used above

## Release Notes Template

Use: `.github/release-notes-template.md`

## License

MIT - see `LICENSE`.
