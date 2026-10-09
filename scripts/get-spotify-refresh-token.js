const http = require("http");
const crypto = require("crypto");

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI || "http://127.0.0.1:8888/callback";
const redirect = new URL(redirectUri);

if (!clientId || !clientSecret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your environment first.");
  process.exit(1);
}
if (redirect.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(redirect.hostname)) {
  console.error("For safety, this helper only supports a localhost HTTP redirect URI.");
  process.exit(1);
}

const state = crypto.randomBytes(24).toString("hex");
const scopes = ["user-read-currently-playing", "user-read-playback-state"];
const authUrl = new URL("https://accounts.spotify.com/authorize");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("redirect_uri", redirectUri);
authUrl.searchParams.set("scope", scopes.join(" "));
authUrl.searchParams.set("state", state);

const server = http.createServer(async (req, res) => {
  const callbackUrl = new URL(req.url, redirect.origin);
  if (callbackUrl.pathname !== redirect.pathname) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  if (callbackUrl.searchParams.get("state") !== state) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("OAuth state did not match. Close this window and run the helper again.");
    server.close();
    process.exitCode = 1;
    return;
  }

  const code = callbackUrl.searchParams.get("code");
  const oauthError = callbackUrl.searchParams.get("error");
  if (!code) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Spotify authorization failed: " + (oauthError || "no authorization code returned"));
    server.close();
    process.exitCode = 1;
    return;
  }

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.refresh_token) {
      throw new Error("Spotify token exchange failed (HTTP " + tokenResponse.status + ").");
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h2>Spotify authorization complete</h2><p>You can close this tab and return to your terminal.</p>");
    console.log("\nAuthorization successful. Copy the following value into your backend host's");
    console.log("SPOTIFY_REFRESH_TOKEN environment variable. Do not commit it or share it.\n");
    console.log(tokenData.refresh_token + "\n");
    console.log("The refresh token is intentionally not written to a file.");
    server.close();
  } catch (error) {
    console.error(error.message || error);
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Token exchange failed. Check the terminal for details.");
    server.close();
    process.exitCode = 1;
  }
});

server.listen(Number(redirect.port || 80), redirect.hostname, () => {
  console.log("Listening for Spotify's callback at " + redirectUri);
  console.log("\nOpen this URL in a browser and authorize your Spotify account:\n");
  console.log(authUrl.toString() + "\n");
  console.log("Ensure this exact redirect URI is registered in your Spotify app settings.");
});
