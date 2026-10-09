# Spotify Public Lyrics Viewer

A public, read-only version of Spotify Lyrics Viewer for **currentlylistening.vismaypatel.com**. It reuses the existing React lyrics UI and retrieves playback from one Spotify account authorized by the site owner. Visitors do not sign in to Spotify and cannot control playback.

## Architecture

- `client/`: React frontend, deploy to Vercel.
- `src/`: Express/TypeScript API, deploy to Render.
- `GET /api/public/currently-playing`: returns the owner's current playback or `null` when nothing is playing. The API caches playback briefly so multiple viewers share Spotify API requests.
- `scripts/get-spotify-refresh-token.js`: one-time local helper to authorize the owner's Spotify account. It prints the refresh token to the terminal and does not write it to disk.

## 1. Create a Spotify refresh token

1. In the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), open your Spotify app.
2. Add this exact Redirect URI to the app's settings: `http://127.0.0.1:8888/callback`
3. Use Node.js 18 or newer. In PowerShell, set the credentials temporarily for the current terminal:

   ```powershell
   $env:SPOTIFY_CLIENT_ID = "your-client-id"
   $env:SPOTIFY_CLIENT_SECRET = "your-client-secret"
   node scripts/get-spotify-refresh-token.js
   ```

4. Open the authorization URL printed in the terminal and authorize **your own Spotify account**.
5. Copy the refresh token printed in the terminal. Treat it like a password; do not commit it or send it to anyone.

The token requests `user-read-currently-playing` and `user-read-playback-state`. The Spotify app's development-mode user restrictions still apply to the account that authorizes it; visitors do not need to be added as authorized users because they do not authorize the app.

## 2. Deploy the API to Render

Create a new Web Service from this repository.

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Runtime:** Node.js 20 or newer

Set these environment variables in Render:

- `NODE_ENV` = `production`
- `SERVER_ALLOWED_ORIGINS` = `https://currentlylistening.vismaypatel.com`
- `SERVER_SESSION_KEYS` = two long random values separated by a space
- `SPOTIFY_CLIENT_ID` = your Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` = your Spotify app client secret
- `SPOTIFY_REFRESH_TOKEN` = the refresh token generated above
- `GENIUS_ACCESS_TOKEN` and `GOOGLE_TRANSLATE_API_KEY` are optional, if you want the same optional integrations as the original app.

Do not put the Spotify client secret or refresh token in any `client/` environment variable. They must remain on the backend only.

## 3. Deploy the frontend to Vercel

Import this new repository as a separate Vercel project.

- **Root Directory:** `client`
- **Framework Preset:** Create React App
- **Build Command:** `npm run build`
- **Output Directory:** `build`

Set these Vercel environment variables:

- `REACT_APP_API_ROOT` = the full HTTPS URL of the Render API service, without a trailing slash
- `PUBLIC_URL` = `https://currentlylistening.vismaypatel.com`
- `NODE_OPTIONS` = `--openssl-legacy-provider` if the React Scripts 4 build fails with an OpenSSL error on the selected Node.js runtime
- Optionally set `REACT_APP_TRACK_CHECK_DELAY_SECONDS` to `3`

The frontend build embeds `REACT_APP_API_ROOT`, so redeploy after changing it.

## 4. Connect the subdomain

In Vercel, add `currentlylistening.vismaypatel.com` to the new frontend project's Domains page and follow the DNS instructions Vercel provides. Add the requested DNS record in Cloudflare. Do not modify the DNS records for `spotifylyrics.vismaypatel.com`.

## Behavior

- The page polls the backend every few seconds.
- If no track is playing, it shows an idle screen.
- When playback starts, the existing lyrics lookup and synchronized lyrics UI are reused.
- Playback controls and seeking are hidden; visitors cannot control the Spotify account.
- If the API is not configured or Spotify is temporarily unavailable, the page shows a temporary error instead of requesting visitor login.

## Security notes

- Never commit `.env` files, Spotify client secrets, or refresh tokens.
- Keep `SPOTIFY_REFRESH_TOKEN` in the backend host's secret environment variables.
- The API only exposes playback metadata needed for the public display. The endpoint is intentionally read-only.
