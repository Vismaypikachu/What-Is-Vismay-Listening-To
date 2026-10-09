import { useEffect, useState } from "react";
import { getPublicCurrentlyPlaying } from "../api";
import config from "../config";
import { CurrentlyPlayingState, PlayingStates } from "../types/currentlyPlayingState";

const usePublicCurrentlyPlayingSong = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlayingState>({
    state: PlayingStates.Loading,
    currentlyPlayingObject: null
  });

  useEffect(() => {
    let mounted = true;
    let requestInFlight = false;

    const updatePlayback = async () => {
      if (requestInFlight) return;
      requestInFlight = true;
      try {
        const playback = await getPublicCurrentlyPlaying();
        if (!mounted) return;
        if (playback === null) {
          setCurrentlyPlaying({
            state: PlayingStates.NotPlaying,
            currentlyPlayingObject: null
          });
        } else {
          setCurrentlyPlaying({
            state: playback.is_playing ? PlayingStates.Playing : PlayingStates.Paused,
            currentlyPlayingObject: playback
          });
        }
      } catch (error) {
        if (mounted) {
          console.error("Unable to load public playback:", error);
          setCurrentlyPlaying({ state: PlayingStates.Error, currentlyPlayingObject: null });
        }
      } finally {
        requestInFlight = false;
      }
    };

    updatePlayback();
    const interval = window.setInterval(
      updatePlayback,
      Math.max(config.client.trackCheckDelaySeconds, 3) * 1000
    );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return currentlyPlaying;
};

export default usePublicCurrentlyPlayingSong;
