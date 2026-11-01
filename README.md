# Kharcha — installable Android web app (PWA)

Expense, recharge, subscription and loan-EMI tracker in ₹. Works offline; data stays on the phone.

## Files
- `index.html` – the app
- `manifest.webmanifest` – name, icon and colours used by "Install app"
- `sw.js` – offline support and background due-date alerts
- `icons/` – app icons

## Host it (must be HTTPS; both options are free)
**GitHub Pages:** create a new repo → upload all files (keep the `icons` folder) → Settings → Pages → Deploy from branch `main`, root folder → open `https://<user>.github.io/<repo>/`.

**Netlify Drop:** on a computer, open app.netlify.com/drop and drag this folder in.

## Install on Android
1. Open the HTTPS link in Chrome.
2. Tap **Install** on the Overview screen (or Chrome ⋮ → Install app / Add to Home screen).
3. Open Kharcha → Overview → Reminders → **Turn on** → allow notifications.

## Backups
Data lives only on that phone. **Back up** saves a .json file to Downloads; keep it in Google Drive. **Restore** loads it on a new phone. Clearing Chrome site data or uninstalling the app deletes entries.

## Updating
Edit the files and re-upload, then bump `VERSION` in `sw.js` so installed phones pick up the new version.
