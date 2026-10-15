import React from "react";
import { CurrentlyPlayingState, PlayingStates } from "../../types/currentlyPlayingState";
import { ITrackLyrics } from "../../types/trackLyrics";
import Advertisement from "./Advertisement";
import Error from "./Error";
import Loading from "./Loading";
import NoTrackPlaying from "./NoTrackPlaying";
import TrackPlaying from "./TrackPlaying";
import Welcome from "./Welcome";
import { Box, Typography } from "@material-ui/core";
import HijackedImage from "../../img/facepalm.png";

interface IProps {
  user: SpotifyApi.UserObjectPrivate | null;
  currentlyPlayingSong: CurrentlyPlayingState;
  lyrics: ITrackLyrics | undefined;
  publicMode?: boolean;
}

const LyricsView: React.FunctionComponent<IProps> = ({
  user,
  currentlyPlayingSong,
  lyrics,
  publicMode = false
}) => {
  if (!publicMode && user === null) {
    return <Welcome />;
  } else if (currentlyPlayingSong.state === PlayingStates.Loading) {
    return <Loading />;
  } else if (currentlyPlayingSong.state === PlayingStates.NotPlaying) {
    return <NoTrackPlaying />;
  } else if (currentlyPlayingSong.state === PlayingStates.Error) {
    return <Error />;
  } else if (currentlyPlayingSong.currentlyPlayingObject.currently_playing_type === "ad") {
    return <Advertisement />;
  } else if (currentlyPlayingSong.currentlyPlayingObject?.device?.name === "Car") {
    return (
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        minHeight={0}
      >
        {currentlyPlayingSong.currentlyPlayingObject?.device?.name === "Car" && (
          <Box
            flexShrink={0}
            textAlign="center"
            py={2}
            px={2}
            mx={2}
            mb={1}
            borderRadius={8}
            style={{
              backgroundColor: "rgba(255, 152, 0, 0.12)",
              border: "2px solid #ff9800"
            }}
          >
            <Typography variant="h5" gutterBottom>
              🚨 Spotify Hijacked!
            </Typography>
            <Typography color="textSecondary">
              The parents have hijacked my Spotify account. What they're playing
              in the car is NOT what Vismay is listening to.
            </Typography>
            <img
              src={HijackedImage}
              height="250"
              alt="Spotify account hijacked"
              style={{ maxWidth: "100%", objectFit: "contain" }}
            />
          </Box>
        )}

        <Box flex={1} minHeight={0} overflow="hidden">
          <TrackPlaying
            lyricDetails={lyrics}
            currentlyPlayingSong={currentlyPlayingSong}
          />
        </Box>
      </Box>
    );
  } else {
    return (
      <TrackPlaying
        lyricDetails={lyrics}
        currentlyPlayingSong={currentlyPlayingSong}
      />
    );
  }
};

export default LyricsView;
