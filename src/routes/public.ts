import express from "express";
import SpotifyWebApi from "spotify-web-api-node";

export const subRoute = "/api/public";

const router = express.Router();

interface PublicPlayback {
  timestamp: number | null;
  progress_ms: number | null;
  is_playing: boolean;
  currently_playing_type: string;
  item: any | null;
}

let cachedAccessToken: string | undefined;
let accessTokenExpiresAt = 0;
let refreshInFlight: Promise<string> | undefined;
let cachedPlayback: PublicPlayback | null = null;
let playbackCachedAt = 0;
let playbackRequestInFlight: Promise<PublicPlayback | null> | undefined;

const getAccessToken = async (): Promise<string> => {
  if (cachedAccessToken && Date.now() < accessTokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  if (refreshInFlight) return refreshInFlight;

  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error("Public Spotify playback is not configured. Set Spotify client credentials and SPOTIFY_REFRESH_TOKEN.");
  }

  refreshInFlight = (async () => {
    const spotifyApi = new SpotifyWebApi({ clientId, clientSecret });
    spotifyApi.setRefreshToken(refreshToken);
    const response = await spotifyApi.refreshAccessToken();
    cachedAccessToken = response.body.access_token;
    accessTokenExpiresAt = Date.now() + response.body.expires_in * 1000;
    return cachedAccessToken;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = undefined;
  }
};

const fetchPlayback = async (): Promise<PublicPlayback | null> => {
  const accessToken = await getAccessToken();
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);
  const response = await spotifyApi.getMyCurrentPlayingTrack();
  const playback: any = response && (response as any).body;
  if (!playback) return null;

  // Expose only fields used by the public UI; omit playback context and action metadata.
  const item: any = playback.item;
  if (!item) {
    return {
      timestamp: playback.timestamp,
      progress_ms: playback.progress_ms,
      is_playing: playback.is_playing,
      currently_playing_type: playback.currently_playing_type,
      item: null
    };
  }

  const isTrack = Array.isArray(item.artists) && item.album;
  const images = isTrack ? item.album.images : item.images || item.show?.images || [];
  const artists = isTrack
    ? item.artists.map((artist: { name: string }) => ({ name: artist.name }))
    : [{ name: item.show?.name || "Podcast" }];

  return {
    timestamp: playback.timestamp,
    progress_ms: playback.progress_ms,
    is_playing: playback.is_playing,
    currently_playing_type: playback.currently_playing_type,
    item: {
      id: item.id,
      name: item.name,
      duration_ms: item.duration_ms,
      artists,
      album: {
        name: isTrack ? item.album.name : item.show?.name || "Podcast",
        images: images.map((image: { url: string }) => ({ url: image.url }))
      }
    }
  };
};

// All visitors share this short cache, so opening the site in many browsers
// does not create one Spotify API request per visitor.
router.get("/currently-playing", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (Date.now() - playbackCachedAt < 2500) {
    res.json(cachedPlayback);
    return;
  }

  if (!playbackRequestInFlight) {
    playbackRequestInFlight = (async () => {
      try {
        const playback = await fetchPlayback();
        cachedPlayback = playback;
        playbackCachedAt = Date.now();
        return playback;
      } finally {
        playbackRequestInFlight = undefined;
      }
    })();
  }

  try {
    const playback = await playbackRequestInFlight;
    res.json(playback);
  } catch (error) {
    console.error("Failed to fetch the public Spotify playback state:", error);
    res.status(503).json({ error: "Spotify playback is temporarily unavailable." });
  }
});

export default router;
