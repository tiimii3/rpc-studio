# macOS Notarization Setup (GitHub Actions)

This project uses Tauri release workflow for macOS `.dmg` signing and notarization.

## 1) Apple prerequisites

- Active Apple Developer Program membership.
- `Developer ID Application` certificate in Apple Developer portal.
- App-specific password for your Apple ID.

## 2) Export certificate to `.p12`

On your Mac:

1. Open `Keychain Access`.
2. Locate your `Developer ID Application` certificate.
3. Export it as `.p12` with a password.

## 3) Convert certificate to base64

```bash
base64 -i /path/to/DeveloperID.p12 | pbcopy
```

Paste clipboard value into GitHub secret `APPLE_CERTIFICATE`.

## 4) Add required GitHub secrets

Repository -> `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

- `APPLE_CERTIFICATE`: base64 text of `.p12`
- `APPLE_CERTIFICATE_PASSWORD`: password used for `.p12` export
- `APPLE_SIGNING_IDENTITY`: exact identity string from Keychain/codesign
- `APPLE_ID`: Apple ID email
- `APPLE_PASSWORD`: app-specific password (not Apple ID login password)
- `APPLE_TEAM_ID`: your Apple Developer Team ID

## 5) Verify signing identity string

```bash
security find-identity -v -p codesigning
```

Use the exact identity line for `APPLE_SIGNING_IDENTITY`.

## 6) Release

1. Bump app version.
2. Push to `main`.
3. Wait for `Release RPC Studio` workflow.

The workflow signs and notarizes macOS release artifacts.
